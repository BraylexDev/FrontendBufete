import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { CreateProceso, ProcesoDTO } from '../../../domain/models/proceso';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';
import { CreateExpedienteDto, ExpedienteDTO } from '../../../domain/models/expediente';
import { AlertService, AlertType } from '../../shared/alert/service/alert.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-proceso-modal',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './proceso-modal.component.html',
  styleUrl: './proceso-modal.component.scss',
})
export class ProcesoModalComponent {
  proc!: CreateProceso;
  exp!: CreateExpedienteDto;
  selectedFile: File | null = null;
  activeTab: string = 'process';

  procesosDef: ProcesoDTO[] = [];
  expDef: ExpedienteDTO[] = [];

  formDataDocument = {
    proceso: '',
    expediente: '',
    descripcion: '',
  };

  formDataProcess = {
    numeroProceso: '',
    nombre: '',
    clienteId: '',
  };

  formDataExpediente = {
    nombre: '',
    procesoId: '',
  };

  constructor(
    public activeModal: NgbActiveModal,
    private svcProcesos: ProcesoService,
    private svcExpediente: ExpedienteService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarProcesos();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  cargarProcesos() {
    this.svcProcesos.listarProcesosByAbodado().subscribe({
      next: (data) => {
        (this.procesosDef = data.data), console.log(data.data);
      },
      error: (err) => console.error('Error fetching items', err),
    });
  }

  onSubmitProcess(): void {
    const { numeroProceso, nombre, clienteId } = this.formDataProcess;

    if (!numeroProceso || !nombre || !clienteId) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const proceso: CreateProceso = {
      numeroProceso,
      nombre,
      clienteId,
      abogadoResponsableId: 0,
      tipoDocumentoCliente: 'CC'
    };

    this.svcProcesos.crearProceso(proceso).subscribe({
      next: (data) => {
        if (data.success) {
          this.triggerAlert('Proceso registrado exitosamente ', 'success');
          this.resetProcessForm();
          this.cargarProcesos();
        }

      },
      error: (err) => {
        console.error('Error al crear proceso:', err);
        this.triggerAlert('Error al crear proceso', 'danger');
      },
    });
  }

  onSubmitExpediente(): void {
    const { nombre, procesoId } = this.formDataExpediente;
    if (!nombre || !procesoId) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    const expediente: CreateExpedienteDto = { nombre: nombre, procesoId: parseInt(procesoId) }

    this.svcExpediente.crearExpediente(expediente).subscribe({
      next: (data) => {
        this.triggerAlert('Expediente registrado exitosamente ', 'success');
        this.resetProcessForm();
        this.activeModal.dismiss();
      },
      error: (err) => {
        console.error('Error al crear Expediente:', err);
        this.triggerAlert('Error al crear Expediente', 'danger');
      },
    });
  }

  onCancel(): void {
    this.resetProcessForm();
    this.resetExpedienteForm();
  }

  private resetProcessForm(): void {
    this.formDataProcess = {
      numeroProceso: '',
      nombre: '',
      clienteId: '',
    };
  }

  private resetExpedienteForm(): void {
    this.formDataExpediente = {
      nombre: '',
      procesoId: '',
    };
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }
}
