/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from '../device/device.service';
import { Param_File_Map } from './const';
import { getMainDoc, getParamDoc } from './parser';

const Param_Dir = 'assets/param';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private _main?: DocMain;
  private _paramMap: Map<string, DocParam> = new Map();

  constructor(private http: HttpClient, private device: DeviceService) {
    this.device.deviceChanged$.subscribe((device: HIDDevice) => {
      console.log(`device changed: ${device.productId}`);

      const file = device.productId === 3 ? 'main_vid_3.json' : 'main.json';
      this.load(file);
    });
  }

  load(file: string = 'main.json') {
    const subscribe = this.http.get<MainJson>(`${Param_Dir}/${file}`).subscribe((res) => {
      subscribe.unsubscribe();
      this._main = getMainDoc(res);
      console.log(this._main);
    });
  }

  param(key: string) {
    if (key.endsWith('.json')) key = key.slice(0, key.length - 5);

    if (!Param_File_Map.has(key)) throw new Error(`Not found param file: ${key}`);

    if (!this._paramMap.has(key)) {
      const subscribe = this.http.get<ParamJson>(`${Param_Dir}/${key}`).subscribe((res) => {
        subscribe.unsubscribe();
        this._paramMap.set(key, getParamDoc(res));
      });
    }

    return this._paramMap.get(key);
  }

  cmd(code: number) {
    if (!this._main) throw new Error('please init main doc');
    if (!this._main.cmdMap.has(code)) throw new Error(`Not found cmd: ${code}`);

    return this._main.cmdMap.get(code);
  }

  mode(cmd: number, code: number) {
    const cmdMap = this.cmd(cmd);

    if (!cmdMap?.modeMap.has(code)) throw new Error(`Not found mode code: ${code}`);

    return cmdMap.modeMap.get(code);
  }
}
