import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PwdService } from 'src/app/core/device/pwd.service';

@Component({
  selector: 'app-pwd-manage',
  templateUrl: './pwd-manage.component.html',
  styleUrls: ['./pwd-manage.component.scss'],
})
export class PwdManageComponent implements OnInit {
  destory$ = new Subject();

  pwds$: Observable<Password[]>;

  constructor(private _pwd: PwdService) {
    this.pwds$ = this._pwd.data$.pipe(takeUntil(this.destory$));
  }

  ngOnInit(): void {
    if (this._pwd.isSupport() && this._pwd.data$.value.length === 0) {
      this._pwd.init();
    }
  }

  onTextChanged(id: number, text: string) {
    const item = { id: id, content: text };
    this._pwd.setItem(item);
  }

  drop(event: CdkDragDrop<string[]>) {
    this._pwd.swap(event.previousIndex, event.currentIndex);
  }
}
