import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { SimpleKeyService } from 'src/app/core/device/simple-key.service';
import { ControlType, General_Keys, getKeyModeName, Linux_Keys } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';
import { Cmd } from 'src/app/core/hid';
import { KeyFormData, OptionControlData, OptionFormData } from 'src/app/shared/components/dynamix-form';

@Component({
  selector: 'app-simplekey-manage',
  templateUrl: './simplekey-manage.component.html',
  styleUrls: ['./simplekey-manage.component.scss'],
})
export class SimplekeyManageComponent implements OnInit, OnDestroy {
  activeKey: SimpleKey | undefined;
  vkeys: VKey[] = [];
  formData: OptionFormData | undefined;

  destory$ = new Subject();

  @ViewChild('editor') keyEditor!: MatDrawer;

  constructor(private _key: SimpleKeyService, private _doc: DocService, private _snackBar: MatSnackBar) {
    this._key.data$.pipe(takeUntil(this.destory$)).subscribe((keys) => {
      console.log(keys);

      this._updateVkeys(keys);
    });
  }

  ngOnInit(): void {
    this._key.init();
  }

  ngOnDestroy(): void {
    this.destory$.next(0);
    this.destory$.complete();
  }

  onModeChanged(code: string) {
    if (this.activeKey) {
      const { files } = this._doc.mode(Cmd.SimpleKey, Number(code))!;

      this.activeKey.function = {
        mode: Number(code),
        values: files.map((file) => this._doc.param(file)!.def),
      };

      this._updateFormData();
    }
  }

  onFormSubmit(data: KeyFormData) {
    if (this.activeKey) {

      this.activeKey.function = {
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

  idFormart() {
    return this.activeKey ? this.activeKey.id + 1 : 0;
  }

  private _updateFormData() {
    const getModeOptions = () => {
      let options = [];
      for (const [code, mode] of this._doc.cmd(Cmd.SimpleKey)?.modeMap!) {
        options.push({ key: mode.name, value: String(code) });
      }

      return options;
    };

    const getParams = () => {
      const { mode, values } = this.activeKey?.function!;
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
        value: String(this.activeKey?.function.mode),
        options: getModeOptions(),
      },
      params: getParams(),
    };
  }

  private _updateVkeys(keys: SimpleKey[]) {
    this.vkeys = keys.map((key) => this._key2vKey(key));
  }

  private _key2vKey(key: SimpleKey) {
    const { mode, values } = key.function;

    const name = getKeyModeName(this._doc, mode, values);
    const tooltip = name;

    return {
      ...key,
      name,
      tooltip,
    };
  }
}
