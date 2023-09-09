import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DeviceService } from 'src/app/core/device/device.service';
import { FirmwareService } from 'src/app/core/device/firmware.service';
import { DocService } from 'src/app/core/doc/doc.service';
import { Sayo_Device_filters, Config } from "src/app/core/hid";

const isMac = () => navigator.userAgent.includes("Mac OS");

@Component({
  templateUrl: './device-manage.component.html',
  styleUrls: ['./device-manage.component.scss'],
})
export class DeviceManageComponent implements OnInit {

  hasMacPermission = false;

  select$ = new Subject<void>();

  destory$ = new Subject();

  constructor(
    private _device: DeviceService,
    private _doc: DocService,
    private _tr: TranslateService,
    private _firmware: FirmwareService
  ) {
    this.select$
      .pipe(
        takeUntil(this.destory$),
        debounceTime(100),
        switchMap((_) => navigator.hid.requestDevice({ filters: Sayo_Device_filters })),
        map((devices: HIDDevice[]) => {
          let target: HIDDevice | null = null;

          for (let i = 0; i < devices.length; i++) {
            let item = devices[i];

            if (item.collections.length > 0) {
              for (let j = 0; j < item.collections.length; j++) {
                const col = item.collections[j];
                if (col.usagePage! >= Config.usagePage) {
                  target = item;
                  break;
                }
              }
            }
          }

          if (target === null) {
            location.reload();
            throw new Error("could not find hid device.");
          }

          return target;
        }),
        distinctUntilChanged(),
        tap((device: HIDDevice) => this._device.setDevice(device)),
        switchMap(async (device: HIDDevice) => {

          if (device && !device.opened) {

            await device.open();
            this.hasMacPermission = isMac() && device.opened;
          }

          return of();
        }),
      )
      .subscribe((_) => {
        this._device.updateInfo();
      });

    this._doc.loadParamDoc();
  }

  ngOnInit(): void { }

  isBootloader() {
    return this._firmware.onBootloader;
  }

  search() {
    this.select$.next();
  }

  howGetMacPermissionTip() {
    return this._tr.instant("如果您的操作系统是 Mac OS，请打开输入监听权限。");
  }
}
