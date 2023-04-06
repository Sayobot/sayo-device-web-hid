import { NgModule } from '@angular/core';
import { HidReportComponent } from './hid-report.component';
import { HIDReportRoutingModule } from './hid-report-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [
    HidReportComponent
  ],
  imports: [
    SharedModule,
    HIDReportRoutingModule
  ]
})
export class HidReportModule { }
