import { TestBed } from '@angular/core/testing';

import { AsuntoPenalService } from './asunto-penal.service';

describe('AsuntoPenalService', () => {
  let service: AsuntoPenalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AsuntoPenalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
