import O2Core from './const';
import * as iconvLite from 'iconv-lite';

const FUNCTION_START = 16;
const FUNCTION_LENGTH = 6;
const TEXT_MAX_LENGTH = 56;
const TEXT_START = 3;
const COLOR_START = 2;
const COLOR_LENGTH = 10;

const SUPPORT_START = 8;

export const nameFromBuffer: ParserFromFunc<string> = (data) => {
  const str_len = data[1];
  const codes = data.slice(2, str_len);

  const unicodes: string[] = [];

  for (let i = 0; i < codes.length; i += 2) {
    const codePoint = codes[i] | (codes[i + 1] << 8);
    unicodes.push(String.fromCodePoint(codePoint));
  }

  return unicodes.join("");
}

export const BL_MetaInfoFromBuffer: ParserFromFunc<DeviceInfo> = (data) => {

  let info: DeviceInfo = {
    pid: 0,
    version: 0,
    mode_code: data[4] * 256 + data[5],
    name: '',
    api: [],
  };
  return info;
}

export const MetaInfoFromBuffer: ParserFromFunc<DeviceInfo> = (data: Uint8Array) => {

  const length = data[1];

  data = data.slice(2);

  let info: DeviceInfo = {
    pid: 0,
    version: data[0] * 256 + data[1],
    mode_code: data[2] * 256 + data[3],
    name: '',
    api: [...new Set(data.slice(SUPPORT_START, SUPPORT_START + length))],
  };

  // remove simplekey if has key
  if (info.api.includes(O2Core.Cmd.SimpleKey) && info.api.includes(O2Core.Cmd.Key)) {
    const index = info.api.indexOf(O2Core.Cmd.SimpleKey);
    info.api.splice(index, 1);
  }

  return info;
};

export const SimpleKeyFromBuffer: ParserFromFunc<SimpleKey> = (data: Uint8Array) => {
  data = data.slice(2);

  const id = data[1];

  const spacer = 8;

  const size: Size = {
    width: 60,
    height: 60,
    radius: 8,
  };

  const point: Point = {
    x: (id + 1) * spacer + id * size.width,
    y: spacer,
  };

  let func: KeyFunction = {
    mode: data[2],
    values: [data[4], data[5], data[6], data[7]],
  };

  return <SimpleKey>{
    id,
    type: O2Core.KeyType.Button,
    pos: { point, size },
    function: func,
  };
};

export const KeyFromBuffer: ParserFromFunc<Key> = (data: Uint8Array) => {
  const length = data[1];

  data = data.slice(2);

  const width = data[10] + data[11] * 256;
  const height = data[12] + data[13] * 256;
  const midX = data[4] + data[5] * 256;
  const midY = data[6] + data[7] * 256;

  const pos: KeyPostion = {
    point: {
      x: midX - width / 2,
      y: midY - height / 2,
    },
    size: {
      width,
      height,
      radius: data[14] + data[15] * 256,
    },
  };

  let functions: KeyFunction[] = [];
  for (let i = 0; i < (length - FUNCTION_START) / FUNCTION_LENGTH; i++) {
    const start = FUNCTION_START + i * FUNCTION_LENGTH;
    functions.push({
      mode: data[start],
      values: [data[start + 2], data[start + 3], data[start + 4], data[start + 5]],
    });
  }

  return <Key>{ id: data[1], type: data[3], pos, functions };
};

export const PwdFromBuffer: ParserFromFunc<Password> = (data: Uint8Array) => {
  const dataSize = data[1] - 4;
  const max = dataSize < 32 ? 32 : dataSize;

  data = data.slice(2);

  const id = data[1];

  const str = [...data.slice(2)];
  let contentArr = [];

  for (let i = 0; i < str.length; i++) {
    if (str[i] === 0) break;

    contentArr.push(String.fromCharCode(str[i]));
  }

  return <Password>{ id, content: contentArr.join(''), max };
};

export const GbkFromBuffer: ParserFromFunc<IText> = (data: Uint8Array) => {
  data = data.slice(2);

  const id = data[1];

  let arr = [];

  for (let i = 0; i < TEXT_MAX_LENGTH; i += 2) {
    if (data[TEXT_START + i] === 0) {
      arr.push(data[TEXT_START + i + 1]);
    } else {
      arr.push(data[TEXT_START + i + 1]);
      arr.push(data[TEXT_START + i]);
    }
  }

  let gbkDecoder = new TextDecoder('gbk');
  const bytes = new Uint8Array(arr.filter((code) => code !== 0));

  return <IText>{ id, encode: 'GBK', content: gbkDecoder.decode(bytes) };
};

export const UnicodeFromBuffer: ParserFromFunc<IText> = (data: Uint8Array) => {
  data = data.slice(2);

  const id = data[1];

  let arr = [];

  for (let i = 0; i < TEXT_MAX_LENGTH; i += 2) {
    const low = data[TEXT_START + i + 1];
    const high = data[TEXT_START + i];

    if (high + low !== 0) {
      arr.push(high);
      arr.push(low);
    }
  }

  let unicodeDecoder = new TextDecoder('unicode');
  const bytes = new Uint8Array(arr);

  return <IText>{ id, encode: 'Unicode', content: unicodeDecoder.decode(bytes) };
};

export const LightFromBuffer: ParserFromFunc<Light> = (data: Uint8Array) => {
  const length = data[1];

  data = data.slice(2);

  const id = data[1];

  let colors: LightColor[] = [];

  for (let i = 0; i < (length - COLOR_START) / COLOR_LENGTH; i++) {
    const start = COLOR_START + i * COLOR_LENGTH;
    colors.push({
      action: data[start],
      values: [...data.slice(start + 1, start + COLOR_LENGTH)],
    });
  }

  let light: Light = { id, colors };

  return light;
}

export const OptionFromBuffer: ParserFromFunc<DeviceOption> = (data: Uint8Array) => {

  let result: DeviceOption = {
    id: 0,
    values: [...data.slice(5)]
  }

  return result;
};

export const NameAsBuffer: ParserAsFunc<string> = (name: string) => {
  let unicodeCodes = [];
  for (let i = 0; i < name.length; i++) {
    const codePoint = name.codePointAt(i);
    const lowByte = codePoint! & 0xff;
    const highByte = (codePoint! >> 8) & 0xff;
    unicodeCodes.push(lowByte, highByte);
  }
  return unicodeCodes;
}

export const OptionAsBuffer: ParserAsFunc<DeviceOption> = (option: DeviceOption) => {
  return [0, ...option.values];
}

export const LightAsBuffer: ParserAsFunc<Light> = (light: Light) => {
  return light.colors.reduce(
    (result: number[], color: LightColor) => result.concat([color.action, ...color.values])
    , [])
    .concat([0]);
}

export const SimpleKeyAsBuffer: ParserAsFunc<SimpleKey> = (key: SimpleKey) => {
  const { mode, values } = key.function;
  const data: number[] = [mode, 0, values[0], values[1], values[2], values[3]];
  return data.map((item) => (item === undefined ? 0 : item));
};

export const KeyAsBuffer: ParserAsFunc<Key> = (key: Key) => {
  const DATA_START = FUNCTION_START - 3;

  const { functions } = key;

  let data: number[] = new Array(functions.length * 6 + 1).fill(0);
  data.push(key.type);

  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    data[DATA_START + i * 6] = func.mode;

    for (let j = 0; j < func.values.length; j++) {
      data[DATA_START + i * 6 + j + 2] = func.values[j];
    }
  }

  return data.map((item) => (item === undefined ? 0 : item));
};

export const PwdAsBuffer: ParserAsFunc<Password> = (data: Password) => {
  let arr = [];

  for (let i = 0; i < data.content.length; i++) {
    arr.push(data.content.charCodeAt(i));
  }

  return arr;
};

export const GbkAsBuffer: ParserAsFunc<IText> = (data: IText) => {
  let arr = [];

  data.content.split('').forEach((char) => {
    const buffer = iconvLite.encode(char, 'gbk');

    if (buffer.byteLength === 1) {
      arr.push(0);
      arr.push(buffer[0]);
    } else {
      arr.push(buffer[1]);
      arr.push(buffer[0]);
    }
  });

  while (arr.length < 56) {
    arr.push(0);
  }

  return arr;
};

export const UnicodeAsBuffer: ParserAsFunc<IText> = (data: IText) => {
  let arr = [];

  const { content } = data;

  for (let i = 0; i < content.length; i++) {
    const code = content.charCodeAt(i);
    const low = code & 0xff;
    const high = (code >> 8) & 0xff;
    arr.push(low);
    arr.push(high);
  }

  while (arr.length < 56) {
    arr.push(0);
  }

  return arr;
};

const onlyStatu: ParserFromFunc<null> = (_) => null;

export default {
  // buffer to data
  asDeviceName: nameFromBuffer,
  asBLMetaInfo: BL_MetaInfoFromBuffer,
  asMetaInfo: MetaInfoFromBuffer,
  asGBK: GbkFromBuffer,
  asUnicode: UnicodeFromBuffer,
  asPassword: PwdFromBuffer,
  asKey: KeyFromBuffer,
  asSimpleKey: SimpleKeyFromBuffer,
  asLight: LightFromBuffer,
  asOption: OptionFromBuffer,

  onlyStatu,

  // data to buffer
  toNameBuffer: NameAsBuffer,
  toGBKBuffer: GbkAsBuffer,
  toUnicodeBuffer: UnicodeAsBuffer,
  toPasswordBuffer: PwdAsBuffer,
  toSimpleBuffer: SimpleKeyAsBuffer,
  toKeyBuffer: KeyAsBuffer,
  toLightBuffer: LightAsBuffer,
  toOptionByte: OptionAsBuffer
}
