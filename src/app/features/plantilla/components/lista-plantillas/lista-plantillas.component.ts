import { CommonModule, DatePipe } from '@angular/common';
import { Component, PipeTransform } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { map, Observable, of, startWith } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { PlantillaModalComponent } from '../plantilla-modal/plantilla-modal.component';
import { VerDocumentoService } from '../../../shared/components/ver-documento/ver-documento-service/ver-documento.service';
import { Router } from '@angular/router';
import { PlantillaService } from '../../../../domain/services/plantilla/plantilla.service';
import { PlantillaDto } from '../../../../domain/models/plantilla.model';
import { CategoriaService } from '../../../../domain/services/categoria/categoria.service';
import { CategoriaDTO } from '../../../../domain/models/categoria.model';


@Component({
  selector: 'app-lista-plantillas',
  imports: [SharedModule, CommonModule, FormsModule, NgbPaginationModule],
  providers: [
    DatePipe
  ],
  templateUrl: './lista-plantillas.component.html',
  styleUrl: './lista-plantillas.component.scss'
})
export class ListaPlantillasComponent {
  // Filtros
  filtroBusqueda: string = '';
  categoriaSeleccionada: string = '';

  page = 1;
  pageSize = 10;

  plantillas: PlantillaDto[] = [];
  categorias: CategoriaDTO[] = [];

  constructor(
    private verDomuentoService: VerDocumentoService, 
    private pipe: DatePipe, 
    private modalService: NgbModal, 
    private router: Router,
    private plantillaService: PlantillaService,
    private categoriaService: CategoriaService,
  ) {
    this.categoriaService.listarCategorias("PLANTILLA").subscribe({
      next: data => {
        this.categorias = data;
      }
    });
  }

  ngOnInit(): void {
    this.cargarPlantillas();
  }

  cargarPlantillas(): void {
    this.plantillaService.listarPlantillas()
      .subscribe({
        next: (data) => {
          this.plantillas = data;
        },
        error: err => console.error('Error fetching items', err)
      });
  }

  get plantillasfiltradas(): PlantillaDto[] {
    let resultado = [...this.plantillas];

    // Filtro por categoría
    if (this.categoriaSeleccionada && this.categoriaSeleccionada.trim()) {
      resultado = resultado.filter(plantilla => 
        plantilla.categoria === this.categoriaSeleccionada
      );
    }

    // Filtro por búsqueda general
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(plantilla => {
        const nombreCoincide = plantilla.nombre?.toLowerCase().includes(texto) || false;
        const categoriaCoincide = plantilla.categoria?.toLowerCase().includes(texto) || false;
        
        // Convertir la fecha a string de forma segura
        let fechaCoincide = false;
        if (plantilla.fecha) {
          const fechaFormateada = this.pipe.transform(plantilla.fecha, 'yyyy/MM/dd');
          fechaCoincide = fechaFormateada ? fechaFormateada.includes(texto) : false;
        }
        
        return nombreCoincide || categoriaCoincide || fechaCoincide;
      });
    }

    return resultado;
  }

  get collectionSize(): number {
    return this.plantillasfiltradas.length;
  }

  get plantillasPaginadas(): PlantillaDto[] {
    const filtered = this.plantillasfiltradas;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.categoriaSeleccionada = '';
    this.page = 1;
  }

  onNodeDoubleClick(idFileBlob: string): void {
    this.viewFile(idFileBlob);
  }

  viewFile(idFileBlob: string): void {
    this.plantillaService.viewFile(idFileBlob);
  }

  downloadFile(idFileBlob: string): void {
    this.plantillaService.downloadFile(idFileBlob);
  }

  openModal() {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    const modalRef = this.modalService.open(PlantillaModalComponent);
    modalRef.componentInstance.modalTitle = 'Crear Plantilla Jurídica';
    
    // Suscribirse al cierre del modal
    modalRef.dismissed.subscribe(() => {
      this.cargarPlantillas();
    });
  }

  verDocumento(url: string) {
    this.verDomuentoService.urlDocumentToConsult = url;
    this.router.navigate(['/admin/ver']);
  }
}