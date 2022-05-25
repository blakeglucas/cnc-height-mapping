import { Observable } from 'rxjs';
import { PortInfo } from '@serialport/bindings-interface';
import { SerialPort } from 'serialport';

export interface ISerialService {
  availablePorts: PortInfo[];
  availablePorts$: Observable<(PortInfo | Partial<PortInfo>)[]>;

  cncPort: SerialPort | undefined;
  switchPort: SerialPort | undefined;

  setCNCPort(portPath: string, baud: number): Promise<void>;
  setSwitchPort(portPath: string, baud: number): Promise<void>;
}
