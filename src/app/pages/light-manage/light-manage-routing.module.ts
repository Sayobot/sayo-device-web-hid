import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LightManageComponent } from './light-manage.component';

const routes: Routes = [{ path: '', component: LightManageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LightManageRoutingModule { }
