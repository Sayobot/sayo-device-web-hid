import { Cmd, KeyType } from './const';
import * as iconvLite from 'iconv-lite';

export const MetaInfoFromBuffer: ParserFromFunc<DeviceInfo> = (data: Uint8Array) => {
  let info: DeviceInfo = {
    version: data[0] * 256 + data[1],
    mode: 'app',
    name: '',
    api: [...new Set(data.slice(8, data[1]))],
  };

  // remove simplekey if has key
  if (info.api.includes(Cmd.SimpleKey) && info.api.includes(Cmd.Key)) {
    const index = info.api.indexOf(Cmd.SimpleKey);
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
    type: KeyType.Button,
    pos: { point, size },
    function: func,
  };
};

export const SimpleKeyAsBuffer: ParserAsFunc<SimpleKey> = (key: SimpleKey) => {
  const { mode, values } = key.function;
  const data: number[] = [mode, 0, values[0], values[1], values[2], values[3]];
  return data.map((item) => (item === undefined ? 0 : item));
};

export const KeyFromBuffer: ParserFromFunc<Key> = (data: Uint8Array) => {
  const level = data[1];

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
  for (let i = 0; i < (level - 16) / 6; i++) {
    const start = 16 + i * 6;
    functions.push({
      mode: data[start],
      values: [data[start + 2], data[start + 3], data[start + 4], data[start + 5]],
    });
  }

  return <Key>{ id: data[1], type: data[3], pos, functions };
};

export const KeyAsBuffer: ParserAsFunc<Key> = (key: Key) => {
  const Data_start = 13;

  const { functions } = key;

  let data: number[] = new Array(functions.length * 6 + 1).fill(0);
  data.push(key.type);

  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    data[Data_start + i * 6] = func.mode;

    for (let j = 0; j < func.values.length; j++) {
      data[Data_start + i * 6 + j + 2] = func.values[j];
    }
  }

  return data.map((item) => (item === undefined ? 0 : item));
};

export const PwdFromBuffer: ParserFromFunc<Password> = (data: Uint8Array) => {
  data = data.slice(2);

  const id = data[1];

  const str = [...data.slice(2)];
  let contentArr = [];

  for (let i = 0; i < str.length; i++) {
    if (str[i] === 0) break;

    contentArr.push(String.fromCharCode(str[i]));
  }

  return <Password>{ id, content: contentArr.join('') };
};

export const PwdAsBuffer: ParserAsFunc<Password> = (data: Password) => {
  let arr = [];

  for (let i = 0; i < data.content.length; i++) {
    arr.push(data.content.charCodeAt(i));
  }

  return arr;
};

export const GbkFromBuffer: ParserFromFunc<IText> = (data: Uint8Array) => {
  const Max_Length = 56;
  const Text_Start = 3;

  data = data.slice(2);

  const id = data[1];

  let arr = [];

  for (let i = 0; i < Max_Length; i += 2) {
    if (data[Text_Start + i] === 0) {
      arr.push(data[Text_Start + i + 1]);
    } else {
      arr.push(data[Text_Start + i + 1]);
      arr.push(data[Text_Start + i]);
    }
  }

  let gbkDecoder = new TextDecoder('gbk');
  const bytes = new Uint8Array(arr.filter((code) => code !== 0));

  return <IText>{ id, encode: 'GBK', content: gbkDecoder.decode(bytes) };
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

export const UnicodeFromBuffer: ParserFromFunc<IText> = (data: Uint8Array) => {
  const Max_Length = 56;
  const Text_Start = 3;

  data = data.slice(2);

  const id = data[1];

  let arr = [];

  for (let i = 0; i < Max_Length; i += 2) {
    const low = data[Text_Start + i + 1];
    const high = data[Text_Start + i];

    if (high + low !== 0) {
      arr.push(high);
      arr.push(low);
    }
  }

  let unicodeDecoder = new TextDecoder('unicode');
  const bytes = new Uint8Array(arr);

  return <IText>{ id, encode: 'Unicode', content: unicodeDecoder.decode(bytes) };
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
