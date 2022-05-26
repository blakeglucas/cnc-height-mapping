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

@Component({
  selector: 'app-calibration',
  templateUrl: './calibration.component.html',
  styleUrls: ['./calibration.component.scss'],
})
export class CalibrationComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() width = -1;
  @Input() height = -1;
  @ViewChild('threeRenderer', { read: ElementRef })
  threeRenderer: ElementRef<HTMLDivElement>;
  @ViewChild('controlHeader', { read: ElementRef })
  controlHeader: ElementRef<HTMLDivElement>;

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

  constructor(
    private serialService: SerialService,
    private cdr: ChangeDetectorRef
  ) {
    this.initRender = this.initRender.bind(this);
    this.animate = this.animate.bind(this);
    this.initRender();
  }

  ngOnInit(): void {}

  canStart() {
    return !!(this.serialService.cncPort && this.serialService.switchPort);
  }

  private initRender() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / this.height,
      0.01,
      10000
    );

    this.zoomToFit();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(colornames('gray 22'));

    this.drawGrid();
    this.drawCalibrationPoints();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.getRenderHeight());
    this.renderer.render(this.scene, this.camera);
    this.animate();
  }

  private drawGrid() {
    const xOffset = this.xDim / -2;
    const yOffset = this.yDim / -2;
    if (this.gridRef) {
      this.scene.remove(this.gridRef);
    }

    this.gridRef = new THREE.Group();

    const axes = new CoordinateAxes(0, this.xDim, 0, this.yDim);
    axes.group.position.setX(xOffset);
    axes.group.position.setY(yOffset);
    this.gridRef.add(axes.group);

    const lines = new GridLines(
      0,
      this.xDim,
      1,
      0,
      this.yDim,
      1,
      colornames('blue'),
      colornames('gray 70')
    );
    this.gridRef.add(lines.group);
    lines.group.position.setX(xOffset);
    lines.group.position.setY(yOffset);

    const textSize = 0.5;
    const minX = 0;
    const minY = 0;
    const maxX = this.xDim;
    const maxY = this.yDim;

    for (let x = minX; x <= maxX; x++) {
      if (x !== 0) {
        const textLabel = new TextSprite({
          x: x + xOffset,
          y: -0.5 + yOffset,
          z: 0,
          size: textSize,
          text: x,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: colornames('red'),
          opacity: 0.5,
        });
        // @ts-ignore
        this.gridRef.add(textLabel);
      }
    }
    for (let y = minY; y <= maxY; y += 1) {
      if (y !== 0) {
        const textLabel = new TextSprite({
          x: -0.5 + xOffset,
          y: y + yOffset,
          z: 0,
          size: textSize,
          text: y,
          textAlign: 'center',
          textBaseline: 'bottom',
          color: colornames('green'),
          opacity: 0.5,
        });
        // @ts-ignore
        this.gridRef.add(textLabel);
      }
    }
    this.scene.add(this.gridRef);
  }

  private drawCalibrationPoints() {
    if (this.calPointsRef) {
      this.scene.remove(this.calPointsRef);
    }

    this.calPointsRef = new THREE.Group();

    const xOffset = this.xDim / -2;
    const yOffset = this.yDim / -2;

    const xDelta = this.xDim / (this.xDiv - (this.xDiv < this.xDim ? 1 : 0));
    const yDelta = this.yDim / (this.yDiv - (this.yDiv < this.yDim ? 1 : 0));

    const material = new THREE.MeshBasicMaterial({
      color: colornames('gold 3'),
    });

    for (let y = 0; y <= this.yDim; y += yDelta) {
      for (let x = 0; x <= this.xDim; x += xDelta) {
        const center = new THREE.Vector2(x + xOffset, y + yOffset);
        const geometry = new THREE.SphereGeometry(0.5, 64);
        const circle = new THREE.Mesh(geometry, material);
        circle.position.set(x + xOffset, y + yOffset, 0);
        this.calPointsRef.add(circle);
      }
    }
    this.scene.add(this.calPointsRef);
  }

  private zoomToFit() {
    const theta = this.camera.fov / 2;
    const cHeight =
      (this.yDim >= this.xDim ? this.yDim + 3 : this.xDim - 6) /
      2 /
      Math.tan(theta * ((2 * Math.PI) / 360));
    this.camera.position.z = cHeight;
  }

  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate);
  }

  ngAfterViewInit(): void {
    this.threeRenderer.nativeElement.appendChild(this.renderer.domElement);
  }

  updateRendererWidth() {
    if (!this.renderer) {
      return;
    }
    setTimeout(() => {
      const renderHeight = this.getRenderHeight();
      this.renderer.setSize(this.width, renderHeight);
      this.camera.aspect = this.width / renderHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.render(this.scene, this.camera);
    }, 500);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateRendererWidth();
    this.cdr.detectChanges();
  }

  getRenderHeight(): number {
    if (!this.controlHeader) {
      return this.height;
    }
    const { height } = this.controlHeader.nativeElement.getBoundingClientRect();
    return this.height - height;
  }

  resetView() {
    const height = this.getRenderHeight();
    this.camera = new THREE.PerspectiveCamera(
      50,
      this.width / height,
      0.01,
      10000
    );
    this.zoomToFit();
    this.renderer.render(this.scene, this.camera);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.updateRendererWidth();
  }

  onInputChange() {
    if (
      this.xDim !== 0 &&
      this.yDim !== 0 &&
      this.xDiv !== 0 &&
      this.yDiv !== 0
    ) {
      this.drawGrid();
      this.drawCalibrationPoints();
      this.zoomToFit();
    }
  }
}
