import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  
  loading$ = new ReplaySubject<boolean>(1);

  loading() {
    this.loading$.next(true);
  }

  complete() {
    this.loading$.next(false);
  }
}
