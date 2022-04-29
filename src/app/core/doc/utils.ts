import { DocService } from './doc.service';
import { Cmd } from 'src/app/core/hid';
import { General_Keys, Linux_Keys } from './const';
import * as _ from 'lodash';

export const getKeyModeName = (doc: DocService, modeCode: number, values: number[]) => {
  const Default_Mode = 0;

  let name: string = '';

  const cmd = doc.cmd(Cmd.SimpleKey);
  if (cmd) {
    const mode = doc.mode(cmd.code, modeCode);

    if (mode) {
      if (mode.code === Default_Mode) {
        const [modifier, general] = values;

        const modifier_string = getModifierName(doc, 'modifier_keys', modifier);
        const general_string = getGeneralName(general);

        if (!_.isEmpty(modifier_string) && !_.isEmpty(general_string)) {
          name = `${modifier_string} + ${general_string}`;
        } else if (!_.isEmpty(modifier_string) && _.isEmpty(general_string)) {
          name = modifier_string;
        } else {
          name = general_string;
        }
      } else {
        name = mode.name;
      }
    }
  }

  return name;
};

export const getModifierName = (doc: DocService, key: string, modifierCode: number) => {
  const fill = ' + ';

  let modifier_string = '';

  const param = doc.param(key);
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
};

export const getGeneralName = (generalCode: number) => {
  let name = '';

  for (const key of General_Keys) {
    if (key.code === generalCode) {
      name = key.name;
      break;
    }
  }

  if (!_.isEmpty(name)) return name;

  for (const key of Linux_Keys) {
    if (key.code === generalCode) {
      name = key.name;
      break;
    }
  }

  return name;
};
