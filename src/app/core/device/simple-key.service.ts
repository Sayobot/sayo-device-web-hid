import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class SimpleKeyService {
  data$ = new BehaviorSubject<SimpleKey[]>([]);

  constructor(private _device: DeviceService, private _protocol: Protocol) {}

  init() {
    if (!this._device.device) return;

    console.info("初始化按键数据");
    this._protocol.get_simplekey(this._device.device, (data: SimpleKey[]) => this.data$.next(data));
  }

  setItem(key: SimpleKey) {
    if (!this._device.device) return;

    this._protocol.set_simplekey(this._device.device, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }
}
