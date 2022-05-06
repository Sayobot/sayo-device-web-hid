import { NgModule } from '@angular/core';

import { DeviceManageRoutingModule } from './device-manage-routing.module';
import { DeviceManageComponent } from './device-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [DeviceManageComponent],
  imports: [SharedModule, DeviceManageRoutingModule],
})
export class DeviceManageModule {}

