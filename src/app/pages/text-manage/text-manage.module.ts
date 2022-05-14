import { NgModule } from '@angular/core';

import { TextManageRoutingModule } from './text-manage-routing.module';
import { TextManageComponent } from './text-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    TextManageComponent
  ],
  imports: [
    SharedModule,
    TextManageRoutingModule
  ]
})
export class TextManageModule { }
