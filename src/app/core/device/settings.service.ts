import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface SettingStorage {
  [key: string]: string
}

@Injectable({ providedIn: 'root' })
export class Settings {
  storage$ = new BehaviorSubject<SettingStorage>({ ...localStorage });

  constructor() { }

  set(key: string, value: string) {
    localStorage.setItem(key, value);
    this.storage$.next({ ...localStorage });
  }

  setStorage(storage: SettingStorage) {
    Object.keys(storage).forEach(key => {
      localStorage.setItem(key, storage[key]);
    })
    this.storage$.next({ ...localStorage });
  }

  get(key: string) {
    return localStorage.getItem(key);
  }

  clear() {
    localStorage.clear();
  }
}
