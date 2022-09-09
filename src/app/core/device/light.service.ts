import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from 'src/app/shared/components/loading/loader.service';
import { DocService } from '../doc/doc.service';
import { Cmd, O2Protocol } from '../hid';
import { DeviceService } from './device.service';

@Injectable({
    providedIn: 'root'
})
export class LightService implements O2Service<Light> {
    data$ = new BehaviorSubject<Light[]>([]);

    constructor(private _device: DeviceService, private _doc: DocService,
        private _o2p: O2Protocol, private _loader: LoaderService) { }

    init() {
        if (!this._device.isConnected()) return;

        console.info("初始化灯光数据");

        this._loader.loading();
        this._o2p.get_light(this._device.instance!, (lights) => {
            this.data$.next(lights);
            this._loader.complete();
        });
    }

    setItem(data: Light) {

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