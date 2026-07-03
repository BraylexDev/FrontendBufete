import { Component, OnDestroy, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, AlertType } from '../../shared/alert/service/alert.service';
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { ProcesoDTO } from '../../../domain/models/proceso';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';
import { PermissionService } from '../../../domain/services/permission/permission.service';
import { AuthService } from '../../../domain/services/auth/auth.service';
import { Router } from '@angular/router';
import { ProcesoModalComponent } from '../proceso-modal/proceso-modal.component';

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

interface JurisdiccionOption {
  value: string;
  label: string;
  asuntos: string[];
}

interface ProcesoItem {
  id: number;
  numero: string;
  nombre: string;
  cliente: string;
  estado: string;
  fecha: string;
}

@Component({
  selector: 'app-gestion-proceso-nueva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModalModule],
  templateUrl: './gestion-proceso-nueva.component.html',
  styleUrl: './gestion-proceso-nueva.component.scss'
})
export class GestionProcesoNuevaComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly alertService = inject(AlertService);


  private procesoService = inject(ProcesoService);
  private expedienteService = inject(ExpedienteService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  procesosext: ProcesoExpandible[] = [];
  usuarioGrupos: UsuarioGrupo[] = [];
  procesosFiltrados: ProcesoExpandible[] = [];
  usuarioGruposFiltrados: UsuarioGrupo[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = false;
  error: string | null = null;
  mostrarAbogado: boolean = false;



  @ViewChild('actionModal', { static: true }) actionModal?: TemplateRef<any>;

  readonly buscadorForm: FormGroup;
  readonly subForm: FormGroup;

  readonly jurisdicciones: JurisdiccionOption[] = [
    {
      value: 'ORDINARIA',
      label: 'Ordinaria',
      asuntos: [
        'ASUNTOS PENALES',
        'ASUNTOS CORPORATIVOS',
        'ASUNTOS CIVILES – COMERCIALES'
      ]
    },
    {
      value: 'CONTENCIOSA_ADMINISTRATIVA',
      label: 'Contenciosa Administrativa',
      asuntos: [
        'ASUNTOS DE REPARACION DIRECTA',
        'ASUNTOS DE CONTRATACION ESTATAL',
        'ASUNTOS DISCIPLINARIOS'
      ]
    },
    {
      value: 'ESPECIALES',
      label: 'Especiales y Transitoria',
      asuntos: [
        'ASUNTOS DE LA JUSTICIA TRANSICIONAL',
        'ASUNTOS JURISDICCION PENAL MILITAR',
        'ASUNTOS JURISDICCION ESPECIAL INDIGENA'
      ]
    }
  ];

  readonly opcionesAsuntoNuevo = [
    { value: 'ETAPA_CONOCIMIENTO', label: 'Etapa de conocimiento' },
    { value: 'RECURSO_EXTRAORDINARIO', label: 'Recurso extraordinario' },
    { value: 'PENITENCIARIO', label: 'Penitenciario – Ejecución de la pena' }
  ];

  readonly tiposProcedimiento = [
    { value: 'LEY_906_2004', label: 'LEY 906 DE 2004' },
    { value: 'LEY_1908_2018', label: 'LEY 1908 DE 2018' },
    { value: 'LEY_1826_2017', label: 'LEY 1826 DE 2017' },
    { value: 'LEY_1098_2006', label: 'LEY 1098 DE 2006' },
    { value: 'REPRESENTACION_VICTIMAS', label: 'REPRESENTACIÓN DE VÍCTIMAS' }
  ];

  readonly medidasEjecucion = [
    { value: 'CONSTANCIA_VISITA', label: 'Constancia de visita penitenciaria' },
    { value: 'SOLICITUD_SALUD', label: 'Solicitudes de salud de PPL' },
    { value: 'MECANISMOS_LIBERTAD', label: 'Mecanismos de libertad' },
    { value: 'REDENCION_PENAS', label: 'Redención de penas y aplicación de favorabilidad' },
    { value: 'TRASLADOS', label: 'Solicitud de traslados de establecimientos penitenciarios' }
  ];

  procesos: ProcesoItem[] = [];
  modalAction: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | null = null;
  modalTitle = '';
  selectedFileName = '';
  currentStep = 1;

  constructor() {
    this.buscadorForm = this.fb.group({
      jurisdiccion: ['', Validators.required],
      asunto: ['', Validators.required]
    });

    this.subForm = this.fb.group({
      tipoAsuntoNuevo: ['', Validators.required],
      tipoProcedimiento: ['', Validators.required],
      numeroProceso: ['', Validators.required],
      nombreProceso: ['', Validators.required],
      identificacionCliente: ['', Validators.required],
      fechaAudiencia: ['', Validators.required],
      fechaPresentacionPruebas: ['', Validators.required],
      medidaEjecucion: ['', Validators.required],
      archivo: [null]
    });

    this.configurarDependencias();
  }

  ngOnDestroy(): void {
    // Las suscripciones se gestionan con takeUntilDestroyed para evitar fugas de memoria.
  }



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
      // Obtener usuario actual
      const usuarioActual = this.authService.currentUser();
      const usuarioActualNombre = usuarioActual?.nombre || '';
  
      // Crear mapa de usuarios únicos
      const usuariosMap = new Map<number, { nombre: string; procesos: ProcesoExpandible[] }>();
      const misProcesosList: ProcesoExpandible[] = [];
  
      // Agrupar procesos por usuario
      this.procesosext.forEach(proceso => {
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
          this.procesosFiltrados = [...this.procesosext];
        } else {
          this.procesosFiltrados = this.procesosext.filter(p =>
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





  private configurarDependencias(): void {
    this.buscadorForm.get('jurisdiccion')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.buscadorForm.patchValue({ asunto: '' }, { emitEvent: false });
        this.procesos = this.cargarProcesosMock();
      });

    this.buscadorForm.get('asunto')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.procesos = this.cargarProcesosMock();
      });
  }

  get jurisdiccionControl() {
    return this.buscadorForm.get('jurisdiccion');
  }

  get asuntoControl() {
    return this.buscadorForm.get('asunto');
  }

  get tipoAsuntoNuevoControl() {
    return this.subForm.get('tipoAsuntoNuevo');
  }

  get hasSelection(): boolean {
    return Boolean(this.jurisdiccionControl?.value && this.asuntoControl?.value);
  }

  get showInfoMessage(): boolean {
    return !this.hasSelection;
  }

  get showEmptyState(): boolean {
    return this.hasSelection && !this.showProcesosList;
  }

  get showProcesosList(): boolean {
    if (!this.hasSelection) {
      return false;
    }

    if (this.mostrarAbogado) {
      return this.usuarioGruposFiltrados.length > 0;
    }

    return this.procesos.length > 0;
  }

  get asuntosDisponibles(): string[] {
    const seleccion = this.jurisdicciones.find(item => item.value === this.jurisdiccionControl?.value);
    return seleccion?.asuntos ?? [];
  }

  get showEtapaConocimiento(): boolean {
    return this.tipoAsuntoNuevoControl?.value === 'ETAPA_CONOCIMIENTO';
  }

  get showRecursoExtraordinario(): boolean {
    return this.tipoAsuntoNuevoControl?.value === 'RECURSO_EXTRAORDINARIO';
  }

  get showPenitenciario(): boolean {
    return this.tipoAsuntoNuevoControl?.value === 'PENITENCIARIO';
  }

  openActionModal(action: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA'): void {
    this.modalAction = action;

    if (action === 'ASUNTO_NUEVO') {
      this.modalTitle = 'Asunto nuevo';
      this.resetSubForm();
      this.currentStep = 1;
    } else if (action === 'MODIFICAR_ACTUACION') {
      this.modalTitle = 'Modificar o adicionar actuación';
    } else {
      this.modalTitle = 'Estadística de área';
    }

    this.modalService.open(this.actionModal, { size: 'lg', centered: true });
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  siguientePaso(): void {
    if (this.currentStep === 1) {
      if (this.subForm.get('tipoProcedimiento')?.valid) {
        this.currentStep = 2;
      } else {
        this.subForm.get('tipoProcedimiento')?.markAsTouched();
      }
      return;
    }

    if (this.currentStep === 2) {
      const stepTwoValid = this.subForm.get('numeroProceso')?.valid
        && this.subForm.get('nombreProceso')?.valid
        && this.subForm.get('identificacionCliente')?.valid;

      if (stepTwoValid) {
        this.currentStep = 3;
      } else {
        this.subForm.get('numeroProceso')?.markAsTouched();
        this.subForm.get('nombreProceso')?.markAsTouched();
        this.subForm.get('identificacionCliente')?.markAsTouched();
      }
    }
  }

  pasoAnterior(): void {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileName = input.files?.[0]?.name ?? '';
  }

  guardarAsuntoNuevo(): void {
    this.triggerAlert('Registro Exitoso', 'success');
    this.modalService.dismissAll();
    if (this.showEtapaConocimiento) {
      if (this.currentStep !== 3 || this.subForm.invalid) {
        this.subForm.markAllAsTouched();
        return;
      }
    } else if (this.showRecursoExtraordinario) {
      if (!this.selectedFileName) {
        return;
      }
    } else if (this.showPenitenciario) {
      if (this.subForm.get('medidaEjecucion')?.invalid || !this.selectedFileName) {
        this.subForm.get('medidaEjecucion')?.markAsTouched();
        return;
      }
    }

    this.triggerAlert('Registro Exitoso', 'success');
    this.agregarProcesoSimulado();
    this.modalService.dismissAll();
  }

  private agregarProcesoSimulado(): void {
    const numeroProceso = this.subForm.get('numeroProceso')?.value?.toString().trim();
    const nombreProceso = this.subForm.get('nombreProceso')?.value?.toString().trim();
    const identificacionCliente = this.subForm.get('identificacionCliente')?.value?.toString().trim();

    if (!numeroProceso || !nombreProceso || !identificacionCliente) {
      return;
    }

    const usuarioActual = this.authService.currentUser();
    const idSimulado = Date.now();
    const procesoSimulado: ProcesoExpandible = {
      id: idSimulado,
      numeroProceso,
      nombre: nombreProceso,
      clienteId: 0,
      clienteNombre: identificacionCliente,
      abogadoResponsableId: 0,
      abogadoResponsableNombre: usuarioActual?.nombre ?? 'Usuario actual',
      estado: 'Nuevo',
      expanded: false,
      expedientes: [],
      cargandoExpedientes: false
    } as ProcesoExpandible;

    const procesoItem: ProcesoItem = {
      id: idSimulado,
      numero: numeroProceso,
      nombre: nombreProceso,
      cliente: identificacionCliente,
      estado: 'Nuevo',
      fecha: new Date().toISOString().slice(0, 10)
    };

    this.procesosext = [procesoSimulado, ...this.procesosext];
    this.procesos = [procesoItem, ...this.procesos];

    if (this.mostrarAbogado) {
      this.agruparProcesosPorUsuario();
    } else {
      this.actualizarFiltro();
    }
  }

  private resetSubForm(): void {
    this.subForm.reset({
      tipoAsuntoNuevo: '',
      tipoProcedimiento: '',
      numeroProceso: '',
      nombreProceso: '',
      identificacionCliente: '',
      fechaAudiencia: '',
      fechaPresentacionPruebas: '',
      medidaEjecucion: '',
      archivo: null
    });
    this.selectedFileName = '';
    this.currentStep = 1;
  }

  private cargarProcesosMock(): ProcesoItem[] {
    const jurisdiccion = this.jurisdiccionControl?.value;
    const asunto = this.asuntoControl?.value;

    if (!jurisdiccion || !asunto) {
      return [];
    }

    if (jurisdiccion === 'ORDINARIA' && asunto === 'ASUNTOS PENALES') {
      return [
        {
          id: 1,
          numero: 'PR-2026-001',
          nombre: 'Delito contra la vida',
          cliente: 'Carlos Torres',
          estado: 'En trámite',
          fecha: '2026-07-03'
        },
        {
          id: 2,
          numero: 'PR-2026-002',
          nombre: 'Lesiones personales',
          cliente: 'Marta Ruiz',
          estado: 'Asignado',
          fecha: '2026-07-04'
        }
      ];
    }

    return [];
  }

  triggerAlert(message: string, type: AlertType) {
      this.alertService.showAlert(message, type);
    }
}
