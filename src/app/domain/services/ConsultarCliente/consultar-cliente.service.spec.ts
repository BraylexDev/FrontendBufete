import { TestBed } from '@angular/core/testing';

import { ConsultarClienteService } from './consultar-cliente.service';

describe('ConsultarClienteService', () => {
  let service: ConsultarClienteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultarClienteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
