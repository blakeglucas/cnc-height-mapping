import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GcodeService {

  private readonly _rawGCode = new BehaviorSubject<string>('')
  readonly rawGCode$ = this._rawGCode.asObservable()

  private readonly _cGCode = new BehaviorSubject<string>('')
  readonly cGCode$ = this._cGCode.asObservable()

  constructor() { }

  setRawGCode(g: string) {
    if (g) {
      // TODO Validate
      this._rawGCode.next(g)
    }
  }

  clearRawGCode() {
    this._rawGCode.next('')
  }

  setCGCode(c: string) {
    if (c) {
      this._cGCode.next(c)
    }
  }

  clearCGCode() {
    this._cGCode.next('')
  }
}
