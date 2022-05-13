import { Cmd, KeyType } from './const';

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
  for (let i = 16; i < data.length - 16; i += 6) {
    functions.push({
      mode: data[i],
      values: [data[i + 2], data[i + 3], data[i + 4], data[i + 5]],
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
