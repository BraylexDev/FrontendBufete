import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoConsultarComponent } from './info-consultar.component';

describe('InfoConsultarComponent', () => {
  let component: InfoConsultarComponent;
  let fixture: ComponentFixture<InfoConsultarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoConsultarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoConsultarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
