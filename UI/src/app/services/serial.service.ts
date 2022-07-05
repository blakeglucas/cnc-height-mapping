import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortInfo } from '@serialport/bindings-interface';
import {
  ISerialService,
  SERIAL_COMMAND,
  SERIAL_PARAMS,
} from '../interfaces/SerialService.interface';
import { SerialPort } from 'serialport';
import { ipcRenderer } from 'electron';
import { NotificationService } from './notification.service';
import { IPCRendererBase } from '../utils/IPCRendererBase';

@Injectable({
  providedIn: 'root',
})
export class SerialService extends IPCRendererBase implements ISerialService {
  private readonly _availablePorts = new BehaviorSubject<PortInfo[]>([]);
  readonly availablePorts$ = this._availablePorts.asObservable();

  private readonly _activeCommand = new BehaviorSubject<
    SERIAL_COMMAND | undefined
  >(undefined);
  readonly activeCommand$ = this._activeCommand.asObservable();

  constructor(private n: NotificationService) {
    super();
  }

  cncPort: string;
  switchPort: string;
  cncPortBaud: number;
  switchPortBaud: number;

  set availablePorts(ports: PortInfo[]) {
    this._availablePorts.next(ports);
  }

  async setCNCPort(portPath: string, baud: number): Promise<void> {
    const eventTag = 'serial:set_cnc_port';
    await new Promise<void>((resolve, reject) => {
      this.ipcRenderer.once(eventTag, (event, err) => {
        if (err) {
          console.log(err);
          this.n.showError(err);
          this.cncPort = undefined;
          reject(err);
        }
        this.cncPortBaud = baud;
        resolve();
      });
      this.ipcRenderer.send(eventTag, portPath, baud);
    });
    this.cncPort = portPath;
  }

  async setSwitchPort(portPath: string, baud: number): Promise<void> {
    const eventTag = 'serial:set_switch_port';
    await new Promise<void>((resolve, reject) => {
      this.ipcRenderer.once(eventTag, (event, err) => {
        if (err) {
          console.log(err);
          this.n.showError(err);
          this.switchPort = undefined;
          reject(err);
        }
        this.switchPortBaud = baud;
        resolve();
      });
      this.ipcRenderer.send(eventTag, portPath, baud);
    });
    this.switchPort = portPath;
  }

  async sendCommand(cmd: SERIAL_COMMAND, params?: SERIAL_PARAMS): Promise<any> {
    const eventTag = 'serial:command';
    return await new Promise<any>((resolve, reject) => {
      this.ipcRenderer.once(eventTag, (event, err, result) => {
        if (err) {
          console.log(err);
          this.n.showError(err);
          reject(err);
        }
        resolve(result);
      });
      this.ipcRenderer.send(eventTag, cmd, params);
    });
  }
}
