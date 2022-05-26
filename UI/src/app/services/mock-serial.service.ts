import { ipcRenderer } from 'electron';
import { Injectable } from '@angular/core';
import { PortInfo } from '@serialport/bindings-interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { SerialPort } from 'serialport';
import {
  ISerialService,
  SERIAL_COMMAND,
  SERIAL_PARAMS,
} from '../interfaces/SerialService.interface';
import { ElectronService } from './electron.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class MockSerialService implements ISerialService {
  private readonly _availablePorts = new BehaviorSubject<Partial<PortInfo>[]>([
    {
      path: 'COM3',
    },
    {
      path: 'COM10',
    },
  ]);
  readonly availablePorts$ = this._availablePorts.asObservable();

  cncPort: SerialPort | undefined;
  switchPort: SerialPort | undefined;

  private readonly ipcRenderer: typeof ipcRenderer;

  constructor(private n: NotificationService) {
    this.ipcRenderer = window.require('electron').ipcRenderer;
  }

  set availablePorts(ports: PortInfo[]) {
    // this._availablePorts.next(ports)
  }

  async setCNCPort(portPath: string, baud: number): Promise<void> {
    const eventTag = 'serial:set_cnc_port';
    await new Promise<void>((resolve, reject) => {
      this.ipcRenderer.once(eventTag, (event, err) => {
        console.log(err);
        this.n.showError(err);
        resolve();
      });
      this.ipcRenderer.send(eventTag, portPath, baud);
    });
  }

  async setSwitchPort(portPath: string, baud: number): Promise<void> {
    const eventTag = 'serial:set_switch_port';
    await new Promise<void>((resolve, reject) => {
      this.ipcRenderer.once(eventTag, (event, err) => {
        console.log(err);
        this.n.showError(err);
        resolve();
      });
      this.ipcRenderer.send(eventTag, portPath, baud);
    });
  }

  async sendCommand(cmd: SERIAL_COMMAND, params: SERIAL_PARAMS) {}
}
