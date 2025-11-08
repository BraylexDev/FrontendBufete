import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EventoData } from '../../../agenda/utils/eventoData';
import { SharedModule } from '../../../shared/shared.module';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PlantillaService } from '../../../../domain/services/plantilla/plantilla.service';
import { NodeService } from '../../../../domain/services/folder/node.service';
import { NodeDTO } from '../../../../domain/models/node2.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';
import { CategoriaService } from '../../../../domain/services/categoria/categoria.service';
import { CategoriaDTO } from '../../../../domain/models/categoria.model';

const exp: Array<string> = [
  'Administrativo',
  'Civil',
  'Familia',
  'Penal'
];

@Component({
  selector: 'app-plantilla-modal',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './plantilla-modal.component.html',
  styleUrl: './plantilla-modal.component.scss'
})
export class PlantillaModalComponent {
  @Input() modalTitle: string = '';
  /* @Input() event: CalendarEvent = { start: new Date(), title: '' }; */
  @Output() eventSaved = new EventEmitter<EventoData>();

  expedientes: string[] = exp;
  categorias: CategoriaDTO[] = [];

  currentNodes: NodeDTO[] = [];
    currentParentId: string = '';
    loading = false;
    error: string | null = null;

  // Formularios
  newFolderName = '';
  newFolderDescription = '';
  selectedFile: File | null = null;
  fileDescription = '';
  fileNombre = '';
  fileCategoria = '1';

  formDataPlantilla = {
    nombre: '',
    descripcion: '',
    categoria: '1'
  };

  constructor(public activeModal: NgbActiveModal,
    private nodeService: NodeService,
    private categoriaService: CategoriaService,
    private alertService: AlertService
  ) {

    this.cargarPlantillas();
   }
 
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  cargarPlantillas(){
    this.categoriaService.listarCategorias("PLANTILLA").subscribe({
      next: data => {
        this.categorias = data;
      }
    });
  }

  uploadFile() {
    if (
      !this.formDataPlantilla.nombre ||
      !this.formDataPlantilla.descripcion ||
      !this.formDataPlantilla.categoria ||
      !this.selectedFile
    ) {
      this.triggerAlert('Por favor complete todos los campos requeridos', 'warning');
      return;
    }

    if (!this.selectedFile) {
      return;
    }

    this.loading = true;
    this.error = null;
    this.nodeService.uploadFileNOexp(
      this.selectedFile,
      this.formDataPlantilla.categoria,
      this.formDataPlantilla.nombre,
      this.formDataPlantilla.descripcion
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.triggerAlert('Plantilla Registrada Exitosamente', 'success');
          this.cargarPlantillas();
          this.activeModal.dismiss();
        }
        this.loading = false;
      },
      error: (err) => {
        this.triggerAlert('Error al registrar la plantilla', 'danger');
        /* this.activeModal.dismiss(); */
        this.error = err.error?.message || 'Error al subir el archivo';
        this.loading = false;
      }
    });
  }

  triggerAlert(message: string, type: AlertType) {
      this.alertService.showAlert(message, type);
    }
}
