import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';
import { Cmd, O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class TextService implements O2Service<IText> {
  data$ = new BehaviorSubject<IText[]>([]);

  private _encode: TextEncode = "GBK";

  constructor(
    private _device: DeviceService,
    private o2p: O2Protocol,
    private _loader: LoaderService
  ) {
    this._device.device$.subscribe(device => {
      if (device) this.data$.next([]);
    });
  }

  init(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._device.isConnected()) {
        reject("device not connect.");
      } else {
        console.info('初始化字符串数据');

        const dev = this._device.instance();
        if (!dev) return;

        this._loader.loading();
        switch (this.encode) {
          case 'GBK':
            this.o2p.get_gbk(dev, (data: IText[]) => {
              this.data$.next(data);
              resolve("init GBK successful.");
              this._loader.complete();
            });
            break;
          case 'Unicode':
            this.o2p.get_unicode(dev, (data: IText[]) => {
              this.data$.next(data);
              resolve("init Unicode successful.");
              this._loader.complete();
            });
            break;
          default:
            console.error('不支持的文本编码格式：', this.encode);
            break;
        }
      }
    });
  }

  isSupport() {
    return this._device.isSupport(Cmd.Text);
  }

  get encode() {
    return this._encode;
  }

  set encode(c: TextEncode) {
    this._encode = c;
  }

  setItem(text: IText) {
    const dev = this._device.instance();
    if (!dev) return;

    switch (this._encode) {
      case 'GBK':
        this.o2p.set_gbk(dev, text, (ok: boolean) => {
          setItemHandler(this.data$, text, ok);
          this._device.setChanged(ok);
        });
        break;
      case 'Unicode':
        this.o2p.set_unicode(dev, text, (ok: boolean) => {
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
