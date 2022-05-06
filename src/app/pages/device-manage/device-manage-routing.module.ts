import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceManageComponent } from './device-manage.component';

const routes: Routes = [{ path: '', component: DeviceManageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceManageRoutingModule { }
