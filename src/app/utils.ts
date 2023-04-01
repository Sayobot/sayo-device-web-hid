export const random = (min: number, max: number) => Math.round(Math.random() * (max - min + 1) + min);

export const randomAsciiString = (size: number) => {
  let chars = [];

  while (chars.length < size) {
    chars.push(String.fromCharCode(random(0, 127)));
  }

  return chars.join('');
};
