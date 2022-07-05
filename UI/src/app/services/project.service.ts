import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GCodeObject } from '../utils/contourGCode';
import { IPCRendererBase } from '../utils/IPCRendererBase';
import { CalibrationService } from './calibration.service';
import { GcodeService } from './gcode.service';
import {
  HeightMap,
  HeightMapMetadata,
  HeightMapService,
} from './height-map.service';
import { SerialService } from './serial.service';

export type ProjectMetadata = {
  lastSaved?: string;
  created: string;
};

export type ProjectCalibration = {
  x: number;
  y: number;
  xpoints: number;
  ypoints: number;
  zstep: number;
  ztrav: number;
  data: number[][];
};

export type ProjectHeightMapData = {
  filepath?: string;
  map: HeightMap;
  metadata: HeightMapMetadata;
};

export type GCodeData = {
  filepath: string;
  filecontent: string;
};

export type ProjectGCodeData = {
  raw?: GCodeData;
  contoured?: GCodeData;
};

export type ProjectControlData = {
  cncPort: string;
  switchPort: string;
  cncPortBaud: number;
  switchPortBaud: number;
};

export type ProjectFileSchema = {
  metadata: ProjectMetadata;
  calibration: ProjectCalibration;
  heightMap: ProjectHeightMapData;
  gcode: ProjectGCodeData;
  control: ProjectControlData;
};

@Injectable({
  providedIn: 'root',
})
export class ProjectService extends IPCRendererBase {
  private readonly _openedProject = new BehaviorSubject<
    ProjectFileSchema | undefined
  >(undefined);
  readonly openedProject$ = this._openedProject.asObservable();

  constructor(
    private calibrationService: CalibrationService,
    private gcodeService: GcodeService,
    private heightMapService: HeightMapService,
    private serialService: SerialService
  ) {
    super();
  }

  openProject(pFileContent: string) {}

  getProjectContents() {
    const data: ProjectFileSchema = {
      metadata: {
        created: new Date().toUTCString(),
      },
      calibration: {
        x: this.calibrationService.xDim,
        y: this.calibrationService.yDim,
        xpoints: this.calibrationService.xDiv,
        ypoints: this.calibrationService.yDiv,
        zstep: this.calibrationService.zStep,
        ztrav: this.calibrationService.zTrav,
        data: this.calibrationService.points,
      },
      heightMap: {
        // TODO Filepath
        map: this.heightMapService.currentHeightMap,
        metadata: this.heightMapService.currentMetadata,
      },
      gcode: {
        raw: {
          filepath: this.gcodeService.rawFilePath,
          filecontent: this.gcodeService.rawGCode,
        },
        contoured: {
          filepath: this.gcodeService.cFilePath,
          filecontent: this.gcodeService.cGCode,
        },
      },
      control: {
        cncPort: this.serialService.cncPort,
        switchPort: this.serialService.switchPort,
        cncPortBaud: this.serialService.cncPortBaud,
        switchPortBaud: this.serialService.switchPortBaud,
      },
    };
    return data;
  }
}
