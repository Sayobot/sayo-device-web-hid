import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceManageComponent } from './device-manage.component';

describe('DeviceManageComponent', () => {
  let component: DeviceManageComponent;
  let fixture: ComponentFixture<DeviceManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeviceManageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeviceManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
