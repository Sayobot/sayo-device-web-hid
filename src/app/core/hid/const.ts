export enum KeyType {
  Button, // 普通按钮
  Clockwise, // 顺时针旋转
  Anticlockwise, // 逆时针旋转
}

export const Config = {
  cmdSize: 2,

  usagePage: 0xff00,
  vendorId: 0x8089,
  reportId: 0x02,

  checkSumStepSize: 2
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
  MetaInfo = 0x00,
  MemoryRead = 0x01,
  MemoryWrite = 0x02,
  ExecApp = 0x03,
  Save = 0x04,
  EraseFlash = 0x04,
  FirmwareVerify = 0x05,
  SimpleKey = 0x06,
  Password = 0x0B,
  Text = 0x0C,
  Light = 0x10,
  Palette = 0x11,
  Key = 0x16,
  Option = 0xfc,
  Bootloader = 0xff,
  ScreenStart = 0x31,
  ScreenMain = 0x32,
  ScreenSleep = 0x33,
}

export enum ResponseType {
  None = -1,
  NotSupport = 0xff,      // 不支持的指令
  Continue = 0xfe,        // 继续接受响应码
  Done = 0x00,            // 成功且已经返回全部数据
  Ok = 0x01,              // 成功
  Message = 0x02,         // 提示
  NotSuppotData = 0x03,   // 数据不支持
  ErrorCheck = 0x04,      // 错误的校验和
  ErrorData = 0x05        // 数据错误
}

export enum LightMode {
  Static = 0
}

export const Sayo_Device_filters: HIDDeviceFilter[] = [
  {
    vendorId: 0x8089
  }
]

export default {
  KeyType,
  Config,
  Offset,
  Method,
  Cmd,
  Sayo_Device_filters
}
