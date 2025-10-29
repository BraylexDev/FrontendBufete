import { TestBed } from '@angular/core/testing';

import { SentenciaService } from './sentencia.service';

describe('SentenciaService', () => {
  let service: SentenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SentenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
