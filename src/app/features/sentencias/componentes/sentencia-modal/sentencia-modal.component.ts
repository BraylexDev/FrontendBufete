import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventoData } from '../../../agenda/utils/eventoData';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { Proceso } from '../../../../domain/models/proceso';
import { ExpedienteService } from '../../../../domain/services/expediente/expediente.service';
import { Documento } from '../../../../domain/models/document';
import { ExpedienteDTO } from '../../../../domain/models/expediente';


const exp: Array<string> = [
  'Administrativo',
  'Civil',
  'Familia',
  'Penal'
];


@Component({
  selector: 'app-sentencia-modal',
  imports: [CommonModule, SharedModule],
  templateUrl: './sentencia-modal.component.html',
  styleUrl: './sentencia-modal.component.scss'
})
export class SentenciaModalComponent {

  @Input() modalTitle: string = '';
  @Input() event: Documento = {
    nombre: '',
    tipo: '',
    tipo_contable: '',
    descripcion: '',
    url: '',
    fecha_creacion: new Date(),
    expediente_id: 0,
    usuario_id: 0
  };
  /* @Input() event: CalendarEvent = { start: new Date(), title: '' }; */
  @Output() eventSaved = new EventEmitter<Documento>();

  expedientes: string[] = exp;

  procesos!: Proceso[];
  exped!: ExpedienteDTO[];
  expMap = new Map<number, string>();
  processMap = new Map<number, string>();

  procesoSelected: number = -1;

  constructor(public activeModal: NgbActiveModal, private processService: ProcesoService, private expService: ExpedienteService) {
    this.processService.listarProcesos()
      .subscribe(
        {
          next: data => {
            this.procesos = data;
            this.processMap = new Map(data.map(r => [r.id, r.nombre]));
          }
        }
      );
  }

  m(){
    console.log(this.procesoSelected);
  }

  cargarExpedientes(pS: number){
    this.expService.listarExpedientes()
    .subscribe(
      {
        next: data => {
          this.exped = data.filter(exp => exp.procesoId === pS);
          this.expMap = new Map(data.map(r => [r.id, r.nombre]));
        }
      }
    );
  }

  saveEvent() {
    this.eventSaved.emit(this.event);
    this.activeModal.close(this.event);
  }

}
