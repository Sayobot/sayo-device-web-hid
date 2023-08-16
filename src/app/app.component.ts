import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject, lastValueFrom, takeUntil } from 'rxjs';
import { DeviceService } from './core/device/device.service';
import { DocService } from './core/doc/doc.service';
import { Cmd, O2Protocol } from './core/hid';
import { Router } from "@angular/router";
import { BreakpointObserver } from '@angular/cdk/layout';
import { Settings } from './core/device/settings.service';
import { FirmwareService } from './core/device/firmware.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { LoaderService } from './shared/components/loading/loader.service';
import { GetBoolDialog } from './shared/components/get-bool-dialog/get-bool-dialog.component';
import { ProgressDialog } from './shared/components/progress-dialog/progress-dialog.component';
import { InformationDialog } from './shared/components/information-dialog/information-dialog.component';

const isWeChat = navigator.userAgent.toLowerCase().includes("micromessenger");
const isO3C = (pid: number, mode_code: number) => (pid === 5 && mode_code === 4);
const caniuse = () => navigator.hid && !isWeChat;

const O3C_MIN_VERSION = 98;

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

  deviceInfo: DeviceInfo | undefined;
  firmwareConfig: Firmware | undefined;

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
    if (!this.caniuse()) {
      return;
    }

    this._bpo.observe([SMALL_SCREEN]).pipe(takeUntil(this.destory$))
      .subscribe(result => {
        this.matchSmallScreen = result.breakpoints[SMALL_SCREEN];
      })

    this.http.get<{ languages: Lang[] }>('/assets/i18n/lang.json')
      .pipe(takeUntil(this.destory$))
      .subscribe((res) => {
        this.langs = res.languages;
        this.setLanguage(this._tr.getBrowserLang() || 'en');
      });

    this._device.device$
      .pipe(takeUntil(this.destory$))
      .subscribe(async (device: HIDDevice) => {
        if (!device.opened) {
          return console.error("please connect device.");;
        }

        const isBootloader = await this._firmware.isBootloader(device);
        if (isBootloader) {
          this.upgrade(device);
          return;
        }

        this.deviceInfo = this._device.info();
        const { pid, mode_code, version } = this.deviceInfo;
        if (isO3C(pid, mode_code) && version < O3C_MIN_VERSION) {
          const ok = await this.confirmUpdate(this._tr.instant("设备版本过低，必须升级固件后才能正常使用设置程序"));
          if (ok) {
            this.jumpToBootloader();
          }
          return;
        }

        this.firmwareConfig = await this._firmware.config(pid);

        if (this.firmwareConfig && this._firmware.canUpdate(this.firmwareConfig, this.deviceInfo)) {
          const ok = await this.confirmUpdate(this._tr.instant("当前设备有新固件可以更新"));
          if (ok) {
            this.jumpToBootloader();
            return;
          }
        };

        if (!this._doc.isLoaded()) {
          await this._doc.load(this._device.filename());
        }

        this.menus = [...this.createMenus()];
        if (this._settings.get("HIDInput") === "open") {
          this.menus.push(HIDMenu);
        }
        this.toFirstPage();

        this._settings.storage$
          .pipe(takeUntil(this.destory$)).subscribe(result => {
            this._protocol.setLogEnable(result["log"] === "open");
            this._protocol.setHIDLogEnable(result["HIDLog"] === "open");

            if (this._device.isConnected()) {
              this.menus = [...this.createMenus()];

              if (this._settings.get("HIDInput") === "open") {
                this.menus.push(HIDMenu);
              }
            }
          })
      });
  }

  private caniuse() {
    if (!caniuse()) {
      const url = "https://caniuse.com/?search=webhid";
      const tip = `${this._tr.instant("请使用支持 Web HID 的浏览器，支持列表可查询")}:${url}`;
      alert(tip);
      return false;
    }

    return true;
  }

  private async upgrade(device: HIDDevice) {
    const config: MatDialogConfig = {
      disableClose: true,
      width: "500px",
      data: {
        title: this._tr.instant("固件升级中，请不要断开连接或者关闭窗口...")
      }
    };

    this.deviceInfo = await this._firmware.bl_device_info(device);
    this.firmwareConfig = await this._firmware.config(device.productId);

    if (!this.firmwareConfig) {
      return;
    }

    const info = this._firmware.firmwareInfo(this.firmwareConfig, this.deviceInfo.mode_code);

    if (!info) {
      console.error("没找到对应固件用于升级");
      return;
    }

    const ref = this._dialog.open(ProgressDialog, config);

    this._firmware.upgrade$
      .pipe(takeUntil(this.destory$))
      .subscribe((progress) => {
        if (progress.done) {
          ref.componentInstance.setValue(100);
          ref.componentInstance.setContent("固件升级结束，窗口关闭后请重新连接设备...");

          setTimeout(() => {
            ref.close();
            this._router.navigate(["/device"]);
          }, 2000);

          return;
        }

        ref.componentInstance.setValue(100 * (progress.value / progress.total));
        ref.componentInstance.setContent(`${progress.value}/${progress.total} byte`);
      });

    this._firmware.onBootloader = false;
    this._firmware.upgrade(device, info, this.firmwareConfig);
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

  private async jumpToBootloader() {
    if (!this.deviceInfo) return;

    const config: MatDialogConfig = {
      disableClose: true,
      width: "500px",
      data: {
        content: this._tr.instant("设备正在进入 Bootloader，稍后请重新选择并连接设备后开始自动在线升级"),
        title: this._tr.instant("Bootloader")
      }
    }

    const ref = this._dialog.open(InformationDialog, config);
    await this._firmware.bootloader(this._device.instance!, 3000, () => {
      ref.close();
      this._firmware.onBootloader = true;
      this._router.navigate(["/device"]);
    });
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
}
