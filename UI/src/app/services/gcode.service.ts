import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GcodeService {
  private readonly _rawGCode = new BehaviorSubject<string>('');
  readonly rawGCode$ = this._rawGCode.asObservable();

  private readonly _cGCode = new BehaviorSubject<string>('');
  readonly cGCode$ = this._cGCode.asObservable();

  rawFilePath = '';
  cFilePath = '';

  constructor() {}

  get rawGCode() {
    return this._rawGCode.getValue();
  }

  get cGCode() {
    return this._cGCode.getValue();
  }

  setRawGCode(g: string, path: string) {
    if (g) {
      // TODO Validate
      this._rawGCode.next(g);
      this.rawFilePath = path;
    }
  }

  clearRawGCode() {
    this._rawGCode.next('');
  }

  setCGCode(c: string, path: string) {
    if (c) {
      this._cGCode.next(c);
      this.cFilePath = path;
    }
  }

  clearCGCode() {
    this._cGCode.next('');
  }
}
