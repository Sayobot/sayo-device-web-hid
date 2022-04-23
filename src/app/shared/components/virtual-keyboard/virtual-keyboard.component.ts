import { Component, Input, OnInit } from '@angular/core';

interface VKeyboardInfo {
  width: number;
  height: number;
  isHorizen: boolean;
  zoom: number;
  size: Size;
}

@Component({
  selector: 'Virtual-Keyboard',
  templateUrl: './virtual-keyboard.component.html',
  styleUrls: ['./virtual-keyboard.component.scss'],
})
export class VirtualKeyboardComponent implements OnInit {
  vkeyboardSize!: Size;

  @Input()
  width = 1080;

  @Input()
  height = 540;

  private _keys: Key[] = [];

  @Input()
  get keys() {
    return this._keys;
  }
  set keys(data: Key[]) {
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

  get containerStyle() {
    return {
      width: `${this.width}px`,
      height: `${this.height}px`,
    };
  }

  get vkeyboardStyle() {
    return {
      width: `${this.vkeyboardSize.width}px`,
      height: `${this.vkeyboardSize.height}px`,
      'border-radius': `${this.vkeyboardSize.radius}px`,
    };
  }

  vkeyStyle(point: Point) {
    return {
      top: `${point.y}px`,
      left: `${point.x}px`,
    };
  }

  getVKeyboardInfo(keys: Key[]) {
    const spaceing = this.vkeyboardLeft(keys);
    const width = this.vkeyboardRight(keys) + spaceing;
    const height = this.vkeyboardBottom(keys) + spaceing;

    const isHorizen = width / height >= this.width / this.height;
    const zoom = isHorizen ? this.height / width : this.height / height;

    const size: Size = {
      width: isHorizen ? this.width : width * zoom,
      height: isHorizen ? height * zoom : this.height,
      radius: 8,
    };

    const info: VKeyboardInfo = {
      width,
      height,
      isHorizen,
      zoom,
      size,
    };

    return info;
  }

  private vkeyboardLeft(keys: Key[]) {
    return Math.min(...keys.map((key) => key.pos.point.x));
  }

  private vkeyboardRight(keys: Key[]) {
    return Math.max(...keys.map((key) => key.pos.point.x + key.pos.size.width));
  }

  private vkeyboardBottom(keys: Key[]) {
    return Math.max(...keys.map((key) => key.pos.point.y + key.pos.size.height));
  }

  onClicked() {
    console.log('on click');
  }
}
