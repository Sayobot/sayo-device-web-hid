import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { GeneralKeySelectDialog } from './general-key-select-dialog/general-key-select-dialog.component';
import { map, Observable, of } from 'rxjs';

const isString = (obj: any) => obj.toString().includes("string");

interface Option {
  key: string;
  value: string;
}

const Reg_Char = "+?*${}[]().\^|";

@Component({
  selector: 'general-key-select-control',
  templateUrl: './general-key-select-control.component.html',
  styleUrls: ['./general-key-select-control.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => GeneralKeySelectControlComponent), multi: true }],
})
export class GeneralKeySelectControlComponent implements ControlValueAccessor {
  @Input() label = 'label';
  @Input() options: Option[] = [];

  filteredOptions$: Observable<Option[]>;

  onChange = (code: string) => { };
  onTouched = () => { };
  touched = false;
  disabled = false;

  control = new FormControl<Option | string>("");

  constructor(private _dialog: MatDialog) {
    this.filteredOptions$ = this.control.valueChanges.pipe(map(val => {

      if (typeof val === "string") {
        const str = (val as string).split("").map(char => Reg_Char.includes(char) ? `\${char}` : char).join("");
        const reg = new RegExp(str, "i");
        return this.options.filter(option => reg.test(option.key));
      } else {
        return this.options
      }
    }));
  }

  ngOnInit(): void { }

  openVKeyboard(event: MouseEvent) {
    event.stopPropagation();

    const { value } = this.control.value as Option;

    const ref = this._dialog
      .open(GeneralKeySelectDialog, {
        width: '1200px',
        data: { value },
      })
      .afterClosed()
      .subscribe((res: { code: string } | undefined) => {
        if (res !== undefined) {
          const fetch = this.options.find(option => option.value === res.code);

          if (fetch) {
            this.control.setValue(fetch);
            this.onChange(res.code);
          }
        }
        ref.unsubscribe();
      });
  }

  displayFn(option: Option) {
    return option && option.key ? option.key : "";
  }

  onSelectChange() {
    const { value } = this.control.value as Option;
    this.onChange(value);
  }

  writeValue(val: string): void {
    const fetch = this.options.find(option => option.value === val);
    if (fetch) {
      this.control.setValue(fetch);
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
