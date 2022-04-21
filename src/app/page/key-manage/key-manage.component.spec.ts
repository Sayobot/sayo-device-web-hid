import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyManageComponent } from './key-manage.component';

describe('KeyManageComponent', () => {
  let component: KeyManageComponent;
  let fixture: ComponentFixture<KeyManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyManageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
