import { NgModule } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatCommonModule, MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { LayoutModule } from '@angular/cdk/layout';

const MAT_CDK = [
  LayoutModule,
  DragDropModule
]

const MAT_COMPONENT = [
  MatSidenavModule,
  MatSnackBarModule,
  MatButtonModule,
  MatChipsModule,
  MatDialogModule,
  MatIconModule,
  MatCommonModule,
  MatInputModule,
  MatListModule,
  MatSelectModule,
  MatToolbarModule,
  MatFormFieldModule,
  MatButtonToggleModule,
  MatTabsModule,
  MatTableModule,
  MatTooltipModule,
  MatRadioModule,
  MatRippleModule,
  MatMenuModule,
  MatProgressSpinnerModule,
]

const MAT_UI = [
  ...MAT_CDK,
  ...MAT_COMPONENT,
];

@NgModule({
  imports: MAT_UI,
  exports: MAT_UI,
})
export class MaterialUiModule { }
