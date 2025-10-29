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

  saved: boolean = false;

  selectedFile: File | null = null;
  fileName: string = 'No se eligió archivo';
  activeTab: string = 'process';

  procesosDef: ProcesoDTO[] = [];
  expDef: ExpedienteDTO[] = [];

  expedientes = [
    { id: 1, nombre: 'EXP-001-2024', procesoId: 1 },
    { id: 2, nombre: 'EXP-002-2024', procesoId: 1 },
    { id: 3, nombre: 'EXP-003-2024', procesoId: 2 },
  ];

  // Formulario para subir documento
  formDataDocument = {
    proceso: '',
    expediente: '',
    descripcion: '',
  };

  // Formulario para crear proceso
  formDataProcess = {
    numeroProceso: '',
    nombre: '',
    clienteId: '',
  };

  // Formulario para crear expediente
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
      this.fileName = file.name;
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

  // Método para subir documento
  onSubmitDocument(): void {
    if (
      !this.formDataDocument.proceso ||
      !this.formDataDocument.expediente ||
      !this.formDataDocument.descripcion ||
      !this.selectedFile
    ) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    console.log('Documento enviado:', {
      ...this.formDataDocument,
      archivo: this.selectedFile,
    });
    alert('Documento subido exitosamente');
    this.resetDocumentForm();
  }

  // Método para crear proceso
  onSubmitProcess(): void {
    const { numeroProceso, nombre, clienteId } = this.formDataProcess;

    // Validación
    if (!numeroProceso || !nombre || !clienteId) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    // Crear objeto con nombres correctos
    const proceso: CreateProceso = {
      numeroProceso,
      nombre,
      clienteId,
      abogadoResponsableId: 0,
      tipoDocumentoCliente: 'CC'
    };

    this.svcProcesos.crearProceso(proceso).subscribe({
      next: (data) => {
        this.saved = true;
        this.triggerAlert('Proceso registrado exitosamente  223', 'success');
        this.resetProcessForm();
        this.cargarProcesos();
      },
      error: (err) => {
        console.error('Error al crear proceso:', err);
        /* alert('Error al crear el proceso'); */
      },
    });
    console.log("saved : "+this.saved)
    if(this.saved){
      this.triggerAlert('Proceso registrado exitosamente', 'success');
    }
    else{
      this.triggerAlert('Error al crear proceso', 'danger');
    }

  }

  // Método para crear expediente
  onSubmitExpediente(): void {

    const { nombre, procesoId } = this.formDataExpediente;


    if (!nombre || !procesoId) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    const expediente: CreateExpedienteDto = { nombre: nombre, procesoId: parseInt(procesoId) }

    this.svcExpediente.crearExpediente(expediente).subscribe({
      next: (data) => {
        console.log('Expediente creado exitosamente:', data.data);
        alert('Expediente registrado exitosamente');
        this.resetProcessForm();
      },
      error: (err) => {
        console.error('Error al crear Expediente:', err);
        alert('Error al crear el Expediente');
      },
    });
  }

  onCancel(): void {
    this.resetDocumentForm();
    this.resetProcessForm();
    this.resetExpedienteForm();
  }

  private resetDocumentForm(): void {
    this.formDataDocument = {
      proceso: '',
      expediente: '',
      descripcion: '',
    };
    this.selectedFile = null;
    this.fileName = 'No se eligió archivo';
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

  cargarPlantilla(): void {
    console.log('Cargar plantilla');
    // Aquí iría la lógica para cargar una plantilla
  }

  // Obtener expedientes filtrados por proceso seleccionado
  getExpedientesByProceso(): any[] {
    if (!this.formDataDocument.proceso) {
      return this.expedientes;
    }
    return this.expedientes.filter(
      (exp) => exp.procesoId === parseInt(this.formDataDocument.proceso)
    );
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }
}
