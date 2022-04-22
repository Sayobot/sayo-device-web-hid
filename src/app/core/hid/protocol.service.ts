/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { Config, Cmd, Method, Offset } from './const';
import { fromBuffer_key } from './utils';

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
    let response: Uint8Array[] = [];
    let done = false;

    const handleEvent = ({ data }: HIDInputReportEvent) => {
      if (data.getUint8(0) === 0xff) {
        device.removeEventListener('inputreport', handleEvent);
        done = true;
      } else {
        response.push(new Uint8Array(data.buffer));
      }
    };

    device.addEventListener('inputreport', handleEvent);

    let id = 0;
    while (!done) {
      await device.sendReport(Config.reportId, this.key_buffer(id, Method.Read));
      id++;
    }

    return response.map(key => fromBuffer_key(key));
  }

  private key_buffer(id: number, method: Method) {
    const checkBit = Config.cmdSize + Config.checkSumStepSize;

    let reportData = new Array(checkBit).fill(0);
    reportData[Offset.Cmd] = Cmd.Key;
    reportData[Offset.Size] = Config.cmdSize;
    reportData[Offset.Method] = method;
    reportData[Offset.Id] = id;

    reportData[checkBit] = this.checkSum(reportData, checkBit);

    console.log(`CMD: ${Cmd.Key}, Report Data:`, reportData);

    return new Uint8Array(reportData);
  }

  private checkSum(data: number[], checkBit: number) {
    return data.slice(0, checkBit).reduce((sum, n) => sum + n) + Config.checkSumStepSize;
  }
}
