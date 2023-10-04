import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { DeviceService } from './core/device/device.service';
import { DocService } from './core/doc/doc.service';
import { Cmd, O2Protocol, ResponseType } from './core/hid';
import { Router } from "@angular/router";
import { BreakpointObserver } from '@angular/cdk/layout';
import { SettingStorage, Settings } from './core/device/settings.service';
import { FirmwareService, UpgradeProgress, UpgradeEvent } from './core/device/firmware.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LoaderService } from './shared/components/loading/loader.service';
import { GetBoolDialog } from './shared/components/get-bool-dialog/get-bool-dialog.component';
import { GetStringDialog } from './shared/components/get-string-dialog/get-string-dialog.component';

const isO3C = (pid: number, mode_code: number) => (pid === 5 && mode_code === 4);

const O3C_MIN_VERSION = 98;

interface Menu {
  link: string;
  icon: string;
  name: string;
  key: Cmd;
}

const KEYBOARD_PAGE = '/key';
const SIMPLE_KEY_PAGE = '/simplekey';

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
  },
  {
    link: "screen",
    icon: "dashboard",
    name: "屏幕编辑",
    key: Cmd.ScreenMain
  }
];

const HIDMenu: Menu = {
  link: "hid-report",
  icon: "code",
  name: "HID",
  key: 0
}

const SettingMenu: Menu = {
  link: "/setting",
  icon: "settings",
  name: "设置",
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

  onUpgrade = false;

  name = "";
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
    private _loading: LoaderService,
  ) {
    this._bpo.observe([SMALL_SCREEN]).pipe(takeUntil(this.destory$))
      .subscribe(result => {
        this.matchSmallScreen = result.breakpoints[SMALL_SCREEN];
      })

    this.http.get<{ languages: Lang[] }>('/assets/i18n/lang.json')
      .pipe(takeUntil(this.destory$))
      .subscribe((res) => {
        this.handleLangChanged(res.languages);
      });

    this._device.device$
      .pipe(takeUntil(this.destory$))
      .subscribe((device) => {
        if (device) this.handleDeviceChanged(device);
      });

    this._firmware.upgrade$
      .pipe(takeUntil(this.destory$))
      .subscribe((progress) => {
        this.handleUpgradeEvent(progress);
      });

    navigator.hid.addEventListener("disconnect", ({ device }) => {
      const dev = this._device.instance();

      this._device.disconnect();

      if (!this.onUpgrade && device.productId === dev?.productId && device.vendorId === dev.vendorId) {
        alert(`HID disconnected: ${device.productName}`);
        location.reload();
      }

    });

    this._settings.storage$
      .pipe(takeUntil(this.destory$))
      .subscribe(store => {
        this.handleSettingChanged(store)
      })
  }

  private async handleUpgradeEvent(progress: UpgradeProgress) {
    switch (progress.event) {
      case UpgradeEvent.Start:
        this.onUpgrade = true;
        break;
      case UpgradeEvent.Static:
        this.onUpgrade = false;
        break;
      default:
        break;
    }
  }

  private async handleDeviceChanged(device: HIDDevice) {
    if (!device) return;

    if (!device.opened) return console.error("please connect device.");

    if (await this._firmware.isBootloader(device)) {
      this.onUpgrade = true;
      return this._firmware.upgrade(device);
    }

    const info = this._device.info();
    if (!info) return;

    const { pid, mode_code, version } = info;
    if (isO3C(pid, mode_code) && version < O3C_MIN_VERSION) {
      if (await this.confirmUpdate(this._tr.instant("设备版本过低，必须升级固件后才能正常使用设置程序"))) {
        return await this._firmware.bootloader(device);
      }
    }

    const config = await this._firmware.config(pid);

    if (this._device.isSupport(Cmd.Bootloader) && config && this._firmware.checkUpdate(config, info)) {
      if (await this.confirmUpdate(this._tr.instant("当前设备有新固件可以更新"))) {
        return await this._firmware.bootloader(device);
      }
    };

    if (!this._doc.isLoaded()) {
      await this._doc.load(this._device.filename());
    }

    this.updateMenu();
    this.name = await this._device.name(device);
    this.toFirstPage();
  }

  private updateMenu() {
    this.menus = [...this.createMenus()];

    if (this._settings.get("HIDInput") === "open") {
      this.menus.push(HIDMenu);
    }

    this.menus.push(SettingMenu);
  }

  private async confirmUpdate(content = "") {
    const config: MatDialogConfig = {
      width: "500px",
      data: {
        title: "Update!!!",
        content: content,
      }
    }

    const confirmRef = this._dialog.open(GetBoolDialog, config);
    return await lastValueFrom(confirmRef.afterClosed())
  }

  private handleSettingChanged(store: SettingStorage) {
    this._protocol.setLogEnable(store["log"] === "open");
    this._protocol.setHIDLogEnable(store["HIDLog"] === "open");

    if (this._device.isConnected()) {
      this.updateMenu();
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
    return MENUS.filter((menu) => this._device.isSupport(menu.key));
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

  private handleLangChanged(langs: Lang[]) {
    this.langs = [...langs];
    this.setLanguage(this._tr.getBrowserLang() || 'en');
  }

  async onRename() {
    const { pid } = this._device.info()!;

    const config: MatDialogConfig = {
      width: "500px",
      data: {
        title: "Hi",
        content: this._tr.instant("请输入设备新名称"),
        min: 0,
        max: pid === 3 ? 15 : 25,
        value: this.name
      }
    }

    const ref = this._dialog.open(GetStringDialog, config);

    ref.afterClosed()
      .pipe(takeUntil(this.destory$))
      .subscribe(async (name) => {
        if (name) {
          const statu = await this._device.rename(name);
          if (statu === ResponseType.Done) {
            this.name = name;
          }
        }
      })
  }
}
