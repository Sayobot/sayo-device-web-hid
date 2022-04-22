import { Injectable } from '@angular/core';
import { Protocol } from '../hid/protocol.service';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root',
})
export class KeyService implements onInputReport {
  _data: Key[] = [];

  constructor(private _device: DeviceService, private _protocol: Protocol) {
    this._device.inputReport$.subscribe(this.handleInputReport);
  }

  handleInputReport(data: DataView) {}

  async read() {
    if (this._device.device) {
      const data = await this._protocol.read_key(this._device.device);
      console.log(data);
    }
  }
}
