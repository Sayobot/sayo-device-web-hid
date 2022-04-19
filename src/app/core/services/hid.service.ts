import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HidService {
  constructor() {}

  connect() {
    console.log('connect');
  }

  disconnect() {
    console.log('disconnect');
  }

  send() {}

  reciver() {}
}
