/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from '../device/device.service';
import { Param_File_Map } from './const';
import { getMainDoc, getParamDoc } from './parser';
import { Observable, zip } from 'rxjs';
import * as _ from 'lodash';

const Param_Dir = 'assets/param';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private _main?: DocMain;
  private _paramMap: Map<string, DocParam> = new Map();

  constructor(private http: HttpClient, private device: DeviceService) {
    this.device.device$.subscribe((device: HIDDevice) => {
      console.log(`device changed: ${device.productId}`);

      const file = device.productId === 3 ? 'main_vid_3.json' : 'main.json';
      this.load(file);
    });
  }

  /**
   * 加载 params 文档
   */
  loadParamDoc() {
    const requests: Observable<ParamJson>[] = [];

    for (const file of Param_File_Map.keys()) {
      const req = this.http.get<ParamJson>(`${Param_Dir}/${file}.json`);
      requests.push(req);
    }

    zip(requests).subscribe((res) => {
      const files = Array.from(Param_File_Map.keys());
      for (let i = 0; i < files.length; i++) {
        this._paramMap.set(files[i], getParamDoc(res[i]));
      }
    });
  }

  /**
   * 加载 main 文档
   * @param file
   */
  load(file: string = 'main.json') {
    const subscribe = this.http.get<MainJson>(`${Param_Dir}/${file}`).subscribe((res) => {
      subscribe.unsubscribe();
      this._main = getMainDoc(res);
      console.log(this._main);
    });
  }

  /**
   * 获取参数文档
   * @param key
   * @returns
   */
  param(key: string) {
    if (key.endsWith('.json')) key = key.slice(0, key.length - 5);

    if (!Param_File_Map.has(key)) {
      throw new Error(`Not found param file: ${key}`);
    }

    return this._paramMap.get(key);
  }

  /**
   * 获取 cmd 文档
   * @param cmdCode
   * @returns
   */
  cmd(cmdCode: number) {
    if(!_.isNumber(cmdCode)) {
      cmdCode = Number(cmdCode);
    }

    if (!this._main) {
      throw new Error('please init main doc');
    }

    if (!this._main.cmdMap.has(cmdCode)) {
      throw new Error(`Not found cmd: ${cmdCode}`);
    }

    return this._main.cmdMap.get(cmdCode);
  }

  /**
   * 获取 mode 文档
   * @param cmdCode
   * @param modeCode
   * @returns
   */
  mode(cmdCode: number, modeCode: number) {
    const cmd = this.cmd(cmdCode)!;

    if(!_.isNumber(cmdCode)) {
      cmdCode = Number(cmdCode);
    }

    if (!cmd.modeMap.has(modeCode)) {
      throw new Error(`Not found mode code: ${modeCode}`);
    }

    return cmd.modeMap.get(modeCode);
  }

  /**
   * 获取对应的控件类型
   * @param file
   * @returns
   */
  controlType(file: string) {
    if (file.endsWith('.json')) {
      file = file.slice(0, file.length - 5);
    }

    if (!Param_File_Map.has(file)) {
      throw new Error(`Not found param file: ${file}`);
    }

    return Param_File_Map.get(file);
  }
}
