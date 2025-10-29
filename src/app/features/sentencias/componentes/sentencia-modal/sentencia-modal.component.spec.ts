import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenciaModalComponent } from './sentencia-modal.component';

describe('SentenciaModalComponent', () => {
  let component: SentenciaModalComponent;
  let fixture: ComponentFixture<SentenciaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SentenciaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SentenciaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
