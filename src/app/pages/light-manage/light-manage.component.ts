import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { LightService } from 'src/app/core/device/light.service';
import { loopRequestO2Service } from 'src/app/core/device/utils';
import { ControlType } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';
import { Cmd, KeyType } from 'src/app/core/hid';
import { OptionFormData } from 'src/app/shared/components/dynamix-form';

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

  constructor(private _doc: DocService, private _light: LightService, private _key: KeyService) {
    this._light.data$.pipe(
      takeUntil(this.destory$),
    ).subscribe((keys) => {
      const vkeys = keys.map((key) => this._light2vKey(key));
      this.vkeys$.next(vkeys);
    });

    this.vkeys$.subscribe((_) => {
      setTimeout(() => {
        console.log(111);
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

    }

    // this.formData = {
    //   mode: {
    //     type: ControlType.Select,
    //     key: 'mode',
    //     value: String(this.active?.mode),
    //     options: getModeOptions(),
    //   },
    //   params: getParams(),
    // }
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

    return {
      id: light.id,
      type: KeyType.Button,
      pos: pos,
      name: name,
      tooltip: name
    }
  }

}
