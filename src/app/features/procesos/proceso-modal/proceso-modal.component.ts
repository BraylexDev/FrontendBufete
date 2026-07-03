import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { CreateProceso, EditProcesoRequest, ProcesoDTO } from '../../../domain/models/proceso';
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
  
  // Propiedades para modo edición
  modoEdicion: boolean = false;
  procesoEdicion: ProcesoDTO | null = null;
  expedienteEdicion: ExpedienteDTO | null = null;

  // Opciones de tipo de proceso
  tiposProceso = ['Administrativo', 'Civil', 'Penal'];

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
    tipoProceso: '',
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
    
    // Si estamos en modo edición, cargamos los datos
    if (this.modoEdicion) {
      if (this.procesoEdicion) {
        this.formDataProcess = {
          numeroProceso: this.procesoEdicion.numeroProceso || '',
          nombre: this.procesoEdicion.nombre || '',
          clienteId: this.procesoEdicion.clienteId?.toString() || '',
          tipoProceso: this.procesoEdicion.tipoProceso || '',
        };
      } else if (this.expedienteEdicion) {
        this.formDataExpediente = {
          nombre: this.expedienteEdicion.nombre || '',
          procesoId: this.expedienteEdicion.procesoId?.toString() || '',
        };
      }
    }
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
    const { numeroProceso, nombre, clienteId, tipoProceso } = this.formDataProcess;

    if (!numeroProceso || !nombre || !clienteId || !tipoProceso) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.modoEdicion && this.procesoEdicion) {
      // Modo edición
      const requestEdit: EditProcesoRequest = {
        id: this.procesoEdicion.id!,
        numeroProceso,
        nombre,
        descripcion: this.procesoEdicion?.descripcion,
        tipoProceso: tipoProceso,
        clienteId: clienteId.toString(), // backend espera String
      };

      this.svcProcesos.actualizarProceso(requestEdit.id!, requestEdit).subscribe({
        next: (data) => {
          if (data.success) {
            this.triggerAlert('Proceso actualizado exitosamente', 'success');
            this.activeModal.close();
          }
        },
        error: (err) => {
          console.error('Error al actualizar proceso:', err);
          this.triggerAlert('Error al actualizar proceso', 'danger');
        },
      });
    } else {
      // Modo creación
      const proceso: CreateProceso = {
        numeroProceso,
        nombre,
        clienteId,
        abogadoResponsableId: 0,
        tipoDocumentoCliente: 'CC',
        tipoProceso
      };

      this.svcProcesos.crearProceso(proceso).subscribe({
        next: (data) => {
          if (data.success) {
            this.triggerAlert('Proceso registrado exitosamente ', 'success');
            this.resetProcessForm();
            this.cargarProcesos();
            this.activeModal.close();
          }

        },
        error: (err) => {
          console.error('Error al crear proceso:', err);
          this.triggerAlert('Error al crear proceso', 'danger');
        },
      });
    }
  }

  onSubmitExpediente(): void {
    const { nombre, procesoId } = this.formDataExpediente;
    if (!nombre || !procesoId) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (this.modoEdicion && this.expedienteEdicion) {
      // Modo edición
      const expedienteActualizado = {
        ...this.expedienteEdicion,
        nombre,
        procesoId: parseInt(procesoId)
      };

      this.svcExpediente.actualizarExpediente(expedienteActualizado.id!, expedienteActualizado).subscribe({
        next: (data) => {
          this.triggerAlert('Expediente actualizado exitosamente', 'success');
          this.activeModal.close();
        },
        error: (err) => {
          console.error('Error al actualizar Expediente:', err);
          this.triggerAlert('Error al actualizar Expediente', 'danger');
        },
      });
    } else {
      // Modo creación
      const expediente: CreateExpedienteDto = { nombre: nombre, procesoId: parseInt(procesoId) }

      this.svcExpediente.crearExpediente(expediente).subscribe({
        next: (data) => {
          this.triggerAlert('Expediente registrado exitosamente ', 'success');
          this.resetExpedienteForm();
          this.activeModal.close();
        },
        error: (err) => {
          console.error('Error al crear Expediente:', err);
          this.triggerAlert('Error al crear Expediente', 'danger');
        },
      });
    }
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
      tipoProceso: '',
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
