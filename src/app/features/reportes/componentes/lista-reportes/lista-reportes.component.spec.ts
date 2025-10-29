import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaReportesComponent } from './lista-reportes.component';

describe('ListaReportesComponent', () => {
  let component: ListaReportesComponent;
  let fixture: ComponentFixture<ListaReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaReportesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
