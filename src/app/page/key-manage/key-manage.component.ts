import { Component, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { getKeyModeName } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';

@Component({
  templateUrl: './key-manage.component.html',
  styleUrls: ['./key-manage.component.scss'],
})
export class KeyManagePage implements OnInit {
  data$!: Observable<VKey[]>;

  constructor(private _key: KeyService, private _doc: DocService) {
    this.data$ = this._key.data$.pipe(map((keys) => keys.map((key) => this.key2vKey(key))));
  }

  ngOnInit(): void {
    this._key.init();
  }

  key2vKey(key: Key) {
    const name = getKeyModeName(this._doc, key.functions[0].mode, key.functions[0].values);
    const tooltip = name;

    return {
      ...key,
      name,
      tooltip,
    };
  }

  onClicked() {}
}
