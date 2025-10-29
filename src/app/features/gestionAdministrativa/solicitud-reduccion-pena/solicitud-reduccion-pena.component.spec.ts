import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudReduccionPenaComponent } from './solicitud-reduccion-pena.component';

describe('SolicitudReduccionPenaComponent', () => {
  let component: SolicitudReduccionPenaComponent;
  let fixture: ComponentFixture<SolicitudReduccionPenaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolicitudReduccionPenaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudReduccionPenaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
