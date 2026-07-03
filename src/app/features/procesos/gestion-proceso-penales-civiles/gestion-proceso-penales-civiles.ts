import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';
import { PermissionService } from '../../../domain/services/permission/permission.service';
import { AuthService } from '../../../domain/services/auth/auth.service';
import { ProcesoDTO } from '../../../domain/models/proceso';
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { ProcesoModalComponent } from '../proceso-modal/proceso-modal.component';
import { Router } from '@angular/router';

interface ProcesoExpandible extends ProcesoDTO {
  expanded?: boolean;
  expedientes?: ExpedienteDTO[];
  cargandoExpedientes?: boolean;
}

interface UsuarioGrupo {
  usuarioId: number;
  usuarioNombre: string;
  procesos: ProcesoExpandible[];
  expanded?: boolean;
  esMisProcesos?: boolean;
}

@Component({
  selector: 'app-gestion-proceso-penales-civiles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: '../gestion-proceso/gestion-proceso.html',
  styleUrl: '../gestion-proceso/gestion-proceso.scss'
})
export class GestionProcesoPenalesCivilesComponent implements OnInit {
  private procesoService = inject(ProcesoService);
  private expedienteService = inject(ExpedienteService);
  private modalService = inject(NgbModal);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  procesos: ProcesoExpandible[] = [];
  usuarioGrupos: UsuarioGrupo[] = [];
  procesosFiltrados: ProcesoExpandible[] = [];
  usuarioGruposFiltrados: UsuarioGrupo[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = false;
  error: string | null = null;
  mostrarAbogado: boolean = false;

  ngOnInit(): void {
    // Verificar si el usuario tiene permisos para ver todos los procesos
    this.mostrarAbogado = this.permissionService.canViewAllSystemProcesses();
    this.cargarProcesos();
  }

  cargarProcesos(): void {
    this.cargando = true;
    this.error = null;

    // Usar endpoint diferente según permisos
    const endpoint$ = this.mostrarAbogado 
      ? this.procesoService.listarTodosProcesos()
      : this.procesoService.listarProcesosByAbodado();

    endpoint$.subscribe({
      next: (response) => {
        // Filtrar solo procesos Penales y Civiles
        const procesosFiltrados = (response.data || []).filter(p => 
          p.tipoProceso === 'Penal' || p.tipoProceso === 'Civil'
        );

        this.procesos = procesosFiltrados.map(p => ({
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
    // Obtener usuario actual
    const usuarioActual = this.authService.currentUser();
    const usuarioActualNombre = usuarioActual?.nombre || '';

    // Crear mapa de usuarios únicos
    const usuariosMap = new Map<number, { nombre: string; procesos: ProcesoExpandible[] }>();
    const misProcesosList: ProcesoExpandible[] = [];

    // Agrupar procesos por usuario
    this.procesos.forEach(proceso => {
      const usuarioId = proceso.abogadoResponsableId || 0;
      const usuarioNombre = proceso.abogadoResponsableNombre || 'Sin asignar';

      // Si pertenece al usuario actual, guardarlo en misProcesosList
      if (usuarioActualNombre && usuarioNombre === usuarioActualNombre) {
        misProcesosList.push(proceso);
      } else {
        // Agregar a los demás usuarios
        if (!usuariosMap.has(usuarioId)) {
          usuariosMap.set(usuarioId, {
            nombre: usuarioNombre,
            procesos: []
          });
        }
        usuariosMap.get(usuarioId)!.procesos.push(proceso);
      }
    });

    // Convertir mapa a array de grupos
    const otrosGrupos = Array.from(usuariosMap.entries())
      .map(([id, data]) => ({
        usuarioId: id,
        usuarioNombre: data.nombre,
        procesos: data.procesos.sort((a, b) => 
          (a.numeroProceso || '').localeCompare(b.numeroProceso || '')
        ),
        expanded: false,
        esMisProcesos: false
      }))
      .sort((a, b) => a.usuarioNombre.localeCompare(b.usuarioNombre));

    // Crear grupo "Mis Procesos" primero si hay procesos
    this.usuarioGrupos = [];
    if (misProcesosList.length > 0) {
      this.usuarioGrupos.push({
        usuarioId: -1,
        usuarioNombre: 'Mis Procesos',
        procesos: misProcesosList,
        expanded: false,
        esMisProcesos: true
      });
    }

    // Luego agregar los demás grupos (ya ordenados alfabéticamente)
    this.usuarioGrupos = [...this.usuarioGrupos, ...otrosGrupos];

    this.actualizarFiltro();
  }

  actualizarFiltro(): void {
    const filtro = this.filtroBusqueda.toLowerCase().trim();

    if (!this.mostrarAbogado) {
      // Filtro para vista sin agrupación por usuario
      if (!filtro) {
        this.procesosFiltrados = [...this.procesos];
      } else {
        this.procesosFiltrados = this.procesos.filter(p =>
          p.nombre?.toLowerCase().includes(filtro) ||
          p.numeroProceso?.toLowerCase().includes(filtro) ||
          p.clienteNombre?.toLowerCase().includes(filtro)
        );
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
              p.numeroProceso?.toLowerCase().includes(filtro) ||
              p.clienteNombre?.toLowerCase().includes(filtro)
            )
          }))
          .filter(grupo => 
            grupo.procesos.length > 0 || 
            grupo.usuarioNombre.toLowerCase().includes(filtro)
          );
      }
    }
  }

  onBusquedaChange(): void {
    this.actualizarFiltro();
  }

  toggleUsuarioGrupo(grupo: UsuarioGrupo): void {
    grupo.expanded = !grupo.expanded;
  }

  toggleExpanded(proceso: ProcesoExpandible): void {
    proceso.expanded = !proceso.expanded;
    
    // Cargar expedientes si no están cargados
    if (proceso.expanded && (!proceso.expedientes || proceso.expedientes.length === 0)) {
      this.cargarExpedientesDelProceso(proceso);
    }
  }

  cargarExpedientesDelProceso(proceso: ProcesoExpandible): void {
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

  editarProceso(proceso: ProcesoExpandible): void {
    const modalRef = this.modalService.open(ProcesoModalComponent, { size: 'lg' });
    modalRef.componentInstance.modoEdicion = true;
    modalRef.componentInstance.procesoEdicion = { ...proceso };
    
    modalRef.result.then(() => {
      this.cargarProcesos();
    }).catch((reason) => {
      console.log('Modal cerrado:', reason);
    });
  }

  eliminarProceso(proceso: ProcesoExpandible): void {
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

  editarExpediente(expediente: ExpedienteDTO): void {
    const modalRef = this.modalService.open(ProcesoModalComponent, { size: 'lg' });
    modalRef.componentInstance.modoEdicion = true;
    modalRef.componentInstance.expedienteEdicion = { ...expediente };
    modalRef.componentInstance.activeTab = 'expediente';
    
    modalRef.result.then(() => {
      this.cargarProcesos();
    }).catch((reason) => {
      console.log('Modal cerrado:', reason);
    });
  }

  eliminarExpediente(expediente: ExpedienteDTO, proceso: ProcesoExpandible): void {
    if (!expediente.id) return;
    
    if (!confirm(`¿Está seguro de que desea eliminar el expediente "${expediente.nombre}"?`)) {
      return;
    }

    this.expedienteService.eliminarExpediente(expediente.id).subscribe({
      next: () => {
        alert('Expediente eliminado exitosamente');
        // Recargar expedientes del proceso
        if (proceso.id) {
          this.cargarExpedientesDelProceso(proceso);
        }
      },
      error: (err: any) => {
        console.error('Error al eliminar expediente:', err);
        alert('Error al eliminar el expediente. Por favor intente nuevamente.');
      }
    });
  }

  toFolder(exp: ExpedienteDTO): void {
    this.router.navigate(['/admin/expedientes', exp.id, 'archivos'], {
      state: { rootNodeId: exp.rootNodeId }
    });
  }
}
