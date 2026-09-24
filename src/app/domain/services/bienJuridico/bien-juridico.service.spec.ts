import { TestBed } from '@angular/core/testing';

import { BienJuridicoService } from './bien-juridico.service';

describe('BienJuridicoService', () => {
  let service: BienJuridicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BienJuridicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
