/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import O2Core, { ResponseType as O2ResType, ResponseType } from './const';
import O2Utils from './utils';
import O2Parser from './parser';
import { lockFactory } from './lock';

export interface O2Response<T> {
  statu: O2ResType,
  data: T;
}

function wait(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

const REQUEST_SIZE = 63;

// 字节序是否为小端
const isLittleEndian = () => {
  const buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true);
  return new Int16Array(buffer)[0] === 256;
};

const isLittle = isLittleEndian();

const getAddrArray = (addr: number, addr_len: number, isLittle: boolean) => {
  const addr_buf = new ArrayBuffer(addr_len);
  const dataview = new DataView(addr_buf);


  switch (addr_len) {
    case 2:
      dataview.setUint16(0, addr);
      break;
    case 4:
      dataview.setUint32(0, addr);
      break;
  }

  const addr_arr = [...new Uint8Array(addr_buf)];
  return isLittle ? [...addr_arr.reverse()] : [...addr_arr];
}

@Injectable({
  providedIn: 'root',
})
export class O2Protocol {
  private _log = false;
  private _hidLog = false;

  private lock = lockFactory("HID Request");

  constructor() { }

  setLogEnable(ok: boolean) {
    this._log = ok;
  }

  setHIDLogEnable(ok: boolean) {
    this._hidLog = ok;
  }

  save(device: HIDDevice, handler: SetHandler) {
    let data = [O2Core.Cmd.Save, O2Core.Config.cmdSize, 0x72, 0x96];

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Save to device",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }

  async write_memory(device: HIDDevice, addr: number, addr_len: number, data: number[]) {
    const out_array = Array(REQUEST_SIZE).fill(0);
    out_array[0] = O2Core.Cmd.MemoryWrite;
    out_array[1] = data.length + addr_len;

    const ADDR_START = 2;
    const DATA_START = ADDR_START + addr_len;

    const addr_array = getAddrArray(addr, addr_len, isLittle);
    out_array.splice(ADDR_START, addr_len, ...addr_array);
    out_array.splice(DATA_START, data.length, ...data);

    const out_buf = this.fillBuffer(out_array);

    // console.log("addr: ", i);
    // console.log("Num array : ", [...out_buf].map(n => n).join(" "));
    // console.log("HEX buffer: ", [...out_buf].map(n => (n > 15 ? n.toString(16) : `0${n.toString(16)}`)).join(" "));
    // console.log("out index : ", [...out_buf].map((n, i) => i > 9 ? i : `0${i}`).join(" "));

    return await this.takeData(device, out_buf, O2Parser.onlyStatu);
  }

  async bootlodaer_model_code(device: HIDDevice) {
    const out_buf = this.fillBuffer([1, 0, 3]);
    return await this.takeData(device, out_buf, O2Parser.asBLMetaInfo);
  }

  async erase_firmware(device: HIDDevice) {
    // 02 04 00 06
    const out_buf = this.fillBuffer([O2Core.Cmd.EraseFlash, 0]);
    return await this.takeData(device, out_buf, O2Parser.onlyStatu);
  }

  async verify_firmware(device: HIDDevice) {
    // 02 05 00 07
    const out_buf = this.fillBuffer([O2Core.Cmd.FirmwareVerify, 0]);
    return await this.takeData(device, out_buf, O2Parser.onlyStatu);
  }

  async jump_bootloader(device: HIDDevice) {
    // 02 ff 02 72 96 0b 发两次
    let out_buf = this.fillBuffer([O2Core.Cmd.Bootloader, O2Core.Config.cmdSize, 0x72, 0x96]);

    await this.takeData(device, out_buf, O2Parser.onlyStatu);
    await this.takeData(device, out_buf, O2Parser.onlyStatu);
  }

  async jump_app(device: HIDDevice) {
    // 02 03 00 05
    let out_buf = this.fillBuffer([O2Core.Cmd.ExecApp, 0]);
    return await this.takeData(device, out_buf, O2Parser.onlyStatu);
  }

  async get_metaInfo_2(device: HIDDevice) {
    const out_buf = new Uint8Array([O2Core.Cmd.MetaInfo, 0x00, 0x02]);
    return this.takeData(device, out_buf, O2Parser.asMetaInfo);
  };

  async get_device_name(device: HIDDevice) {
    const out_buf = new Uint8Array([O2Core.Cmd.DeviceName, 0x01, 0x00, 0x0b]);
    return this.takeData(device, out_buf, O2Parser.asDeviceName);
  }

  async set_device_name(device: HIDDevice, name: string) {
    const out_array = Array(REQUEST_SIZE).fill(0);
    out_array[O2Core.Offset.Cmd] = O2Core.Cmd.DeviceName;
    out_array[O2Core.Offset.Size] = 32;
    out_array[O2Core.Offset.Method] = O2Core.Method.Write;

    const name_buf = O2Parser.toNameBuffer(name);

    out_array.splice(3, 3 + name_buf.length, ...name_buf);

    const out_buf = this.fillBuffer(out_array);
    return await this.takeData(device, out_buf, O2Parser.onlyStatu);
  }

  private async takeData<T>(device: HIDDevice, out_buf: Uint8Array, parser: ParserFromFunc<T>): Promise<O2Response<T>> {
    if (this._hidLog) {
      console.log("Out Report Buffer:", out_buf);
    }

    const in_buf = await O2Utils.sendReport2(device, out_buf);
    const uint8_buf = new Uint8Array(in_buf);

    if (this._hidLog) {
      console.log("In Report Buffer:", uint8_buf);
    }

    const result = parser(uint8_buf);
    return { statu: uint8_buf[0], data: result };
  }

  private fillBuffer(data: number[]): Uint8Array {
    const result = [...data];

    const checkOffset = result[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    result[checkOffset] = O2Utils.calcCheckSum(result.slice(0, checkOffset));

    return new Uint8Array(result);
  }

  get_metaInfo(device: HIDDevice, handler: GetHandler<DeviceInfo>) {
    const reportData = new Uint8Array([O2Core.Cmd.MetaInfo, 0x00, 0x02]);

    const option: ReadItemOption<DeviceInfo> = {
      key: "Device Info",
      cmd: O2Core.Cmd.MetaInfo,
      parser: O2Parser.asMetaInfo,
      buffer: reportData,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
    }

    O2Utils.requestByRead(device, option);
  }

  get_simplekey(device: HIDDevice, handler: GetHandler<SimpleKey[]>) {
    const option: ReadListOption<SimpleKey> = {
      key: "Simple Key",
      cmd: O2Core.Cmd.SimpleKey,
      parser: O2Parser.asSimpleKey,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  get_key(device: HIDDevice, handler: GetHandler<Key[]>) {
    const option: ReadListOption<Key> = {
      key: "Key",
      cmd: O2Core.Cmd.Key,
      parser: O2Parser.asKey,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  get_pwd(device: HIDDevice, handler: GetHandler<Password[]>) {
    const option: ReadListOption<Password> = {
      key: "Password",
      cmd: O2Core.Cmd.Password,
      parser: O2Parser.asPassword,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  get_gbk(device: HIDDevice, handler: GetHandler<IText[]>) {
    const option: ReadListOption<IText> = {
      key: "GBK",
      cmd: O2Core.Cmd.Text,
      parser: O2Parser.asGBK,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  get_unicode(device: HIDDevice, handler: GetHandler<IText[]>) {
    const option: ReadListOption<IText> = {
      key: "Unicode",
      cmd: O2Core.Cmd.Text,
      parser: O2Parser.asUnicode,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  get_light(device: HIDDevice, handler: GetHandler<Light[]>) {
    const option: ReadListOption<Light> = {
      key: "Light",
      cmd: O2Core.Cmd.Light,
      parser: O2Parser.asLight,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  get_option_byte(device: HIDDevice, handler: GetHandler<DeviceOption[]>) {
    const option: ReadListOption<DeviceOption> = {
      key: "Device Option",
      cmd: O2Core.Cmd.Option,
      parser: O2Parser.asOption,
      handler: handler,
      log: this._log,
      HIDLog: this._hidLog,
      lock: this.lock,
    }

    O2Utils.loopRequestByRead(device, option);
  }

  set_option_byte(device: HIDDevice, deviceOpt: DeviceOption, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "Option Byte", deviceOpt);
    }

    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Option;
    data[O2Core.Offset.Size] = deviceOpt.values.length;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = deviceOpt.id;

    data = data.concat(O2Parser.toOptionByte(deviceOpt));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Option Byte",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }

    O2Utils.requestByWrite(device, option);
  }

  set_simplekey(device: HIDDevice, key: SimpleKey, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "Simple Key", key);
    }

    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.SimpleKey;
    data[O2Core.Offset.Size] = 8;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = key.id;

    data = data.concat(O2Parser.toSimpleBuffer(key));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Simple Key",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }

  set_key(device: HIDDevice, key: Key, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "Key", key);
    }

    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Key;
    data[O2Core.Offset.Size] = 16 + key.functions.length * 6;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = key.id;
    data[4] = 64; // ?

    data = data.concat(O2Parser.toKeyBuffer(key));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Key",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }

  set_pwd(device: HIDDevice, pwd: Password, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "Password", pwd);
    }

    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Password;
    data[O2Core.Offset.Size] = pwd.content.length + 3;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = pwd.id;

    data = data.concat(O2Parser.toPasswordBuffer(pwd));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Password",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }

  set_gbk(device: HIDDevice, text: IText, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "GBK", text);
    }

    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Text;
    data[O2Core.Offset.Size] = 56 + 3; // ?
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = text.id;
    data.push(0); // ?

    data = data.concat(O2Parser.toGBKBuffer(text));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "GBK",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }

  set_unicode(device: HIDDevice, text: IText, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "Unicode", text);
    }

    let data = [];

    const buffer = O2Parser.toUnicodeBuffer(text);

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Text;
    data[O2Core.Offset.Size] = buffer.length > 57 ? 57 : buffer.length + 3;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = text.id;
    data.push(0); // ?

    data = data.concat(buffer);

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Unicode",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }

  set_light(device: HIDDevice, light: Light, handler: SetHandler) {
    if (this._log) {
      console.log("Write Request: ", "light", light);
    }

    let data = [];

    const buffer = O2Parser.toLightBuffer(light);

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Light;
    data[O2Core.Offset.Size] = buffer.length > 57 ? 57 : buffer.length + 2;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = light.id;

    data = data.concat(buffer);

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data.slice(0, checkOffset));

    const option: WriteItemOption = {
      key: "Light",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }
}
