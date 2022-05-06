import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GeneralKeySelectDialog } from './general-key-select-dialog/general-key-select-dialog.component';

@Component({
  selector: 'general-key-select-control',
  templateUrl: './general-key-select-control.component.html',
  styleUrls: ['./general-key-select-control.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeneralKeySelectControlComponent), multi: true }],
})
export class GeneralKeySelectControlComponent implements ControlValueAccessor {
  @Input() label = 'label';
  @Input() options: { key: string; value: string }[] = [];

  onChange = (code: string) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;

  selected = '';

  constructor(private _dialog: MatDialog) {}

  openVKeyboard(event: MouseEvent) {
    event.stopPropagation();

    const ref = this._dialog
      .open(GeneralKeySelectDialog, {
        width: '1440px',
        data: { value: this.selected },
      })
      .afterClosed()
      .subscribe((res: { code: string } | undefined) => {
        if (res !== undefined) {
          this.selected = res.code;
          this.onChange(res.code);
        }
        ref.unsubscribe();
      });
  }

  onSelectChange(val: string) {
    console.log(val);

    this.onChange(val);
  }

  writeValue(val: string): void {
    this.selected = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  ngOnInit(): void {}
}
