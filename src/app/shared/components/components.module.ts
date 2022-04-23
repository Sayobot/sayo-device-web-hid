import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualKeyComponent } from './virtual-key/virtual-key.component';
import { MaterialUiModule } from '../material-ui/material-ui.module';
import { VirtualKeyboardComponent } from './virtual-keyboard/virtual-keyboard.component';

const Components = [VirtualKeyComponent, VirtualKeyboardComponent];

@NgModule({
  declarations: [...Components],
  imports: [CommonModule, MaterialUiModule],
  exports: [...Components],
})
export class ComponentsModule {}
