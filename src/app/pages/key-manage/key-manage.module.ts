import { NgModule } from '@angular/core';

import { KeyManageRoutingModule } from './key-manage-routing.module';
import { KeyManageComponent } from './key-manage.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [KeyManageComponent],
  imports: [SharedModule, KeyManageRoutingModule],
})
export class KeyManageModule {}

