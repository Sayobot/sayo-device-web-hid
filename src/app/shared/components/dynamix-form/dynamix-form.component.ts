import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OptionControlData, OptionFormData } from '../types';

@Component({
  selector: 'dynamix-form',
  templateUrl: './dynamix-form.component.html',
  styleUrls: ['./dynamix-form.component.scss'],
})
export class DynamixFormComponent implements OnInit, OnChanges {
  form: UntypedFormGroup | undefined;

  modeChange$: Subscription | undefined;

  @Input() data: OptionFormData | undefined;
  @Output() modeChanged = new EventEmitter<string>();
  @Output() valueChanged = new EventEmitter<any>();

  constructor(private _fb: UntypedFormBuilder) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] !== undefined) this.updateFormGroup();
  }

  ngOnInit(): void { }

  onSubmit() {
    this.valueChanged.emit(this.form?.value);
  }

  updateFormGroup() {
    const createParams = (datas: OptionControlData[]) => {
      return this._fb.array(datas.map((item) => this._fb.control(item.value, Validators.required)));
    };

    if (this.data) {
      if (this.modeChange$) this.modeChange$.unsubscribe();

      this.form = undefined;

      this.form = this._fb.group({
        mode: [this.data?.mode.value, Validators.required],
        params: createParams(this.data.params),
      });

      this.modeChange$ = this.form.controls['mode'].valueChanges
        .subscribe((code) => {
          this.modeChanged.emit(code);
        });
    }
  }
}
