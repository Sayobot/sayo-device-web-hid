import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HidReportComponent } from './hid-report.component';

const routes: Routes = [{ path: '', component: HidReportComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HIDReportRoutingModule { }
