import { NgModule } from '@angular/core';
import { MaterialUiModule } from './material-ui/material-ui.module';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

const All_Modules = [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule, MaterialUiModule];

@NgModule({
  imports: All_Modules,
  exports: All_Modules,
})
export class SharedModule {}
