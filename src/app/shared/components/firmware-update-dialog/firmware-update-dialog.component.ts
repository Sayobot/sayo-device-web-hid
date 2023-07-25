import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-firmware-update-dialog',
  templateUrl: './firmware-update-dialog.component.html',
  styleUrls: ['./firmware-update-dialog.component.scss']
})
export class FirmwareUpdateDialogComponent {
  constructor(public dialogRef: MatDialogRef<FirmwareUpdateDialogComponent>) {
  }

  comfirm() {
    this.dialogRef.close(true);
  }

  close() {
    this.dialogRef.close(false);
  }
}
