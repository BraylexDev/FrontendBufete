import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccionesLegalesComponent } from './acciones-legales.component';

describe('AccionesLegalesComponent', () => {
  let component: AccionesLegalesComponent;
  let fixture: ComponentFixture<AccionesLegalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionesLegalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccionesLegalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
