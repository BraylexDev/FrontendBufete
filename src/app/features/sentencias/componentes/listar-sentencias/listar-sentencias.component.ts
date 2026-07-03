import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule, DatePipe } from '@angular/common';
import { SentenciaModalComponent } from '../sentencia-modal/sentencia-modal.component';
import { NgbModal, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { VerDocumentoService } from '../../../shared/components/ver-documento/ver-documento-service/ver-documento.service';
import { Router } from '@angular/router';
import { SentenciaService } from '../../../../domain/services/sentencia/sentencia.service';
import { SentenciaResponse } from '../../../../domain/models/sentencia.model';

@Component({
  selector: 'app-listar-sentencias',
  imports: [SharedModule, CommonModule, FormsModule, NgbPaginationModule],
  providers: [
    DatePipe
  ],
  templateUrl: './listar-sentencias.component.html',
  styleUrl: './listar-sentencias.component.scss'
})
export class ListarSentenciasComponent implements OnInit{
  // Filtros
  filtroBusqueda: string = '';
  tipoSentenciaSeleccionada: string = '';

  page = 1;
  pageSize = 10;

  sentencias: SentenciaResponse[] = [];
  tiposSentencia: string[] = ['Condenatoria', 'Absolutoria', 'Mixta', 'Apelación', 'Casación'];

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

    // Filtro por tipo de sentencia
    if (this.tipoSentenciaSeleccionada && this.tipoSentenciaSeleccionada.trim()) {
      resultado = resultado.filter(sentencia => 
        sentencia.tipoSentencia === this.tipoSentenciaSeleccionada
      );
    }

    // Filtro por búsqueda general
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase();
      resultado = resultado.filter(sentencia => {
        const nombreCoincide = sentencia.nombre?.toLowerCase().includes(texto) || false;
        const tipoCoincide = sentencia.tipoSentencia?.toLowerCase().includes(texto) || false;
        const clienteCoincide = sentencia.clienteId?.toLowerCase().includes(texto) || false;
        
        // Convertir la fecha a string de forma segura
        let fechaCoincide = false;
        if (sentencia.fechaSentencia) {
          const fechaFormateada = this.pipe.transform(sentencia.fechaSentencia, 'yyyy/MM/dd');
          fechaCoincide = fechaFormateada ? fechaFormateada.includes(texto) : false;
        }
        
        return nombreCoincide || tipoCoincide || clienteCoincide || fechaCoincide;
      });
    }

    return resultado;
  }

  get collectionSize(): number {
    return this.sentenciasfiltradas.length;
  }

  get sentenciasPaginadas(): SentenciaResponse[] {
    const filtered = this.sentenciasfiltradas;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.tipoSentenciaSeleccionada = '';
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
    modalRef.componentInstance.modalTitle = 'Registrar Nueva Sentencia';
    modalRef.componentInstance.tipoDocumento = 'SENTENCIA';
    
    // Suscribirse al cierre del modal
    modalRef.result.then(() => {
      this.cargarSentencias();
    }).catch(() => {
      this.cargarSentencias();
    });
  }

  verDocumento(url: string) {
    this.verDomuentoService.urlDocumentToConsult = url;
    console.log("urlVErDoc: " + url);
    this.router.navigate(['/admin/ver']);
  }

  getTipoBadgeClass(tipo: string): string {
    switch(tipo?.toLowerCase()) {
      case 'condenatoria':
        return 'bg-danger';
      case 'absolutoria':
        return 'bg-success';
      case 'mixta':
        return 'bg-warning';
      case 'apelación':
        return 'bg-info';
      case 'casación':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }
}
