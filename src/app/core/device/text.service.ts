import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';



@Injectable({
  providedIn: 'root',
})
export class TextService {
  data$ = new BehaviorSubject<IText[]>([]);

  private _encode: TextEncode = "GBK";

  constructor(private _device: DeviceService, private o2p: O2Protocol, private _loader: LoaderService) { }

  init(encode: TextEncode) {
    if (!this._device.isConnected()) return;

    console.info('初始化字符串数据');

    this._loader.loading();
    switch (encode) {
      case 'GBK':
        this.o2p.get_gbk(this._device.instance!, (data: IText[]) => {
          this.data$.next(data);
          this._loader.complete();
        });
        break;
      case 'Unicode':
        this.o2p.get_unicode(this._device.instance!, (data: IText[]) => {
          this.data$.next(data);
          this._loader.complete();
        });
        break;
      default:
        console.error('不支持的文本编码格式：', encode);
        break;
    }
  }

  get encode() {
    return this._encode;
  }

  set encode(c: TextEncode) {
    this._encode = c;
    this.init(c);
  }

  setItem(text: IText) {
    if (!this._device.isConnected()) return;

    switch (this._encode) {
      case 'GBK':
        this.o2p.set_gbk(this._device.instance!, text, (ok: boolean) => {
          setItemHandler(this.data$, text, ok);
          this._device.setChanged(ok);
        });
        break;
      case 'Unicode':
        this.o2p.set_unicode(this._device.instance!, text, (ok: boolean) => {
          setItemHandler(this.data$, text, ok);
          this._device.setChanged(ok);
        });
        break;
      default:
        console.error('不支持的文本编码格式：', text.encode);
        break;
    }
  }

  swap(first: number, second: number) {
    const datas = this.data$.getValue();

    const str_first = datas[first].content;
    const str_second = datas[second].content;

    const item_fitst = datas[first];
    item_fitst.content = str_second;

    const item_second = datas[second];
    item_second.content = str_first;

    this.setItem(item_fitst);
    this.setItem(item_second);
  }
}
