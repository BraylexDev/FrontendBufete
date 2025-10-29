import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionProceso } from './gestion-proceso';

describe('GestionProceso', () => {
  let component: GestionProceso;
  let fixture: ComponentFixture<GestionProceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionProceso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionProceso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
