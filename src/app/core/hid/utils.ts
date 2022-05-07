import { Cmd, KeyType } from './const';

export const typeOf = (ev: HIDInputReportEvent) => {};

export const metaInfoFromBuffer: (data: Uint8Array) => DeviceInfo = (data: Uint8Array) => {
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

export const simpleKeyFromBuffer: (data: Uint8Array) => SimpleKey = (data: Uint8Array) => {
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

  return {
    id,
    type: KeyType.Button,
    pos: { point, size },
    function: func,
  };
};

export const keyAsBuffer: (key: Key) => Array<number> = (key: Key) => {
  const Data_start = 13;

  const { functions } = key;

  let data = new Array(functions.length * 6 + 1).fill(0);
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

export const keyFromBuffer: (data: Uint8Array) => Key = (data: Uint8Array) => {
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

  return { id: data[1], type: data[3], pos, functions };
};
