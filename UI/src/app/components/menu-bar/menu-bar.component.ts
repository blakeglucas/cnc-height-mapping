import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {

  isMaximized = false

  constructor(private electronService: ElectronService, private cdr: ChangeDetectorRef) {
    this.electronService.ipcRenderer.on('menubar:ismaximized', (event, isMaximized) => {
      this.isMaximized = isMaximized
      this.cdr.detectChanges()
    })
    this.electronService.ipcRenderer.send('menubar:ismaximized')
  }

  ngOnInit(): void {
  }

  minimize() {
    this.electronService.ipcRenderer.send('minimize')
  }

  maximize() {
    if (!this.isMaximized) {
      this.electronService.ipcRenderer.send('maximize')
    } else {
      this.electronService.ipcRenderer.send('unmaximize')
    }
  }

  close() {
    this.electronService.ipcRenderer.send('close')
  }

}
