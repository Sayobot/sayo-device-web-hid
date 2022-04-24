import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';

@Component({
  templateUrl: './key-manage.component.html',
  styleUrls: ['./key-manage.component.scss'],
})
export class KeyManagePage implements OnInit {
  data$!: Observable<Key[]>;

  constructor(private _key: KeyService) {
    this.data$ = this._key.data$;
  }

  ngOnInit(): void {
    this._key.init();
  }

  onClicked() {}
}
