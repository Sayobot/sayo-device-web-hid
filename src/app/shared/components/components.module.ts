import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualKeyComponent } from './virtual-key/virtual-key.component';
import { MaterialUiModule } from '../material-ui/material-ui.module';
import { VirtualKeyboardComponent } from './virtual-keyboard/virtual-keyboard.component';
import { DynamixFormComponent } from './dynamix-form/dynamix-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectControlComponent } from './multi-select-control/multi-select-control.component';

const Components = [VirtualKeyComponent, VirtualKeyboardComponent, DynamixFormComponent, MultiSelectControlComponent];

@NgModule({
  declarations: [...Components],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialUiModule],
  exports: [...Components],
})
export class ComponentsModule {}
