import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerArchivoComponent } from './ver-archivo.component';

describe('VerArchivoComponent', () => {
  let component: VerArchivoComponent;
  let fixture: ComponentFixture<VerArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerArchivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
