import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PwdService } from 'src/app/core/device/pwd.service';

@Component({
  selector: 'app-pwd-manage',
  templateUrl: './pwd-manage.component.html',
  styleUrls: ['./pwd-manage.component.scss'],
})
export class PwdManageComponent implements OnInit {
  destory$ = new Subject();

  constructor(private _pwd: PwdService) {
    this._pwd.data$.pipe(takeUntil(this.destory$)).subscribe((pwds) => {

    });
  }

  ngOnInit(): void {
    this._pwd.init();
  }

  setText(val: string) {
    const t = {id: 0, content: val};
    this._pwd.setItem(t);
  }
}
