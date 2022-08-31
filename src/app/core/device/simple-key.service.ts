import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { KeyService } from './key.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class SimpleKeyService {
  data$ = new BehaviorSubject<SimpleKey[]>([]);

  constructor(private _device: DeviceService, private o2p: O2Protocol, private _key: KeyService) {}

  init() {
    if (!this._device.isConnected()) return;

    this.o2p.get_simplekey(this._device.instance!, (data: SimpleKey[]) => this.data$.next(data));
  }

  setItem(key: SimpleKey) {
    if (!this._device.isConnected()) return;

    this.o2p.set_simplekey(this._device.instance!, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }

  getKeyName(modeCode: number, values: number[]) {
   return this._key.getKeyName(modeCode, values);
  }

  getModifierName(key: string, modifierCode: number) {
    return this._key.getModifierName(key, modifierCode);
  }

  getGeneralName(generalCode: number) {
    return this._key.getGeneralName(generalCode);
  }
}
