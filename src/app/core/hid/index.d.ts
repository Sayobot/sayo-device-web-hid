declare interface O2Service<T> {
  init(): Promise<string>;
  setItem(data: T): void;
  isSupport(): boolean;
}

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

declare interface Light {
  id: number;
  colors: LightColor[];
}

declare interface LightColor {
  action: number;
  values: number[];
}

declare interface Password {
  id: number;
  content: string;
}

declare interface ReadListOption<T> {
  cmd: number;
  key: string;
  parser: ParserFromFunc<T>;
  handler: GetHandler<T[]>;
  lock: O2Lock;
  log: boolean;
  HIDLog: boolean;
}

declare interface ReadItemOption<T> {
  cmd: number;
  key: string;
  buffer: Uint8Array,
  parser: ParserFromFunc<T>;
  handler: GetHandler<T>;
  log: boolean;
  HIDLog: boolean;
}

declare interface WriteItemOption {
  key: string;
  buffer: Uint8Array,
  handler: SetHandler;
  HIDLog: boolean;
}

type TextEncode = 'GBK' | 'Unicode';

declare interface IText {
  id: number;
  encode: TextEncode;
  content: string;
}

interface Level {
  id: number;
  name: string;
}

declare interface O2Lock {
  setLogEnable(ok: boolean): void;
  isLock(): boolean;
  lock(): boolean;
  unlock(): boolean;
  counter(): number;
}
