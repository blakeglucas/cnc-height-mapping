import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SerialService } from '../../services/serial.service';
import colornames from 'colornames';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { CoordinateAxes } from '../../utils/threejs/CoordinateAxes';
import { GridLines } from '../../utils/threejs/GridLines';
import { TextSprite } from '../../utils/threejs/TextSprite';
import { CalibrationService } from '../../services/calibration.service';

@Component({
  selector: 'app-calibration',
  templateUrl: './calibration.component.html',
  styleUrls: ['./calibration.component.scss'],
})
export class CalibrationComponent implements OnInit {
  @Input() width = -1;
  @Input() height = -1;
  // @ViewChild('threeRenderer', { read: ElementRef })
  // threeRenderer: ElementRef<HTMLDivElement>;
  @ViewChild('controlHeader', { read: ElementRef })
  controlHeader: ElementRef<HTMLDivElement>;
  @ViewChild('confirmDialog', { read: ElementRef })
  confirmDialog: ElementRef<HTMLDialogElement>;

  xDim = 20;
  yDim = 20;
  xDiv = 5;
  yDiv = 5;
  zStep = 0.1;
  zTravel = 1;

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private gridRef: THREE.Group;
  private calPointsRef: THREE.Group;

  calibrationRunning = false;
  calibrationFinished = false;

  calibrationPoints: number[][] = [];

  constructor(
    private serialService: SerialService,
    private calibrationService: CalibrationService,
    private cdr: ChangeDetectorRef
  ) {
    this.calibrationService.points$.subscribe({
      next: (points) => {
        this.calibrationPoints = points;
      },
    });
  }

  ngOnInit(): void {}

  canStart() {
    return !!(this.serialService.cncPort && this.serialService.switchPort);
  }

  async startCalibration() {
    if (this.canStart()) {
      if (this.calibrationService.points.length > 0) {
        this.showConfirmDialog();
        return;
      }
      this.calibrationService.start({
        x: this.xDim,
        y: this.yDim,
        xn: this.xDiv,
        yn: this.yDiv,
        zstep: this.zStep,
        ztrav: this.zTravel,
        onComplete: () => {
          this.calibrationFinished = true;
          this.calibrationRunning = false;
        },
        onError: () => {
          this.calibrationRunning = false;
        },
      });
      this.calibrationRunning = true;
    }
  }

  // onInputChange() {
  //   if (
  //     this.xDim !== 0 &&
  //     this.yDim !== 0 &&
  //     this.xDiv !== 0 &&
  //     this.yDiv !== 0
  //   ) {
  //     this.drawGrid();
  //     this.drawCalibrationPoints();
  //     this.zoomToFit();
  //   }
  // }

  stopCalibration() {
    if (this.calibrationRunning) {
      this.calibrationService.stop();
      this.calibrationRunning = false;
    }
  }

  showConfirmDialog() {
    this.confirmDialog.nativeElement.removeAttribute('hidden');
    this.confirmDialog.nativeElement.setAttribute('open', 'true');
  }

  closeConfimDialog() {
    this.confirmDialog.nativeElement.removeAttribute('open');
    this.confirmDialog.nativeElement.setAttribute('hidden', 'true');
  }

  cancelConfirm() {
    this.closeConfimDialog();
  }

  didConfirm() {
    this.closeConfimDialog();
    this.calibrationService.clear();
    this.startCalibration();
  }
}
