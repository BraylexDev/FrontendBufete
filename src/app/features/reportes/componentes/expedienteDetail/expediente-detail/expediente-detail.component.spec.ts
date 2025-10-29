import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedienteDetailComponent } from './expediente-detail.component';

describe('ExpedienteDetailComponent', () => {
  let component: ExpedienteDetailComponent;
  let fixture: ComponentFixture<ExpedienteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedienteDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpedienteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
