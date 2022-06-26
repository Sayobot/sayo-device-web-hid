import { Component, OnInit } from '@angular/core';
import { config } from 'process';
import { debounceTime, distinctUntilChanged, filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DeviceService } from 'src/app/core/device/device.service';
import { DocService } from 'src/app/core/doc/doc.service';
import { Sayo_Device_filters, Config } from "src/app/core/hid";

@Component({
  templateUrl: './device-manage.component.html',
  styleUrls: ['./device-manage.component.scss'],
})
export class DeviceManageComponent implements OnInit {

  select$ = new Subject<void>();

  destory$ = new Subject();

  constructor(private _device: DeviceService, private _doc: DocService) {
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
                if(col.usagePage === Config.usagePage) {
                  target = item;
                  break;
                }  
              }
            }
          }

          if(target === null)
            throw new Error("could not find hid device.");

          return target;
        }),

        // check is changed
        distinctUntilChanged(),

        // set select device to service
        tap((device: HIDDevice) => this._device.setDevice(device)),

        // open select device
        switchMap((device: HIDDevice) => (device && !device.opened ? device.open() : of())),
      )
      .subscribe((_) => {
        // set device info if device opened
        this._device.updateInfo();
      });

    this._doc.loadParamDoc();
  }

  ngOnInit(): void { }

  search() {
    this.select$.next();
  }
}
