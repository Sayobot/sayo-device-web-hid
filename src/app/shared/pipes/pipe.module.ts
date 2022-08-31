import { NgModule } from '@angular/core';

import { OrderPipe } from './order.pipe'

let Pipes = [OrderPipe];

@NgModule({
    declarations: [Pipes],
    exports: Pipes,
})
export class PipesModule { }
