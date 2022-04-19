import { TestBed } from '@angular/core/testing';

import { HidService } from './hid.service';

describe('HidService', () => {
  let service: HidService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HidService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
