import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DownloadService } from '../../../shared/components/ver-documento/download-service/download.service';
import { VerDocumentoService } from '../../../shared/components/ver-documento/ver-documento-service/ver-documento.service';
import { Router } from '@angular/router';
import { ProcesoModalComponent } from '../../../procesos/proceso-modal/proceso-modal.component';
import { EventoData } from '../../../agenda/utils/eventoData';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { ProcesoDTO } from '../../../../domain/models/proceso';
import { ExpedienteService } from '../../../../domain/services/expediente/expediente.service';
import { ExpedienteDTO } from '../../../../domain/models/expediente';

interface ProcesoExpandible extends ProcesoDTO {
  expanded?: boolean;
  expedientes?: ExpedienteDTO[];
  cargandoExpedientes?: boolean;
}

interface Expedienteaux {
  id: number;
  nombre: string;
  procesoId?: number;
  rootNodeId: string;
  abierto: boolean; 
}

interface Procesoaux {
  id?: number;
  nombre?: string; 
  numeroProceso?: string; 
  clienteId?: string;
  expedientes: Expedienteaux[];
  abierto: boolean; 
  cargandoExpedientes?: boolean;
}


@Component({
  selector: 'app-lista-reportes',
  imports: [CommonModule, SharedModule, NgbModule],
  templateUrl: './lista-reportes.component.html',
  styleUrl: './lista-reportes.component.scss'
})
export class ListaReportesComponent {
  private procesoService = inject(ProcesoService);
  private expedienteService = inject(ExpedienteService);
  private modalService2 = inject(NgbModal);

  private router = inject(Router);
  // modelo de datos simulado
  procesos: Procesoaux[] = [];
  pro!: Procesoaux;

  expedientesGlobal: ExpedienteDTO[] = [];

  listaprocesos: ProcesoDTO[] = [];

  // texto en el campo de búsqueda
  filtroBusqueda: string = '';

  constructor(
    private verDomuentoService: VerDocumentoService,
    private downloadService: DownloadService,
    private modalService: NgbModal,
    private svc: ProcesoService,
    private expSvc: ExpedienteService
  ) { }

  ngOnInit(): void {
    this.cargarProcesos();  
  }

  cargarProcesos(){
    this.svc.listarProcesosByAbodado()
      .subscribe(
        {
          next: (data) => {
            this.listaprocesos = data.data,
            console.log(data.data)
              this.conversionAux2(this.listaprocesos),
              this.consultarExpedientes(this.procesos)
          },
          error: err => console.error('Error fetching items', err)
        }
      )
  }

  openModal() {
      const buttonElement = document.activeElement as HTMLElement;
      buttonElement.blur();
      const modalRef = this.modalService.open(ProcesoModalComponent);
      modalRef.componentInstance.modalTitle = 'Crear Plantilla Jurídica';
      
      // Suscribirse al cierre del modal
      modalRef.dismissed.subscribe(() => {
        this.cargarProcesos();
      });

    }

  toFolder(exp: Expedienteaux){
    this.router.navigate(['/admin/expedientes', exp.id, 'archivos'], {
      state: { rootNodeId: exp.rootNodeId }
    });
  }

  consultarExpedientes(proc: Procesoaux[]) {
    for (let index = 0; index < proc.length; index++) {
      let element = proc[index];
      this.expSvc.getExpedientesByProceso(element.id)
        .subscribe(
          {
            next: (data) => {
                this.expedientesGlobal = data.data,
                console.log(" exps", this.expedientesGlobal),
                this.procesos[index].expedientes = this.cargarExpedientes(this.expedientesGlobal),
                console.log(" expsdasd", this.procesos[index].expedientes),
                this.procesos[index].abierto = false
            },
            error: err => console.error('Error fetching items', err)
          }
        )
    }
  }

  existExpedients(exp: ExpedienteDTO[]): boolean{
    if(exp.length>0){
      return true;
    }
    return false;
  }

  cargarExpedientes(exp: ExpedienteDTO[]): Expedienteaux[] {
    let expedientes: Expedienteaux[] = [];
    for (let index = 0; index < exp.length; index++) {
      let element = exp[index];

      expedientes.push({
        id: element.id,
        nombre: element.nombre,
        procesoId: element.procesoId,
        rootNodeId: element.rootNodeId,
        abierto: true
      })
    }
    return expedientes;
  }

  conversionAux2(proc: ProcesoDTO[]) {
    this.procesos = proc.map((p) => {
      return {
        id: p.id ?? 0, 
        numeroProceso: p.numeroProceso,
        clienteId: p.clienteId.toString(),
        nombre: p.nombre,
        expedientes: [], 
        abierto: false,
      } as Procesoaux;
    });
  }

  // Alterna colapso del proceso
  toggleProceso(proceso: Procesoaux) {
    proceso.abierto = !proceso.abierto;
  }

  // Alterna colapso del expediente
  toggleExpediente(expediente: Expedienteaux) {
    expediente.abierto = !expediente.abierto;
  }

  get procesosFiltrados(): Procesoaux[] {
    if (!this.filtroBusqueda.trim()) {
      return this.procesos;
    }
    const texto = this.filtroBusqueda.toLowerCase();
    return this.procesos
      .map(proceso => {
        // Verificamos si el nombre de proceso coincide
        const coincideProceso = proceso.nombre?.toLowerCase().includes(texto);

        // Para cada expediente, filtramos documentos que coincidan
        const expedientesFiltrados = proceso.expedientes.map(exp => {
          const coincideExpediente = exp.nombre.toLowerCase().includes(texto);

          return {
            ...exp,
            abierto: coincideExpediente  ? true : exp.abierto
          };
        })
          // Dejamos solo expedientes que tengan documentos filtrados o cuyo número concatene el texto
          .filter(exp => exp.nombre.toLowerCase().includes(texto));

        // Si algún expediente se mantiene, abrimos el proceso
        const hayExpedientes = expedientesFiltrados.length > 0;

        if (coincideProceso || hayExpedientes) {
          return {
            ...proceso,
            expedientes: expedientesFiltrados,
            abierto: coincideProceso || hayExpedientes ? true : proceso.abierto
          };
        }
        return null;
      })
      .filter(p => p !== null) as Procesoaux[];
  }

  verDocumento(url: string) {
    this.verDomuentoService.urlDocumentToConsult = url;
    console.log(url);
    this.router.navigate(['/admin/ver']);
  }

  download(urlDocument: string) {
    console.log(urlDocument);
    const url = urlDocument;
    this.downloadService.downloadFile(url).subscribe((blob) => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;

      console.log(objectUrl);

      /* cambiar por el nombre real del archivo */
      /* a.download = url; */
      a.download = 'file.pdf';
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
  }

  downloadLocal(urlDocument: string) {

    const a = document.createElement('a');
    a.href = urlDocument;

    const carps: string[] = urlDocument.split("/");
    const name: string = carps[carps.length - 1];

    a.download = name;
    a.click();
    URL.revokeObjectURL(urlDocument);
  }

  editarProceso(proceso: Procesoaux): void {
      const modalRef = this.modalService.open(ProcesoModalComponent, { size: 'lg' });
      modalRef.componentInstance.modoEdicion = true;
      modalRef.componentInstance.procesoEdicion = { ...proceso };
      console.log("proceso a editar : ", proceso)
      
      modalRef.result.then(() => {
        this.cargarProcesos();
      }).catch((reason) => {
        console.log('Modal cerrado:', reason);
      });
    }
  
    eliminarProceso(proceso: Procesoaux): void {
      if (!proceso.id) return;
      
      if (!confirm(`¿Está seguro de que desea eliminar el proceso "${proceso.nombre}"?`)) {
        return;
      }
  
      this.procesoService.eliminarProceso(proceso.id).subscribe({
        next: () => {
          alert('Proceso eliminado exitosamente');
          this.cargarProcesos();
        },
        error: (err: any) => {
          console.error('Error al eliminar proceso:', err);
          alert('Error al eliminar el proceso. Por favor intente nuevamente.');
        }
      });
    }
  
    editarExpediente(expediente: Expedienteaux): void {
      const modalRef = this.modalService.open(ProcesoModalComponent, { size: 'lg' });
      modalRef.componentInstance.modoEdicion = true;
      modalRef.componentInstance.expedienteEdicion = { ...expediente };
      modalRef.componentInstance.activeTab = 'expediente';
      console.log("expediente a editar : ", expediente)
      
      modalRef.result.then(() => {
        this.cargarProcesos();
      }).catch((reason) => {
        console.log('Modal cerrado:', reason);
      });
    }
  
    eliminarExpediente(expediente: Expedienteaux, proceso: Procesoaux): void {
      if (!expediente.id) return;
      
      if (!confirm(`¿Está seguro de que desea eliminar el expediente "${expediente.nombre}"?`)) {
        return;
      }
  
      this.expedienteService.eliminarExpediente(expediente.id).subscribe({
        next: () => {
          alert('Expediente eliminado exitosamente');
          // Recargar expedientes del proceso
          if (proceso.id) {
            this.cargarProcesos()
          }
        },
        error: (err: any) => {
          console.error('Error al eliminar expediente:', err);
          alert('Error al eliminar el expediente. Por favor intente nuevamente.');
        }
      });
    }
}
