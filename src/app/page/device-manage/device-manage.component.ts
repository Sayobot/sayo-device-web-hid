import { Component, OnInit } from '@angular/core';
import { DeviceService } from 'src/app/core/device/device.service';

@Component({
  templateUrl: './device-manage.component.html',
  styleUrls: ['./device-manage.component.scss'],
})
export class DeviceManagePage implements OnInit {
  constructor(private _device: DeviceService) {}

  ngOnInit(): void {}

  search() {
    this._device.select();
  }
}
