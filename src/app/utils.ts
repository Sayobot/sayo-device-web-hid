export const random = (min: number, max: number) => Math.round(Math.random() * (max - min + 1) + min);

export const randomAsciiString = (size: number) => {
  let chars = [];

  console.log(size);

  while (chars.length < size) {
    const char = String.fromCharCode(random(0, 127));

    if(/[a-zA-Z0-9]/.test(char)) {
      chars.push(char);
    }
  }

  return chars.join('');
};
