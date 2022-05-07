import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SimplekeyManageComponent } from './simplekey-manage.component';

const routes: Routes = [{ path: '', component: SimplekeyManageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SimplekeyManageRoutingModule { }
