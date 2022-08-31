import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'order' })
export class OrderPipe implements PipeTransform {
    transform(value: number): string {
        let out = value < 0 ? "0" : (value + 1).toString();
        return out;
    }
}