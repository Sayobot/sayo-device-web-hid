import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { DeviceService } from './core/device/device.service';
import { DocService } from './core/doc/doc.service';
import { Cmd, O2Protocol } from './core/hid';
import { Router } from "@angular/router";
import { BreakpointObserver } from '@angular/cdk/layout';
import { Settings } from './core/device/settings.service';
import { FirmwareService } from './core/device/firmware.service';
import { MatDialog } from '@angular/material/dialog';
import { FirmwareUpdateDialogComponent } from './shared/components/firmware-update-dialog/firmware-update-dialog.component';
import { LoaderService } from './shared/components/loading/loader.service';

interface Menu {
  link: string;
  icon: string;
  name: string;
  key: Cmd;
}

const KEYBOARD_PAGE = '/key';
const SIMPLE_KEY_PAGE = '/simplekey'

const SMALL_SCREEN = "(max-width: 700px)";

const MENUS: Menu[] = [
  {
    link: KEYBOARD_PAGE,
    icon: 'keyboard_alt',
    name: '按键',
    key: Cmd.Key,
  },
  {
    link: SIMPLE_KEY_PAGE,
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
  {
    link: '/device-option',
    icon: 'settings_suggest',
    name: "设备选项",
    key: Cmd.Option
  }
];

const HIDMenu: Menu = {
  link: "hid-report",
  icon: "code",
  name: "HID",
  key: 0
}

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
  matchSmallScreen = false;

  menus: Menu[] = [];
  langs: Lang[] = [];
  lang: Lang = { key: 'en', title: 'English' };

  destory$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private _firmware: FirmwareService,
    private _device: DeviceService,
    private _protocol: O2Protocol,
    private _tr: TranslateService,
    private _doc: DocService,
    private _router: Router,
    private _settings: Settings,
    private _bpo: BreakpointObserver,
    private _dialog: MatDialog,
    private _loading: LoaderService
  ) {

    this._bpo.observe([SMALL_SCREEN]).pipe(takeUntil(this.destory$))
      .subscribe(result => {
        this.matchSmallScreen = result.breakpoints[SMALL_SCREEN];
      })

    this._settings.storage$
      .pipe(takeUntil(this.destory$)).subscribe(result => {
        this._protocol.setLogEnable(result["log"] === "open");
        this._protocol.setHIDLogEnable(result["HIDLog"] === "open");

        if (this._device.isConnected()) {
          this.menus = [...this.createMenus()];
        }
      })

    if (navigator.hid) {
      this._device.device$
        .pipe(takeUntil(this.destory$))
        .subscribe(async (device: HIDDevice) => {
          if (device.opened) {
            this.menus = [...this.createMenus()];
            await this.checkVersion();

            if(!this._doc.isLoaded())  {
              await this._doc.load(this._device.filename());
            }

            this.toFirstPage();
          }
        });

      this.http.get<{ languages: Lang[] }>('/assets/i18n/lang.json').subscribe((res) => {
        this.langs = res.languages;

        this.setLanguage(this._tr.getBrowserLang() || 'en');
      });
    } else {
      const url = "https://caniuse.com/?search=webhid";
      const tip = `${this._tr.instant("请使用支持 Web HID 的浏览器，支持列表可查询")}:${url}`;
      alert(tip);
    }
  }

  async checkVersion() {
    const yes = await this._firmware.hasNewVersino(this._device.info());

    if (yes) {
      const ref = this._dialog.open(FirmwareUpdateDialogComponent);

      ref.afterClosed().subscribe((state) => {
        if (state) {
          this._firmware.download();
        }
      })
    }
  }

  private toFirstPage() {
    if (this._device.isSupport(Cmd.Key)) {
      this._router.navigate([KEYBOARD_PAGE]);
    } else {
      this._router.navigate([SIMPLE_KEY_PAGE]);
    }
  }

  private createMenus() {
    let menus = MENUS.filter((menu) => this._device.isSupport(menu.key));

    if (this._settings.get("HIDInput") === "open") {
      menus.push(HIDMenu);
    }

    return menus;
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }

  setLanguage(key: string) {
    this._tr.use(key).subscribe(async () => {
      this._loading.loading();
      const lang = this.langs.find((item) => item.key === this._tr.currentLang);

      if (lang) {
        this.lang = lang;

        await this._doc.loadParamDoc();

        if (this._device.isConnected()) {
          await this._doc.load(this._device.filename());
        };

        this._loading.complete();
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
