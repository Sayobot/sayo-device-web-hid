import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScreenEditComponent } from './screen-edit.component'

const routes: Routes = [{ path: '', component: ScreenEditComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScreenEditRoutingModule { }
