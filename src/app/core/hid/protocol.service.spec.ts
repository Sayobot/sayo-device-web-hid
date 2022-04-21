import { TestBed } from '@angular/core/testing';

import { ProtocolService } from './protocol.service';

describe('ProtocolService', () => {
  let service: ProtocolService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProtocolService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
