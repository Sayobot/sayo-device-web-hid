import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Protocol } from '../hid';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  data$ = new BehaviorSubject<Key[]>([]);

  constructor(private _device: DeviceService, private _protocol: Protocol) {}

  init() {
    if (!this._device.device) return;

    this._protocol.get_key(this._device.device, (data: Key[]) => this.data$.next(data));
  }

  setItem(key: Key) {
    if (!this._device.device) return;

    this._protocol.set_key(this._device.device, key, () => {
      let keys = this.data$.getValue();
      const index = keys.findIndex((item) => item.id === key.id);
      if (index !== -1) {
        keys[index] = key;
      } else {
        console.log('Not fount key.', key);
      }
      this.data$.next(keys);
    });
  }
}
