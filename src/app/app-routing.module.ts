import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/device', pathMatch: 'full' },
  { path: 'device', loadChildren: () => import('./pages/device-manage/device-manage.module').then((m) => m.DeviceManageModule) },
  {
    path: 'setting',
    loadChildren: () => import('./pages/setting/setting.module').then((m) => m.SettingModule)
  },
  {
    path: 'hid-report',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/hid-report/hid-report.module').then((m) => m.HidReportModule)
  },
  {
    path: 'key',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/key-manage/key-manage.module').then((m) => m.KeyManageModule),
  },
  {
    path: 'simplekey',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/simplekey-manage/simplekey-manage.module').then((m) => m.SimplekeyManageModule),
  },
  {
    path: 'pwd',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/pwd-manage/pwd-manage.module').then((m) => m.PwdManageModule),
  },
  {
    path: 'text',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/text-manage/text-manage.module').then((m) => m.TextManageModule),
  },
  {
    path: 'light',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/light-manage/light-manage.module').then(m => m.LightManageModule)
  },
  {
    path: "screen",
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/screen-edit/screen-edit.module').then(m => m.ScreenEditModule)
  },
  {
    path: "device-option",
    canActivate: [AuthGuard],
    loadChildren: () => import("./pages/device-option/device-option.module").then(m => m.DeviceOptionModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
