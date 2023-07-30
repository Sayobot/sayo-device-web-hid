import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';
import { DocService } from '../doc/doc.service';
import { Cmd, O2Protocol } from '../hid';
import { DeviceService } from './device.service';
import { setItemHandler } from './utils';

@Injectable({
  providedIn: 'root'
})
export class LightService implements O2Service<Light> {
  data$ = new BehaviorSubject<Light[]>([]);

  constructor(
    private _device: DeviceService,
    private _doc: DocService,
    private _o2p: O2Protocol,
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
        console.info("初始化灯光数据");

        this._loader.loading();
        this._o2p.get_light(this._device.instance!, (lights) => {
          this.data$.next(lights);
          resolve("init light successful.");
          this._loader.complete();
        });
      }
    });
  }

  setItem(data: Light) {
    if (!this._device.isConnected()) return;

    this._o2p.set_light(this._device.instance!, data, (ok: boolean) => {
      setItemHandler(this.data$, data, ok);
      this._device.setChanged(ok);
    });
  }

  isSupport() {
    return this._device.isSupport(Cmd.Light);
  }

  getLightName(modeCode: number): string {
    let result = "";
    const cmd = this._doc.cmd(Cmd.Light);

    if (cmd) {
      const mode = this._doc.mode(cmd.code, modeCode);

      if (mode) {
        result = mode?.name;
      }
    }

    return result;
  }

}
