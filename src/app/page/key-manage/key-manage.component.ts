import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, takeUntil, tap } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { getKeyModeName } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';

interface Level {
  id: number;
  name: string;
}

@Component({
  templateUrl: './key-manage.component.html',
  styleUrls: ['./key-manage.component.scss'],
})
export class KeyManagePage implements OnInit, OnDestroy {
  vkeys: VKey[] = [];
  levels: Level[] = [];

  level = new FormControl();

  destory$ = new Subject();

  constructor(private _key: KeyService, private _doc: DocService) {
    this._key.data$
      .pipe(
        takeUntil(this.destory$),

        // set function level name
        tap((keys) => {
          if (keys.length > 0 && this.levels.length !== keys[0]?.functions.length) {
            this.setLevelName(keys[0].functions.length);
          }
        }),
      )
      .subscribe((keys) => {
        this.updateVkeys(keys, this.level.value);
      });
  }

  ngOnInit(): void {
    this._key.init();

    this.level.setValue(0);
  }

  ngOnDestroy(): void {
    this.destory$.next(0);
    this.destory$.complete();
  }

  onLevelChange() {
    const keys = this._key.data$.getValue();
    const level = this.level.value;

    if (level !== undefined) {
      this.updateVkeys(keys, level);
    }
  }

  updateVkeys(keys: Key[], level: number) {
    this.vkeys = keys.map((key) => this.key2vKey(key, level));
  }

  setLevelName(length: number) {
    this.levels = [];
    for (let i = 0; i < length; i++) {
      const name = i === 0 ? '基本层' : `Fn ${i}`;
      this.levels.push({ id: i, name });
    }
  }

  private key2vKey(key: Key, level: number) {
    const { functions } = key;

    const { mode, values } = functions[level];

    const name = getKeyModeName(this._doc, mode, values);
    const tooltip = name;

    return {
      ...key,
      name,
      tooltip,
    };
  }
}
