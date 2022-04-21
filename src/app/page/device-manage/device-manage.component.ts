import { Component, OnInit } from '@angular/core';
import { DeviceService } from 'src/app/core/device/device.service';
import { DocService } from 'src/app/core/doc/doc.service';

@Component({
  templateUrl: './device-manage.component.html',
  styleUrls: ['./device-manage.component.scss'],
})
export class DeviceManagePage implements OnInit {
  constructor(private device: DeviceService, private doc: DocService) {}

  ngOnInit(): void {}

  changeDevice(pid: number) {
    this.device.pid.next(pid);
  }
}
