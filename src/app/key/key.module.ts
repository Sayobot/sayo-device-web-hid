import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { KeyRoutingModule } from './key-routing.module';
import { KeyComponent } from './key.component';

@NgModule({
  declarations: [KeyComponent],
  imports: [SharedModule, KeyRoutingModule],
})
export class KeyModule {}
