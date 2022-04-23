import { Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DeviceService } from './core/device/device.service';
import { Cmd } from './core/hid';

interface Menu {
  link: string;
  icon: string;
  name: string;
  key: Cmd;
}

const MENUS: Menu[] = [
  {
    link: '/key',
    icon: 'keyboard_alt',
    name: 'Key',
    key: Cmd.Key,
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  menus: Menu[] = [];

  destory$ = new Subject<void>();

  constructor(private _device: DeviceService) {
    this._device.deviceChanged$.pipe(takeUntil(this.destory$)).subscribe((_) => {
      this.menus = MENUS.filter((menu) => this._device.isSupport(menu.key));
    });
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
