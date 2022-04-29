export const typeOf = (ev: HIDInputReportEvent) => {};

export const metaInfoFromBuffer: (data: Uint8Array) => DeviceInfo = (data: Uint8Array) => {
  const info: DeviceInfo = {
    version: data[0] * 256 + data[1],
    mode: 'app',
    name: '',
    api: [...data.slice(8, data[1])],
  };

  return info;
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
