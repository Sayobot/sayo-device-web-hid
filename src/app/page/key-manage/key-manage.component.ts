import { Component, OnInit } from '@angular/core';
import { KeyService } from 'src/app/core/device/key.service';

@Component({
  templateUrl: './key-manage.component.html',
  styleUrls: ['./key-manage.component.scss'],
})
export class KeyManagePage implements OnInit {
  constructor(private _key: KeyService) {}

  ngOnInit(): void {}

  async getData() {
    await this._key.read();
  }

  setData() {}
}
