import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent } from 'angular-calendar';
import { SharedModule } from '../../../shared/shared.module';
import { EventoData } from '../../utils/eventoData';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { Proceso, ProcesoDTO } from '../../../../domain/models/proceso';
import { FormGroup, FormControl, Validators } from '@angular/forms';

interface Termino {
  id: number;
  name: string;
}

const TERMINOS: Termino[] = [
  {
    id: 5,
    name: "5 días"
  },
  {
    id: 15,
    name: "15 días"
  },
  {
    id: 30,
    name: "30 días"
  },
  {
    id: 100,
    name: "100 días"
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
export class EventModalComponent implements OnInit{
  @Input() procesos: ProcesoDTO[] = [];
  @Input() modalTitle: string = '';
  @Input() dataEvento: EventoData = {
    evento: {
      titulo: '',
      tipoEventoId: 0,
      fechaInicio: '',
      allDay: false
    }, infoCalendar: { start: new Date(), title: '', end: new Date() }
  };

  @Output() eventSaved = new EventEmitter<EventoData>();

  defaultDate: string ='';
  defaultTime: string ='  ';
  terminos = TERMINOS;
  minDate = new Date();
  items: Termino[] = [];
  selectedTermino!: number;
  processMap = new Map<number, string>();

  myForm!: FormGroup;

  constructor(public activeModal: NgbActiveModal, private processService: ProcesoService) {

    this.myForm = new FormGroup({
        firstName: new FormControl('', Validators.required)
      });
  }

  ngOnInit(): void {
    const now = this.dataEvento.infoCalendar.start;

    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); 
    const day = now.getDate().toString().padStart(2, '0');
    this.defaultDate = `${year}-${month}-${day}`;

    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.defaultTime = `${hours}:${minutes}`;
  }

  saveEvent() {
    const procesoBuscado = this.procesos.find((proceso) => proceso.id === this.dataEvento.evento.procesoId);
    if(procesoBuscado){
      this.dataEvento.infoCalendar.title = procesoBuscado.nombre + " <br> " +this.dataEvento.evento.titulo ;
    }
    else{
      this.dataEvento.infoCalendar.title = this.dataEvento.evento.titulo
    }
    
    console.log("title: "+this.dataEvento.infoCalendar.title)
    console.log(this.dataEvento);
    addDays(this.dataEvento.infoCalendar.end || new Date, this.selectedTermino);
    this.eventSaved.emit(this.dataEvento);
    this.activeModal.close(this.dataEvento);
  }

  buscarNombreProceso(id: number){
  }
}
