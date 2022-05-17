import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { ElectronService } from './services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';

import * as GCodePreview from 'gcode-preview'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {

  gcodePreview: GCodePreview.WebGLPreview;

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }

  ngAfterViewInit(): void {
    this.gcodePreview = new GCodePreview.WebGLPreview({
      targetId: 'gcode-preview',
      buildVolume: {
        x: 150,
        y: 150,
        z: 150,
      },
      initialCameraPosition: [0, 400, 450],
    })

    this.gcodePreview.processGCode('G0 X0 Y0 Z0.2\nG1 X42 Y42')
    this.gcodePreview.render()
  }

  
}
