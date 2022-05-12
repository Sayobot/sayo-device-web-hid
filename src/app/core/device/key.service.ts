import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  data$ = new BehaviorSubject<Key[]>([]);

  constructor(private _device: DeviceService, private _protocol: Protocol) {}

  init() {
    if (!this._device.device) return;

    console.info("初始化按键数据");
    this._protocol.get_key(this._device.device, (data: Key[]) => this.data$.next(data));
  }

  setItem(key: Key) {
    if (!this._device.device) return;

    this._protocol.set_key(this._device.device, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }
}
