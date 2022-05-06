import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KeyManageComponent } from './key-manage.component';

const routes: Routes = [{ path: '', component: KeyManageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KeyManageRoutingModule { }
