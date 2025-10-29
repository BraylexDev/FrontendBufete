import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerConsultaComponent } from './ver-consulta.component';

describe('VerConsultaComponent', () => {
  let component: VerConsultaComponent;
  let fixture: ComponentFixture<VerConsultaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerConsultaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerConsultaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
