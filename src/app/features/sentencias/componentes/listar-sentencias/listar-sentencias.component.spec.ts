import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarSentenciasComponent } from './listar-sentencias.component';

describe('ListarSentenciasComponent', () => {
  let component: ListarSentenciasComponent;
  let fixture: ComponentFixture<ListarSentenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListarSentenciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListarSentenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
