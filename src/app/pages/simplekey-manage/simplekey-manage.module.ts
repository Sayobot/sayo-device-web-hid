import { NgModule } from '@angular/core';

import { SimplekeyManageRoutingModule } from './simplekey-manage-routing.module';
import { SimplekeyManageComponent } from './simplekey-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [SimplekeyManageComponent],
  imports: [SharedModule, SimplekeyManageRoutingModule],
})
export class SimplekeyManageModule {}

