import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortInfo } from '@serialport/bindings-interface';
import {
  ISerialService,
  SERIAL_COMMAND,
} from '../interfaces/SerialService.interface';

@Injectable({
  providedIn: 'root',
})
export class SerialService implements ISerialService {
  private readonly _availablePorts = new BehaviorSubject<PortInfo[]>([]);
  readonly availablePorts$ = this._availablePorts.asObservable();

  constructor() {}

  set availablePorts(ports: PortInfo[]) {
    this._availablePorts.next(ports);
  }

  setCNCPort(portPath: string, baud: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  setSwitchPort(portPath: string, baud: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  sendCommand(
    cmd: SERIAL_COMMAND,
    params: Partial<{
      x: number;
      y: number;
      z: number;
      f: number;
      s: number;
      e: never;
      b: never;
    }>
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
