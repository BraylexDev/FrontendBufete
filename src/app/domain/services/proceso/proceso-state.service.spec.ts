import { TestBed } from '@angular/core/testing';

import { ProcesoStateService } from './proceso-state.service';

describe('ProcesoStateService', () => {
  let service: ProcesoStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcesoStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
