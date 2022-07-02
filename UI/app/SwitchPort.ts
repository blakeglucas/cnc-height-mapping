import { SerialPort, SerialPortOpenOptions } from 'serialport';

export type SendFunction = (channel: string, ...args: any[]) => void;

export class SwitchPort {
  private readonly eventTag = 'serial:switch_trigger';
  private readonly serialPort: SerialPort;
  private readonly send: SendFunction;

  constructor(portOptions: SerialPortOpenOptions<any>, send: SendFunction) {
    // No bind to retain sendfn's original context
    this.send = send;
    this.serialPort = new SerialPort(portOptions, (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
    });
    this.errorHandler = this.errorHandler.bind(this);
    this.dataHandler = this.dataHandler.bind(this);
    this.serialPort.on('error', this.errorHandler);
    this.serialPort.on('data', this.dataHandler);
  }

  get isOpen() {
    return this.serialPort.isOpen;
  }

  errorHandler(err: any, err2: any) {
    console.error(err, err2);
  }

  dataHandler(data: Buffer) {
    this.send(this.eventTag, data.toString());
  }

  async close() {
    if (this.isOpen) {
      await new Promise<void>((resolve, reject) => {
        this.serialPort.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }
  }
}
