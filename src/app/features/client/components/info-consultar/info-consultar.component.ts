import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, PipeTransform } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { map, Observable, of, startWith } from 'rxjs';
import { SharedModule } from '../../../shared/shared.module';
import { Router } from '@angular/router';
import { VerDocumentoService } from '../../../shared/components/ver-documento/ver-documento-service/ver-documento.service';
import { ClienteService } from '../../../../domain/services/cliente/cliente.service';
import { ClienteDTO } from '../../../../domain/models/cliente.model';
import { ConsultarClienteService } from '../../../../domain/services/ConsultarCliente/consultar-cliente.service';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SentenciaResponse } from '../../../../domain/models/sentencia.model';
import { SentenciaService } from '../../../../domain/services/sentencia/sentencia.service';

@Component({
  selector: 'app-info-consultar',
  imports: [SharedModule, CommonModule, FormsModule, NgbPaginationModule],
  providers: [
    DatePipe
  ],
  templateUrl: './info-consultar.component.html',
  styleUrl: './info-consultar.component.scss'
})
export class InfoConsultarComponent implements OnInit {

  // Filtros
  filtroBusqueda: string = '';
  tipoSentenciaSeleccionada: string = '';

  page = 1;
  pageSize = 10;

  sentencias: SentenciaResponse[] = [];
  tiposSentencia: string[] = ['Condenatoria', 'Absolutoria', 'Mixta', 'Apelación', 'Casación'];
  infoCliente: ClienteDTO = {} as ClienteDTO;

  id: string = '';

  filter = new FormControl('', { nonNullable: true });

  constructor(private infoclienteService: ConsultarClienteService,
    private clienteService: ClienteService,
    private verDomuentoService: VerDocumentoService, private router: Router,
    private pipe: DatePipe,
    private sentenciaService: SentenciaService
  ) {
  }

  ngOnInit() {
    // Nos suscribimos al servicio para obtener el id
    this.infoclienteService.currentId.subscribe(id => {
      this.id = id;  // Asignamos el id recibido

      if (this.id) {
        // Llamamos al servicio de cliente una vez que el id esté disponible
        this.clienteService.getClienteById(this.id).subscribe({
          next: (data) => {
            this.infoCliente = data.data;
            console.log(this.infoCliente);
            this.cargarSentencias(this.id);
          },
          error: (err) => console.error('Error fetching client data', err)
        });
      } else {
        console.log('ID no disponible');
      }
    });
  }

  cargarSentencias(id: string): void {
    this.sentenciaService.listarDocsPorCliente(id)
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

  verDocumento(url: string) {
    this.verDomuentoService.urlDocumentToConsult = url;
    /* this.router.navigateByUrl('/view'); */
    window.open("/view", "_blank")
  }
}
