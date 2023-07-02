import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GeneralKeySelectDialog } from './general-key-select-dialog/general-key-select-dialog.component';

interface Option {
  key: string;
  value: string;
}

@Component({
  selector: 'general-key-select-control',
  templateUrl: './general-key-select-control.component.html',
  styleUrls: ['./general-key-select-control.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeneralKeySelectControlComponent), multi: true }],
})
export class GeneralKeySelectControlComponent implements ControlValueAccessor {
  @Input() label = 'label';
  @Input() options: Option[] = [];

  @Output() valueChange = new EventEmitter<string>();

  onChange = (_: string) => { };
  onTouched = () => { };
  touched = false;
  disabled = false;

  displayText = "";
  result = "";

  constructor(private _dialog: MatDialog) { }

  ngOnInit(): void { }

  openVKeyboard() {
    const ref = this._dialog
      .open(GeneralKeySelectDialog, {
        width: '1200px',
        data: { value: this.result },
      })
      .afterClosed()
      .subscribe((res: { code: string } | undefined) => {
        if (res !== undefined) {
          const fetch = this.options.find(option => option.value === res.code);

          if (fetch) {
            this.displayText = fetch.key;
            this.result = res.code;
            this.onChange(this.result);
          }
        }
        ref.unsubscribe();
      });
  }
  onClickIcon(event: MouseEvent) {
    event.stopPropagation();
    this.openVKeyboard();
  }

  writeValue(val: string): void {
    const fetch = this.options.find(option => option.value === val);
    if (fetch) {
      this.displayText = fetch.key;
      this.result = fetch.value;
    }
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
}
