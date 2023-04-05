/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import O2Core from './const';
import O2Utils from './utils';
import O2Parser from './parser';

@Injectable({
  providedIn: 'root',
})
export class O2Protocol {
  private _log = false;
  private _hidLog = false;

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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const option: WriteItemOption = {
      key: "Save to device",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
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
      HIDLog: this._hidLog
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
      HIDLog: this._hidLog
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
      HIDLog: this._hidLog
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
      HIDLog: this._hidLog
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
      HIDLog: this._hidLog
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
      HIDLog: this._hidLog
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
      HIDLog: this._hidLog
    }

    O2Utils.loopRequestByRead(device, option);
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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

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
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const option: WriteItemOption = {
      key: "Light",
      buffer: new Uint8Array(data),
      handler: handler,
      HIDLog: this._hidLog
    }
    O2Utils.requestByWrite(device, option);
  }
}
