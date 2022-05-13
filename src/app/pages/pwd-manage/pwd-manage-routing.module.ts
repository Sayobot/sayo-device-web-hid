import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PwdManageComponent } from './pwd-manage.component';

const routes: Routes = [{ path: '', component: PwdManageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PwdManageRoutingModule { }
