import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class SimpleKeyService {
  data$ = new BehaviorSubject<SimpleKey[]>([]);

  constructor(private _device: DeviceService, private o2p: O2Protocol) {}

  init() {
    if (!this._device.device) return;

    this.o2p.get_simplekey(this._device.device, (data: SimpleKey[]) => this.data$.next(data));
  }

  setItem(key: SimpleKey) {
    if (!this._device.device) return;

    this.o2p.set_simplekey(this._device.device, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }
}
