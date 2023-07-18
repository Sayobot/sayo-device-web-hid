import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DeviceOptService } from 'src/app/core/device/device-opt.service';
import { DocService } from 'src/app/core/doc/doc.service';
import { Cmd } from 'src/app/core/hid';
import { OptionControlData } from 'src/app/shared/components/types';

@Component({
  templateUrl: './device-option.component.html',
  styleUrls: ['./device-option.component.scss']
})
export class DeviceOptionComponent implements OnInit {
  destory$ = new Subject();

  form: FormGroup | undefined;
  params: OptionControlData[] = [];

  constructor(
    private _opt: DeviceOptService,
    private _fb: FormBuilder,
    private _doc: DocService
  ) {
    this._opt.data$.pipe(takeUntil(this.destory$)).subscribe((data) => {
      this.updateParams(data.values);
    });
  }

  ngOnInit(): void {
    this._opt.init();
  }

  onSubmit() {

    const { options: values } = this.form?.value;

    const opt = {
      id: 0,
      values: values.map((val: any) => Number(val))
    }

    this._opt.setItem(opt);
  }

  updateParams(values: number[]) {

    const { files } = this._doc.mode(Cmd.Option, 0)!;

    this.params = [...this._doc.createControlData(files, values)];

    this.form = this._fb.group({
      options: this._fb.array(this.params.map((item) => this._fb.control(item.value, Validators.required)))
    });
  }
}
