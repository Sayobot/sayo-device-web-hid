import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cmd, O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { KeyService } from './key.service';
import { setItemHandler } from './utils';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';

@Injectable({
  providedIn: 'root',
})
export class SimpleKeyService implements O2Service<SimpleKey> {
  data$ = new BehaviorSubject<SimpleKey[]>([]);

  constructor(
    private _device: DeviceService,
    private o2p: O2Protocol,
    private _key: KeyService,
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
        const dev = this._device.instance();
        if (!dev) return;

        this._loader.loading();

        this.o2p.get_simplekey(dev, (data: SimpleKey[]) => {
          this.data$.next(data);
          resolve("init simple key successful.");
          this._loader.complete();
        });
      }
    });



  }

  setItem(key: SimpleKey) {
    const dev = this._device.instance();
    if (!dev) return;

    this.o2p.set_simplekey(dev, key, (ok: boolean) => {
      setItemHandler(this.data$, key, ok);
      this._device.setChanged(ok);
    });
  }

  isSupport() {
    return this._device.isSupport(Cmd.SimpleKey);
  }

  getKeyName(modeCode: number, values: number[]) {
    return this._key.getKeyName(modeCode, values);
  }

  getModifierName(key: string, modifierCode: number) {
    return this._key.getModifierName(key, modifierCode);
  }

  getGeneralName(generalCode: number) {
    return this._key.getGeneralName(generalCode);
  }
}
