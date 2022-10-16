import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { LightService } from 'src/app/core/device/light.service';
import { loopRequestO2Service } from 'src/app/core/device/utils';
import { ControlType } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';
import { Cmd, KeyType, LightMode } from 'src/app/core/hid';
import { FormData, OptionControlData, OptionFormData } from 'src/app/shared/components/dynamix-form';

@Component({
  selector: 'app-light-manage',
  templateUrl: './light-manage.component.html',
  styleUrls: ['./light-manage.component.scss']
})
export class LightManageComponent implements OnInit {
  active: Light | undefined;
  vkeys$ = new BehaviorSubject<VKey[]>([]);

  destory$ = new Subject();

  formData: OptionFormData | undefined;

  @ViewChild('editor') keyEditor!: MatDrawer;

  constructor(private _doc: DocService, private _light: LightService,
    private _key: KeyService, private _snackBar: MatSnackBar) {
    this._light.data$.pipe(
      takeUntil(this.destory$),
    ).subscribe((keys) => {
      const vkeys = keys.map((key) => this._light2vKey(key));
      this.vkeys$.next(vkeys);
    });

    this.vkeys$.subscribe((_) => {
      setTimeout(() => {
        this.onIdClicked(this.active ? this.active.id : 0);
      }, 300);
    });

    if (this._key.isSupport()) {
      this._key.data$.pipe(takeUntil(this.destory$)).subscribe();
    }
  }

  ngOnInit(): void {
    if (this._light.data$.value.length === 0) {
      loopRequestO2Service([this._key, this._light]);
    }
  }

  ngOnDestroy(): void {
    this.destory$.next(0);
    this.destory$.complete();
  }

  onItemClicked(vkey: VKey) {
    this.onIdClicked(vkey.id)
  }

  onIdClicked(id: number) {
    const lights = this._light.data$.getValue();

    if (lights.length > 0) {
      this.active = lights.find((item) => item.id == id)!;
      this._updateFormData();

      if (this.keyEditor) {
        this.keyEditor.open();
      }
    }
  }

  onEditorClosed() {
    this.keyEditor.close();
    this.active = undefined;
    this.formData = undefined;
  }

  onModeChanged(code: string) {
    if (this.active) {
      const { files } = this._doc.mode(Cmd.Light, Number(code))!;

      this.active.mode = Number(code);
      this.active.values = files.map((file) => this._doc.param(file)!.def);
      this._updateFormData();
    }
  }

  onFormSubmit(data: FormData) {
    if (this.active) {
      let values = [];
      const modeDoc = this._doc.mode(Cmd.Light, Number(data.mode));

      if (modeDoc) {
        let count = 0;

        while (count < modeDoc.files.length) {
          const file = modeDoc.files[count];
          const type = this._doc.controlType(file)!;

          if (type == ControlType.Color) {
            let [r, g, b] = data.params[count].replace("rgb(", '').replace(")", '').split(",");
            values.push(Number(r), Number(g), Number(b));
            count += 3;
          } else {
            values.push(Number(data.params[count]));
            count++;
          }
        }
      }

      this.active = {
        ...this.active,
        mode: Number(data.mode),
        values
      }

      this._light.setItem(this.active);

      this._snackBar.open('Successful!', 'Done', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }

  private _updateFormData() {
    const getModeOptions = () => {
      let options = [];
      const cmd = this._doc.cmd(Cmd.Light);

      if (cmd) {
        for (const [code, mode] of cmd.modeMap) {
          options.push({ key: mode.name, value: String(code) });
        }
      }

      return options;
    }

    const getParams = () => {
      let params: OptionControlData[] = [];

      if (this.active) {
        const { mode, values } = this.active;
        const modeDoc = this._doc.mode(Cmd.Light, mode);

        if (modeDoc) {
          let count = 0;

          while (count < modeDoc.files.length) {
            const file = modeDoc.files[count];

            const type = this._doc.controlType(file)!;

            let data: OptionControlData = {
              type,
              key: this._doc.param(file)?.title!,
              value: "",
              options: [],
            };

            for (const [code, name] of this._doc.param(file)?.optionMap!) {
              data.options.push({ key: name, value: String(code) });
            }

            if (type == ControlType.Color) {
              data.value = `rgb(${values[count]},${values[count + 1]},${values[count + 2]})`;
              params.push(data);
              params.push({ type: ControlType.Empty, key: "", value: "", options: [] });
              params.push({ type: ControlType.Empty, key: "", value: "", options: [] });
              count += 3;
            } else {
              data.value = String(values[count]);
              params.push(data);
              count++;
            }
          }
        }
      }

      return params;
    }

    this.formData = {
      mode: {
        type: ControlType.Select,
        key: 'mode',
        value: String(this.active?.mode),
        options: getModeOptions(),
      },
      params: getParams(),
    }
  }

  private _light2vKey(light: Light): VKey {
    const spacer = 4, border = 10, width = 36, radius = 4;

    let pos = {
      point: {
        x: border + light.id * spacer + light.id * width,
        y: border
      },
      size: { width, height: width, radius }
    };

    if (this._key.isSupport()) {
      const item = this._key.findItem(light.id);

      if (item)
        pos = item.pos;
    }

    const name = this._light.getLightName(light.mode);

    let color = "";

    if (light.mode === LightMode.Static) {
      const r = light.values[3],
        g = light.values[4],
        b = light.values[5];

      color = `rgb(${r},${g},${b})`;
    }

    return {
      id: light.id,
      type: KeyType.Button,
      pos,
      name,
      tooltip: name,
      color
    }
  }

}