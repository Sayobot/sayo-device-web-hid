import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Protocol, Config as HID, metaInfoFromBuffer } from '../hid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  info?: DeviceInfo;
  device?: HIDDevice;

  deviceChanged$ = new ReplaySubject<HIDDevice>();

  constructor(private _protocol: Protocol) {}

  isSupport(code: number) {
    if (!this.device) return false;
    return this.info?.api.includes(code);
  }

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

      const metaInfoBuffer = await this._protocol.read_metaInfo(this.device);

      this.info = metaInfoFromBuffer(metaInfoBuffer);

      this.deviceChanged$.next(this.device);

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
