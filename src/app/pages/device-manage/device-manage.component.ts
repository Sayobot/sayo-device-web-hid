import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, isEmpty, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { DeviceService } from 'src/app/core/device/device.service';
import { DocService } from 'src/app/core/doc/doc.service';

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
        switchMap((_) => navigator.hid.requestDevice({ filters: [{ vendorId: 0x8089 }] })),

        // get first device
        map((devices: HIDDevice[]) => devices[0]),

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

  ngOnInit(): void {}

  search() {
    this.select$.next();
  }
}
