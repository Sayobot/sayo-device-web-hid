import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'key', pathMatch: 'full' },
  { path: 'key', loadChildren: () => import('./key/key.module').then((m) => m.KeyModule) },
  { path: 'connect', loadChildren: () => import('./connect/connect.module').then(m => m.ConnectModule) },

  { path: '**', redirectTo: 'key', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
