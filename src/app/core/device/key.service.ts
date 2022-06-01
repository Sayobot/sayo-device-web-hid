import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  data$ = new BehaviorSubject<Key[]>([]);

  constructor(private _device: DeviceService, private _o2p: O2Protocol) {}

  init() {
    if (!this._device.device) return;

    this._o2p.get_key(this._device.device, (data: Key[]) => this.data$.next(data));
  }

  setItem(key: Key) {
    if (!this._device.device) return;

    this._o2p.set_key(this._device.device, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }
}
