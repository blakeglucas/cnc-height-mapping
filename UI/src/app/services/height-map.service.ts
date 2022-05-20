import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElectronService } from './electron.service';

export type HeightMap = number[][]

@Injectable({
  providedIn: 'root'
})
export class HeightMapService {

  private readonly _currentHeightMap = new BehaviorSubject<HeightMap | undefined>(undefined);
  readonly currentHeightMap$ = this._currentHeightMap.asObservable();

  constructor() {
    this.processHeightMapFile = this.processHeightMapFile.bind(this)
  }

  processHeightMapFile(contents: string) {
    try {
      const data = JSON.parse(contents)
      const nData = this.normalize(data)
      this._currentHeightMap.next(nData)
    } catch (e) {
      console.error(e)
      // TODO notifications
    }
  }

  clearCurrentMap() {
    this._currentHeightMap.next(undefined)
  }

  private normalize(data: number[][] | number[][][]) {
    if (Array.isArray(data[0][0])) {
      console.log(data.flat())
      return data.flat() as number[][]
    } else {
      return data as number[][];
    }
  }
}
