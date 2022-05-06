/// <reference path="./index.d.ts" />

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'Virtual-Keyboard',
  templateUrl: './virtual-keyboard.component.html',
  styleUrls: ['./virtual-keyboard.component.scss'],
})
export class VirtualKeyboardComponent implements OnInit {
  vkeyboardSize!: Size;

  @Input()
  id: number | undefined;

  @Output() itemClicked = new EventEmitter<VKey>();

  @Input()
  width = 1080;

  @Input()
  height = 540;

  private _keys: VKey[] = [];

  @Input()
  get keys() {
    return this._keys;
  }
  set keys(data: VKey[]) {
    if (data?.length > 0) {
      const { size, zoom } = this.getVKeyboardInfo(data);
      this.vkeyboardSize = size;

      this._keys = data.map((item) => {
        const size = item.pos.size;
        const point = item.pos.point;

        item.pos = {
          size: {
            width: size.width * zoom,
            height: size.height * zoom,
            radius: size.radius * zoom,
          },
          point: {
            x: point.x * zoom,
            y: point.y * zoom,
          },
        };

        return item;
      });
    }
  }

  constructor() {}

  ngOnInit(): void {}

  get vkeyboardStyle() {
    return {
      width: `${this.vkeyboardSize.width}px`,
      height: `${this.vkeyboardSize.height}px`,
      'border-radius': `${this.vkeyboardSize.radius}px`,
    };
  }

  onClicked(key: VKey) {
    this.itemClicked.emit(key);
  }

  vkeyStyle(point: Point) {
    return {
      top: `${point.y}px`,
      left: `${point.x}px`,
    };
  }

  getVKeyboardInfo(keys: VKey[]) {
    const spaceing = this.vkeyboardLeft(keys);
    const width = this.vkeyboardRight(keys) + spaceing;
    const height = this.vkeyboardBottom(keys) + spaceing;

    const isHorizen = width / height >= this.width / this.height;
    const zoom = isHorizen ? this.width / width : this.height / height;

    const size: Size = {
      width: isHorizen ? this.width : width * zoom,
      height: isHorizen ? height * zoom : this.height,
      radius: 8,
    };

    const info: VKeyboard = {
      width,
      height,
      isHorizen,
      zoom,
      size,
    };

    return info;
  }

  private vkeyboardLeft(keys: VKey[]) {
    return Math.min(...keys.map((key) => key.pos.point.x));
  }

  private vkeyboardRight(keys: VKey[]) {
    return Math.max(...keys.map((key) => key.pos.point.x + key.pos.size.width));
  }

  private vkeyboardBottom(keys: VKey[]) {
    return Math.max(...keys.map((key) => key.pos.point.y + key.pos.size.height));
  }
}
