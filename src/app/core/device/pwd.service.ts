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

  constructor(private _device: DeviceService, private _o2p: O2Protocol) {}

  init() {
    if (!this._device.device) return;

    this._o2p.get_pwd(this._device.device, (pwds) => {
      this.data$.next(pwds);
    });
  }

  setItem(pwd: Password) {
    if (!this._device.device) return;

    this._o2p.set_pwd(this._device.device, pwd, (ok: boolean) => {
      setItemHandler(this.data$, pwd, ok);
      this._device.setChanged(ok);
    });
  }
}
