import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { randomAsciiString } from '../../../utils';
import * as _ from 'lodash';

@Component({
  selector: 'string-edit',
  templateUrl: './string-edit.component.html',
  styleUrls: ['./string-edit.component.scss']
})
export class StringEditComponent implements OnInit {
  edited = false;
  value = "";

  @Input() id!: string;
  @Input() text!: string;
  @Input() maxLength = 28;
  @Input() charset: "ASCII" | "All" = "All";

  @Output() textChanged = new EventEmitter<string>();

  constructor(private _el: ElementRef, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  onEdit() {
    this.edited = true;
    this.value = this.text;

    setTimeout(() => {
      let input: HTMLInputElement = this._el.nativeElement.querySelector("#content-input");
      if (input) {
        input.focus();
      }
    }, 100);
  }

  onRandom() {
    this.value = randomAsciiString(12);
  }

  onConfirm() {
    if (!this.valid()) {
      this._snackBar.open('Only ASCII', 'Done', {
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });

      return;
    }

    this.edited = false;

    if (this.value === this.text) {
      return;
    }

    this.textChanged.emit(this.value);
  }

  onCancel() {
    this.edited = false;
    this.value = this.text;
  }

  valid() {
    switch (this.charset) {
      case "ASCII": {
        for (let i = 0; i < this.value.length; i++) {
          if (this.value.charCodeAt(i) > 127) {
            return false;
          }
        }
      }
        break;
      case "All":
        break;
    }

    return true;
  }

  hint() {
    let result = '';

    switch (this.charset) {
      case "ASCII":
        result = "Only ASCII";
        break;
      case "All":
        result = "";
        break;
    }

    return result;
  }

}
