import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface GetStringConfig {
  title: string;
  content: string;
  min: number;
  max: number;
  value: string;
  cancel?: string;
  ok?: string;
}

@Component({
  templateUrl: './get-string-dialog.component.html',
  styleUrls: ['./get-string-dialog.component.scss']
})
export class GetStringDialog {
  value = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public config: GetStringConfig,
    public ref: MatDialogRef<GetStringDialog>,
  ) {
    this.value = config.value;
  }

  get counter() {
    return `${this.value.length}/${this.config.max}`;
  }

  comfirm() {
    this.ref.close(this.value);
  }

  close() {
    this.ref.close(undefined);
  }
}
