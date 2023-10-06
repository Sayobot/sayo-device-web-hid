import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Config, O2Protocol, ResponseType } from '../hid';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  _info?: DeviceInfo;

  prevDevice: HIDDevice | null = null;

  device$ = new BehaviorSubject<HIDDevice | null>(null);

  changed$ = new BehaviorSubject<Boolean>(false);

  constructor(
    private protocol: O2Protocol
  ) {

  }

  async autoConnect(isBoot: boolean) {
    if (!this.prevDevice) return false;
    const devices = await this.getDevices(isBoot);

    if(devices.length === 0) return false;

    for (let i = 0; i < devices.length; i++) {
      const item = devices[i];

      if (item.productId === this.prevDevice.productId
        && item.vendorId === this.prevDevice.vendorId) {
        await this.connect(item);
        return true;
      }
    }

    return false;
  }

  async getDevices(matchBoot: boolean) {
    const devices = await navigator.hid.getDevices();

    const result: HIDDevice[] = devices.filter(dev => {
      if (matchBoot) {
        if (dev.collections.length === 0) return false;
      } else {
        if (dev.collections.length < 2) return false;
      }

      for (let i = 0; i < dev.collections.length; i++) {
        const col = dev.collections[i];
        if (col.usagePage! >= Config.usagePage) {
          return true;
        }
      }

      return true;
    });

    return result;
  }

  disconnect() {
    const dev = this.device$.getValue();
    if (dev) this.prevDevice = dev;
    this.device$.next(null);
  }

  instance() {
    return this.device$.getValue();
  }

  async rename(name: string) {
    const dev = this.instance();
    if (!dev) return;

    const res = await this.protocol.set_device_name(dev, name);
    this.setChanged(true);
    return res.statu;
  }

  async name(device: HIDDevice) {
    const res = await this.protocol.get_device_name(device);
    if (res.statu !== ResponseType.Done) {
      console.error("获取设备名称失败");
    }

    return res.data;
  }

  isSupport(code: number) {
    const dev = this.instance();
    if (!dev || !this._info) return false;

    return this._info.api.includes(code);
  }

  info() {
    return this._info;
  }

  async connect(device: HIDDevice) {
    if (!device.opened) await device.open();

    if (!device.opened) return console.error("打开设备失败:", device);

    console.table(device);

    const res = await this.protocol.get_metaInfo(device);
    this._info = {
      ...res.data,
      pid: device.productId
    }

    this.device$.next(device);
  }

  save() {
    const dev = this.instance();

    if (!dev) {
      console.warn('请连接设备');
      return;
    }

    this.protocol.save(dev, (ok: boolean) => {
      if (ok) this.setChanged(false);
    });
  }

  isConnected() {
    return !!this.instance();
  }

  isChanged() {
    return this.changed$.getValue();
  }

  setChanged(isChanged: boolean) {
    this.changed$.next(isChanged);
  }

  filename() {
    const dev = this.instance();
    if (dev) {
      return dev.productId === 3 ? 'main_vid_3.json' : 'main.json';
    } else {
      console.error('device not connect.');

      return '';
    }
  }
}
