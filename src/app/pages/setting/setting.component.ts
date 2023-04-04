import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Settings } from 'src/app/core/device/settings.service';

@Component({
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
  form: FormGroup;

  destory$ = new Subject();

  constructor(private _settings: Settings, private _fb: FormBuilder) {
    this.form = this._fb.group({
      log: ["close"],
      HIDLog: ["close"],
      HIDInput: ["close"]
    })

    this.form.valueChanges.subscribe(value => {
      this._settings.setStorage(value);
    })
  }

  ngOnInit(): void {
    const settings = this._settings.storage$.value;
    Object.keys(settings).forEach(key => {
      this.form.controls[key].setValue(settings[key]);
    });
  }

  ngOnDestroy(): void {
    this.destory$.next(true);
    this.destory$.complete();
  }
}
