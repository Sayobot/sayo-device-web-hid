import { Component, OnInit } from '@angular/core';
import { FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Subject, fromEvent, takeUntil } from 'rxjs';
import { DeviceService } from 'src/app/core/device/device.service';
import { calcChecksum, sendReport } from 'src/app/core/hid';

const HEXValidator: ValidatorFn = (control) => {
  const reg = /^[0-9a-f][0-9a-f]$/i;
  return (control.value as string)
    .trim()
    .split(" ")
    .every(hex => reg.test(hex))
    ? null : { "HEXInvalid": true };
}

const format = (n: number) => {
  const str = n.toString(16);
  return str.length === 2 ? str : str.padStart(2, "0");
}

const Quicks = [
  { name: "设备数据", value: "00 00" },
  { name: "按键V1 ID 0", value: "06 02 00 00" },
  { name: "按键V2 ID 0", value: "16 02 00 00" },
  { name: "密码 ID 0", value: "0B 02 00 00" },
  { name: "字符串 ID 0", value: "0C 02 00 00" },
  { name: "灯光 ID 0", value: "10 02 00 00" },
  { name: "Bootloader", value: "ff 02 72 96" },
  { name: "恢复出厂", value: "4f 02 72 96" },

  // 临时
  { name: "App", value: "03 00" },
  { name: "固件擦除", value: "04 00" },
  { name: "固件验证", value: "05 00" },
  { name: "设备信息", value: "01 00" }
]

@Component({
  selector: 'app-hid-report',
  templateUrl: './hid-report.component.html',
  styleUrls: ['./hid-report.component.scss']
})
export class HidReportComponent implements OnInit {

  destory$ = new Subject();

  pid = "02";
  checkSum = "00";
  response = "";

  quicks = [...Quicks];

  control = new FormControl("", {
    validators: [Validators.required, HEXValidator]
  });

  constructor(private _device: DeviceService) {
    this.control.valueChanges.subscribe(value => {
      if (value) {

        const sum = calcChecksum(value.trim().split(" ").map(hex => parseInt(hex, 16)));

        this.checkSum = format(sum);
      } else {
        this.checkSum = "00";
      }
    })
  }

  ngOnInit(): void {

  }

  setData(value: string) {
    this.control.setValue(value);
  }

  sendReport() {
    const dev = this._device.instance();
    if (!dev) return;

    if (this.control.valid && dev) {
      const input = this.control.value?.trim().split(" ").map(hex => parseInt(hex, 16))!;
      const buffer = [...input, parseInt(this.checkSum, 16)];

      const done$ = new Subject<boolean>();
      const input$ = fromEvent<HIDInputReportEvent>(dev, 'inputreport').pipe(takeUntil(done$));

      input$.subscribe(({ data }) => {
        const req = ["02", ...buffer.map(format)];
        const res = [...new Uint8Array(data.buffer)].map(format);

        this.response = `HEX Request : ${req}\nHEX Response: ${res}\nResponse: ${[...new Uint8Array(data.buffer)]}`;

        done$.next(true);
        done$.complete();
      });

      sendReport(dev, new Uint8Array(buffer));
    }
  }
}
