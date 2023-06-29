import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'multi-select-control',
  templateUrl: './multi-select-control.component.html',
  styleUrls: ['./multi-select-control.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MultiSelectControlComponent), multi: true }],
})
export class MultiSelectControlComponent implements ControlValueAccessor {
  @Input() label = 'label';
  @Input() options: { key: string; value: string }[] = [];
  @Output() valueChange = new EventEmitter<string>();

  selected: string[] = [];

  onChange = (code: string) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;

  constructor() {}

  onSelectChange(codes: string[]) {
    this.markAsTouched();
    if (!this.disabled) {
      let sum = 0;
      for (let i = 0; i < codes.length; i++) {
        sum += Number(codes[i]);
      }

      this.onChange(String(sum));
    }
  }

  writeValue(code: string): void {
    let codes = [];

    for (let i = 0; i < this.options.length; i++) {
      const el = this.options[i];
      if ((Number(el.value) & Number(code)) !== 0) {
        codes.push(el.value);
      }
    }

    this.selected = codes;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }
  registerOnTouched(onTouch: any): void {
    this.onTouched = onTouch;
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
