import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/device', pathMatch: 'full' },
  { path: 'device', loadChildren: () => import('./pages/device-manage/device-manage.module').then((m) => m.DeviceManageModule) },
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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
