import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DeviceService } from 'src/app/core/device/device.service';
import { DocService } from 'src/app/core/doc/doc.service';
import { Sayo_Device_filters, Config } from "src/app/core/hid";
import { sendReport }from "src/app/core/hid/utils"


const isMac = () => navigator.userAgent.includes("Mac OS");

@Component({
  templateUrl: './device-manage.component.html',
  styleUrls: ['./device-manage.component.scss'],
})
export class DeviceManageComponent implements OnInit {

  hasMacPermission = true;

  select$ = new Subject<void>();

  destory$ = new Subject();

  constructor(
    private _device: DeviceService,
    private _doc: DocService,
    private _tr: TranslateService) {
    this.select$
      .pipe(
        takeUntil(this.destory$),

        // wait 100ms if clicked
        debounceTime(100),

        // request hid device list
        switchMap((_) => navigator.hid.requestDevice({ filters: Sayo_Device_filters })),

        // get first device
        map((devices: HIDDevice[]) => {

          let target: HIDDevice | null = null;

          for(let i = 0; i < devices.length; i++) {
            let item = devices[i];

            if(item.collections.length > 0) {
              for (let j = 0; j < item.collections.length; j++) {
                const col = item.collections[j];
                if(col.usagePage! >= Config.usagePage) {
                  target = item;
                  break;
                }
              }
            }
          }

          if(target === null) {
            location.reload();
            throw new Error("could not find hid device.");
          }


          return target;
        }),

        // check is changed
        distinctUntilChanged(),

        // set select device to service
        tap((device: HIDDevice) => this._device.setDevice(device)),

        // open select device
        switchMap(async (device: HIDDevice) => {
          if(device && !device.opened) {

          try {
            await device.open();
          } catch (error) {
            if(isMac()) {
              this.hasMacPermission = false;
            }
          }
          }

          return of();
        }),
      )
      .subscribe((_) => {
        // 以下命令会进入设备的 BootLoader
        // sendReport(this._device.instance!, new Uint8Array([0xff,0x02,0x72,0x96, 11]));
        // setTimeout(() => {
        //   sendReport(this._device.instance!, new Uint8Array([0xff,0x02,0x72,0x96, 11]));
        // }, 1000);
        this._device.updateInfo();
      });

    this._doc.loadParamDoc();
  }

  ngOnInit(): void { }

  search() {
    this.select$.next();
  }

  howGetMacPermissionTip() {
    return this._tr.instant("如果您的操作系统是 Mac OS，请打开输入监听权限。");
  }
}
