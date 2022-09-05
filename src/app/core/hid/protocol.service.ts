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
  constructor() { }

  save(device: HIDDevice, handler: SetHandler) {
    let data = [O2Core.Cmd.Save, O2Core.Config.cmdSize, 0x72, 0x96];

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const reportData = new Uint8Array(data);
    O2Utils.requestByWrite(device, reportData, handler);
  }

  get_metaInfo(device: HIDDevice, handler: GetHandler<DeviceInfo>) {
    const reportData = new Uint8Array([O2Core.Cmd.MetaInfo, 0x00, 0x02]);
    O2Utils.requestByRead(device, reportData, O2Parser.asMetaInfo, handler);
  }

  get_simplekey(device: HIDDevice, handler: GetHandler<SimpleKey[]>) {
    O2Utils.loopRequestByRead(device, O2Core.Cmd.SimpleKey, O2Parser.asSimpleKey, handler);
  }

  get_key(device: HIDDevice, handler: GetHandler<Key[]>) {
    O2Utils.loopRequestByRead(device, O2Core.Cmd.Key, O2Parser.asKey, handler);
  }

  get_pwd(device: HIDDevice, handler: GetHandler<Password[]>) {
    O2Utils.loopRequestByRead(device, O2Core.Cmd.Password, O2Parser.asPassword, handler);
  }

  get_gbk(device: HIDDevice, handler: GetHandler<IText[]>) {
    O2Utils.loopRequestByRead(device, O2Core.Cmd.Text, O2Parser.asGBK, handler);
  }

  get_unicode(device: HIDDevice, handler: GetHandler<IText[]>) {
    O2Utils.loopRequestByRead(device, O2Core.Cmd.Text, O2Parser.asUnicode, handler);
  }

  set_simplekey(device: HIDDevice, key: SimpleKey, handler: SetHandler) {
    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.SimpleKey;
    data[O2Core.Offset.Size] = 8;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = key.id;

    data = data.concat(O2Parser.toSimpleBuffer(key));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const reportData = new Uint8Array(data);
    O2Utils.requestByWrite(device, reportData, handler);
  }

  set_key(device: HIDDevice, key: Key, handler: SetHandler) {
    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Key;
    data[O2Core.Offset.Size] = 16 + key.functions.length * 6;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = key.id;
    data[4] = 64; // ?

    data = data.concat(O2Parser.toKeyBuffer(key));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const reportData = new Uint8Array(data);
    O2Utils.requestByWrite(device, reportData, handler);
  }

  set_pwd(device: HIDDevice, pwd: Password, handler: SetHandler) {
    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Password;
    data[O2Core.Offset.Size] = pwd.content.length + 3;
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = pwd.id;

    data = data.concat(O2Parser.toPasswordBuffer(pwd));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const reportData = new Uint8Array(data);
    O2Utils.requestByWrite(device, reportData, handler);
  }

  set_gbk(device: HIDDevice, text: IText, handler: SetHandler) {
    let data = [];

    data[O2Core.Offset.Cmd] = O2Core.Cmd.Text;
    data[O2Core.Offset.Size] = 56 + 3; // ?
    data[O2Core.Offset.Method] = O2Core.Method.Write;
    data[O2Core.Offset.Id] = text.id;
    data.push(0); // ?

    data = data.concat(O2Parser.toGBKBuffer(text));

    const checkOffset = data[O2Core.Offset.Size] + O2Core.Config.checkSumStepSize;
    data[checkOffset] = O2Utils.calcCheckSum(data, checkOffset);

    const reportData = new Uint8Array(data);
    O2Utils.requestByWrite(device, reportData, handler);
  }

  set_unicode(device: HIDDevice, text: IText, handler: SetHandler) {
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

    const reportData = new Uint8Array(data);
    O2Utils.requestByWrite(device, reportData, handler);
  }
}
