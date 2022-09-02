import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialUiModule } from '../material-ui/material-ui.module';

import { VirtualKeyComponent } from './virtual-key';
import { VirtualKeyboardComponent } from './virtual-keyboard';
import { DynamixFormComponent } from './dynamix-form';
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

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const Components = [
  VirtualKeyComponent,
  VirtualKeyboardComponent,
  DynamixFormComponent,
  MultiSelectControlComponent,
  GeneralKeySelectControlComponent,
  GeneralKeySelectDialog,
  StringEditComponent,
  LoadingComponent
];

@NgModule({
  declarations: [...Components],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MaterialUiModule,
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
