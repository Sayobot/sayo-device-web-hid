/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { Config, Cmd, Method, Offset } from './const';
import { calcChecksum, loopRequestByRead, requestByRead, requestByWrite } from './utils';
import {
  GbkFromBuffer,
  KeyAsBuffer,
  KeyFromBuffer,
  MetaInfoFromBuffer,
  PwdAsBuffer,
  PwdFromBuffer,
  SimpleKeyAsBuffer,
  SimpleKeyFromBuffer,
  UnicodeAsBuffer,
  UnicodeFromBuffer,
} from './parser';

@Injectable({
  providedIn: 'root',
})
export class O2Protocol {
  constructor() {}

  save(device: HIDDevice, handler: SetHandler) {
    let data = [Cmd.Save, Config.cmdSize, 0x72, 0x96];

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }

  get_metaInfo(device: HIDDevice, handler: GetHandler<DeviceInfo>) {
    const reportData = new Uint8Array([Cmd.MetaInfo, 0, 0x02]);
    requestByRead(device, reportData, MetaInfoFromBuffer, handler);
  }

  get_simplekey(device: HIDDevice, handler: GetHandler<SimpleKey[]>) {
    loopRequestByRead(device, Cmd.SimpleKey, SimpleKeyFromBuffer, handler);
  }

  set_simplekey(device: HIDDevice, key: SimpleKey, handler: SetHandler) {
    let data = [];

    data[Offset.Cmd] = Cmd.SimpleKey;
    data[Offset.Size] = 8;
    data[Offset.Method] = Method.Write;
    data[Offset.Id] = key.id;

    data = data.concat(SimpleKeyAsBuffer(key));

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }

  get_key(device: HIDDevice, handler: GetHandler<Key[]>) {
    loopRequestByRead(device, Cmd.Key, KeyFromBuffer, handler);
  }

  set_key(device: HIDDevice, key: Key, handler: SetHandler) {
    let data = [];

    data[Offset.Cmd] = Cmd.Key;
    data[Offset.Size] = 16 + key.functions.length * 6;
    data[Offset.Method] = Method.Write;
    data[Offset.Id] = key.id;
    data[4] = 40; // ?

    data = data.concat(KeyAsBuffer(key));

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }

  get_pwd(device: HIDDevice, handler: GetHandler<Password[]>) {
    loopRequestByRead(device, Cmd.Password, PwdFromBuffer, handler);
  }

  set_pwd(device: HIDDevice, pwd: Password, handler: SetHandler) {
    let data = [];

    data[Offset.Cmd] = Cmd.Password;
    data[Offset.Size] = pwd.content.length + 3;
    data[Offset.Method] = Method.Write;
    data[Offset.Id] = pwd.id;

    data = data.concat(PwdAsBuffer(pwd));

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }

  get_gbk(device: HIDDevice, handler: GetHandler<IText[]>) {
    loopRequestByRead(device, Cmd.Text, GbkFromBuffer, handler);
  }

  get_unicode(device: HIDDevice, handler: GetHandler<IText[]>) {
    loopRequestByRead(device, Cmd.Text, UnicodeFromBuffer, handler);
  }

  set_gbk(device: HIDDevice, text: IText, handler: SetHandler) {}

  set_unicode(device: HIDDevice, text: IText, handler: SetHandler) {
    let data = [];

    const buffer = UnicodeAsBuffer(text);

    data[Offset.Cmd] = Cmd.Text;
    data[Offset.Size] = buffer.length > 57 ? 57 : buffer.length + 3;
    data[Offset.Method] = Method.Write;
    data[Offset.Id] = text.id;
    data.push(0); // ?

    data = data.concat(buffer);

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }
}
