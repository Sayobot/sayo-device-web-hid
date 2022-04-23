export const typeOf = (ev: HIDInputReportEvent) => {};

// export const bufferFromKey: (key:Key) => Uint8Array;

export const keyFromBuffer: (data: Uint8Array) => Key = (data: Uint8Array) => {
  data = data.slice(2);

  const pos: KeyPostion = {
    point: {
      left: data[4] + data[5] * 256,
      top: data[6] + data[7] * 256,
    },
    size: {
      width: data[10] + data[11] * 256,
      height: data[12] + data[13] * 256,
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