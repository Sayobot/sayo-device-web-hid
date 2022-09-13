import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'color-picker-control',
  templateUrl: './color-picker-control.component.html',
  styleUrls: ['./color-picker-control.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ColorPickerControlComponent), multi: true }],
})
export class ColorPickerControlComponent implements ControlValueAccessor {

  result: string = "";

  onChange = (color: string) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;

  constructor() { }

  ngOnInit(): void {
  }

  onColorChange(color: string) {
    this.result = color;
    this.onChange(this.result);
  }

  writeValue(color: string): void {
    this.result = color;
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
