import { Injectable } from '@angular/core';
import { IPCRendererBase } from '../utils/IPCRendererBase';
import { SerialService } from './serial.service';
import { SERIAL_COMMAND } from '../interfaces/SerialService.interface';
import { sleep } from '../utils/sleep';
import { BehaviorSubject } from 'rxjs';
import { HeightMapService } from './height-map.service';

enum CALIBRATION_STATE {
  IDLE = 0,
  RUNNING,
  STOPPING,
  STOPPED,
}

type CalibrationParams = {
  x: number;
  y: number;
  xn: number;
  yn: number;
  zstep: number;
  ztrav: number;
  onComplete: () => void;
};

@Injectable({
  providedIn: 'root',
})
export class CalibrationService extends IPCRendererBase {
  private state: CALIBRATION_STATE = CALIBRATION_STATE.IDLE;

  private cY = 0;
  private cX = 0;
  private heightMap: number[][][] = [];
  private rowMap: number[][] = [];
  private zResults: number[] = [];
  private dX = 0;
  private dY = 0;

  private calParams: CalibrationParams;

  private switchTrigger = false;
  private abortController: AbortController;

  private readonly _points = new BehaviorSubject<number[][]>([]);
  readonly points$ = this._points.asObservable();

  constructor(
    private serialService: SerialService,
    private heightMapService: HeightMapService
  ) {
    super();
    this.start = this.start.bind(this);
    this.run = this.run.bind(this);
    this.ipcRenderer.on('serial:switch_trigger', (event, value) => {
      this.switchTrigger = true;
    });
    this.abortController = new AbortController();
  }

  get points() {
    return this._points.getValue();
  }

  async start(params: CalibrationParams) {
    this.calParams = {
      ...params,
    };
    this.dX = this.calParams.x / (this.calParams.xn - 1);
    this.dY = this.calParams.y / (this.calParams.yn - 1);
    await this.serialService.sendCommand(SERIAL_COMMAND.GO_TO_ORIGIN);
    await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
      z: this.calParams.ztrav,
    });
    this.cY = 0;
    this.cX = 0;
    this.rowMap = [];
    this.zResults = [];
    this.switchTrigger = false;
    this.state = CALIBRATION_STATE.RUNNING;
    this.run();
  }

  async run() {
    if (this.state !== CALIBRATION_STATE.RUNNING) {
      return;
    }
    this.abortController.signal.addEventListener('abort', () => {
      this.state = CALIBRATION_STATE.STOPPED;
    });
    while (
      this.cY <= this.calParams.y &&
      this.state === CALIBRATION_STATE.RUNNING
    ) {
      this.rowMap = [];
      while (
        this.cX <= this.calParams.x &&
        this.state === CALIBRATION_STATE.RUNNING
      ) {
        this.zResults = [];
        await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          x: this.cX,
          z: this.calParams.ztrav,
        });
        // Required to prevent skipping position bc switch race condition
        await sleep(1500);
        this.switchTrigger = false;
        let i = 0;
        while (
          !this.switchTrigger &&
          this.state === CALIBRATION_STATE.RUNNING
        ) {
          await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
            z: -1 * this.calParams.zstep,
          });
          await sleep(600);
          i++;
        }
        if (this.state !== CALIBRATION_STATE.RUNNING) {
          return;
        }
        this.switchTrigger = false;
        const rawPosition: string = await this.serialService.sendCommand(
          SERIAL_COMMAND.GET_POSITION
        );
        const position = rawPosition
          .split(' ')
          .slice(0, 3)
          .map((x) => {
            const parts = x.split(':');
            return Number(parts[parts.length - 1]);
          });
        this.appendToPoints([this.cX, this.cY, position[2]]);
        this.rowMap.push([this.cX, this.cY, position[2]]);
        this.cX += this.dX;
      }
      if (this.state !== CALIBRATION_STATE.RUNNING) {
        return;
      }
      this.cY += this.dY;
      this.heightMap.push(this.rowMap);
      if (this.cY > this.calParams.y) {
        await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
          z: 15,
        });
        break;
      } else {
        this.cX = 0;
        this.zResults = [];
        await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          z: this.calParams.ztrav,
        });
        await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          y: this.cY,
        });
      }
    }
    this.heightMapService.loadHeightMapFromCalibration(this.heightMap);
    this.calParams.onComplete();
  }

  appendToPoints(point: number[]) {
    this._points.next([...this._points.getValue(), point]);
  }

  stop() {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  clear() {
    this._points.next([]);
  }
}
