export const Config = {
  cmdSize: 2,

  vendorId: 0x8089,
  reportId: 0x02,

  checkSumStepSize: 2,
};

export enum Offset {
  Cmd,
  Size,
  Method,
  Id
}

export enum Method {
  Read = 0,
  Write = 1
}

export enum Cmd {
  Key = 0x16
}
