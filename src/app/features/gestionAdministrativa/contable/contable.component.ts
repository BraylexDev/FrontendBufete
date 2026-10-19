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
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';
import { PermissionService } from '../../../domain/services/permission/permission.service';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { ProcesoDTO } from '../../../domain/models/proceso';

interface DocumentoExpandible extends SentenciaResponse {
  expanded?: boolean;
  expedientes?: ExpedienteDTO[];
  cargandoExpedientes?: boolean;
}

interface DocumentoGrupo {
  usuarioNombre: string;
  procesos: DocumentoExpandible[];
  expanded?: boolean;
  esMisProcesos?: boolean;
}

@Component({
  selector: 'app-contable',
  imports: [SharedModule, CommonModule, FormsModule, NgbPaginationModule],
  providers: [
    DatePipe
  ],
  templateUrl: './contable.component.html',
  styleUrl: './contable.component.scss'
})
export class ContableComponent implements OnInit {
  // Filtros
  filtroBusqueda: string = '';
  categoriaSeleccionada: string = '';

  page = 1;
  pageSize = 10;

  contables: DocumentoGrupo[] = [];
  categorias: CategoriaDTO[] = [];

  /* variables para cargar documentos */
  cargando: boolean = false;
  error: string | null = null;
  asuntoSeleccionado: string = 'CONTABLE';

  procesosFiltrados: DocumentoExpandible[] = [];
  usuarioGruposFiltrados: DocumentoGrupo[] = [];
  usuarioGrupos: DocumentoGrupo[] = [];

  mostrarAbogado: boolean = true;
  procesosext: DocumentoExpandible[] = [];
  contablesFiltradosCache: DocumentoGrupo[] = []; // Caché para mantener las referencias y el estado expanded

  /* Expedientes registrados en el sistema*/
  procesos: ProcesoDTO[] = [];

  constructor(
    private pipe: DatePipe,
    private modalService: NgbModal,
    private router: Router,
    private categoriaService: CategoriaService,
    private sentenciaService: SentenciaService,
    private verDocumentoService: VerDocumentoService,
    private expedienteService: ExpedienteService,
    private procesoService: ProcesoService
  ) {
    
  }

  ngOnInit(): void {
    this.cargarDocumentosContables();
    this.cargarProcesos();
  }

  inicializarDatos(data: DocumentoGrupo[]) {
    this.contables = data;
    this.contablesFiltradosCache = [...this.contables];
    this.aplicarFiltro(); // Genera la primera versión de la caché
  }

  cargarContables(): void {
    this.sentenciaService.listarDocumentos("CONTABLE").subscribe({
      next: (data) => {
        /* this.contables = data; */
      },
      error: err => console.error('Error fetching items', err)
    });
  }

  cargarProcesos(): void {
    this.procesoService.listarProcesosByAbodado().subscribe({
      next: (data) => {
        this.procesos = data.data;
      },
      error: (err) => console.error('Error cargando procesos:', err)
    });
  }

  cargarDocumentosContables(): void {
    this.cargando = true;
    this.error = null;

    this.sentenciaService.listarDocumentosPorAbogado("CONTABLE").subscribe({
      next: (response) => {

        this.procesosext = (response.data || []).map(p => ({
          ...p,
          expanded: false,
          expedientes: [],
          cargandoExpedientes: false
        }));
        // Si tiene permisos, agrupar por usuario
        if (this.mostrarAbogado) {
          this.agruparProcesosPorUsuario();
        } else {
          this.actualizarFiltro();
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar procesos:', err);
        this.error = 'Error al cargar procesos. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  agruparProcesosPorUsuario(): void {

    // Crear mapa de usuarios únicos
    const usuariosMap = new Map<string, { nombre: string; procesos: DocumentoExpandible[] }>();

    const procesosFiltrados = this.procesosext.filter(p =>
      p.tipoSentencia?.toLowerCase().includes(this.asuntoSeleccionado.toLowerCase())
    )

    procesosFiltrados.forEach(proceso => {
      this.cargarExpedientesDelProceso(proceso)
    });

    // Agrupar procesos por usuario
    procesosFiltrados.forEach(proceso => {
      /* const usuarioId = proceso.createdById || 0; */
      const usuarioNombre = proceso.tipoDocumento || 'Sin asignar';
      const procesoNunc = proceso.procesoNunc || 'Sin asignar';

      // Agregar a los demás usuarios
      if (!usuariosMap.has(usuarioNombre)) {
        usuariosMap.set(usuarioNombre, {
          nombre: procesoNunc,
          procesos: []
        });
      }
      usuariosMap.get(usuarioNombre)!.procesos.push(proceso);
    });
    // Convertir mapa a array de grupos
    const otrosGrupos = Array.from(usuariosMap.entries())
      .map(([documento, data]) => ({
        /* usuarioId: id, */
        usuarioNombre: documento,
        procesos: data.procesos.sort((a, b) =>
          (a.procesoNunc || '').localeCompare(b.procesoNunc || '')
        ),
        expanded: false,
        esMisProcesos: false
      }))
      .sort((a, b) => a.usuarioNombre.localeCompare(b.usuarioNombre));

    // Luego agregar los demás grupos (ya ordenados alfabéticamente)
    this.usuarioGrupos = [...this.usuarioGrupos, ...otrosGrupos];

    this.inicializarDatos(this.usuarioGrupos);

    this.actualizarFiltro();
  }

  actualizarFiltro(): void {
    const filtro = this.filtroBusqueda.toLowerCase().trim();
    if (!this.mostrarAbogado) {
      // Filtro para vista sin agrupación por usuario

      if (!filtro) {
        this.procesosFiltrados = this.procesosext.filter(p =>
          p.tipoSentencia?.toLowerCase().includes(this.asuntoSeleccionado.toLowerCase())
        );

        this.procesosFiltrados.forEach(proceso => {
          this.cargarExpedientesDelProceso(proceso)
        });
      } else {
        this.procesosFiltrados = this.procesosext.filter(p =>
          p.tipoSentencia?.toLowerCase().includes(this.asuntoSeleccionado.toLowerCase()) ||
          p.procesoNunc?.toLowerCase().includes(filtro) ||
          p.clienteNumeroDocumento?.toLowerCase().includes(filtro)
        );
        this.procesosFiltrados.forEach(proceso => {
          this.cargarExpedientesDelProceso(proceso)
        });
      }
    } else {
      // Filtro para vista con agrupación por usuario
      if (!filtro) {
        this.usuarioGruposFiltrados = [...this.usuarioGrupos];
      } else {
        this.usuarioGruposFiltrados = this.usuarioGrupos
          .map(grupo => ({
            ...grupo,
            procesos: grupo.procesos.filter(p =>
              p.nombre?.toLowerCase().includes(filtro) ||
              p.procesoNunc?.toLowerCase().includes(filtro) ||
              p.clienteNumeroDocumento?.toLowerCase().includes(filtro)
            )
          }))
          .filter(grupo =>
            grupo.procesos.length > 0 ||
            grupo.usuarioNombre.toLowerCase().includes(filtro)
          );
      }
    }
  }

  cargarExpedientesDelProceso(proceso: DocumentoExpandible): void {
    if (!proceso.id) return;

    proceso.cargandoExpedientes = true;

    this.expedienteService.getExpedientesByProceso(proceso.id).subscribe({
      next: (response: any) => {
        proceso.expedientes = Array.isArray(response) ? response : (response?.data || []);
        proceso.cargandoExpedientes = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
        proceso.expedientes = [];
        proceso.cargandoExpedientes = false;
      }
    });
  }

  get showProcesosList(): boolean {

    if (this.mostrarAbogado) {
      return this.usuarioGruposFiltrados.length > 0;
    }

    return this.procesosFiltrados.length > 0;
  }

  /* get contablesfiltrados(): DocumentoGrupo[] {
    let resultado = [...this.contables];

    // Filtro por búsqueda general
    if (this.filtroBusqueda && this.filtroBusqueda.trim()) {
      const texto = this.filtroBusqueda.toLowerCase();     

      resultado = resultado.filter(contable => {

        const tipoDocCoincide = contable.usuarioNombre?.toLowerCase().includes(texto) || false;  
        const nombresCoinciden = contable.procesos.filter( nombres => {
          const nombreCoincide = nombres.nombre?.toLowerCase().includes(texto) || false;
          const clienteCoincide = nombres.clienteNumeroDocumento?.toLowerCase().includes(texto) || false;
          const expCoincide = nombres.procesoNunc?.toLowerCase().includes(texto) || false;
          // Convertir la fecha a string de forma segura
          let fechaCoincide = false;
          if (nombres.fechaSentencia) {
            const fechaFormateada = this.pipe.transform(nombres.fechaSentencia, 'yyyy/MM/dd');
            fechaCoincide = fechaFormateada ? fechaFormateada.includes(texto) : false;
          }
          return clienteCoincide || nombreCoincide || fechaCoincide || expCoincide;
        });   
        console.log("nombres ::::> ", nombresCoinciden);
                 
        return tipoDocCoincide || nombresCoinciden;
      });
      console.log("asdasdasdad   ", resultado)
      console.log("texto: ", texto);
    }
    console.log("usurio grupo filtrados", this.usuarioGruposFiltrados);
    console.log("contables filtrados", this.contables);
    console.log("resultado :=> ", resultado)
    return resultado;
  } */

  // Este método se ejecuta cada vez que el usuario escribe en el buscador
  aplicarFiltro(): void {
  if (!this.filtroBusqueda || !this.filtroBusqueda.trim()) {
    this.contablesFiltradosCache = [...this.contables];
    return;
  }

  const texto = this.filtroBusqueda.toLowerCase();    
  const resultado: DocumentoGrupo[] = [];

  this.contables.forEach(contable => {
    const tipoDocCoincide = contable.usuarioNombre?.toLowerCase().includes(texto) || false;  
    
    // Filtramos los procesos internamente
    const procesosFiltrados = contable.procesos.filter(nombres => {
      const nombreCoincide = nombres.nombre?.toLowerCase().includes(texto) || false;
      const clienteCoincide = nombres.clienteNumeroDocumento?.toLowerCase().includes(texto) || false;
      const expCoincide = nombres.procesoNunc?.toLowerCase().includes(texto) || false;
      
      let fechaCoincide = false;
      if (nombres.fechaSentencia) {
        const fechaFormateada = this.pipe.transform(nombres.fechaSentencia, 'yyyy/MM/dd');
        fechaCoincide = fechaFormateada ? fechaFormateada.includes(texto) : false;
      }
      return clienteCoincide || nombreCoincide || fechaCoincide || expCoincide;
    });   

    const grupoCoincide = tipoDocCoincide || procesosFiltrados.length > 0;

    // Si el grupo coincide, lo agregamos a los resultados respetando su estado expanded
    if (grupoCoincide) {
      resultado.push({
        ...contable,
        expanded: contable.expanded ?? false, // Mantiene el estado si ya existía
        procesos: tipoDocCoincide ? contable.procesos : procesosFiltrados
      });
    }
  });

  this.contablesFiltradosCache = resultado;
}

  // El getter ahora solo expone la caché ya procesada (sin recrear objetos en cada ciclo)
  get contablesfiltrados(): DocumentoGrupo[] {
    return this.contablesFiltradosCache;
  }


  get collectionSize(): number {
    return this.contablesfiltrados.length;
  }

  get contablesPaginados(): DocumentoGrupo[] {
    const filtered = this.contablesfiltrados;
    const startIndex = (this.page - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return filtered.slice(startIndex, endIndex);
  }


  toggleUsuarioGrupo(grupo: DocumentoGrupo): void {
    grupo.expanded = !grupo.expanded;
  }

  toggleExpanded(proceso: DocumentoExpandible): void {
    proceso.expanded = !proceso.expanded;

    // Cargar expedientes si no están cargados
    if (proceso.expanded && (!proceso.expedientes || proceso.expedientes.length === 0)) {
      this.cargarExpedientesDelProceso(proceso);
    }
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.page = 1;
    this.aplicarFiltro();
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
    modalRef.componentInstance.modalTitle = 'Registrar Nuevo Documento Contable';
    modalRef.componentInstance.tipoSentencia = 'CONTABLE';
    modalRef.componentInstance.expedientes = this.procesos;

    // Suscribirse al cierre del modal
    modalRef.result.then(() => {
      this.usuarioGrupos = [];
      this.cargarDocumentosContables();
    }).catch(() => {
      /* this.cargarDocumentosContables(); */
    });
  }

  verDocumento(url: string) {
    this.verDocumentoService.urlDocumentToConsult = url;
    this.router.navigate(['/admin/ver']);
  }

  eliminarDocumentoContable(id: number){
    this.sentenciaService.eliminarFile(id,"CONTABLE").subscribe({
      next: () => {
        alert('Documento contable eliminado exitosamente');
        this.usuarioGrupos = [];
        this.cargarDocumentosContables();
      },
      error: (err:any) => {
        alert('Error al eliminar documento contable. ');
        console.error('Error al eliminar documento:', err);
        this.error = 'Error al eliminar documentos. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }
}
