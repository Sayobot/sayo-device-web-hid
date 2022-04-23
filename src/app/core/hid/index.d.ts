declare namespace HID {
  enum KeyType {
    Button, // 普通按钮
    KnobAnticlockwise, // 逆时针旋转
    KnobClockwise, // 顺时针旋转
  }
}

declare interface DeviceInfo {
  version: number;
  mode: 'app';
  api: number[];
  name: string;
}

declare interface Point {
  left: number;
  top: number;
}

declare interface Size {
  width: number;
  height: number;
  radius: number;
}

declare interface KeyPostion {
  point: Point;
  size: Size;
}

declare interface KeyFunction {
  mode: number;
  values: number[];
}

declare interface Key {
  id: number;
  type: HID.KeyType;
  pos: KeyPostion;
  functions: KeyFunction[];
}
