import { NgModule } from '@angular/core';
import { ScreenEditComponent } from './screen-edit.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ScreenEditRoutingModule } from './screen-edit-routing,module';



@NgModule({
  declarations: [
    ScreenEditComponent
  ],
  imports: [
    SharedModule,
    ScreenEditRoutingModule
  ]
})
export class ScreenEditModule { }
