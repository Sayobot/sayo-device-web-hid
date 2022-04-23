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

// export const bufferFromKey: (key:Key) => Uint8Array;

export const keyFromBuffer: (data: Uint8Array) => Key = (data: Uint8Array) => {
  data = data.slice(2);

  const width = data[10] + data[11] * 256;
  const height = data[12] + data[13] * 256;
  const midX = data[4] + data[5] * 256;
  const midY = data[6] + data[7] * 256;

  const pos: KeyPostion = {
    point: {
      left: midX - width / 2,
      top: midY - height / 2,
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
