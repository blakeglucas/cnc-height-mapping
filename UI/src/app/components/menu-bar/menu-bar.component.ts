import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import * as Mousetrap from 'mousetrap';
import { ElectronService } from '../../services/electron.service';
import { GcodeService } from '../../services/gcode.service';

@Component({
  selector: 'app-menu-bar',
  templateUrl: './menu-bar.component.html',
  styleUrls: ['./menu-bar.component.scss']
})
export class MenuBarComponent implements OnInit {

  isMaximized = false

  constructor(private electronService: ElectronService, private gCodeService: GcodeService, private cdr: ChangeDetectorRef) {
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
      this.openHeightMap()
      return false
    })
    Mousetrap.bind(['ctrl+o g', 'cmd+o g'], () => {
      this.openRawGCode()
      return false
    })
    Mousetrap.bind(['ctrl+o c', 'cmd+o c'], () => {
      this.openCGCode()
      return false
    })
    Mousetrap.bind(['ctrl+e', 'cmd+e'], () => {
      this.saveCGCode()
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

  openHeightMap() {
    this.electronService.ipcRenderer.send('file:open_height_map')
  }

  openRawGCode() {
    this.electronService.ipcRenderer.send('file:open_raw_gcode')
  }

  openCGCode() {
    this.electronService.ipcRenderer.send('file:open_contoured_gcode')
  }

  saveCGCode() {
    this.electronService.ipcRenderer.send('file:save_cgcode', this.gCodeService.cGCode)
  }

}
