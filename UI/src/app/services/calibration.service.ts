import { Injectable } from '@angular/core';
import { IPCRendererBase } from '../utils/IPCRendererBase';
import { SerialService } from './serial.service';
import { SERIAL_COMMAND } from '../interfaces/SerialService.interface';
import { sleep } from '../utils/sleep';

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

  constructor(private serialService: SerialService) {
    super();
    this.start = this.start.bind(this);
    this.run = this.run.bind(this);
    this.ipcRenderer.on('serial:switch_trigger', (event, value) => {
      this.switchTrigger = true;
    });
  }

  async start(params: CalibrationParams) {
    this.calParams = {
      ...params,
    };
    this.dX = this.calParams.x / this.calParams.xn;
    this.dY = this.calParams.y / this.calParams.yn;
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
    await this.run();
  }

  async run() {
    if (this.state !== CALIBRATION_STATE.RUNNING) {
      return;
    }
    while (this.cY <= this.calParams.y) {
      this.rowMap = [];
      while (this.cX < this.calParams.x) {
        this.zResults = [];
        await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_ABS, {
          x: this.cX,
          z: this.calParams.ztrav,
        });
        let i = 0;
        while (!this.switchTrigger) {
          await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
            z: -1 * this.calParams.zstep,
          });
          await sleep(600);
          i++;
        }
        this.switchTrigger = false;
        const position: number[] = await this.serialService.sendCommand(
          SERIAL_COMMAND.GET_POSITION
        );
        console.log(position);
        this.rowMap.push([this.cX, this.cY, position[2]]);
        this.cX += this.dX;
      }
      this.cY += this.dY;
      this.heightMap.push(this.rowMap);
      if (this.cY > this.calParams.y) {
        await this.serialService.sendCommand(SERIAL_COMMAND.MOVE_REL, {
          z: 15,
        });
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
  }
}
