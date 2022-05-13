declare interface ParserFromFunc<T> {
  (data: Uint8Array): T;
}

declare interface ParserAsFunc<T> {
  (data: T): number[];
}

declare interface GetHandler<T> {
  (data: T): void;
}

declare interface SetHandler {
  (ok: boolean): void;
}

declare interface ID {
  id: number;
}

declare interface DeviceInfo {
  version: number;
  mode: 'app';
  api: number[];
  name: string;
}

declare interface Point {
  x: number;
  y: number;
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
  type: number;
  pos: KeyPostion;
  functions: KeyFunction[];
}

declare interface SimpleKey {
  id: number;
  type: number;
  pos: KeyPostion;
  function: KeyFunction;
}

declare interface Password {
  id: number;
  content: string;
}

declare interface Text {
  id: number;
  encode: 'GBK' | 'Unicode';
  content: string;
}
