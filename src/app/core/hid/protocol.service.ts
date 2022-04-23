/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { Config, Cmd, Method, Offset } from './const';
import { keyFromBuffer } from './utils';

@Injectable({
  providedIn: 'root',
})
export class Protocol {
  constructor() {}

  async sendReport(device: HIDDevice, reportData: Uint8Array) {
    if (device) {
      await device.sendReport(Config.reportId, reportData);
    } else {
      throw new Error('Not connect device.');
    }
  }

  async read_key(device: HIDDevice) {
    const buffer = await this.read(device, this.keyReadBuffer.bind(this));
    return buffer.map((key) => keyFromBuffer(key));
  }

  async read_metaInfo(device: HIDDevice) {
    let done = false;
    let response = new Uint8Array();

    const handleEvent = ({ data }: HIDInputReportEvent) => {
      response = new Uint8Array(data.buffer);
      device.removeEventListener('inputreport', handleEvent);
      done = true;
    };

    device.addEventListener('inputreport', handleEvent);

    while (!done) await this.sendReport(device, new Uint8Array([Cmd.MetaInfo, 0, 0x02]));

    return response;
  }

  private keyReadBuffer(id: number) {
    return this.readBuffer(Cmd.Key, id);
  }

  private readBuffer(cmd: Cmd, id: number) {
    const checkOffset = Config.cmdSize + Config.checkSumStepSize;

    let reportData = new Array(checkOffset).fill(0);
    reportData[Offset.Cmd] = cmd;
    reportData[Offset.Size] = Config.cmdSize;
    reportData[Offset.Method] = Method.Read;
    reportData[Offset.Id] = id;
    reportData[checkOffset] = this.checkSum(reportData, checkOffset);

    return new Uint8Array(reportData);
  }

  private async read(device: HIDDevice, bufferFunc: (id: number) => Uint8Array) {
    let response: Uint8Array[] = [];
    let done = false;

    const handleEvent = ({ data }: HIDInputReportEvent) => {
      if (data.getUint8(0) === 0xff || data.getUint8(0) === 0x04) {
        device.removeEventListener('inputreport', handleEvent);
        done = true;
      } else {
        response.push(new Uint8Array(data.buffer));
      }
    };

    device.addEventListener('inputreport', handleEvent);

    let id = 0;
    while (!done) {
      await device.sendReport(Config.reportId, bufferFunc(id));
      id++;
    }

    return response;
  }

  private checkSum(data: number[], checkBit: number) {
    return data.slice(0, checkBit).reduce((sum, n) => sum + n) + Config.checkSumStepSize;
  }
}
