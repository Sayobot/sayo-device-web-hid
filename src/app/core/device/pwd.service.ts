import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';
import { Cmd, O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root',
})
export class PwdService implements O2Service<Password> {
  data$ = new BehaviorSubject<Password[]>([]);

  constructor(
    private _device: DeviceService,
    private _o2p: O2Protocol,
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
        console.info("初始化密码数据");

        const dev = this._device.instance();
        if (!dev) return;

        this._loader.loading();
        this._o2p.get_pwd(dev, (pwds) => {
          this.data$.next(pwds);
          resolve("init password successful.");
          this._loader.complete();
        });
      }
    });

  }

  setItem(pwd: Password) {
    const dev = this._device.instance();
    if (!dev) return;

    this._o2p.set_pwd(dev, pwd, (ok: boolean) => {
      setItemHandler(this.data$, pwd, ok);
      this._device.setChanged(ok);
    });
  }

  isSupport() {
    return this._device.isSupport(Cmd.Password);
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
