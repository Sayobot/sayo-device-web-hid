import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { map, Observable, of, Subject } from 'rxjs';
import { General_Keys, Linux_Keys } from 'src/app/core/doc';

@Component({
  selector: 'app-general-key-select-dialog',
  templateUrl: './general-key-select-dialog.component.html',
  styleUrls: ['./general-key-select-dialog.component.scss'],
})
export class GeneralKeySelectDialog implements OnInit {
  value: number;

  destory$ = new Subject();
  general$: Observable<VKey[]>;
  onlyLinux$: Observable<LinuxKey[]>;

  constructor(private _Ref: MatDialogRef<GeneralKeySelectDialog>, @Inject(MAT_DIALOG_DATA) private data: { value: string }) {
    this.value = Number(this.data.value);

    this.general$ = of(General_Keys).pipe(map((keys) => keys.map((key) => this.toVkey(key))));
    this.onlyLinux$ = of(Linux_Keys);
  }

  toVkey(key: GeneralKey) {
    let vk: VKey = {
      id: key.code,
      type: 0,
      name: key.name,
      tooltip: key.name,
      pos: {
        point: {
          y: key.midPointY - key.height / 2,
          x: key.midPointX - key.width / 2,
        },
        size: {
          width: key.width,
          height: key.height,
          radius: key.radius,
        },
      },
    };
    return vk;
  }

  ngOnInit(): void {}

  select(code: number) {
    this.value = code;
    this.onConfirm();
  }

  onCancel() {
    this._Ref.close();
  }

  onConfirm() {
    this._Ref.close({ code: this.value.toString() });
  }

  onGeneralClick(vkey: VKey) {
    this.value = vkey.id;
  }

  onLinuxClick(code: number) {
    this.value = code;
  }
}
