/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from '../device/device.service';
import { Param_File_Map } from './const';
import { Observable, zip } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

const Param_Dir = 'assets/param';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private _main?: DocMain;
  private _paramMap: Map<string, DocParam> = new Map();

  constructor(private http: HttpClient, private _tr: TranslateService, private device: DeviceService) {
    this.device.device$.subscribe(() => {
      this.load(device.filename());
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
        let doc = this._parseParamDoc(res[i]);
        doc.title = this._tr.instant(doc.title);

        this._paramMap.set(files[i], doc);
      }
    });
  }

  /**
   * 加载 main 文档
   * @param file
   */
  load(file: string = 'main.json') {
    const subscribe = this.http.get<MainJson>(`${Param_Dir}/${file}`).subscribe((res) => {
      console.info(`加载选项数据: ${file}`);

      subscribe.unsubscribe();
      this._main = this._parseMainDoc(res);
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
      console.error(`Error: Not found param file: ${key}`);
    }

    return this._paramMap.get(key);
  }

  /**
   * 获取 cmd 文档
   * @param cmdCode
   * @returns
   */
  cmd(cmdCode: number) {
    cmdCode = Number(cmdCode);

    if (!this._main) {
      throw new Error('please init main doc');
    }

    if (!this._main.cmdMap.has(cmdCode)) {
      console.error(`Error: Not found cmd: ${cmdCode}`);
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
    const cmd = this.cmd(Number(cmdCode))!;

    if (!cmd.modeMap.has(modeCode)) {
      console.error(`Error: Not found mode code: ${modeCode}`);
      return cmd.modeMap.get(0);
    }

    return cmd.modeMap.get(modeCode);
  }

  modeHas(cmdCode: number, code: number) {
    const cmd = this.cmd(cmdCode)!;
    return cmd.modeMap.has(code);
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
      console.error(`Error: Not found param file: ${file}`);
    }

    return Param_File_Map.get(file);
  }

  private _parseParamDoc(json: ParamJson) {
    const name = json.title || " ";

    let doc: DocParam = {
      title: this._tr.instant(name),
      def: json.defVal,
      max: json.max,
      optionMap: new Map(),
    };

    json.data.forEach((element) => {
      const name = element.name || " ";
      doc.optionMap.set(element.code, this._tr.instant(name));
    });

    return doc;
  }

  private _parseMainDoc(json: MainJson) {
    const name = json.title || " ";

    let doc: DocMain = {
      title: this._tr.instant(name),
      cmdMap: new Map(),
    };

    json.data.forEach((element) => {
      const cmd = this._parseCmdDoc(element);
      doc.cmdMap.set(cmd.code, cmd);
    });

    return doc;
  }

  private _parseCmdDoc(json: CmdJson) {
    const name = json.title || " ";

    let doc: DocCmd = {
      name: this._tr.instant(name),
      code: json.cmd_code,
      modeMap: new Map(),
    };

    json.mode.forEach((element) => {
      const mode = this._parseModeDoc(element);
      doc.modeMap.set(mode.code, mode);
    });

    return doc;
  }

  private _parseModeDoc(json: ModeJson) {
    const name = json.name || " ";

    let doc: DocMode = {
      name: this._tr.instant(name),
      code: json.code,
      note: json?.note || '',
      files: json.values,
    };
    return doc;
  }
}
