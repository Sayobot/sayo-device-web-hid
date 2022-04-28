import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject, takeUntil, tap } from 'rxjs';
import { KeyService } from 'src/app/core/device/key.service';
import { getKeyModeName } from 'src/app/core/doc';
import { DocService } from 'src/app/core/doc/doc.service';
import { VirtualKeyboardComponent } from 'src/app/shared/components/virtual-keyboard/virtual-keyboard.component';

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

  @ViewChild('editor') keyEditor!: MatDrawer;
  @ViewChild('vkeyboard') vkeybaord!: VirtualKeyboardComponent;

  constructor(private _key: KeyService, private _doc: DocService) {
    this._key.data$
      .pipe(
        takeUntil(this.destory$),

        // set function level name
        tap((keys) => {
          if (keys.length > 0 && this.levels.length !== keys[0]?.functions.length) {
            this._setLevelName(keys[0].functions.length);
          }
        }),
      )
      .subscribe((keys) => {
        this._updateVkeys(keys, this.level.value);
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
      this._updateVkeys(keys, level);
    }
  }

  onEditorClosed() {
    this.keyEditor.close();
    this.vkeybaord.setActive(undefined);
  }

  onItemClicked(vkey: VKey) {
    this.keyEditor.open();
  }

  private _updateVkeys(keys: Key[], level: number) {
    this.vkeys = keys.map((key) => this._key2vKey(key, level));
  }

  private _setLevelName(length: number) {
    this.levels = [];
    for (let i = 0; i < length; i++) {
      const name = i === 0 ? '基本层' : `Fn ${i}`;
      this.levels.push({ id: i, name });
    }
  }

  private _key2vKey(key: Key, level: number) {
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
