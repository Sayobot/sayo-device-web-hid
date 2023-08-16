import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, lastValueFrom } from 'rxjs';
import { O2Protocol, ResponseType } from '../hid';

export interface UpgradeProgress {
  done: boolean;
  value: number;
  total: number;
}

const WRITE_BLOCK_SIZE = 32; // 每次编程的数据大小,必须是 16 32 64 128 等整数

const afterMemoryEmpty = (buf: number[], i: number) => {
  for (let j = 0; j < WRITE_BLOCK_SIZE; j++) {
    if (buf[i + j] != 0) {
      return false;
    }
  }
  return true;
}

@Injectable({ providedIn: 'root' })
export class FirmwareService {

  onBootloader: boolean = false;

  upgrade$ = new Subject<UpgradeProgress>();

  constructor(
    private httpClient: HttpClient,
    private _protocol: O2Protocol
  ) { }

  async bl_device_info(device: HIDDevice) {
    const res = await this._protocol.bootlodaer_model_code(device);
    if (res.statu === -1) {
      throw "get bootloader device info error";
    };
    return res.data;
  }

  handleUpgradeProgress(value: number, total: number) {
    if (value >= total) {
      this.upgrade$.next({ done: true, value, total })
    } else {
      this.upgrade$.next({ done: false, value, total });
    }
  }

  async upgrade(device: HIDDevice, info: FirmwareInfo, config: Firmware) {
    if (config.erase_flash) {
      const { statu } = await this._protocol.erase_firmware(device);
      if (statu == ResponseType.NotSuppotData) {
        console.error("固件擦除失败");
        return;
      }
    }

    const { file_path } = info;
    const buf = await this.firmwareBuffer(device.productId, file_path);

    let addr_len = config.addr_len;
    const bin_buf = new Uint8Array(buf);

    const arr_buf = [...bin_buf];
    const total = arr_buf.length;

    // 每次写入 32 字节
    for (let addr = 0; addr < total; addr += WRITE_BLOCK_SIZE) {
      if (device.productId == 3) addr_len = 2; // TODO: 移除，这里是因为 config 文件漏了 addr_len

      if (device.productId == 3 && afterMemoryEmpty(arr_buf, addr)) {
        break;
      }

      const temp_buf = arr_buf.slice(addr, WRITE_BLOCK_SIZE + addr);
      await this._protocol.write_memory(device, addr, addr_len, temp_buf);
      this.handleUpgradeProgress(addr + WRITE_BLOCK_SIZE, total);
    }

    // PID 3 需要写入校验码
    if (device.productId == 3) {
      const addr = info.rom_size - 4;
      const temp_buf = arr_buf.slice(addr, WRITE_BLOCK_SIZE + addr);
      await this._protocol.write_memory(device, addr, addr_len, temp_buf);
      this.handleUpgradeProgress(total, total);
    }

    // 验证固件是否错误
    const varify = await this._protocol.verify_firmware(device);
    if (varify.statu === ResponseType.NotSuppotData) {
      console.error("固件验证错误");
      return;
    }

    await this._protocol.jump_app(device);
  }

  async isBootloader(device: HIDDevice) {
    if (!device.opened) {
      throw "Please open device"
    }

    const res = await this._protocol.get_metaInfo_2(device);
    return (res.statu !== ResponseType.Done);
  }

  async bootloader(device: HIDDevice, duration: number, callback: () => void) {
    const timer = setTimeout(async () => {
      clearTimeout(timer);
      callback();
    }, duration);

    await this._protocol.jump_bootloader(device);
  }

  async firmwareBuffer(pid: number, path: string) {
    const response = await fetch(`https://a.sayobot.cn/firmware/update/${pid}/${path}`, {
      method: "GET",
      mode: "cors",
    });

    return response.arrayBuffer();
  }

  async config(pid: number) {
    const requestConfig = this.httpClient.get<Firmware>(`https://a.sayobot.cn/firmware/update/${pid}.json`)
    return await lastValueFrom(requestConfig);
  }

  firmwareInfo(config: Firmware, code: number) {
    return config.data.find(item => item.model_code === code);
  }

  canUpdate(config: Firmware, info: DeviceInfo): boolean {
    const firmwareInfo = this.firmwareInfo(config, info.mode_code);

    if (info.pid === 2) {
      console.error("PID 为 2 的设备暂不支持在线升级");
      return false;
    }

    if (!firmwareInfo) {
      console.error("未找到匹配该设备的固件：", info);
      return false;
    }

    if (info.version >= firmwareInfo.version) {
      console.info("当前设备的固件版本已经是最新: ", info);
      return false;
    }

    return true;
  }
}
