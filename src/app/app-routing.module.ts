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
  { path: '**', redirectTo: '/device' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
