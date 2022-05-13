export enum KeyType {
  Button, // 普通按钮
  Clockwise, // 顺时针旋转
  Anticlockwise, // 逆时针旋转
}

export const Config = {
  cmdSize: 2,

  vendorId: 0x8089,
  reportId: 0x02,

  checkSumStepSize: 2,
  period: 10,
};

export enum Offset {
  Cmd,
  Size,
  Method,
  Id,
}

export enum Method {
  Read = 0,
  Write = 1,
}

export enum Cmd {
  Save = 0x04,
  MetaInfo = 0x00,
  Key = 0x16,
  SimpleKey = 0x06,
  Password = 0x0B
}
