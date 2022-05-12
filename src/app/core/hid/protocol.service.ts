/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { Config, Cmd, Method, Offset } from './const';
import { keyAsBuffer, keyFromBuffer, metaInfoFromBuffer, simpleKeyAsBuffer, simpleKeyFromBuffer } from './parser';
import { calcChecksum, loopRequestByRead, requestByRead, requestByWrite } from './utils';

@Injectable({
  providedIn: 'root',
})
export class Protocol {
  constructor() {}

  /**
   * 永久保存到设备中
   * @param device
   * @param handler
   */
  save(device: HIDDevice, handler: (ok: boolean) => void) {
    let data = [Cmd.Save, Config.cmdSize, 0x72, 0x96];

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }

  /**
   * 请求设备元数据
   * @param device
   * @param handler
   */
  get_metaInfo(device: HIDDevice, handler: (info: DeviceInfo) => void) {
    const reportData = new Uint8Array([Cmd.MetaInfo, 0, 0x02]);
    requestByRead(device, reportData, metaInfoFromBuffer, handler);
  }

  /**
   * 获取兼容版按键
   * @param device
   * @param handler
   */
  get_simplekey(device: HIDDevice, handler: (keys: SimpleKey[]) => void) {
    loopRequestByRead(device, Cmd.SimpleKey, simpleKeyFromBuffer, handler);
  }

  /**
   * 修改按键数据 TODO: 重构
   * @param device
   * @param key
   * @param handler
   */
  set_simplekey(device: HIDDevice, key: SimpleKey, handler: (ok: boolean) => void) {
    let data = [];

    data[Offset.Cmd] = Cmd.SimpleKey;
    data[Offset.Size] = 8;
    data[Offset.Method] = Method.Write;
    data[Offset.Id] = key.id;

    data = data.concat(simpleKeyAsBuffer(key));

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }

  /**
   * 获取按键数据
   * @param device
   * @param handler
   */
  get_key(device: HIDDevice, handler: (keys: Key[]) => void) {
    loopRequestByRead(device, Cmd.Key, keyFromBuffer, handler);
  }

  /**
   * 修改按键数据
   * @param device
   * @param key
   * @param handler
   */
  set_key(device: HIDDevice, key: Key, handler: (ok: boolean) => void) {
    let data = [];

    data[Offset.Cmd] = Cmd.Key;
    data[Offset.Size] = 16 + key.functions.length * 6;
    data[Offset.Method] = Method.Write;
    data[Offset.Id] = key.id;
    data[4] = 40; // ?

    data = data.concat(keyAsBuffer(key));

    const checkOffset = data[Offset.Size] + Config.checkSumStepSize;
    data[checkOffset] = calcChecksum(data, checkOffset);

    const reportData = new Uint8Array(data);
    requestByWrite(device, reportData, handler);
  }
}
