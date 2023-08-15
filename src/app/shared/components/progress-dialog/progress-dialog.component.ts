import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface ProgressConfig {
  title: string;
}

@Component({
  templateUrl: './progress-dialog.component.html',
  styleUrls: ['./progress-dialog.component.scss']
})
export class ProgressDialog {
  _content: string = "";
  _value: number = 0;

  constructor(
    @Inject(MAT_DIALOG_DATA) public config: ProgressConfig,
    public ref: MatDialogRef<ProgressDialog>,
  ) {

  }

  setContent(content: string) {
    this._content = content;
  }

  setValue(curr: number) {
    this._value = curr;
  }
}
