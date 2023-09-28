export const random = (min: number, max: number) => Math.round(Math.random() * (max - min + 1) + min);

export const randomAsciiString = (size: number) => {
  let chars = [];

  console.log(size);

  while (chars.length < size) {
    const char = String.fromCharCode(random(0, 127));

    if (/[a-zA-Z0-9]/.test(char)) {
      chars.push(char);
    }
  }

  return chars.join('');
};


export const Breakpointer = {
  Large: "(min-width: 1500px)",
  Medium: "(min-width: 1200px) and (max-width: 1499px)",
  Small: "(min-width: 600px) and (max-width: 1199px)",
  XSmall: "(max-width: 599px)"
}

export const ScreenMatch = [Breakpointer.Large, Breakpointer.Medium, Breakpointer.Small, Breakpointer.XSmall];

export const DisplaySizeMap: { [size: string]: number } = {
  [Breakpointer.Large]: 1200,
  [Breakpointer.Medium]: 900,
  [Breakpointer.Small]: 600,
  [Breakpointer.XSmall]: 400
}

export const sleep = (duration: number) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, duration)
  })
}
