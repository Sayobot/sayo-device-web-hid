import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { LoaderService } from './loader.service';

@Component({
  selector: 'global-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  loading$!: Observable<boolean>;

  constructor(private _loader: LoaderService) {
    this.loading$ = this._loader.loading$;
    this._loader.complete();
  }

  ngOnInit() {

  }

}
