import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { ProcesoDTO } from '../../../../domain/models/proceso';
import { ExpedienteService } from '../../../../domain/services/expediente/expediente.service';
import { ExpedienteDTO } from '../../../../domain/models/expediente';
import { CreateSentenciaRequest, SentenciaResponse } from '../../../../domain/models/sentencia.model';
import { SentenciaService } from '../../../../domain/services/sentencia/sentencia.service';
import { NodeService } from '../../../../domain/services/folder/node.service';

@Component({
  selector: 'app-sentencia-modal',
  imports: [CommonModule, SharedModule, FormsModule],
  templateUrl: './sentencia-modal.component.html',
  styleUrl: './sentencia-modal.component.scss'
})
export class SentenciaModalComponent implements OnInit {

  @Input() modalTitle: string = '';
  @Input() tipoDocumento: string = 'SENTENCIA'; // Default to SENTENCIA
  @Output() sentenciaGuardada = new EventEmitter<SentenciaResponse>();

  tiposSentencia = ['Condenatoria', 'Absolutoria', 'Mixta', 'Apelación', 'Casación'];
  procesos: ProcesoDTO[] = [];
  expedientes: ExpedienteDTO[] = [];

  formData = {
    nombre: '',
    description: '',
    procesoId: '',
    expedienteId: ''
  };

  selectedFile: File | null = null;
  procesoSeleccionado: number | string = '';
  expedienteSeleccionado: number | string = '';

  constructor(
    public activeModal: NgbActiveModal, 
    private procesoService: ProcesoService, 
    private expedienteService: ExpedienteService,
    private sentenciaService: SentenciaService,
    private nodeService: NodeService
  ) {}

  ngOnInit(): void {
    // Cargar procesos
    this.cargarProcesos();
  }

  cargarProcesos(): void {
    this.procesoService.listarProcesosByAbodado().subscribe({
      next: (data) => {
        this.procesos = data.data;
      },
      error: (err) => console.error('Error cargando procesos:', err)
    });
  }

  onProcesoChange(procesoId: number | string): void {
    this.procesoSeleccionado = procesoId;
    this.formData.procesoId = String(procesoId);
    this.expedientes = [];
    this.expedienteSeleccionado = '';
    this.formData.expedienteId = '';
    
    // Cargar expedientes del proceso seleccionado
    if (procesoId) {
      this.expedienteService.getExpedientesByProceso(Number(procesoId)).subscribe({
        next: (data: any) => {
          this.expedientes = data.data || [];
        },
        error: (err: any) => console.error('Error cargando expedientes:', err)
      });
    }
  }

  onExpedienteChange(expedienteId: number | string): void {
    this.expedienteSeleccionado = expedienteId;
    this.formData.expedienteId = String(expedienteId);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveEvent(): void {
    if (!this.validarFormulario()) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Subir el archivo
    if (this.selectedFile) {
      this.nodeService.uploadFileSentencia(
        this.selectedFile,
        this.formData.procesoId,
        this.formData.expedienteId,
        this.tipoDocumento,
        this.formData.nombre,
        this.formData.description
      ).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            console.log('Archivo subido exitosamente:', response.data);
            // Emitir evento de éxito (en este caso sin sentencia, solo archivo)
            this.sentenciaGuardada.emit();
            this.activeModal.close(response.data);
          }
        },
        error: (err: any) => {
          console.error('Error al subir archivo:', err);
          alert('Error al subir el archivo. Por favor intente nuevamente.');
        }
      });
    } else {
      alert('Por favor seleccione un archivo');
    }
  }

  private validarFormulario(): boolean {
    return !!(
      this.formData.nombre.trim() &&
      this.formData.procesoId &&
      this.formData.expedienteId &&
      this.selectedFile
    );
  }

  cancelar(): void {
    this.activeModal.dismiss('cancel');
  }
}
