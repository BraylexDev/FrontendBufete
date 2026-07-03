import { TestBed } from '@angular/core/testing';

import { GestionAdministrativaService } from './gestion-administrativa.service';

describe('GestionAdministrativaService', () => {
  let service: GestionAdministrativaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionAdministrativaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
