import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class PwdService {
  data$ = new BehaviorSubject<Password[]>([]);

  constructor(private _device: DeviceService, private _o2p: O2Protocol) { }

  init() {
    if (!this._device.isConnected()) return;

    console.info("初始化密码数据");
    this._o2p.get_pwd(this._device.instance!, (pwds) => {
      this.data$.next(pwds);
    });
  }

  setItem(pwd: Password) {
    if (!this._device.isConnected()) return;

    this._o2p.set_pwd(this._device.instance!, pwd, (ok: boolean) => {
      setItemHandler(this.data$, pwd, ok);
      this._device.setChanged(ok);
    });
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
