import { Observable } from 'rxjs';
import { PortInfo } from '@serialport/bindings-interface';

export enum SERIAL_COMMAND {
  NOP = 0,
  SET_WORK,
  HOME,
  MOVE_ABS,
  MOVE_REL,
  GO_TO_ORIGIN,
  GET_POSITION,
}

export type SERIAL_PARAMS = Partial<{
  x: number;
  y: number;
  z: number;
  f: number;
  s: number;
  e: never;
  b: never;
}>;

export interface ISerialService {
  availablePorts: PortInfo[];
  availablePorts$: Observable<(PortInfo | Partial<PortInfo>)[]>;

  setCNCPort(portPath: string, baud: number): Promise<void>;
  setSwitchPort(portPath: string, baud: number): Promise<void>;

  sendCommand(cmd: SERIAL_COMMAND, params: SERIAL_PARAMS): Promise<void>;
}
