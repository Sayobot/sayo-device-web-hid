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
    this._device.device$.subscribe(async () => {
      this.data$.next([]);
    });
  }

  init(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._device.isConnected()) {
        reject("device not connect.");
      } else {
        this._loader.loading();

        this.o2p.get_simplekey(this._device.instance!, (data: SimpleKey[]) => {
          this.data$.next(data);
          resolve("init simple key successful.");
          this._loader.complete();
        });
      }
    });



  }

  setItem(key: SimpleKey) {
    if (!this._device.isConnected()) return;

    this.o2p.set_simplekey(this._device.instance!, key, (ok: boolean) => {
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
