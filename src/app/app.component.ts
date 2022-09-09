import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { DeviceService } from './core/device/device.service';
import { DocService } from './core/doc/doc.service';
import { Cmd } from './core/hid';

interface Menu {
  link: string;
  icon: string;
  name: string;
  key: Cmd;
}

const MENUS: Menu[] = [
  {
    link: '/key',
    icon: 'keyboard_alt',
    name: '按键',
    key: Cmd.Key,
  },
  {
    link: '/simplekey',
    icon: 'keyboard_alt',
    name: '按键',
    key: Cmd.SimpleKey,
  },
  {
    link: '/pwd',
    icon: 'lock',
    name: '密码',
    key: Cmd.Password,
  },
  {
    link: '/text',
    icon: 'speaker_notes',
    name: '字符串',
    key: Cmd.Text,
  },
  {
    link: '/light',
    icon: 'light',
    name: '灯光',
    key: Cmd.Light,
  },
];

interface Lang {
  key: string;
  title: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  menus: Menu[] = [];
  langs: Lang[] = [];
  lang: Lang = { key: 'en', title: 'English' };

  destory$ = new Subject<void>();

  constructor(private http: HttpClient, private _device: DeviceService, private _tr: TranslateService, private _doc: DocService) {
    this._device.device$.pipe(takeUntil(this.destory$)).subscribe((device: HIDDevice) => {
      if (device.opened) this.menus = MENUS.filter((menu) => this._device.isSupport(menu.key));
    });

    this.http.get<{ languages: Lang[] }>('/assets/i18n/lang.json').subscribe((res) => {
      this.langs = res.languages;

      this.setLanguage(this._tr.getBrowserLang() || 'en');
    });
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }

  setLanguage(key: string) {
    this._tr.use(key).subscribe(() => {
      const lang = this.langs.find((item) => item.key === this._tr.currentLang);

      if (lang) {
        this.lang = lang;

        this._doc.loadParamDoc();

        if (this._device.isConnected()) {
          this._doc.load(this._device.filename());
        };
      }
    });
  }

  save() {
    this._device.save();
  }

  canSave() {
    return this._device.isConnected() && this._device.isChanged();
  }
}
