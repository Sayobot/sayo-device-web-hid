import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Protocol } from '../hid';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root',
})
export class SimpleKeyService {
  data$ = new BehaviorSubject<SimpleKey[]>([]);

  constructor(private _device: DeviceService, private _protocol: Protocol) {}

  init() {
    if (!this._device.device) return;

    this._protocol.get_simplekey(this._device.device, (data: SimpleKey[]) => this.data$.next(data));
  }

  setItem(key: SimpleKey) {}
}
