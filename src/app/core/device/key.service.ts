import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  data$ = new Subject<Key[]>();

  constructor(private _device: DeviceService) {}

  async read() {
    const data = await this._device.key();
    this.data$.next(data);
  }
}
