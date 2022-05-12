import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, tap } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { ControlType, General_Keys, getKeyModeName, Linux_Keys } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';
import { Cmd } from 'src/app/core/hid';
import { KeyFormData, OptionControlData, OptionFormData } from 'src/app/shared/components/dynamix-form';

interface Level {
  id: number;
  name: string;
}

@Component({
  templateUrl: './key-manage.component.html',
  styleUrls: ['./key-manage.component.scss'],
})
export class KeyManageComponent implements OnInit, OnDestroy {
  activeKey: Key | undefined;
  vkeys: VKey[] = [];
  levels: Level[] = [];

  level = new FormControl();

  formData: OptionFormData | undefined;

  destory$ = new Subject();

  @ViewChild('editor') keyEditor!: MatDrawer;

  constructor(private _key: KeyService, private _doc: DocService, private _snackBar: MatSnackBar) {
    this._key.data$
      .pipe(
        takeUntil(this.destory$),

        // set function level name
        tap((keys) => {
          if (keys.length > 0 && this.levels.length !== keys[0]?.functions.length) {
            this._setLevelName(keys[0].functions.length);
          }
        }),
      )
      .subscribe((keys) => {
        this._updateVkeys(keys, this.level.value);
      });
  }

  ngOnInit(): void {
    this._key.init();
    this.level.setValue(0);
  }

  ngOnDestroy(): void {
    this.destory$.next(0);
    this.destory$.complete();
  }

  onLevelChange() {
    const keys = this._key.data$.getValue();
    const level = this.level.value;

    if (level !== undefined) {
      this._updateVkeys(keys, level);

      if (this.activeKey) this._updateFormData();
    }
  }

  onEditorClosed() {
    this.keyEditor.close();
    this.activeKey = undefined;
    this.formData = undefined;
  }

  onItemClicked(vkey: VKey) {
    const keys = this._key.data$.getValue();
    this.activeKey = keys.find((key) => key.id == vkey.id)!;
    this._updateFormData();
    this.keyEditor.open();
  }

  onModeChanged(code: string) {
    const level = this.level.value;

    if (this.activeKey) {
      const { files } = this._doc.mode(Cmd.SimpleKey, Number(code))!;

      this.activeKey.functions[level] = {
        mode: Number(code),
        values: files.map((file) => this._doc.param(file)!.def),
      };

      this._updateFormData();
    }
  }

  onFormSubmit(data: KeyFormData) {
    const level = this.level.value;

    if (this.activeKey) {
      this.activeKey.functions[level] = {
        mode: Number(data.mode),
        values: data.params.map((param) => Number(param)),
      };

      this._key.setItem(this.activeKey);
      this._updateFormData();

      this._snackBar.open('Successful!', 'Done', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  idFormart() {
    return this.activeKey ? this.activeKey.id + 1 : 0;
  }

  levelFormart() {
    return this.level.value + 1;
  }

  private _updateFormData() {
    const getModeOptions = () => {
      let options = [];
      for (const [code, mode] of this._doc.cmd(Cmd.SimpleKey)?.modeMap!) {
        options.push({ key: mode.name, value: String(code) });
      }

      return options;
    };

    const getParams = (level: number) => {
      const { mode, values } = this.activeKey?.functions[level]!;
      const { files } = this._doc.mode(Cmd.SimpleKey, mode)!;

      let params = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        let data: OptionControlData = {
          type: this._doc.controlType(file)!,
          key: this._doc.param(file)?.title!,
          value: String(values[i]),
          options: [],
        };

        if (data.type === ControlType.Common) {
          data.options.push({ key: 'None', value: String('0') });

          for (const { code, name } of General_Keys) {
            data.options.push({ key: name, value: String(code) });
          }

          for (const { code, name } of Linux_Keys) {
            data.options.push({ key: name, value: String(code) });
          }
        } else {
          for (const [code, name] of this._doc.param(file)?.optionMap!) {
            data.options.push({ key: name, value: String(code) });
          }
        }

        params.push(data);
      }

      return params;
    };

    const level = this.level.value;
    this.formData = {
      mode: {
        type: ControlType.Select,
        key: 'mode',
        value: String(this.activeKey?.functions[level].mode),
        options: getModeOptions(),
      },
      params: getParams(level),
    };
  }

  private _updateVkeys(keys: Key[], level: number) {
    if(level === null || level === undefined) return;

    this.vkeys = keys.map((key) => this._key2vKey(key, level));
  }

  private _setLevelName(length: number) {
    this.levels = [];
    for (let i = 0; i < length; i++) {
      const name = i === 0 ? '基本层' : `Fn ${i}`;
      this.levels.push({ id: i, name });
    }
  }

  private _key2vKey(key: Key, level: number) {

    const { functions } = key;

    const { mode, values } = functions[level];

    const name = getKeyModeName(this._doc, mode, values);
    const tooltip = name;

    return {
      ...key,
      name,
      tooltip,
    };
  }
}
