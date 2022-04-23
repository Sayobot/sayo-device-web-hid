import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

import { AppComponent } from './app.component';
import { DeviceManagePage } from './page/device-manage/device-manage.component';
import { KeyManagePage } from './page/key-manage/key-manage.component';

import { AuthService } from './core/auth/auth.service';
import { DeviceService } from './core/device/device.service';

const Page = [DeviceManagePage, KeyManagePage];

@NgModule({
  declarations: [AppComponent, ...Page],
  providers: [AuthService, DeviceService],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, SharedModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
