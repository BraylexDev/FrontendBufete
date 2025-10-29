import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from 'angular-calendar';
import { SharedModule } from '../../../shared/shared.module';
import { EventoData } from '../../utils/eventoData';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { Proceso, ProcesoDTO } from '../../../../domain/models/proceso';
import { EventoDto } from '../../../../domain/models/event.model';

const exp: Array<string> = [
  'Caso Andres Sanchez',
  'Caso Cristian Stuani',
  'Caso Fernando Morales',
  'Caso Pablo Munera',
  'Caso Sandra Diaz',
  'Caso Vivian Sarria',
];

interface Termino {
  id: number;
  name: string;
}

const TERMINOS: Termino[] =[
  {
    id: 5,
    name:"5 días"
  },
  {
    id: 15,
    name:"15 días"
  },
  {
    id: 30,
    name:"30 días"
  },
  {
    id: 100,
    name:"100 días"
  }
]

function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
}

@Component({
  selector: 'app-event-modal',
  imports: [SharedModule],
  templateUrl: './event-modal.component.html',
  styleUrl: './event-modal.component.scss'
})
export class EventModalComponent {
  @Input() modalTitle: string = '';
  @Input() dataEvento: EventoData = { evento: {
    titulo: '',
    tipoEventoId: 0,
    fechaInicio: '',
    allDay: false
  }, infoCalendar: { start: new Date(), title: '', end: new Date() } };

  @Output() eventSaved = new EventEmitter<EventoData>();

  expedientes: string[] = exp;
  terminos = TERMINOS;

  items: Termino[] = [];
  selectedTermino!: number;

  procesos!: ProcesoDTO[];
  processMap = new Map<number, string>();

  constructor(public activeModal: NgbActiveModal, private processService: ProcesoService) {
    this.processService.listarProcesosByAbodado()
      .subscribe(
        {
          next: data => {
            this.procesos = data.data;
          }
        }
      );
    
  }

  saveEvent() {
    this.dataEvento.infoCalendar.title = this.dataEvento.evento.procesoNombre + " <br> " + this.dataEvento.infoCalendar.title;
    
    addDays(this.dataEvento.infoCalendar.end || new Date, this.selectedTermino);
    this.eventSaved.emit(this.dataEvento);
    this.activeModal.close(this.dataEvento);
  }
}
