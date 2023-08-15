import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialUiModule } from '../material-ui/material-ui.module';
import { ColorPickerModule } from 'ngx-color-picker';

import { VirtualKeyComponent } from './virtual-key';
import { VirtualKeyboardComponent } from './virtual-keyboard';
import { DynamixFormComponent } from './dynamix-form';
import { DynamixFormFieldComponent } from './dynamix-form-field';
import { MultiSelectControlComponent } from './multi-select-control';
import { StringEditComponent } from './string-edit';
import {
  GeneralKeySelectControlComponent,
  GeneralKeySelectDialog
} from './general-key-select-control';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from './loading/loading.component';
import { ColorPickerControlComponent } from './color-picker-control';
import { FooterComponent } from './footer/footer.component';
import { GetBoolDialog } from './get-bool-dialog/get-bool-dialog.component';
import { ProgressDialog } from './progress-dialog/progress-dialog.component';
import { InformationDialog } from './information-dialog/information-dialog.component';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const Components = [
  VirtualKeyComponent,
  VirtualKeyboardComponent,
  DynamixFormComponent,
  DynamixFormFieldComponent,
  MultiSelectControlComponent,
  GeneralKeySelectControlComponent,
  GeneralKeySelectDialog,
  StringEditComponent,
  LoadingComponent,
  ColorPickerControlComponent,
  FooterComponent,
  GetBoolDialog,
  ProgressDialog,
  InformationDialog
];

@NgModule({
  declarations: [...Components],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialUiModule, ColorPickerModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),],
  exports: [...Components],
})
export class ComponentsModule { }
