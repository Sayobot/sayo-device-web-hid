import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DocService } from '../doc/doc.service';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';
import { Cmd } from 'src/app/core/hid';
import { ControlType, General_Keys, Linux_Keys } from '../doc';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';

@Injectable({
  providedIn: 'root',
})
export class KeyService {
  data$ = new BehaviorSubject<Key[]>([]);

  constructor(private _device: DeviceService, private _o2p: O2Protocol, private _doc: DocService,
    private _tr: TranslateService, private _loader: LoaderService) { }

  init() {
    if (!this._device.isConnected()) return;

    this._loader.loading();
    this._o2p.get_key(this._device.instance!, (data: Key[]) => {
      // filter size empty key
      const newDatas = data
        .filter((key => key.pos.size.width !== 0))
        .map((key) => {
          let newKey = key;
          for (let i = 0; i < newKey.functions.length; i++) {
            if (!this._doc.modeHas(Cmd.SimpleKey, newKey.functions[i].mode)) {
              newKey.functions[i].mode = 0;
            }
          }

          return newKey;
        });

      this.data$.next(newDatas);
      this._loader.complete();
    });
  }

  setItem(key: Key) {
    if (!this._device.isConnected()) return;

    this._o2p.set_key(this._device.instance!, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }

  getKeyName(modeCode: number, values: number[]) {
    const Default_Mode = 0;

    let name: string = '';

    const cmd = this._doc.cmd(Cmd.SimpleKey);
    if (cmd) {
      const mode = this._doc.mode(cmd.code, modeCode);

      if (mode) {
        if (mode.code === Default_Mode) {
          const [modifier, general] = values;

          const modifier_string = this.getModifierName('modifier_keys', modifier);
          const general_string = this.getGeneralName(general);

          if (!_.isEmpty(modifier_string) && !_.isEmpty(general_string)) {
            name = `${modifier_string} + ${general_string}`;
          } else if (!_.isEmpty(modifier_string) && _.isEmpty(general_string)) {
            name = modifier_string;
          } else {
            name = general_string;
          }
        } else {
          name = mode.name;

          let text_value = "";

          for (let i = 0; i < mode.files.length; i++) {
            let file = mode.files[i];
            const type = this._doc.controlType(file);
            const code = values[i];

            switch (type) {
              case ControlType.Common:
                text_value = this.getGeneralName(code);
                break;
              case ControlType.Multi:
                text_value = this.getModifierName(file, code);
                break;
              case ControlType.Param:
                text_value = this._tr.instant("参数") + ": " + String(code);
                break;
              case ControlType.Select:
                text_value = this._doc.param(file)?.optionMap.get(code)!;
                break;
              case ControlType.Switch: {
                const param_doc = this._doc.param(file)!;
                text_value = param_doc.title + ": " + param_doc.optionMap.get(code)!;
              }
                break;
              default:
                break;
            }

            name = name + "\r\n" + text_value;
          }

        }
      }
    }

    return name;
  }

  getModifierName(key: string, modifierCode: number) {
    const fill = ' + ';

    let modifier_string = '';

    const param = this._doc.param(key);
    if (param) {
      for (const [key, value] of param.optionMap) {
        if ((key & modifierCode) !== 0) {
          modifier_string += value;
          modifier_string += fill;
        }
      }

      // 移除最后一个 “ + ”
      if (!_.isEmpty(modifier_string)) {
        modifier_string = modifier_string.slice(0, -fill.length);
      }
    }

    return modifier_string;
  }

  getGeneralName(generalCode: number) {
    let name = '';

    for (const key of General_Keys) {
      if (key.code === generalCode) {
        name = key.name;
        break;
      }
    }

    if (!_.isEmpty(name)) {
      return _.isEmpty(name) ? "" : this._tr.instant(name);
    }

    for (const key of Linux_Keys) {
      if (key.code === generalCode) {
        name = key.name;
        break;
      }
    }

    return _.isEmpty(name) ? "" : this._tr.instant(name);
  }
}
