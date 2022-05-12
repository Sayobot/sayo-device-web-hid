import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Protocol } from '../hid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  info?: DeviceInfo;
  device?: HIDDevice;

  device$ = new ReplaySubject<HIDDevice>(1);

  changed$ = new BehaviorSubject<Boolean>(false);

  constructor(private _protocol: Protocol) {}

  isSupport(code: number) {
    if (!this.device) return false;
    return this.info?.api.includes(code);
  }

  setDevice(device: HIDDevice) {
    if (device) {
      if (device !== this.device) {
        this.device = device;
        console.info('连接设备: ', this.device.productName);
      } else {
        console.error('请选择其他设备');
      }
    } else {
      console.error('请连接设备');
    }
  }

  save() {
    if (!this.device) {
      console.warn('请连接设备');
      return;
    }

    this._protocol.save(this.device!, (ok: boolean) => {
      if (ok) this.setChanged(false);
    });
  }

  updateInfo() {
    if (!this.device) return;

    this._protocol.get_metaInfo(this.device, (info: DeviceInfo) => {
      this.info = info;
      this.device$.next(this.device!);
    });
  }

  isConnected() {
    return this.device !== undefined;
  }

  isChanged() {
    return this.changed$.getValue();
  }

  setChanged(isChanged: boolean) {
    this.changed$.next(isChanged);
  }
}
