import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { DeviceService } from 'src/app/core/device/device.service';
import { SimpleKeyService } from 'src/app/core/device/simple-key.service';
import { DocService } from 'src/app/core/doc/doc.service';
import { Cmd } from 'src/app/core/hid';
import { ControlType } from 'src/app/shared/components/dynamix-form';
import { DynamixFormData, OptionFormData } from 'src/app/shared/components/types';

@Component({
  templateUrl: './simplekey-manage.component.html',
  styleUrls: ['./simplekey-manage.component.scss'],
})
export class SimplekeyManageComponent implements OnInit, OnDestroy {
  activeKey: SimpleKey | undefined;
  vkeys: VKey[] = [];
  formData: OptionFormData | undefined;

  destory$ = new Subject();

  @ViewChild('editor') keyEditor!: MatDrawer;

  constructor(
    private _device: DeviceService,
    private _key: SimpleKeyService,
    private _doc: DocService,
    private _snackBar: MatSnackBar
    ) {
    this._key.data$.pipe(takeUntil(this.destory$)).subscribe((keys) => {
      this._updateVkeys(keys);
    });
  }

  ngOnInit(): void {
    if(this._key.isSupport()) {
      this._key.init();
    }
  }

  ngOnDestroy(): void {
    this.destory$.next(0);
    this.destory$.complete();
    setTimeout(() => {
      this.onIdClicked(0);
    }, 300);
  }

  onIdClicked(id: number) {
    const keys = this._key.data$.getValue();
    this.activeKey = keys.find((key) => key.id == id)!;
    this._updateFormData();
    this.keyEditor.open();
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

  onFormSubmit(data: DynamixFormData) {
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

  private _updateFormData() {
    const getModeOptions = () => {
      const { version } = this._device._info!;

      // 多媒体控制 | 一键密码
      const HIGH_VERSION_DISABLE = [3, 8];

      let options = [];
      for (const [code, mode] of this._doc.cmd(Cmd.SimpleKey)?.modeMap!) {
        if (version > 75 && HIGH_VERSION_DISABLE.includes(code)) {
          // TDOD: 此处根据版本移除一键密码 v1，重新设计 Web HID 的 json 机制来避免这样的特殊处理
        } else {
          options.push({ key: mode.name, value: String(code) });
        }
      }

      return options;
    };

    const getParams = () => {
      const { mode, values } = this.activeKey?.function!;
      const { files } = this._doc.mode(Cmd.SimpleKey, mode)!;

      return this._doc.createControlData(files, values);
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

    const name = this._key.getKeyName(mode, values);
    const tooltip = name;

    return {
      ...key,
      name,
      tooltip,
    };
  }
}
