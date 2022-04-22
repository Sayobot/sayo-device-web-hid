import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as HID from '../hid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  device?: HIDDevice;

  pid$ = new Subject<number>();

  inputReport$ = new Subject<DataView>();

  constructor() {}

  async select() {
    const filters: HIDDeviceFilter[] = [{ vendorId: HID.Config.vendorId }];
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
}
