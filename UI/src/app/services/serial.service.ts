import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PortInfo } from '@serialport/bindings-interface';
import { ISerialService } from '../interfaces/SerialService.interface';
import { SerialPort } from 'serialport';

@Injectable({
  providedIn: 'root',
})
export class SerialService implements ISerialService {
  private readonly _availablePorts = new BehaviorSubject<PortInfo[]>([]);
  readonly availablePorts$ = this._availablePorts.asObservable();

  constructor() {}
  cncPort: SerialPort;
  switchPort: SerialPort;

  set availablePorts(ports: PortInfo[]) {
    this._availablePorts.next(ports);
  }

  setCNCPort(portPath: string, baud: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
  setSwitchPort(portPath: string, baud: number): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
