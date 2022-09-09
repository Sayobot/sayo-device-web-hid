import { NgModule } from '@angular/core';

import { LightManageRoutingModule } from './light-manage-routing.module';
import { LightManageComponent } from './light-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    LightManageComponent
  ],
  imports: [
    SharedModule,
    LightManageRoutingModule
  ]
})
export class LightManageModule { }
