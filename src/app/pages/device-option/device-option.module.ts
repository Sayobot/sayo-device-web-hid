import { NgModule } from '@angular/core';
import { DeviceOptionComponent } from './device-option.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeviceOptionRoutingModule } from './device-option-routing.module';



@NgModule({
  declarations: [DeviceOptionComponent],
  imports: [SharedModule, DeviceOptionRoutingModule]
})
export class DeviceOptionModule { }
