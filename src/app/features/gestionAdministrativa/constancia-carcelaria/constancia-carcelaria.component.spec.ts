import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstanciaCarcelariaComponent } from './constancia-carcelaria.component';

describe('ConstanciaCarcelariaComponent', () => {
  let component: ConstanciaCarcelariaComponent;
  let fixture: ComponentFixture<ConstanciaCarcelariaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstanciaCarcelariaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstanciaCarcelariaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
