/// <reference path="./index.d.ts" />

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DeviceService } from '../device/device.service';
import { Observable, lastValueFrom, zip } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ControlType } from 'src/app/shared/components/dynamix-form';
import { OptionControlData } from 'src/app/shared/components/types';
import { General_Keys, Linux_Keys } from './const';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';

const PARAM_DIRECTION = 'assets/param';

const PARAM_MAP_CONTROL_TYPE: Map<string, ControlType> = new Map([
  ["n", ControlType.Param],
  ['layout_azerty', ControlType.Switch],
  ["lock_case", ControlType.Switch],
  ["auto_enter", ControlType.Switch],
  ["color_table", ControlType.Param],
  ["color2arr_lock", ControlType.Color],
  ["color2arr", ControlType.Color],
  ["consumer_control", ControlType.Select],
  ["general_keys", ControlType.Common],
  ["indicator_light", ControlType.Select],
  ["joystick_key", ControlType.Select],
  ["joystick", ControlType.Select],
  ["kb_led_off", ControlType.Select],
  ["kb_led_on", ControlType.Select],
  ["keep_off_time", ControlType.Param],
  ["keep_on_time", ControlType.Param],
  ["keys_switch", ControlType.Select],
  ["led_ctrl", ControlType.Select],
  ["led_mode_color", ControlType.Select],
  ["led_mode_speed", ControlType.Select],
  ["led_submode", ControlType.Select],
  ["modifier_keys", ControlType.Multi],
  ["mouse_keys", ControlType.Multi],
  ["mouse_scroll", ControlType.Param],
  ["mouse_x", ControlType.Param],
  ["mouse_xy", ControlType.Select],
  ["mouse_y", ControlType.Param],
  ["mu_keys", ControlType.Select],
  ["no_more", ControlType.Empty],
  ["ok_string", ControlType.Select],
  ["parameter", ControlType.Select],
  ["pwd_interval_time", ControlType.Param],
  ["pwd", ControlType.Select],
  ["reg", ControlType.Select],
  ["signed_char", ControlType.Param],
  ["smjb", ControlType.Param],
  ["u8", ControlType.Param],
  ["u8roll", ControlType.Param],
  ["u8rollx256", ControlType.Param],
  ["u8rollx8", ControlType.Param],
  ["u16", ControlType.Param],
  ["x1", ControlType.Param],
  ["x256", ControlType.Param],
  ["unicode_text_2", ControlType.String],
  ["mini_opt_1", ControlType.Multi],
  ["key_delay", ControlType.Param],
  ["mini_opt_2", ControlType.Multi],
  ["std_opt_HID_report", ControlType.Multi],
  ["control_option", ControlType.Select],
  ["sleep_timeout", ControlType.Param],
  ["wireless_mode", ControlType.Select],
  ["indicator_light_timeout", ControlType.Param],
  ["rocker_axia", ControlType.Select],
  ["rocker_direction", ControlType.Select,]
]);

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private _loaded = false;
  private _main?: DocMain;
  private _paramMap: Map<string, DocParam> = new Map();

  constructor(
    private http: HttpClient,
    private _tr: TranslateService,
    private device: DeviceService,
    private _loader: LoaderService
  ) {
    this.device.device$.subscribe(async () => {
      await this.load(device.filename());
    });
  }

  isLoaded() {
    return this._loaded;
  }

  /**
   * 加载 params 文档
   */
  async loadParamDoc() {
    this._loader.loading();
    const requests: Observable<ParamJson>[] = [];

    for (const file of PARAM_MAP_CONTROL_TYPE.keys()) {
      const req = this.http.get<ParamJson>(`${PARAM_DIRECTION}/${file}.json`);
      requests.push(req);
    }

    const res = await lastValueFrom(zip(requests));

    const files = Array.from(PARAM_MAP_CONTROL_TYPE.keys());
    for (let i = 0; i < files.length; i++) {
      let doc = this._parseParamDoc(res[i]);
      doc.title = this._tr.instant(doc.title);

      this._paramMap.set(files[i], doc);
    }

    this._loader.complete();
  }

  /**
   * 加载 main 文档
   * @param file
   */
  async load(file: string = 'main.json') {
    this._loader.loading();
    const res = await lastValueFrom(this.http.get<MainJson>(`${PARAM_DIRECTION}/${file}`));
    this._main = this._parseMainDoc(res);
    this._loaded = true;
    this._loader.complete();
  }

  /**
   * 获取参数文档
   * @param key
   * @returns
   */
  param(key: string) {
    if (key.endsWith('.json')) key = key.slice(0, key.length - 5);

    if (!PARAM_MAP_CONTROL_TYPE.has(key)) {
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

    if (!PARAM_MAP_CONTROL_TYPE.has(file)) {
      console.error(`Error: Not found param file: ${file}`);
    }

    return PARAM_MAP_CONTROL_TYPE.get(file);
  }

  createControlData(files: string[], values: number[]) {
    let control_data: OptionControlData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      let data: OptionControlData = {
        type: this.controlType(file)!,
        key: this.param(file)?.title!,
        value: String(values[i]),
        options: [],
      };

      if (data.type === ControlType.Common) {
        data.options.push({ key: 'None', value: String('0') });

        for (const { code, name } of General_Keys) {
          data.options.push({ key: name, value: String(code) });
        }

        for (const { code, name } of Linux_Keys) {
          data.options.push({ key: name, value: String(code) });
        }
      } else {
        for (const [code, name] of this.param(file)?.optionMap!) {
          data.options.push({ key: name, value: String(code) });
        }
      }

      control_data.push(data);
    }

    return control_data;
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
