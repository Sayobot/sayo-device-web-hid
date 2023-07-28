import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, map, of, tap } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class FirmwareService {

  downloadUrl = "";

  constructor(
    private httpClient: HttpClient
  ) { }

  hasNewVersino(info: DeviceInfo) {
    debugger
    if((!info.api.includes(0xff))) {
      return lastValueFrom(of(false));
    }

    return lastValueFrom(this.httpClient.get<Firmware>(`https://a.sayobot.cn/firmware/update/${info.pid}.json`)
      .pipe(
        map(res => res.data.filter(item => item.model_code === info.mode_code)[0]),
        tap(_ => this.downloadUrl = `https://a.sayobot.cn/firmware/update/${info.pid}.zip`),
        map(item => item.version > info.version)
      ))
  }

  download() {
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    a.href = this.downloadUrl;
    a.click();
    document.body.removeChild(a);
  }
}
