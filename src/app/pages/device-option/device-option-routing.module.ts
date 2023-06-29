import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceOptionComponent } from './device-option.component';

const routes: Routes = [{ path: '', component: DeviceOptionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceOptionRoutingModule { }
