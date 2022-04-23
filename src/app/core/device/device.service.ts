import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Protocol, Config as HID } from '../hid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  device?: HIDDevice;

  deviceChanged$ = new Subject<HIDDevice>();

  constructor(private _protocol: Protocol) {}

  async select() {
    const filters: HIDDeviceFilter[] = [{ vendorId: HID.vendorId }];
    const devices = await navigator.hid.requestDevice({ filters });

    if (devices.length > 0) {
      if (this.device?.opened) {
        await this.device.close();
        this.device = undefined;
      }

      this.device = devices[0];
      await this.device.open();

      console.log('connect device: ', this.device.productName);
    } else {
      throw new Error('Not found device.');
    }
  }

  async key() {
    if (!this.device) throw new Error('Please connect device.');
    return await this._protocol.read_key(this.device);
  }
}
