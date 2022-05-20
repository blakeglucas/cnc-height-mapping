import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { map, Observable, of } from 'rxjs';
import { SocketService } from '../../services/socket.service';
import { DropdownItem } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.scss'],
})
export class ControlPanelComponent implements OnInit {
  private readonly minWidth = 200;
  readonly initialWidth = 450;
  _width = this.initialWidth;

  piIPAddress = '192.168.1.106';
  _piPort = 8000;

  cncPort = '';
  _cncBaud = 115200;

  cncDropdownOptions: Observable<DropdownItem[]>;

  @Output() controlPanelResize = new EventEmitter<number>();

  constructor(public socketService: SocketService) {
    this.cncDropdownOptions = this.socketService.serialPorts$.pipe(
      map((ports) => ports.map((p) => ({ label: p, value: p })))
    );
  }

  ngOnInit(): void {}

  get width() {
    return this._width;
  }

  set width(newWidth: number) {
    this._width = newWidth;
    this.controlPanelResize.emit(this._width);
  }

  onResize(event?: ResizeEvent) {
    let newWidth = event ? event.rectangle.right : this.width;
    const maxWidth = Math.floor(window.innerWidth / 2);
    if (newWidth > maxWidth) {
      newWidth = maxWidth;
    } else if (newWidth < this.minWidth) {
      newWidth = this.minWidth;
    }
    this.width = newWidth;
  }

  resetWidth() {
    this.width = this.initialWidth;
  }

  log(a: any) {
    console.log(a);
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.onResize();
  }

  connectSocket() {
    console.log(this.piIPAddress, this.piPort);
    if (this.socketService.isConnected) {
      this.socketService.disconnectSocket();
    } else {
      this.socketService.createNewSocket(this.piIPAddress, this.piPort);
      this.socketService.listSerialPorts();
    }
  }

  setActiveMachine() {
    this.socketService.setActivePort(this.cncPort, this.cncBaud);
    this.socketService.getActiveMachine();
  }

  get piPort() {
    return this._piPort;
  }

  set piPort(val: any) {
    this._piPort = Number(val);
  }

  get cncBaud() {
    return this._cncBaud;
  }

  set cncBaud(val: any) {
    this._cncBaud = Number(val);
  }
}
