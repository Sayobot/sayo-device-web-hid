import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionControlData } from '../types';

@Component({
  selector: 'dynamix-form-field',
  templateUrl: './dynamix-form-field.component.html',
  styleUrls: ['./dynamix-form-field.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DynamixFormFieldComponent), multi: true }],

})
export class DynamixFormFieldComponent implements ControlValueAccessor {

  result = "";

  @Input() param!: OptionControlData;

  onChange = (_: string) => { };
  onTouched = () => { };
  touched = false;
  disabled = false;

  valueChange(value: string) {
    this.result = value;
    this.onChange(this.result);
  }

  writeValue(value: string): void {
    this.result = value;
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
