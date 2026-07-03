import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { CategoriaService } from '../../../domain/services/categoria/categoria.service';
import { CategoriaDTO } from '../../../domain/models/categoria.model';
import { SentenciaService } from '../../../domain/services/sentencia/sentencia.service';
import { SentenciaResponse } from '../../../domain/models/sentencia.model';
import { SentenciaModalComponent } from '../../sentencias/componentes/sentencia-modal/sentencia-modal.component';
import { VerDocumentoService } from '../../shared/components/ver-documento/ver-documento-service/ver-documento.service';


@Component({
  selector: 'app-constancia-carcelaria',
  imports: [SharedModule, CommonModule, FormsModule, NgbPaginationModule],
  providers: [
    DatePipe
  ],
  templateUrl: './constancia-carcelaria.component.html',
  styleUrl: './constancia-carcelaria.component.scss'
})
export class ConstanciaCarcelariaComponent implements OnInit {
  // Filtros
  filtroBusqueda: string = '';
  categoriaSeleccionada: string = '';

  page = 1;
  pageSize = 10;

  constancias: SentenciaResponse[] = [];
  categorias: CategoriaDTO[] = [];

  constructor(
    private pipe: DatePipe, 
    private modalService: NgbModal, 
    private router: Router,
    private categoriaService: CategoriaService,
    private sentenciaService: SentenciaService,
    private verDocumentoService: VerDocumentoService
  ) {
  }

  ngOnInit(): void {
    this.cargarConstancias();
  }

  cargarConstancias(): void {
    this.sentenciaService.listarDocumentos("CONSTANCIA").subscribe({
      next: (data) => {
        this.constancias = data;
      },
      error: err => console.error('Error fetching items', err)
    });
  }

  get constanciasfiltradas(): SentenciaResponse[] {
    let resultado = [...this.constancias];

    // Filtro por búsqueda general
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(constancia => {
        const nombreCoincide = constancia.nombre?.toLowerCase().includes(texto) || false;
        const clienteCoincide = constancia.clienteId?.toLowerCase().includes(texto) || false;
        
        // Convertir la fecha a string de forma segura
        let fechaCoincide = false;
        if (constancia.fechaSentencia) {
          const fechaFormateada = this.pipe.transform(constancia.fechaSentencia, 'yyyy/MM/dd');
          fechaCoincide = fechaFormateada ? fechaFormateada.includes(texto) : false;
        }
        
        return nombreCoincide || clienteCoincide || fechaCoincide;
      });
    }

    return resultado;
  }

  get collectionSize(): number {
    return this.constanciasfiltradas.length;
  }

  get constanciasPaginadas(): SentenciaResponse[] {
    const filtered = this.constanciasfiltradas;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.page = 1;
  }

  onNodeDoubleClick(idFileBlob: string): void {
    this.viewFile(idFileBlob);
  }

  viewFile(idFileBlob: string): void {
    this.sentenciaService.downloadFile(idFileBlob);
  }

  downloadFile(idFileBlob: string): void {
    this.sentenciaService.downloadFile(idFileBlob);
  }

  openModal() {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    const modalRef = this.modalService.open(SentenciaModalComponent, { size: 'lg' });
    modalRef.componentInstance.modalTitle = 'Registrar Nueva Constancia Carcelaria';
    modalRef.componentInstance.tipoDocumento = 'CONSTANCIA';
    
    // Suscribirse al cierre del modal
    modalRef.result.then(() => {
      this.cargarConstancias();
    }).catch(() => {
      this.cargarConstancias();
    });
  }

  verDocumento(url: string) {
    this.verDocumentoService.urlDocumentToConsult = url;
    console.log("urlVErDoc: " + url);
    this.router.navigate(['/admin/ver']);
  }
}
