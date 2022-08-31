import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { MaterialUiModule } from './material-ui/material-ui.module';
import { PipesModule } from './pipes/pipe.module'
import { ComponentsModule } from './components/components.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const All_Modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  HttpClientModule,
  MaterialUiModule,
  ComponentsModule,
  TranslateModule,
  PipesModule
];

@NgModule({
  imports: [
    ...All_Modules,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  exports: All_Modules,
})
export class SharedModule { }
