import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TextService } from 'src/app/core/device/text.service';

@Component({
  selector: 'app-text-manage',
  templateUrl: './text-manage.component.html',
  styleUrls: ['./text-manage.component.scss'],
})
export class TextManageComponent implements OnInit {
  destory$ = new Subject();

  texts$: Observable<IText[]>;

  encode: TextEncode;

  constructor(private _text: TextService) {
    this.texts$ = this._text.data$.pipe(takeUntil(this.destory$));
    this.encode = this._text.encode;
  }

  ngOnInit(): void {
    if (this._text.isSupport() && this._text.data$.value.length === 0) {
      this._text.init();
    }
  }

  onTextChanged(id: number, text: string) {
    const item: IText = { id: id, encode: this._text.encode, content: text };
    this._text.setItem(item);
  }

  drop(event: CdkDragDrop<string[]>) {
    this._text.swap(event.previousIndex, event.currentIndex);
  }

  onEncodeChanged(change: MatRadioChange) {
    this._text.encode = change.value;
    this._text.init();
  }
}
