import { Component, Input, OnDestroy, SimpleChanges, TemplateRef, ViewChild, inject, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormsModule, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { DelitoService } from '../../../domain/services/delito/delito.service';
import { BienJuridicoService } from '../../../domain/services/bienJuridico/bien-juridico.service';
import { AsuntoPenal, AsuntoPenalDetalleBasicoDTO, AsuntoPenalDetalleDTO, AsuntosPenalesPorProcedimientoDTO, BienJuridico, Delito, Persona, TerminoDTO } from '../../../domain/models/asuntoPenal/asuntoPenal.model';
import { AsuntoPenalService } from '../../../domain/services/asuntoPenal/asunto-penal.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SharedModule } from '../../shared/shared.module';
import { CrearActuacionRequest } from '../../../domain/models/actuacion.model';
import { catchError, concat, debounceTime, distinctUntilChanged, finalize, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  ProcesoStateService,
  ProcesoExpandible
} from '../../../domain/services/proceso/proceso-state.service';

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
  imports: [SharedModule, CommonModule, FormsModule, ReactiveFormsModule, NgbModalModule, NgSelectModule],
  providers: [DatePipe],
  templateUrl: './gestion-proceso-nueva.component.html',
  styleUrl: './gestion-proceso-nueva.component.scss'
})
export class GestionProcesoNuevaComponent implements OnDestroy {

  @Input() jurisdiccion!: string;
  @Input() tipoAsunto!: string;

  asuntoSeleccionado: string = '';
  jurisdiccionSeleccionada: string = '';

  private readonly procesoState = inject(ProcesoStateService);

  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  private delitoService = inject(DelitoService);
  private bienService = inject(BienJuridicoService);

  private expedienteService = inject(ExpedienteService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('actionModal', { static: true }) actionModal?: TemplateRef<any>;

  readonly buscadorForm: FormGroup;
  readonly RegistrarAsuntoPenalForm: FormGroup;
  readonly RegistrarActuacionForm: FormGroup;
  readonly recursoExtraordinarioForm: FormGroup;
  readonly ejecucionPenaForm: FormGroup;

  readonly jurisdicciones: JurisdiccionOption[] = [
    {
      value: 'ORDINARIA', label: 'Ordinaria',
      asuntos: [ 'ASUNTOS PENALES', 'ASUNTOS CORPORATIVOS', 'ASUNTOS CIVILES – COMERCIALES']
    },
    {
      value: 'CONTENCIOSA_ADMINISTRATIVA', label: 'Contenciosa Administrativa',
      asuntos: [ 'ASUNTOS DE REPARACION DIRECTA', 'ASUNTOS DE CONTRATACION ESTATAL', 'ASUNTOS DISCIPLINARIOS']
    },
    {
      value: 'ESPECIALES', label: 'Especiales y Transitoria',
      asuntos: [ 'ASUNTOS DE LA JUSTICIA TRANSICIONAL', 'ASUNTOS JURISDICCION PENAL MILITAR', 'ASUNTOS JURISDICCION ESPECIAL INDIGENA' ]
    }
  ];

  readonly opcionesAsuntoNuevo = [
    { value: 'ETAPA_CONOCIMIENTO', label: 'Etapa de conocimiento' },
    { value: 'RECURSO_EXTRAORDINARIO', label: 'Recurso extraordinario' },
    { value: 'PENITENCIARIO', label: 'Penitenciario – Ejecución de la pena' }
  ];

  readonly etapasProceso = [
    { value: 'IMPUTACION', label: 'IMPUTACION' },
    { value: 'CONOCIMIENTO', label: 'CONOCIMIENTO' },
    { value: 'EJECUCION', label: 'EJECUCION DE LA PENA' }
  ];

  readonly tiposDetencion = [
    { value: 'LIBERTAD', label: 'EN LIBERTAD' },
    { value: 'RESIDENCIA', label: 'D. EN LUGAR DE RESIDENCIA' },
    { value: 'PENITENCIARIO', label: 'D. EN ESTABLECIMIENTO PENITENCIARIO' },
  ];

  readonly tiposProcedimiento = [
    { value: 1, label: 'LEY 906 DE 2004' },
    { value: 2, label: 'LEY 1908 DE 2018' },
    { value: 3, label: 'LEY 1826 DE 2017' },
    { value: 4, label: 'LEY 1098 DE 2006' },
    { value: 5, label: 'REPRESENTACIÓN DE VÍCTIMAS' }
  ];

  readonly medidasEjecucion = [
    { value: 'CONSTANCIA DE VISITA PENITENCIARIA', label: 'Constancia de visita penitenciaria' },
    { value: 'SOLICITUD DE SALUD DE PPL', label: 'Solicitudes de salud de PPL' },
    { value: 'MECANISMOS DE LIBERTAD', label: 'Mecanismos de libertad' },
    { value: 'REDENCION DE PENAS Y APLICACION DE FAVORABILIDAD', label: 'Redención de penas y aplicación de favorabilidad' },
    { value: 'SOLICITUD DE TRASLADOS DE ESTABLECIMIENTOS PENITENCIARIOS', label: 'Solicitud de traslados de establecimientos penitenciarios' }
  ];

  readonly competenciasAsunto = [
    { value: 'MUNICIPAL', label: 'MUNICIPAL' },
    { value: 'CIRCUITO', label: 'CIRCUITO' },
    { value: 'CIRCUITO_ESPECIALIZADO', label: 'CIRCUITO ESPECIALIZADO' },
  ]

  procesosext: ProcesoExpandible[] = [];
  usuarioGrupos: UsuarioGrupo[] = [];
  procesosFiltrados: ProcesoExpandible[] = [];
  usuarioGruposFiltrados: UsuarioGrupo[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = false;
  error: string | null = null;
  esAdministrador: boolean = false;

  mostrarTodasPersonas: boolean = false;

  asuntoPenalRequest: AsuntoPenal = null as any;
  /* imputados: Persona[] = []; */
  victimas: Persona[] = [];


  delitos: Delito[] = [];
  bienesJuridicos: BienJuridico[] = [];
  tiposJuzgado = [
    { value: 'GARANTIAS', label: 'GARANTIAS' },
    { value: 'CONOCIMIENTO', label: 'CONOCIMIENTO' },
    { value: 'EJECUCION', label: 'EJECUCION DE PENAS'  }
  ];
  filtroDelito = '';
  filtroBienJuridico = '';


  procesos: ProcesoItem[] = [];
  modalAction: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | 'EDITAR_ASUNTO' | null = null;
  modalTitle = '';
  selectedFile: File | null = null;
  selectedFileName = '';
  selectedFileRecursoExtra = '';
  selectedFileEjecucionPena = '';

  currentStep = 1;

  detalleAsunto: AsuntoPenalDetalleDTO | null = null;

  procesoSeleccionado!: number;
  expedienteAeliminar!: ExpedienteDTO;
  procesoAeliminar!: ProcesoExpandible;

  procesosPorProcedimiento!: AsuntosPenalesPorProcedimientoDTO[];
  procesosDetallesProcedimiento!: AsuntoPenalDetalleBasicoDTO[];

  archivoActuacionSeleccionado!: File;
  procesosExpedientes: ProcesoDTO[] = [];
  actuacionesProceso: TerminoDTO[] = [];

  /* nueva implementacion buscador */
    expedienteSeleccionadoId?: number; // Almacenará el ID seleccionado
    expedientes$!: Observable<ProcesoDTO[]>; 
    expedientesInput$ = new Subject<string>();

  constructor(
    private alertService: AlertService,
    private asuntoService: AsuntoPenalService,
    private procesoService: ProcesoService) {
    this.buscadorForm = this.fb.group({
      jurisdiccion: ['', Validators.required],
      asunto: [{ value: '', disabled: true }, Validators.required]
    });

    this.RegistrarAsuntoPenalForm = this.fb.group({
      tipoProcedimiento: ['', Validators.required],
      huboVictimas: [true, Validators.required],
      etapaProceso: ['', Validators.required],
      competenciaAsunto: ['', Validators.required],
      tipoJuzgado: ['', Validators.required],
      tipoAsuntoNuevo: ['', Validators.required],
      nunc: ['', Validators.required],
      imputados: this.fb.array([]),
      delitosIds: this.fb.control<number[]>([1]),
      bienesJuridicosIds: this.fb.control<number[]>([], Validators.required),

      fiscal: this.fb.group({
        nombreFiscal: ['', Validators.required],
        unidad: ['', Validators.required],
        correo: ['', [Validators.required, Validators.email]],
        telefono: ['', Validators.required]
      }),

    });
    this.RegistrarActuacionForm = this.fb.group({
      tipoProcedimiento: ['', Validators.required],
      procesoId: ['', Validators.required],
      tipoActuacion: ['', Validators.required],
      fechaActuacion: [Date.now(), Validators.required],
      descripcion: [''],
      archivoActuacionSeleccionado: ['', Validators.required]
    });

    this.recursoExtraordinarioForm = this.fb.group({
      procesoIdRec: ['', Validators.required],
      fileRecursoExtra: ['', Validators.required]
    });

    this.ejecucionPenaForm = this.fb.group({
      procesoIdEjec: ['', Validators.required],
      tipoDocumentoEjecucionPena: ['', Validators.required],
      fileEjecucionPena: ['', Validators.required]
    });
  }

  ngOnDestroy(): void {
    // Las suscripciones se gestionan con takeUntilDestroyed para evitar fugas de memoria.
  }

  /* ngOnInit(): void {
    this.esAdministrador =
      this.permissionService.canViewAllSystemProcesses();

    const estado = this.procesoState.snapshot;

    this.jurisdiccionSeleccionada = estado.jurisdiccion;
    this.asuntoSeleccionado = estado.tipoAsunto;

    this.buscadorForm.patchValue({
      jurisdiccion: estado.jurisdiccion,
      asunto: estado.tipoAsunto
    });

    if (estado.procesos.length > 0) {
      this.procesosext = estado.procesos;
      this.cargando = false;
      this.aplicarFiltrosProcesos();
    } else {
      this.cargarProcesos();
    }

    this.buscadorForm.get('jurisdiccion')?.valueChanges.subscribe(valor => {
      this.jurisdiccionSeleccionada = valor ?? '';
    });

    this.buscadorForm.get('asunto')?.valueChanges.subscribe(valor => {
      this.asuntoSeleccionado = valor ?? '';
    });

    this.RegistrarActuacionForm.get('tipoProcedimiento')
      ?.valueChanges.subscribe(valor => {
        this.seleccionarProcesosProcedimiento(Number(valor));
      });

    this.cargarBienesJuridicos();
    this.cargarDelitos();
    this.cargarPocesosProcedimiento();
    this.cargarTerminosActuacion(13);
    this.inicializarBuscadorAsincrono();
  } */

  ngOnInit(): void {

    this.esAdministrador =
      this.permissionService.canViewAllSystemProcesses();

      this.configurarDependencias();
      
    const estado = this.procesoState.snapshot;

    // Restaurar filtros
    this.jurisdiccionSeleccionada = estado.jurisdiccion;
    this.asuntoSeleccionado = estado.tipoAsunto;

    this.buscadorForm.patchValue({
      jurisdiccion: estado.jurisdiccion,
      asunto: estado.tipoAsunto
    });

    // Si existen procesos en memoria, recuperarlos
    if (estado.procesos.length > 0) {

      this.procesosext = estado.procesos;

      this.cargando = false;

      this.aplicarFiltrosProcesos();

    } else {

      // Si no existen, consultar el backend
      this.cargarProcesos();

    }

    this.buscadorForm.get('jurisdiccion')?.valueChanges.subscribe(valor => {
      this.jurisdiccionSeleccionada = valor ?? '';
    });

    this.buscadorForm.get('asunto')?.valueChanges.subscribe(valor => {
      this.asuntoSeleccionado = valor ?? '';
    });

    this.RegistrarActuacionForm.get('tipoProcedimiento')
      ?.valueChanges.subscribe(valor => {
        this.seleccionarProcesosProcedimiento(Number(valor));
      });

    this.cargarBienesJuridicos();
    this.cargarDelitos();
    this.cargarPocesosProcedimiento();
    this.cargarTerminosActuacion(13);
    this.inicializarBuscadorAsincrono();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const cambioJurisdiccion = changes['jurisdiccion'];
    const cambioTipoAsunto = changes['tipoAsunto'];

    if (!cambioJurisdiccion && !cambioTipoAsunto) {
      return;
    }

    // Restaurar los filtros recibidos
    this.restaurarFiltros();

    // Si los procesos ya fueron cargados, aplicar los nuevos filtros
    if (this.procesosext.length > 0) {
      this.aplicarFiltrosProcesos();
    }

  }

  private restaurarFiltros(): void {
    this.jurisdiccionSeleccionada = this.jurisdiccion ?? '';
    this.asuntoSeleccionado = this.tipoAsunto ?? '';
    this.buscadorForm.patchValue({
      jurisdiccion: this.jurisdiccionSeleccionada,
      asunto: this.asuntoSeleccionado
    }, {
      emitEvent: false
    });
    const asuntoControl = this.buscadorForm.get('asunto');
    if (this.jurisdiccionSeleccionada) {
      asuntoControl?.enable({ emitEvent: false });
    } else {
      asuntoControl?.disable({ emitEvent: false });
    }
  }

  aplicarFiltrosProcesos(): void {
    if (this.esAdministrador) {
      this.agruparProcesosPorUsuario();
    } else {
      this.actualizarFiltro();
    }
  }

  // Método que devuelve la fecha de hace exactamente un mes en formato 'YYYY-MM-DD'
  getFechaMinimaUnMesAtras(): string {
    const fecha = new Date();

    // Restamos un mes a la fecha actual
    fecha.setMonth(fecha.getMonth() - 1);

    // Convertimos a formato YYYY-MM-DD requerido por el input date
    return fecha.toISOString().split('T')[0];
  }

  seleccionarProcesosProcedimiento(idTipoProcedimiento: number) {

    if (idTipoProcedimiento) {
      // 1. Buscamos en el array general el objeto que coincida con el id seleccionado
      const encontrado = this.procesosPorProcedimiento.find(
        item => item.tipoProcedimiento === idTipoProcedimiento
      );

      // 2. Si lo encontramos, asignamos sus procesos; si no, dejamos la lista vacía
      this.procesosDetallesProcedimiento = encontrado ? encontrado.procesos : [];

    } else {
      // Si se deselecciona, limpiamos la lista
      this.procesosDetallesProcedimiento = [];
    }
  }

  get tipoProcedimientoSeleccionado(): string {
    return this.RegistrarActuacionForm.get('tipoProcedimiento')?.value;
  }

  get tipoActuacionSeleccionada(): number {
    const valor = this.RegistrarActuacionForm.get('tipoActuacion')?.value;
    return valor ? Number(valor) : 0;
  }

  getTextoLabelActuacion(): string {
    const tipo = this.tipoActuacionSeleccionada;

    switch (tipo) {
      case 5:
        return 'Fecha de Presentación del Escrito de Acusación :';
      case 2:
        return 'Fecha de Imputación :';
      case 9:
        return 'Fecha de Inicio de Juicio Oral :';
      default:
        return 'Fecha de Actuación :';
    }
  }

  cargarPocesosProcedimiento(): void {
    if(this.esAdministrador) {
      this.asuntoService.listarProcesosProcedimiento().subscribe({
        next: (response: any) => {
          this.procesosPorProcedimiento = response.data;
        },
        error: (err) => {
          console.error('Error al cargar procesos por procedimiento:', err);
        }
      });
    } else {
      this.asuntoService.listarProcesosProcedimientoAbogado().subscribe({
        next: (response: any) => {
          this.procesosPorProcedimiento = response.data;
        },
        error: (err) => {
          console.error('Error al cargar procesos por procedimiento:', err);
        }
      });
    }
  }
  
  /* cargarProcesos(): void {

    this.cargando = true;
    this.error = null;

    const endpoint$ = this.esAdministrador
      ? this.procesoService.listarTodosProcesos()
      : this.procesoService.listarProcesosByAbodado();

    endpoint$
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.cargando = false;
      })
    ).subscribe({
      next: (response) => {
        this.procesosext = (response.data || []).map(p => ({
          ...p,
          expanded: false,
          expedientes: [],
          cargandoExpedientes: false,
          expedientesCargados: false,
          mostrarTodasPersonas: false
        }));

        this.aplicarFiltrosProcesos();
      },
      error: (err) => {
        this.error = 'Error al cargar procesos. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });

  } */

  cargarProcesos(): void {
    this.cargando = true;
    this.procesoState.establecerCarga(true);
    this.error = null;

    const endpoint$ = this.esAdministrador
      ? this.procesoService.listarTodosProcesos()
      : this.procesoService.listarProcesosByAbodado();

    endpoint$.subscribe({
      next: (response) => {
        this.procesosext = (response.data || []).map(p => ({
          ...p,
          expanded: false,
          expedientes: [],
          cargandoExpedientes: false,
          expedientesCargados: false,
          mostrarTodasPersonas: false
        }));

        // Guardar procesos en memoria
        this.procesoState.guardarProcesos(this.procesosext);

        // Guardar filtros actuales
        this.procesoState.guardarFiltros(
          this.jurisdiccionSeleccionada,
          this.asuntoSeleccionado
        );
        this.aplicarFiltrosProcesos();
        this.cargando = false;
        this.procesoState.establecerCarga(false);
      },

      error: (err) => {
        console.error('Error al cargar procesos:', err);
        this.error = 'Error al cargar procesos. Por favor intente nuevamente.';
        this.cargando = false;
        this.procesoState.establecerCarga(false);
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

    const procesosFiltrados = this.procesosext.filter(p =>
      p.nombre?.toLowerCase().includes(this.asuntoSeleccionado.toLowerCase())
    )

    procesosFiltrados.forEach(proceso => {
      this.cargarExpedientesDelProceso(proceso)
    });

    // Agrupar procesos por usuario
    procesosFiltrados.forEach(proceso => {
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

    if (!this.esAdministrador) {
      // Filtro para vista sin agrupación por usuario
      if (!filtro) {
        this.procesosFiltrados = this.procesosext.filter(p =>
          p.nombre?.toLowerCase().includes(this.asuntoSeleccionado.toLowerCase())
        );

        this.procesosFiltrados.forEach(proceso => {
          this.cargarExpedientesDelProceso(proceso)
        });
      } else {
        this.procesosFiltrados = this.procesosext.filter(p =>
          p.nombre?.toLowerCase().includes(this.asuntoSeleccionado.toLowerCase()) ||
          p.numeroProceso?.toLowerCase().includes(filtro) ||
          p.clienteNombre?.toLowerCase().includes(filtro)
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
    if (proceso.expanded) {
    this.cargarExpedientesDelProceso(proceso);
  }
  }

  /* cargarExpedientesDelProceso(proceso: ProcesoExpandible, forzarRecarga = false): void {
    if (!proceso.id) return;

    if (proceso.cargandoExpedientes) {
      return;
    }

    if (proceso.expedientesCargados && !forzarRecarga) {
      return;
    }

    proceso.cargandoExpedientes = true;

    this.expedienteService.getExpedientesByProceso(proceso.id)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: (response: any) => {
        proceso.expedientes = Array.isArray(response) ? response : (response?.data || []);
        proceso.expedientesCargados = true;
        proceso.cargandoExpedientes = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
        proceso.expedientes = [];
        proceso.cargandoExpedientes = false;
      }
    });
  } */


  cargarExpedientesDelProceso(proceso: ProcesoExpandible): void {

    if (!proceso.id || proceso.cargandoExpedientes ||
        proceso.expedientesCargados) {
      return;
    }

    proceso.cargandoExpedientes = true;

    this.expedienteService
      .getExpedientesByProceso(proceso.id)
      .subscribe({

        next: (response: any) => {

          proceso.expedientes = Array.isArray(response)
            ? response
            : (response?.data || []);

          proceso.cargandoExpedientes = false;
          proceso.expedientesCargados = true;

          this.procesoState.actualizarProceso(proceso);

        },

        error: (err) => {

          console.error('Error al cargar expedientes:', err);

          proceso.expedientes = [];
          proceso.cargandoExpedientes = false;
          proceso.expedientesCargados = false;

          this.procesoState.actualizarProceso(proceso);

        }

      });

  }

  editarProceso(proceso: ProcesoExpandible): void {
    const procesoId = proceso.id;

    if (!procesoId) {
      console.error('El proceso no tiene un ID válido');
      return;
    }

    this.cargarDetalleAsuntoPenal(procesoId);
    this.procesoSeleccionado = procesoId;
  }

  eliminarProceso(): void {
    if (!this.procesoAeliminar) {
      return;
    }
    if (this.procesoAeliminar.id == undefined) {
      return
    }

    this.procesoService.eliminarProceso(this.procesoAeliminar.id).subscribe({
      next: () => {
        this.procesoState.guardarProcesos(
          this.procesosext.filter(p => p.id !== this.procesoAeliminar.id)
        );
        this.triggerAlert(
          'Proceso eliminado exitosamente',
          'success'
        );
        this.cargarProcesos();
      },
      error: (err: any) => {
        console.error('Error al eliminar proceso:', err);
        this.triggerAlert(
          'Error al eliminar el proceso. Por favor intente nuevamente.',
          'warning'
        );
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
    });
  }

  eliminarExpediente(): void {
    if (!this.expedienteAeliminar.id) return;
    this.expedienteService.eliminarExpediente(this.expedienteAeliminar.id).subscribe({
      next: () => {
        this.triggerAlert(
          'Proceso eliminado exitosamente',
          'success'
        );
        // Recargar expedientes del proceso
        if (this.procesoAeliminar.id) {
          this.cargarExpedientesDelProceso(this.procesoAeliminar);
        }
      },
      error: (err: any) => {
        console.error('Error al eliminar expediente:', err);
        this.triggerAlert(
          'Error al eliminar el proceso. Por favor intente nuevamente.',
          'warning'
        );
      }
    });
  }

  /* toFolder(proceso: ProcesoExpandible): void {
    const expediente = proceso.expedientes?.[0];

    if (!expediente?.id) {
      return;
    }
    const filtros = {
      jurisdiccion: this.buscadorForm.get('jurisdiccion')?.value,
      tipoAsunto: this.buscadorForm.get('asunto')?.value
    };

    this.router.navigate(
      ['/admin/expedientes', expediente.id, 'archivos'],
      {
        state: {
          rootNodeId: expediente.rootNodeId
        },
        queryParams: filtros
      }
    );
  } */

  toFolder(process: ProcesoExpandible): void {

    const exp = process.expedientes?.[0];

    if (!exp?.id) return;

    // Guardar filtros antes de navegar
    this.procesoState.guardarFiltros(
      this.jurisdiccionSeleccionada,
      this.asuntoSeleccionado
    );

    // Guardar los procesos actuales
    this.procesoState.guardarProcesos(this.procesosext);

    this.router.navigate(
      ['/admin/expedientes', exp.id, 'archivos'],
      {
        state: {
          rootNodeId: exp.rootNodeId
        },
        queryParams: {
          jurisdiccion: this.jurisdiccionSeleccionada,
          tipoAsunto: this.asuntoSeleccionado
        }
      }
    );
  }


  mostrarErroresFormulario(form: FormGroup, ruta = ''): void {
    Object.keys(form.controls).forEach(nombre => {
      const control = form.get(nombre);
      const campo = ruta ? `${ruta}.${nombre}` : nombre;

      if (control instanceof FormGroup) {
        this.mostrarErroresFormulario(control, campo);
      } else if (control?.invalid) {
      }
    });
  }


  /* private configurarDependencias(): void {

    const jurisdiccionControl = this.buscadorForm.get('jurisdiccion');
    const asuntoControl = this.buscadorForm.get('asunto');

    jurisdiccionControl?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => {

        this.jurisdiccionSeleccionada = valor ?? '';

        if (valor) {
          asuntoControl?.enable({ emitEvent: false });
        } else {
          asuntoControl?.reset('', { emitEvent: false });
          asuntoControl?.disable({ emitEvent: false });
        }

        // Cada cambio de jurisdicción invalida el asunto anterior
        this.asuntoSeleccionado = '';
        this.actualizarFiltro();

      });

    asuntoControl?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => {

        this.asuntoSeleccionado = valor ?? '';

        this.actualizarFiltro();

      });
  } */
  private configurarDependencias(): void {
    const jurisdiccionControl = this.buscadorForm.get('jurisdiccion');
    const asuntoControl = this.buscadorForm.get('asunto');

    jurisdiccionControl?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => {

        this.jurisdiccionSeleccionada = valor ?? '';

        // Limpiar el asunto cuando cambia la jurisdicción
        asuntoControl?.reset('', { emitEvent: false });
        this.asuntoSeleccionado = '';

        if (valor) {
          asuntoControl?.enable({ emitEvent: false });
        } else {
          asuntoControl?.disable({ emitEvent: false });
        }
        this.aplicarFiltrosProcesos();
      });

    asuntoControl?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => {
        this.asuntoSeleccionado = valor ?? '';
        this.aplicarFiltrosProcesos();
      });
  }

  get jurisdiccionControl() {
    return this.buscadorForm.get('jurisdiccion');
  }

  get asuntoControl() {
    return this.buscadorForm.get('asunto');
  }

  get tipoAsuntoNuevoControl() {
    return this.RegistrarAsuntoPenalForm.get('tipoAsuntoNuevo');
  }

  get hasSelection(): boolean {
    return Boolean(this.jurisdiccionControl?.value && this.asuntoControl?.value);
  }

  get showInfoMessage(): boolean {
    return !this.hasSelection;
  }

  get showEmptyState(): boolean {
    return (
      !this.cargando &&
      this.hasSelection &&
      !this.showProcesosList
    );
  }

  get showProcesosList(): boolean {
    if (!this.hasSelection) {
      return false;
    }

    if (this.esAdministrador) {
      return this.usuarioGruposFiltrados.length > 0;
    }

    return this.procesosFiltrados.length > 0;
  }

  /* get asuntosDisponibles(): string[] {
    const seleccion = this.jurisdicciones.find(item => item.value === this.jurisdiccionControl?.value);
    return seleccion?.asuntos ?? [];
  } */

  get asuntosDisponibles(): string[] {
    const jurisdiccion = this.buscadorForm.get('jurisdiccion')?.value;
    const seleccion = this.jurisdicciones.find(
      item => item.value === jurisdiccion
    );
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

  get showtipoAsunto(): boolean {
    return [
      'ETAPA_CONOCIMIENTO',
      'RECURSO_EXTRAORDINARIO',
      'PENITENCIARIO'
    ].includes(this.tipoAsuntoNuevoControl?.value);
  }

  seleccionarExpedienteAeliminar(proceso: ProcesoExpandible, expediente: ExpedienteDTO) {
    this.expedienteAeliminar = expediente;
    this.procesoAeliminar = proceso;
  }

  seleccionarProcesoAeliminar(proceso: any) {
    this.procesoAeliminar = proceso;
  }

  openActionModal(
    action: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | 'EDITAR_ASUNTO'
  ): void {

    this.modalAction = action;

    if (action === 'ASUNTO_NUEVO') {
      this.modalTitle = 'Asunto Nuevo';
      this.resetFormRegistrarAsunto();
      this.resetFormEjecucionPena();
      this.resetFormRecursoExtraordinario();
      this.currentStep = 1;
    } else if (action === 'MODIFICAR_ACTUACION') {
      this.modalTitle = 'Modificar o Adicionar Actuación';
      this.resetFormRegistrarActuacion();
    } else if (action === 'EDITAR_ASUNTO') {
      this.modalTitle = 'Editar Asunto';
    } else {
      this.modalTitle = 'Estadística de Área';
    }

    this.modalService.open(this.actionModal, {
      size: 'lg',
      centered: true
    });
  }

  cerrarModal(): void {
    this.modalService.dismissAll();
  }

  siguientePaso(): void {

    if (this.currentStep === 1) {

      const controlesPaso1 = [
        'nunc',
        'tipoProcedimiento'
      ];

      let valido = true;

      controlesPaso1.forEach(nombre => {
        const control = this.RegistrarAsuntoPenalForm.get(nombre);

        if (control?.invalid) {
          control.markAsTouched();
          valido = false;
        }
      });

      if (valido) {
        this.currentStep = 2;
        if (this.imputados.length === 0) {
          this.agregarImputado();
        }
      }

      return;
    }


    if (this.currentStep === 2) {

      if (this.imputados.length === 0) {
        this.triggerAlert(
          'Debe agregar al menos un imputado',
          'warning'
        );
        return;
      }

      if (this.imputados.invalid) {
        this.imputados.markAllAsTouched();

        this.triggerAlert(
          'Complete los datos obligatorios de los imputados',
          'warning'
        );

        return;
      }

      this.currentStep = 3;

      return;
    }

    if (this.currentStep === 3) {

      const campos = [
        'delitosIds',
        'bienesJuridicosIds'
      ];

      if (!(this.delitosSeleccionados.length > 0) || !(this.bienesJuridicosSeleccionados.length > 0)) {
        this.triggerAlert(
          'Debe agregar al menos un delito y un bien juridico',
          'warning'
        );
        return;
      }

      this.currentStep = 4;
      return;
    }

    if (this.currentStep === 4) {

      const fiscal = this.RegistrarAsuntoPenalForm.get('fiscal');
      this.mostrarErroresFormulario(this.RegistrarAsuntoPenalForm);

      if (!fiscal || fiscal.invalid) {

        fiscal?.markAllAsTouched();

        this.triggerAlert(
          'Complete los datos de la Fiscalía',
          'warning'
        );
      }
      this.currentStep = 5;
      return;
    }

    if (this.currentStep === 5) {

      const campos = [
        'etapaProceso',
        'competenciaAsunto',
        'tipoJuzgado',
      ];

      let valido = true;

      campos.forEach(nombre => {
        const control = this.RegistrarAsuntoPenalForm.get(nombre);

        if (control?.invalid) {
          control.markAsTouched();
          valido = false;
        }
      });

      if (valido) {
        this.currentStep = 5;
      }
    }

  }

  pasoAnterior(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  pasoAnteriorAsuntoNuevo(): void {
    if (this.currentStep === 1) {
      this.tipoAsuntoNuevoControl?.setValue('');
      this.currentStep = 1;
      return;
    }

    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileName = input.files?.[0]?.name ?? '';
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileSelectedRecursoExtra(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileRecursoExtra = input.files?.[0]?.name ?? '';
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileSelectedEjecucionPena(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileEjecucionPena = input.files?.[0]?.name ?? '';
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileActuacionSelected(event: any): void {
    this.archivoActuacionSeleccionado = event.target.files[0];
  }

  guardarAsuntoNuevo(): void {

    if (this.showEtapaConocimiento) {
      this.mostrarErroresFormulario(this.RegistrarAsuntoPenalForm);
      if (this.RegistrarAsuntoPenalForm.invalid) {
        this.RegistrarAsuntoPenalForm.markAllAsTouched();
        this.triggerAlert(
          'Complete los campos obligatorios',
          'warning'
        );

        return;
      }

      if (this.imputados.length === 0) {
        this.triggerAlert(
          'Debe agregar al menos un imputado',
          'warning'
        );

        return;
      }

      if (this.imputados.invalid) {
        this.imputados.markAllAsTouched();

        this.triggerAlert(
          'Complete los datos obligatorios de los imputados',
          'warning'
        );

        return;
      }

      const request: AsuntoPenal =
        this.construirRequest();

      this.asuntoService.crearAsuntoPenal(request).subscribe({
        next: (response) => {
          this.modalService.dismissAll();

          this.RegistrarAsuntoPenalForm.reset();

          this.imputados.clear();

          this.currentStep = 1;
          this.cargarProcesos();
          this.cargarPocesosProcedimiento();

          this.triggerAlert(
            'Registro exitoso.',
            'success'
          );
        },

        error: (error) => {
          console.error(
            'Error creando asunto penal:',
            error
          );

          this.triggerAlert(
            'No fue posible crear el asunto penal',
            'warning'
          );
        }

      });
    } else if (this.showRecursoExtraordinario) {
      if (!this.selectedFileName) {
        return;
      }
    } else if (this.showPenitenciario) {
      if (this.RegistrarAsuntoPenalForm.get('medidaEjecucion')?.invalid || !this.selectedFileName) {
        this.RegistrarAsuntoPenalForm.get('medidaEjecucion')?.markAsTouched();


        return;
      }
      else {
        console.log("registrando medida de ejecucion")
      }
    }
  }

  registrarActuacion(): void {
    this.mostrarErroresFormulario(this.RegistrarActuacionForm);
    if (this.RegistrarActuacionForm.invalid) {
      this.RegistrarActuacionForm.markAllAsTouched();
      
      this.triggerAlert(
        'Complete los campos obligatorios',
        'warning'
      );

      return;
    }

    const request: CrearActuacionRequest =
      this.construirRequestActuacion();


    const procesoId: number = Number(this.RegistrarActuacionForm.get('procesoId')?.value);

    this.asuntoService.crearAsuntoPenalActuacion(procesoId, request, this.archivoActuacionSeleccionado).subscribe({
      next: (response) => {
        this.modalService.dismissAll();

        this.RegistrarActuacionForm.reset();
        this.triggerAlert(
          'Actuación Registrada.',
          'success'
        );
      },

      error: (error) => {
        console.error(
          'Error subiendo actuación : ',
          error
        );

        this.triggerAlert(
          'No fue posible crear la actuación para el asunto penal',
          'warning'
        );
      }

    });
  }

  actualizarAsunto(): void {

    this.mostrarErroresFormulario(this.RegistrarAsuntoPenalForm);
    if (this.RegistrarAsuntoPenalForm.invalid) {
      this.RegistrarAsuntoPenalForm.markAllAsTouched();
      this.triggerAlert(
        'Complete los campos obligatorios',
        'warning'
      );

      return;
    }

    if (this.imputados.length === 0) {
      this.triggerAlert(
        'Debe agregar al menos un imputado',
        'warning'
      );

      return;
    }

    if (this.imputados.invalid) {
      this.imputados.markAllAsTouched();

      this.triggerAlert(
        'Complete los datos obligatorios de los imputados',
        'warning'
      );

      return;
    }

    const request: AsuntoPenal =
      this.construirRequest();

    this.asuntoService.actualizarAsuntoPenal(this.procesoSeleccionado, request).subscribe({
      next: (response) => {
        this.modalService.dismissAll();

        this.RegistrarAsuntoPenalForm.reset();

        this.imputados.clear();

        this.currentStep = 1;
        this.cargarProcesos();
        this.cargarPocesosProcedimiento();
        this.triggerAlert(
          'Actualización exitosa.',
          'success'
        );
      },

      error: (error) => {
        console.error(
          'Error creando asunto penal:',
          error
        );

        this.triggerAlert(
          'No fue posible crear el asunto penal',
          'warning'
        );

      }
    });
  }


  private resetFormRegistrarAsunto(): void {
    this.RegistrarAsuntoPenalForm.get('tipoAsuntoNuevo')?.enable();
    this.RegistrarAsuntoPenalForm.reset({
      tipoAsuntoNuevo: '',
      tipoProcedimiento: '',
      etapaProceso: '',
      competenciaAsunto: '',
      tipoJuzgado: '',
      nunc: '',
      numeroProceso: '',
      nombreProceso: '',
      identificacionCliente: '',
      fechaAudiencia: '',
      fechaPresentacionPruebas: '',
      archivo: null,
      delitosIds: [],
      bienesJuridicosIds: [2],
      huboVictimas: false
    });
    this.selectedFileName = '';
    this.filtroDelito = '';
    this.filtroBienJuridico = '';
    this.currentStep = 1;
  }

  private resetFormRecursoExtraordinario(): void {
    this.recursoExtraordinarioForm.reset({
      procesoIdRec: '',
      fileRecursoExtra: ''
    });
    this.selectedFileRecursoExtra = '';
    this.selectedFile = null;
  }

  private resetFormEjecucionPena(): void {
    this.ejecucionPenaForm.reset({
      procesoIdEjec: '',
      tipoDocumentoEjecucionPena: '',
      fileEjecucionPena: ''
    });
    this.selectedFileEjecucionPena = '';
    this.selectedFile = null;
  }

  private resetFormRegistrarActuacion(): void {
    this.RegistrarActuacionForm.reset({

      tipoProcedimiento: '',
      procesoId: '',
      tipoActuacion: '',
      contexto: '',
      observaciones: ''
    });
    this.selectedFileName = '';
    this.filtroDelito = '';
    this.filtroBienJuridico = '';
    this.currentStep = 1;
  }
  get AsuntoSeleccion(): string {
    return this.buscadorForm.get('asunto')?.value;
  }


  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }


  cargarDelitos() {
    this.delitoService.getDelitos().subscribe({
      next: (response) => {
        this.delitos = response.data;
      },
      error: (err) => {
        console.error('Error al cargar delitos:', err);
      }
    });
  }

  cargarBienesJuridicos() {
    this.bienService.getBienesJuridicos().subscribe({
      next: (response) => {
        this.bienesJuridicos = response.data;
      },
      error: (err) => {
        console.error('Error al cargar bienes jurídicos:', err);
      }
    });
  }

  get delitosFiltrados(): Delito[] {
    const filtro = this.filtroDelito.trim().toLowerCase();
    return this.delitos.filter(delito => delito.nombre.toLowerCase().includes(filtro));
  }

  get bienesJuridicosFiltrados(): BienJuridico[] {
    const filtro = this.filtroBienJuridico.trim().toLowerCase();
    return this.bienesJuridicos.filter(bien => bien.nombre.toLowerCase().includes(filtro));
  }

  get delitosSeleccionados(): Delito[] {
    const ids = this.RegistrarAsuntoPenalForm.get('delitosIds')?.value ?? [];
    return this.delitos.filter(delito => delito.id !== undefined && ids.includes(delito.id));
  }

  get bienesJuridicosSeleccionados(): BienJuridico[] {
    const ids = this.RegistrarAsuntoPenalForm.get('bienesJuridicosIds')?.value ?? [];
    return this.bienesJuridicos.filter(bien => bien.id !== undefined && ids.includes(bien.id));
  }

  estaDelitoSeleccionado(id: number | undefined): boolean {
    return id !== undefined && (this.RegistrarAsuntoPenalForm.get('delitosIds')?.value ?? []).includes(id);
  }

  estaBienJuridicoSeleccionado(id: number | undefined): boolean {
    return id !== undefined && (this.RegistrarAsuntoPenalForm.get('bienesJuridicosIds')?.value ?? []).includes(id);
  }

  toggleDelito(id: number | undefined): void {
    if (id === undefined) return;
    this.toggleSeleccion('delitosIds', id);
  }

  toggleBienJuridico(id: number | undefined): void {
    if (id === undefined) return;
    this.toggleSeleccion('bienesJuridicosIds', id);
  }

  private toggleSeleccion(controlName: 'delitosIds' | 'bienesJuridicosIds', id: number): void {
    const control = this.RegistrarAsuntoPenalForm.get(controlName);
    const ids: number[] = control?.value ?? [1, 2];
    const nuevosIds = ids.includes(id)
      ? ids.filter(selectedId => selectedId !== id)
      : [...ids, id];

    control?.setValue(nuevosIds);
    control?.markAsTouched();
  }


  get imputados(): FormArray {
    return this.RegistrarAsuntoPenalForm.get('imputados') as FormArray;
  }

  private crearImputado(): FormGroup {
    return this.fb.group({
      tipoDocumento: ['', Validators.required],
      numeroDocumento: ['', Validators.required],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', Validators.email],
      telefono: [''],
      privadoLibertad: [false, Validators.required],
      tipoDetencion: [''],
      establecimientoOResidencia: ['']
    });
  }

  agregarImputado(): void {
    this.imputados.push(this.crearImputado());
  }

  eliminarImputado(index: number): void {
    this.imputados.removeAt(index);
  }

  get fiscal(): FormGroup {
    return this.RegistrarAsuntoPenalForm.get('fiscal') as FormGroup;
  }

  private construirRequest(): AsuntoPenal {

    const formValue = this.RegistrarAsuntoPenalForm.getRawValue();

    return {
      jurisdiccionId: 1,
      asuntoId: 1,
      etapaId: 1,
      tipoProcedimientoId: formValue.tipoProcedimiento,

      huboVictimas: formValue.huboVictimas,

      etapaProceso: formValue.etapaProceso,
      competenciaAsunto: formValue.competenciaAsunto,
      tipoJuzgado: formValue.tipoJuzgado,

      nunc: formValue.nunc,

      imputados: formValue.imputados,

      delitosIds: formValue.delitosIds,
      bienesJuridicosIds: formValue.bienesJuridicosIds,

      /* imputacion: formValue.imputacion */

      fiscal: formValue.fiscal

    };
  }

  private construirRequestActuacion(): CrearActuacionRequest {
    const formValue = this.RegistrarActuacionForm.getRawValue();
    return {
      tipoActuacionId: formValue.tipoActuacion,
      fechaActuacion: formValue.fechaActuacion,
      descripcion: formValue.descripcion
    };
  }

  cargarDetalleAsuntoPenal(procesoId: number): void {
    this.asuntoService.obtenerAsuntoPenal(procesoId).subscribe({
      next: (respuesta) => {
        const asunto = respuesta.data;

        if (!asunto) {
          console.error('No se encontró el detalle del asunto penal');
          return;
        }

        this.detalleAsunto = asunto;

        // Establecer el paso inicial del formulario
        this.currentStep = 1;

        // Construir el FormArray de imputados
        const imputadosForm = (asunto.participantes ?? [])
          .filter(p => p.rol === 'IMPUTADO')
          .map(imputado =>
            this.fb.group({
              tipoDocumento: [imputado.tipoDocumento ?? ''],
              numeroDocumento: [imputado.numeroDocumento ?? ''],
              nombres: [imputado.nombres ?? ''],
              apellidos: [imputado.apellidos ?? ''],
              email: [imputado.email ?? ''],
              telefono: [imputado.telefono ?? ''],
              tipoDetencion: [imputado.tipoDetencion ?? ''],
              establecimientoOResidencia: [
                imputado.establecimientoOResidencia ?? ''
              ]
            })
          );

        this.RegistrarAsuntoPenalForm.setControl(
          'imputados',
          this.fb.array(imputadosForm)
        );

        // Extraer los IDs de los delitos y bienes jurídicos
        const delitosIds = (asunto.delitos ?? []).map(d => d.id);
        const bienesJuridicosIds = (asunto.bienesJuridicos ?? []).map(
          b => b.id
        );

        /* const tipoProcedimiento = this.obtenerValuePorLabel(
          this.tiposProcedimiento,
          asunto.proceso?.tipoProcedimientoNorma
        ); */
        const tipoProcedimiento = this.tiposProcedimiento.find(
          item => item.label.trim().toLowerCase() === asunto.proceso?.tipoProcedimientoNorma?.toLowerCase()
        )?.value;

        const tipoAsuntoNuevo = this.obtenerValuePorLabel(
          this.opcionesAsuntoNuevo,
          asunto.proceso?.etapaActualNombre
        );

        const etapaProceso = this.obtenerValuePorLabel(
          this.etapasProceso,
          asunto.procesoPenal?.etapaProceso
        );

        const competenciaAsunto = this.obtenerValuePorLabel(
          this.competenciasAsunto,
          asunto.procesoPenal?.competencia
        );

        const tipoJuzgado = this.obtenerValuePorLabel(
          this.tiposJuzgado,
          asunto.procesoPenal?.tipoJuzgado
        );

        // Cargar los campos del formulario
        this.RegistrarAsuntoPenalForm.patchValue({
          tipoAsuntoNuevo: 'ETAPA_CONOCIMIENTO',
          tipoProcedimiento,
          etapaProceso,

          // El NUNC pertenece a procesoPenal
          nunc: asunto.procesoPenal?.nunc ?? '',

          nombreProceso:
            asunto.proceso?.asuntoNombre ?? '',

          competenciaAsunto,

          tipoJuzgado:
            asunto.procesoPenal?.tipoJuzgado ?? '',

          huboVictimas:
            asunto.procesoPenal?.huboVictimas ?? null,

          delitosIds,
          bienesJuridicosIds,

          fiscal: {
            nombreFiscal: asunto.fiscal?.nombreFiscal ?? '',
            unidad: asunto.fiscal?.unidad ?? '',
            correo: asunto.fiscal?.correo ?? '',
            telefono: asunto.fiscal?.telefono ?? ''
          }
        });
        this.RegistrarAsuntoPenalForm.get('tipoAsuntoNuevo')?.disable();
        // Abrir el modal una vez cargados los datos
        this.openActionModal('EDITAR_ASUNTO');
      },

      error: (err) => {
        console.error('Error al obtener el detalle del asunto penal:', err);
      }
    });
  }

  cargarProcesosExpedientes(): void {
    this.procesoService.listarProcesosByAbodado().subscribe({
      next: (data) => {
        this.procesosExpedientes = data.data;
      },
      error: (err) => console.error('Error cargando procesos:', err)
    });
  }


  private obtenerValuePorLabel<T>(
    opciones: { value: T; label: string }[],
    labelApi: string | null | undefined
  ): T | '' {
    if (!labelApi) {
      return '';
    }
    const opcion = opciones.find(
      item => item.value === labelApi
    );
    return opcion ? opcion.value : '';
  }


  cargarTerminosActuacion(idProceso: number) {
    this.procesoService.obtenerTerminos(idProceso).subscribe({
      next: (response) => {
        this.actuacionesProceso = response.data;
      },
      error: (err) => {
        console.error('Error al cargar delitos:', err);
      }
    });
  }

  get actuacionProcesoSeleccionado(): TerminoDTO[] {
    const procesoId = this.RegistrarActuacionForm.get('procesoId')?.value;
    const tipoActiacionId = this.RegistrarActuacionForm.get('tipoActuacion')?.value;

    this.cargarTerminosActuacion(procesoId);
    return this.actuacionesProceso.filter(actuacion => actuacion.tipoActuacionId === tipoActiacionId);
  }

  private inicializarBuscadorAsincrono() {
    if(this.esAdministrador) {
      // 1. Carga inicial por defecto
      const procesosIniciales$ = this.procesoService.listarExpedientesAdministrador().pipe(
        map(response => response.data),
        catchError(() => of([]))
      );

      // 2. Escucha activa de lo que el usuario digita en el buscador
      const procesosFiltrados$ = this.expedientesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.cargando = true),
        switchMap(term => {
          // Si el usuario borra el texto, pasamos "" para que el backend mande los 10 recientes otra vez
          return this.procesoService.listarExpedientesAdministrador(term).pipe(
            map(response => response.data),
            catchError(() => of([])),
            tap(() => this.cargando = false)
          );
        })
      );

      // Conectamos ambos flujos al HTML
      this.expedientes$ = concat(procesosIniciales$, procesosFiltrados$);

    } else {

      const procesosIniciales$ = this.procesoService.listarExpedientesByAbogado().pipe(
        map(response => response.data),
        catchError(() => of([]))
      );

      const procesosFiltrados$ = this.expedientesInput$.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        tap(() => this.cargando = true),
        switchMap(term => {
          return this.procesoService.listarExpedientesByAbogado(term).pipe(
            map(response => response.data),
            catchError(() => of([])),
            tap(() => this.cargando = false)
          );
        })
      );

      // Conectamos ambos flujos al HTML
      this.expedientes$ = concat(procesosIniciales$, procesosFiltrados$);
    }

    
  }
  
  onBuscarExpediente(event: { term: string; items: any[] }) {
    this.expedientesInput$.next(event.term);
  }

  onLimpiarBusqueda() {
    // Limpiar el término de búsqueda
    this.expedientesInput$.next('');

    // Restablecer el expediente seleccionado
    this.expedienteSeleccionadoId = undefined;

    // Quitar el estado de carga
    this.cargando = false;
  }

  customSearchFn(term: string, item: any) {
    term = term.toLowerCase();
    
    // Permite que coincida por número de proceso o por el nombre del abogado
    const coincideCodigo = item.numeroProceso ? item.numeroProceso.toLowerCase().includes(term) : false;
    const coincideAbogado = item.abogadoResponsableNombre ? item.abogadoResponsableNombre.toLowerCase().includes(term) : false;
    
    // Si manejas el nombre del proceso también puedes sumarlo aquí:
    const coincideNombreProceso = item.nombre ? item.nombre.toLowerCase().includes(term) : false;

    return coincideCodigo || coincideAbogado || coincideNombreProceso;
  }

  GuardarEjecucionPena(): void {
    if (this.ejecucionPenaForm.get('procesoIdEjec')?.invalid || this.ejecucionPenaForm.get('tipoDocumentoEjecucionPena')?.invalid || !this.selectedFileEjecucionPena) {
      this.ejecucionPenaForm.markAllAsTouched();

      return;
    }

    if (!this.selectedFile) {
      this.triggerAlert(
        'Debe seleccionar un archivo para subir',
        'warning'
      );
      return;
    }

    const procesoId = this.ejecucionPenaForm.get('procesoIdEjec')?.value;
    const tipoDocumento = this.ejecucionPenaForm.get('tipoDocumentoEjecucionPena')?.value;

    this.asuntoService.subirDocumentoEjecucionPena(procesoId, this.selectedFile, 'EJECUCION DE PENA', tipoDocumento).subscribe({
        next: (response) => {
          this.modalService.dismissAll();
          this.ejecucionPenaForm.reset();
          
          this.triggerAlert(
            'Registro exitoso.',
            'success'
          );

          const proceso = this.procesosext.find(
            p => p.id === procesoId
          );

          if (!proceso) {
            console.error('No se encontró el proceso:', procesoId);
            return;
          }

          const exp = proceso.expedientes?.[0];

          if (!exp?.id) {
            console.error('No se encontró el expediente');
            return;
          }

          const folderParentId = response.data.folderParentId;

          if (!folderParentId) {
            console.error('No se recibió el ID de la carpeta');
            return;
          }

          this.procesoState.guardarFiltros(
            this.jurisdiccionSeleccionada,
            this.asuntoSeleccionado
          );
          
          this.procesoState.guardarProcesos(
            this.procesosext
          );

          this.router.navigate(
            ['/admin/expedientes', exp.id, 'archivos'],
            {
              state: {
                folderNodeId: folderParentId
              },
              queryParams: {
                jurisdiccion: this.jurisdiccionSeleccionada,
                tipoAsunto: this.asuntoSeleccionado,
                folderNodeId: folderParentId
              }
            }
          );
        },
        error: (error) => {
          this.triggerAlert(
            'No fue posible crear el asunto penal',
            'warning'
          );
        }
      });

  }

  GuardarRecursoExtraordinario(): void {
    if (this.recursoExtraordinarioForm.get('procesoIdRec')?.invalid || !this.selectedFileRecursoExtra) {
      this.recursoExtraordinarioForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.triggerAlert(
        'Debe seleccionar un archivo para subir',
        'warning'
      );
      return;
    }

    const procesoId = this.recursoExtraordinarioForm.get('procesoIdRec')?.value;

    this.asuntoService.subirDocumentoRecursoExtra(procesoId, this.selectedFile, 'RECURSO EXTRAORDINARIO').subscribe({
      next: (response) => {
        this.modalService.dismissAll();
        this.recursoExtraordinarioForm.reset();
        this.triggerAlert(
          'Registro exitoso.',
          'success'
        );

        const proceso = this.procesosext.find(
          p => p.id === procesoId
        );

        if (!proceso) {
          console.error('No se encontró el proceso:', procesoId);
          return;
        }

        const exp = proceso.expedientes?.[0];

        if (!exp?.id) {
          console.error('No se encontró el expediente');
          return;
        }

        const folderParentId = response.data.folderParentId;

        if (!folderParentId) {
          console.error('No se recibió el ID de la carpeta');
          return;
        }

        this.procesoState.guardarFiltros(
          this.jurisdiccionSeleccionada,
          this.asuntoSeleccionado
        );
        
        this.procesoState.guardarProcesos(
          this.procesosext
        );

        this.router.navigate(
          ['/admin/expedientes', exp.id, 'archivos'],
          {
            state: {
              folderNodeId: folderParentId
            },
            queryParams: {
              jurisdiccion: this.jurisdiccionSeleccionada,
              tipoAsunto: this.asuntoSeleccionado,
              folderNodeId: folderParentId
            }
          }
        );
      },
      error: (error) => {
        this.triggerAlert(
          'No fue posible crear el asunto penal',
          'warning'
        );
      }
    }); 
      
  }
}
