import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { ControlType, General_Keys, Linux_Keys } from 'src/app/core/doc';
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

  vkeys$ = new BehaviorSubject<VKey[]>([]);

  levels: Level[] = [];

  level = 0;

  formData: OptionFormData | undefined;

  destory$ = new Subject();

  @ViewChild('editor') keyEditor!: MatDrawer;

  constructor(private _key: KeyService, private _doc: DocService, private _snackBar: MatSnackBar) {
    this._key.data$
      .pipe(
        takeUntil(this.destory$),
      ).subscribe((keys) => {
        if (keys.length > 0 && this.levels.length !== keys[0].functions.length) {
          this._setLevelName(keys[0].functions.length);
        }

        const vkeys = keys.map((key) => this._key2vKey(key, this.level));
        this.vkeys$.next(vkeys);
      });


    this.vkeys$.subscribe((_) => {
      setTimeout(() => {
        this.onIdClicked(this.activeKey ? this.activeKey.id : 0);
      }, 300);
    });
  }

  ngOnInit(): void {
    if (this._key.data$.value.length === 0) {
      this._key.init();
    } else {
      this.onLevelChange();
    }
  }

  ngOnDestroy(): void {
    this.destory$.next(0);
    this.destory$.complete();
  }

  onLevelChange() {
    const vkeys = this._key.data$.getValue().map((key) => this._key2vKey(key, this.level));
    this.vkeys$.next(vkeys);

    if (this.activeKey) {
      this._updateFormData();
    };
  }

  onEditorClosed() {
    this.keyEditor.close();
    this.activeKey = undefined;
    this.formData = undefined;
  }

  onIdClicked(id: number) {
    const keys = this._key.data$.getValue();

    if (keys.length > 0) {
      this.activeKey = keys.find((key) => key.id == id)!;
      this._updateFormData();

      if (this.keyEditor) {
        this.keyEditor.open();
      }
    }
  }

  onItemClicked(vkey: VKey) {
    this.onIdClicked(vkey.id);
  }

  onModeChanged(code: string) {
    if (this.activeKey) {
      const { files } = this._doc.mode(Cmd.SimpleKey, Number(code))!;

      this.activeKey.functions[this.level] = {
        mode: Number(code),
        values: files.map((file) => this._doc.param(file)!.def),
      };

      this._updateFormData();
    }
  }

  onFormSubmit(data: KeyFormData) {
    if (this.activeKey) {
      this.activeKey.functions[this.level] = {
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

    this.formData = {
      mode: {
        type: ControlType.Select,
        key: 'mode',
        value: String(this.activeKey?.functions[this.level].mode),
        options: getModeOptions(),
      },
      params: getParams(this.level),
    };
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

    const name = this._key.getKeyName(mode, values);
    const tooltip = name;

    return {
      ...key,
      name,
      tooltip,
    };
  }
}
