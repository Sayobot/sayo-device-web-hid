import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface GetBoolConfig {
  title: string;
  content: string;
  ok?: string;
  concal?: string;
}

@Component({
  templateUrl: './get-bool-dialog.component.html',
  styleUrls: ['./get-bool-dialog.component.scss']
})
export class GetBoolDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public config: GetBoolConfig,
    public ref: MatDialogRef<GetBoolDialog>,
  ) {
  }

  comfirm() {
    this.ref.close(true);
  }

  close() {
    this.ref.close(false);
  }
}
