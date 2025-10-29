import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { SentenciaModalComponent } from '../sentencia-modal/sentencia-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VerDocumentoService } from '../../../shared/components/ver-documento/ver-documento-service/ver-documento.service';
import { Router } from '@angular/router';
import { SentenciaService } from '../../../../domain/services/sentencia/sentencia.service';
import { SentenciaResponse } from '../../../../domain/models/sentencia.model';

@Component({
  selector: 'app-listar-sentencias',
  imports: [SharedModule, CommonModule],
  providers: [
    DatePipe
  ],
  templateUrl: './listar-sentencias.component.html',
  styleUrl: './listar-sentencias.component.scss'
})
export class ListarSentenciasComponent implements OnInit{
  // Filtros
  filtroBusqueda: string = '';

  page = 1;
  pageSize = 10;

  sentencias: SentenciaResponse[] = [];

 constructor(
    private verDomuentoService: VerDocumentoService, 
    private pipe: DatePipe, 
    private modalService: NgbModal, 
    private router: Router,
    private sentenciaService: SentenciaService,
  ) {
  }

  ngOnInit(): void {
    this.cargarSentencias();
  }

  cargarSentencias(): void {
    this.sentenciaService.listarDocumentos("SENTENCIA")
      .subscribe({
        next: (data) => {
          this.sentencias = data;
        },
        error: err => console.error('Error fetching items', err)
      });
  }

  get sentenciasfiltradas(): SentenciaResponse[] {
    let resultado = [...this.sentencias];

    // Filtro por búsqueda general
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(plantilla => {
        const nombreCoincide = plantilla.nombre?.toLowerCase().includes(texto) || false;
        /* const categoriaCoincide = plantilla.categoria?.toLowerCase().includes(texto) || false; */
        
        // Convertir la fecha a string de forma segura
        let fechaCoincide = false;
        if (plantilla.fechaSentencia) {
          const fechaFormateada = this.pipe.transform(plantilla.fechaSentencia, 'yyyy/MM/dd');
          fechaCoincide = fechaFormateada ? fechaFormateada.includes(texto) : false;
        }
        
        /* return nombreCoincide || categoriaCoincide || fechaCoincide; */
        return nombreCoincide ||  fechaCoincide;
      });
    }

    return resultado;
  }

  get collectionSize(): number {
    return this.sentenciasfiltradas.length;
  }

  get plantillasPaginadas(): SentenciaResponse[] {
    const filtered = this.sentenciasfiltradas;
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
    this.downloadFile(idFileBlob);
  }

  downloadFile(idFileBlob: string): void {
    this.sentenciaService.downloadFile(idFileBlob);
  }

  openModal() {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    const modalRef = this.modalService.open(SentenciaModalComponent);
    modalRef.componentInstance.modalTitle = 'Crear Plantilla Jurídica';
    
    // Suscribirse al cierre del modal
    modalRef.dismissed.subscribe(() => {
      this.cargarSentencias();
    });
  }

  verDocumento(url: string) {
    this.verDomuentoService.urlDocumentToConsult = url;
    console.log("urlVErDoc: " + url);
    this.router.navigate(['/admin/ver']);
  }
}
