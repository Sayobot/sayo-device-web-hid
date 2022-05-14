import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  data$ = new BehaviorSubject<Text[]>([]);

  constructor(private _device: DeviceService, private o2p: O2Protocol) {}

  init(encode: TextEncode) {
    if (!this._device.device) return;

    console.info('初始化字符串数据');
    switch (encode) {
      case 'GBK':
        this.o2p.get_gbk(this._device.device, (data: Text[]) => this.data$.next(data));
        break;
      case 'Unicode':
        this.o2p.get_unicode(this._device.device, (data: Text[]) => this.data$.next(data));
        break;
      default:
        console.error('不支持的文本编码格式：', encode);
        break;
    }
  }

  setItem(text: Text) {
    if (!this._device.device) return;

    switch (text.encode) {
      case 'GBK':
        this.o2p.set_gbk(this._device.device, text, (ok: boolean) => {
          setItemHandler(this.data$, text, ok);
          this._device.setChanged(ok);
        });
        break;
      case 'Unicode':
        this.o2p.set_unicode(this._device.device, text, (ok: boolean) => {
          setItemHandler(this.data$, text, ok);
          this._device.setChanged(ok);
        });
        break;
      default:
        console.error('不支持的文本编码格式：', text.encode);
        break;
    }
  }
}
