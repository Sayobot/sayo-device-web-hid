import { NgModule } from '@angular/core';

import { PwdManageRoutingModule } from './pwd-manage-routing.module';
import { PwdManageComponent } from './pwd-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    PwdManageComponent
  ],
  imports: [
    SharedModule,
    PwdManageRoutingModule
  ]
})
export class PwdManageModule { }
