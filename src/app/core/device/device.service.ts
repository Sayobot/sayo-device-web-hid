import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Protocol } from '../hid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  info?: DeviceInfo;
  device?: HIDDevice;

  device$ = new ReplaySubject<HIDDevice>(1);

  constructor(private _protocol: Protocol) {}

  isSupport(code: number) {
    if (!this.device) return false;
    return this.info?.api.includes(code);
  }

  setDevice(device: HIDDevice) {
    if (device) {
      if (device !== this.device) {
        this.device = device;
        console.log('connect device: ', this.device.productName);
      } else {
        console.error("please connect other device.");
      }
    } else {
      console.error('Please connect device.');
    }
  }

  updateInfo() {
    if (!this.device) return;

    this._protocol.get_metaInfo(this.device, (info: DeviceInfo) => {
      this.info = info;
      this.device$.next(this.device!);
    });
  }
}
