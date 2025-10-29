import { TestBed } from '@angular/core/testing';

import { VerDocumentoService } from './ver-documento.service';

describe('VerDocumentoService', () => {
  let service: VerDocumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerDocumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
