import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TextService } from 'src/app/core/device/text.service';

@Component({
  selector: 'app-text-manage',
  templateUrl: './text-manage.component.html',
  styleUrls: ['./text-manage.component.scss'],
})
export class TextManageComponent implements OnInit {
  destory$ = new Subject();

  constructor(private _text: TextService) {
    this._text.data$.pipe(takeUntil(this.destory$)).subscribe((texts) => {
      console.log(texts);
    });
  }

  ngOnInit(): void {
    if (this._text.data$.value.length === 0) {
      this._text.init("GBK");
    }
  }

  setText(val: string) {
    const t: IText = { id: 0, encode: 'GBK', content: val };
    this._text.setItem(t);
  }
}
