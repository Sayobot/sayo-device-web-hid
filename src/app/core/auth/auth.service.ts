import { Injectable } from '@angular/core';
import { DeviceService } from '../device/device.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private opened = false;

  constructor(private _device: DeviceService) {
    this._device.deviceChanged$.subscribe((device: HIDDevice) => {
      this.opened = device.opened;
    });
  }

  isLogin() {
    return this.opened;
  }
}
