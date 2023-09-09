import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface InformationConfig {
  title: string;
  content: string;
  isBlock: boolean;
}

@Component({
  templateUrl: './information-dialog.component.html',
  styleUrls: ['./information-dialog.component.scss']
})
export class InformationDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public config: InformationConfig,
    public ref: MatDialogRef<InformationDialog>,
  ) {
  }
}
