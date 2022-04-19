import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { ConnectRoutingModule } from './connect-routing.module';
import { ConnectComponent } from './connect.component';

@NgModule({
  declarations: [ConnectComponent],
  imports: [SharedModule, ConnectRoutingModule],
})
export class ConnectModule {}
