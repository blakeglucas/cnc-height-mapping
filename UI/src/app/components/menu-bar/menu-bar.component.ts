import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import * as Mousetrap from 'mousetrap';
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
    Mousetrap.bind(['ctrl+o p', 'cmd+o p'], () => {
      console.log('open project')
      return false
    })
    Mousetrap.bind(['ctrl+o h', 'cmd+o h'], () => {
      console.log('open height map')
      return false
    })
    Mousetrap.bind(['ctrl+o g', 'cmd+o g'], () => {
      console.log('open raw gcode')
      return false
    })
    Mousetrap.bind(['ctrl+o c', 'cmd+o c'], () => {
      console.log('open contoured gcode')
      return false
    })
    Mousetrap.bind(['ctrl+s', 'cmd+s'], () => {
      console.log('save project')
      return false
    })
    Mousetrap.bind(['ctrl+shift+s', 'cmd+shift+s'], () => {
      console.log('save project as')
      return false
    })
    Mousetrap.bind(['ctrl+q', 'cmd+q'], () => {
      this.close()
      return false;
    })
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
    // TODO confirm save
    this.electronService.ipcRenderer.send('close')
  }

  @HostListener('document:keydown.ctrl.q')
  keyQuit() {
    this.close()
  }

}
