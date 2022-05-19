import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import { GridHelper } from './utils/gridHelper';
import { AxesHelper } from './utils/AxesHelper';
import { CoordinateAxes } from './utils/CoordinateAxes';

import * as THREE from 'three'
import * as OrbitControls from 'three-orbitcontrols'
import { Env3Axis } from './utils/Env3Axis';

import { Controls } from './utils/Controls'
import { GridLines } from './utils/GridLines'
import colornames from 'colornames';
import { TextSprite } from './utils/TextSprite';

@Component({
  selector: 'app-gcode-renderer',
  templateUrl: './gcode-renderer.component.html',
  styleUrls: ['./gcode-renderer.component.scss']
})
export class GcodeRendererComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() width = 600;
  @Input() height = 480;
  @ViewChild('renderContainer', { read: ElementRef }) renderContainer: ElementRef<HTMLDivElement>

  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private controls: any

  constructor() {
    this.animate = this.animate.bind(this)
  }

  ngOnInit(): void {
    this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.01, 10000)
    this.camera.position.z = 200;
    // this.camera.position.y = 10;
    // this.camera.rotateX(-1 * Math.PI / 2)
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(colornames('gray 90'))
    // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    // const material = new THREE.MeshNormalMaterial();

    // const axes = new AxesHelper(5)
    // this.scene.add(axes)
    // const gridHelper = new THREE.GridHelper(50, 50);
    // gridHelper.geometry.rotateZ( Math.PI / 2 );
    // const vector = new THREE.Vector3( 1, 1, 1 );
    // gridHelper.lookAt( vector );
    // this.scene.add(gridHelper)
    // const mesh = new THREE.Mesh( geometry, material );
    // this.scene.add( mesh );

    const axes = new CoordinateAxes(-120, 120, -120, 120)
    console.log(axes.group)
    this.scene.add(axes.group)
    const lines = new GridLines(-120, 120, 10, -120, 120, 10, colornames('blue'),
    colornames('gray 44'))
    this.scene.add(lines.group)

    const textSize = (10 / 3);
    const minX = -120;
    const minY = -120;
    const maxX = 120;
    const maxY = 120;

    for (let x = minX; x <= maxX; x += 10) {
        if (x !== 0) {
            const textLabel = new TextSprite({
                x: x,
                y: -4,
                z: 0,
                size: textSize,
                text: x,
                textAlign: 'center',
                textBaseline: 'bottom',
                color: colornames('red'),
                opacity: 0.5
            });
            // @ts-ignore
            this.scene.add(textLabel);
        }
    }
    for (let y = minY; y <= maxY; y += 10) {
        if (y !== 0) {
            const textLabel = new TextSprite({
                x: -4,
                y: y,
                z: 0,
                size: textSize,
                text: y,
                textAlign: 'center',
                textBaseline: 'bottom',
                color: colornames('green'),
                opacity: 0.5
            });
            // @ts-ignore
            this.scene.add(textLabel);
        }
    }

    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    const controls = new Controls(this.camera, this.scene, this.renderer.domElement) 
    this.renderer.setPixelRatio( window.devicePixelRatio )
    // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.renderer.setSize(this.width, this.height)
    this.renderer.render(this.scene, this.camera)
    this.renderer.setAnimationLoop(this.animate)
  }

  ngAfterViewInit(): void {
    this.renderContainer.nativeElement.appendChild(this.renderer.domElement)
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.updateRendererWidth()
  }

  animate(time: number) {
    requestAnimationFrame(this.animate)
    // this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }

  updateRendererWidth() {
    if (!this.renderer) {
      return;
    }
    this.renderer.setSize(this.width, this.height)
    this.renderer.render(this.scene, this.camera)
  }

}
