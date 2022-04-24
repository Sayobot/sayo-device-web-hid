/***************************************************************************************************
 * w3c-web-hid is required for DOM Web-HID API.
 */
/// <reference types="w3c-web-hid" />
/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { fromEvent, interval, ObservableInput, Subject, switchMap, takeUntil } from 'rxjs';
import { Config, Cmd, Method, Offset } from './const';
import { keyFromBuffer, metaInfoFromBuffer } from './utils';

/**
 * 命名规则:
 * request_key 请求包装，用于需要 id 的项
 * get_xxx 读取 api
 * set_xxx 写入 api
 */

@Injectable({
  providedIn: 'root',
})
export class Protocol {
  constructor() {}

  /**
   * 请求设备元数据
   * @param device
   * @param handler
   */
  get_metaInfo(device: HIDDevice, handler: (info: DeviceInfo) => void) {
    const reportData = new Uint8Array([Cmd.MetaInfo, 0, 0x02]);

    this.read(
      device,
      metaInfoFromBuffer,
      (device: HIDDevice) => this.send_report(device, reportData),
      (data: DeviceInfo) => handler(data),
    );
  }

  /**
   * 获取按键数据
   * @param device
   * @param handler
   */
  get_key(device: HIDDevice, handler: (keys: Key[]) => void) {
    this.read_loop(
      device,
      keyFromBuffer,
      (device: HIDDevice, id: number) => this.request_key(device, id),
      (data: Key[]) => handler(data),
    );
  }

  private send_report(device: HIDDevice, reportData: Uint8Array) {
    if (device) {
      return device.sendReport(Config.reportId, reportData);
    } else {
      throw new Error('Not connect device.');
    }
  }

  /**
   * 按键请求函数
   * @param device
   * @param id
   * @returns
   */
  private request_key(device: HIDDevice, id: number) {
    const reportData = this.buffer_read(Cmd.Key, id);
    return this.send_report(device, reportData);
  }

  /**
   * 读取单个
   * @param device
   * @param parser
   * @param request
   * @param handler
   */
  private read<T>(
    device: HIDDevice,
    parser: (data: Uint8Array) => T,
    request: (device: HIDDevice) => ObservableInput<void>,
    handler: (data: T) => void,
  ) {
    const done$ = new Subject<boolean>();
    const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(takeUntil(done$));

    input$.subscribe(({ data }) => {
      const result = parser(new Uint8Array(data.buffer));
      handler(result);
      done$.next(true);
      done$.complete();
    });

    request(device);
  }

  /**
   * 读取多个，例如 按键根据 id 去读取的
   * @param device
   * @param parser 解析函数
   * @param request 请求函数
   * @param handler 处理函数
   */
  private read_loop<T>(
    device: HIDDevice,
    parser: (data: Uint8Array) => T,
    request: (device: HIDDevice, id: number) => ObservableInput<void>,
    handler: (data: T[]) => void,
  ) {
    let result: T[] = [];

    const done$ = new Subject<boolean>();
    const input$ = fromEvent<HIDInputReportEvent>(device, 'inputreport').pipe(takeUntil(done$));
    const request$ = interval(Config.period).pipe(
      takeUntil(done$),
      switchMap((id) => request(device, id)),
    );

    input$.subscribe(({ data }) => {
      if (data.getUint8(0) === 0xff || data.getUint8(0) === 0x04) {
        done$.next(true);
        done$.complete();
      }

      const key = parser(new Uint8Array(data.buffer));
      result.push(key);
    });

    request$.subscribe();
    done$.subscribe((done) => {
      if (done) handler(result);
    });
  }

  /**
   * 用来生成 read 请求的工具函数
   * @param cmd
   * @param id
   * @returns
   */
  private buffer_read(cmd: Cmd, id: number) {
    const checkOffset = Config.cmdSize + Config.checkSumStepSize;

    let reportData = new Array(checkOffset).fill(0);
    reportData[Offset.Cmd] = cmd;
    reportData[Offset.Size] = Config.cmdSize;
    reportData[Offset.Method] = Method.Read;
    reportData[Offset.Id] = id;
    reportData[checkOffset] = this.checkSum(reportData, checkOffset);

    return new Uint8Array(reportData);
  }

  /**
   * 计算检验和
   * @param data
   * @param checkBit
   * @returns
   */
  private checkSum(data: number[], checkBit: number) {
    return data.slice(0, checkBit).reduce((sum, n) => sum + n) + Config.checkSumStepSize;
  }
}
