import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceManagePage } from './page/device-manage/device-manage.component';
import { KeyManagePage } from './page/key-manage/key-manage.component';

const routes: Routes = [
  { path: '', redirectTo: '/device', pathMatch: 'full' },
  { path: 'device', component: DeviceManagePage },
  { path: 'key', component: KeyManagePage },
  { path: '**', redirectTo: '/device' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
