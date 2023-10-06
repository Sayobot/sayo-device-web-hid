import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom, of } from 'rxjs';
import { O2Protocol, ResponseType } from '../hid';
import { TranslateService } from '@ngx-translate/core';
import { DeviceService } from './device.service';
import { sleep } from 'src/app/utils';

export enum UpgradeEvent {
  Static = "static",
  Start = "start",
  Upgrading = "upgrading",
  Failure = "failure",
  Blocking = "blocking",
  Done = "done"
}

export interface UpgradeProgress {
  event: UpgradeEvent;
  value?: number;
  total?: number;
  message?: string;
}

const WRITE_BLOCK_SIZE = 32; // 每次编程的数据大小,必须是 16 32 64 128 等整数

@Injectable({ providedIn: 'root' })
export class FirmwareService {
  upgrade$ = new BehaviorSubject<UpgradeProgress>({ event: UpgradeEvent.Static });

  constructor(
    private http: HttpClient,
    private protocol: O2Protocol,
    private tr: TranslateService,
    private device: DeviceService
  ) { }

  async bl_device_info(device: HIDDevice) {
    const res = await this.protocol.bootlodaer_model_code(device);
    if (res.statu === -1) {
      throw "get bootloader device info error";
    };
    return res.data;
  }

  async upgrade(device: HIDDevice) {
    const bl_info = await this.bl_device_info(device);
    const config = await this.config(device.productId);

    if (!config) return;

    const info = this.info(config, bl_info.mode_code);

    if (!info) return console.error("没找到对应固件用于升级");

    this.upgrade$.next({ event: UpgradeEvent.Upgrading, value: 0, total: 100 });

    if (config.erase_flash) {
      if (!(await this.erase(device))) return;
    }

    await this.write(device, info.file_path, config.addr_len);
    if (!(await this.verify(device))) return;

    await this.protocol.jump_app(device);
    this.upgrade$.next({ event: UpgradeEvent.Done });

    await sleep(3000);
    if (await this.device.autoConnect(false)) {
      this.upgrade$.next({ event: UpgradeEvent.Static });
    } else {
      this.upgrade$.next({ event: UpgradeEvent.Blocking });
    }
  }

  private async erase(device: HIDDevice) {
    const { statu } = await this.protocol.erase_firmware(device);
    if (statu == ResponseType.NotSuppotData) {
      this.upgrade$.next({ event: UpgradeEvent.Failure, message: this.tr.instant("固件擦除失败") });
      return of(false);
    } else {
      return of(true);
    }
  }

  private async verify(device: HIDDevice) {
    const { statu } = await this.protocol.verify_firmware(device);

    if (statu === ResponseType.NotSuppotData) {
      this.upgrade$.next({ event: UpgradeEvent.Failure, message: this.tr.instant("固件擦除失败") });
      return of(false);
    } else {
      return of(true);
    }
  }

  private async write(device: HIDDevice, path: string, addr_len: number) {
    const buf = await this.buffer(device.productId, path);
    const bin_buf = new Uint8Array(buf);

    const arr_buf = [...bin_buf];
    const total = arr_buf.length;

    // 每次写入 32 字节
    for (let addr = 0; addr < total; addr += WRITE_BLOCK_SIZE) {
      if (device.productId == 3) addr_len = 2; // TODO: 移除，这里是因为 config 文件漏了 addr_len

      const temp_buf = arr_buf.slice(addr, WRITE_BLOCK_SIZE + addr);
      await this.protocol.write_memory(device, addr, addr_len, temp_buf);

      const progress = addr + WRITE_BLOCK_SIZE;
      this.upgrade$.next({ event: UpgradeEvent.Upgrading, value: progress, total });
    }
  }

  async isBootloader(device: HIDDevice) {
    if (!device.opened) {
      throw "Please open device"
    }

    const res = await this.protocol.get_metaInfo(device);
    return (res.statu !== ResponseType.Done);
  }

  async bootloader(device: HIDDevice) {
    const timer = setTimeout(async () => {
      const ok = await this.device.autoConnect(true);
      if (!ok) {
        this.upgrade$.next({ event: UpgradeEvent.Blocking });
      }

      clearTimeout(timer);
    }, 5000);

    this.upgrade$.next({ event: UpgradeEvent.Start });
    await this.protocol.jump_bootloader(device);
  }

  private async buffer(pid: number, path: string) {
    const response = await fetch(`https://a.sayobot.cn/firmware/update/${pid}/${path}`, {
      method: "GET",
      mode: "cors",
    });

    return response.arrayBuffer();
  }

  async config(pid: number) {
    try {
      const requestConfig = this.http.get<Firmware>(`https://a.sayobot.cn/firmware/update/${pid}/config.json`)
      return await lastValueFrom(requestConfig);
    } catch (error) {
      return undefined;
    }
  }

  info(config: Firmware, code: number) {
    return config.data.find(item => item.model_code === code);
  }

  checkUpdate(config: Firmware, deviceInfo: DeviceInfo): boolean {
    const info = this.info(config, deviceInfo.mode_code);

    if (deviceInfo.pid === 2) {
      console.error("PID 为 2 的设备暂不支持在线升级");
      return false;
    }

    if (!info) {
      console.error("未找到匹配该设备的固件：", info);
      return false;
    }

    if (deviceInfo.version >= info.version) {
      console.info("当前设备的固件版本已经是最新: ", info);
      return false;
    }

    return true;
  }
}
