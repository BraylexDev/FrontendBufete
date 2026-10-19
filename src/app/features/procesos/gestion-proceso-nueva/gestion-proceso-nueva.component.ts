import { Component, OnDestroy, TemplateRef, ViewChild, inject } from '@angular/core';
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
import { AsuntoPenal, AsuntoPenalDetalleBasicoDTO, AsuntoPenalDetalleDTO, AsuntosPenalesPorProcedimientoDTO, BienJuridico, Delito, Persona } from '../../../domain/models/asuntoPenal/asuntoPenal.model';
import { AsuntoPenalService } from '../../../domain/services/asuntoPenal/asunto-penal.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SharedModule } from '../../shared/shared.module';
import { CrearActuacionRequest } from '../../../domain/models/actuacion.model';


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
  imports: [SharedModule, CommonModule, FormsModule, ReactiveFormsModule, NgbModalModule],
  providers: [DatePipe],
  templateUrl: './gestion-proceso-nueva.component.html',
  styleUrl: './gestion-proceso-nueva.component.scss'
})
export class GestionProcesoNuevaComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  private delitoService = inject(DelitoService);
  private bienService = inject(BienJuridicoService);

  private procesoService = inject(ProcesoService);
  private expedienteService = inject(ExpedienteService);
  private permissionService = inject(PermissionService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('actionModal', { static: true }) actionModal?: TemplateRef<any>;

  readonly buscadorForm: FormGroup;
  readonly RegistrarAsuntoPenalForm: FormGroup;
  readonly RegistrarActuacionForm: FormGroup;

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

  readonly etapasProceso = [
    { value: 'IMPUTACION', label: 'IMPUTACION' },
    { value: 'CONOCIMIENTO', label: 'CONOCIMIENTO' },
    { value: 'EJECUCION', label: 'EJECUCION DE LA PENA' }
  ];

  readonly tiposDetencion = [
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
    { value: 'CONSTANCIA_VISITA', label: 'Constancia de visita penitenciaria' },
    { value: 'SOLICITUD_SALUD', label: 'Solicitudes de salud de PPL' },
    { value: 'MECANISMOS_LIBERTAD', label: 'Mecanismos de libertad' },
    { value: 'REDENCION_PENAS', label: 'Redención de penas y aplicación de favorabilidad' },
    { value: 'TRASLADOS', label: 'Solicitud de traslados de establecimientos penitenciarios' }
  ];

  readonly competenciasAsunto = [
    { value: 'MUNICIPAL', label: 'MUNICIPAL'}, 
    { value: 'CIRCUITO', label: 'CIRCUITO'},
    { value: 'CIRCUITO_ESPECIALIZADO', label: 'CIRCUITO ESPECIALIZADO'},
  ]

  asuntoSeleccionado: string = '';

  procesosext: ProcesoExpandible[] = [];
  usuarioGrupos: UsuarioGrupo[] = [];
  procesosFiltrados: ProcesoExpandible[] = [];
  usuarioGruposFiltrados: UsuarioGrupo[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = false;
  error: string | null = null;
  mostrarAbogado: boolean = false;

  asuntoPenalRequest: AsuntoPenal = null as any;
  /* imputados: Persona[] = []; */
  victimas: Persona[] = [];


  delitos: Delito[] = [];
  bienesJuridicos: BienJuridico[] = [];
  tiposJuzgado = [
    {
      value: 'GARANTIAS',
      label: 'GARANTIAS'
    },
    {
      value: 'CONOCIMIENTO',
      label: 'CONOCIMIENTO'
    },
  ];
  filtroDelito = '';
  filtroBienJuridico = '';


  procesos: ProcesoItem[] = [];
  modalAction: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | 'EDITAR_ASUNTO' | null = null;
  modalTitle = '';
  selectedFileName = '';
  currentStep = 1;

  detalleAsunto: AsuntoPenalDetalleDTO | null = null;

  procesoSeleccionado!: number;
  expedienteAeliminar!: ExpedienteDTO;
  procesoAeliminar!: ProcesoExpandible;

  procesosPorProcedimiento!: AsuntosPenalesPorProcedimientoDTO[];
  procesosDetallesProcedimiento!: AsuntoPenalDetalleBasicoDTO[];

  archivoActuacionSeleccionado!: File;

  constructor(private alertService: AlertService, private asuntoService: AsuntoPenalService) {
    this.buscadorForm = this.fb.group({
      jurisdiccion: ['', Validators.required],
      asunto: [{ value: '', disabled: true }, Validators.required]
    });

    this.RegistrarAsuntoPenalForm = this.fb.group({
      // =========================
      // Datos del asunto
      // =========================
      tipoProcedimiento: ['', Validators.required],
      huboVictimas: [true, Validators.required],
      etapaProceso: ['', Validators.required],
      competenciaAsunto: ['', Validators.required],
      tipoJuzgado: ['', Validators.required],
      tipoAsuntoNuevo: ['', Validators.required],

      nunc: ['', Validators.required],

      // =========================
      // Imputados
      // =========================
      imputados: this.fb.array([]),

      // =========================
      // Delitos y bienes jurídicos
      // =========================
      delitosIds: this.fb.control<number[]>([1]),
      bienesJuridicosIds: this.fb.control<number[]>([], Validators.required),

      // =========================
      // Imputación
      // =========================
      /* imputacion: [''], */

      // =========================
      // Fiscalia
      // =========================
      fiscal: this.fb.group({

        nombreFiscal: [
          '',
          Validators.required
        ],

        unidad: [
          '',
          Validators.required
        ],

        correo: [
          '',
          [
            Validators.required,
            Validators.email
          ]
        ],

        telefono: [
          '',
          Validators.required
        ]

      }),

      medidaEjecucion: ['']

    });
    this.RegistrarActuacionForm = this.fb.group({
      tipoProcedimiento: ['', Validators.required],
      procesoId: ['', Validators.required],
      tipoActuacion: ['', Validators.required],
      fechaActuacion: [Date.now(), Validators.required],
      descripcion: [''],
      archivoActuacionSeleccionado: ['', Validators.required]
    });

    this.configurarDependencias();
  }

  ngOnDestroy(): void {
    // Las suscripciones se gestionan con takeUntilDestroyed para evitar fugas de memoria.
  }

  ngOnInit(): void {

    this.buscadorForm.get('asunto')?.valueChanges.subscribe(valor => {
      this.asuntoSeleccionado = valor ?? '';
    });

    this.RegistrarActuacionForm.get('tipoProcedimiento')?.valueChanges.subscribe(valorSeleccionado => {
      const idNumerico = Number(valorSeleccionado);
      this.seleccionarProcesosProcedimiento(idNumerico);
    });

    // Verificar si el usuario tiene permisos para ver todos los procesos
    this.mostrarAbogado = this.permissionService.canViewAllSystemProcesses();
    this.cargarProcesos();
    this.cargarBienesJuridicos();
    this.cargarDelitos();
    this.cargarPocesosProcedimiento();

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
    this.asuntoService.listarProcesosProcedimiento().subscribe({
      next: (response: any) => {
        this.procesosPorProcedimiento = response.data;
      },
      error: (err) => {
        console.error('Error al cargar procesos por procedimiento:', err);
      }
    });
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

    if (!this.mostrarAbogado) {
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

  toFolder(process: ProcesoExpandible): void {
    const exp: ExpedienteDTO | undefined = process.expedientes?.[0];
    if (!exp || !exp.id) return;

    this.router.navigate(['/admin/expedientes', exp.id, 'archivos'], {
      state: { rootNodeId: exp.rootNodeId }
    });
  }

  /* toFolder(exp: ExpedienteDTO | undefined): void {
    if (!exp || !exp.id) return;

    this.router.navigate(['/admin/expedientes', exp.id, 'archivos'], {
      state: { rootNodeId: exp.rootNodeId }
    });
  } */


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


  private configurarDependencias(): void {

    this.buscadorForm.get('jurisdiccion')?.valueChanges.subscribe(value => {
      const asuntoControl = this.buscadorForm.get('asunto');

      if (value) {
        asuntoControl?.enable();
      } else {
        asuntoControl?.disable();
        asuntoControl?.reset();
      }
    });

    this.buscadorForm.get('jurisdiccion')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.buscadorForm.patchValue({ asunto: '' }, { emitEvent: false });
        /* this.procesos = this.cargarProcesosMock(); */
      });

    this.buscadorForm.get('asunto')?.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(value => {
        /* this.procesos = this.cargarProcesosMock(); */
        this.cargarProcesos();
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

    return (this.hasSelection && !this.showProcesosList);
  }

  get showProcesosList(): boolean {
    if (!this.hasSelection) {
      return false;
    }

    if (this.mostrarAbogado) {
      return this.usuarioGruposFiltrados.length > 0;
    }

    return this.procesosFiltrados.length > 0;
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

  get showtipoAsunto(): boolean {
    if (this.tipoAsuntoNuevoControl?.value === 'ETAPA_CONOCIMIENTO' || this.tipoAsuntoNuevoControl?.value === 'RECURSO_EXTRAORDINARIO' || this.tipoAsuntoNuevoControl?.value === 'PENITENCIARIO') {
      return true;
    }
    return false;
  }

  seleccionarExpedienteAeliminar(proceso: ProcesoExpandible, expediente: ExpedienteDTO) {
    this.expedienteAeliminar = expediente;
    this.procesoAeliminar = proceso;
  }

  seleccionarProcesoAeliminar(proceso: any) {
    this.procesoAeliminar = proceso;
  }

  /* openActionModal(action: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | 'EDITAR_ASUNTO'): void {
    this.modalAction = action;

    if (action === 'ASUNTO_NUEVO') {
      this.modalTitle = 'Asunto nuevo';
      this.resetSubForm();
      this.currentStep = 1;
    } else if (action === 'MODIFICAR_ACTUACION') {
      this.modalTitle = 'Modificar o adicionar actuación';
    } else if (action === 'EDITAR_ASUNTO') {
      this.modalTitle = 'Editar asunto';
      this.currentStep = 1;
    } else {
      this.modalTitle = 'Estadística de área';
    }

    this.modalService.open(this.actionModal, { size: 'lg', centered: true });
  } */

  openActionModal(
    action: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | 'EDITAR_ASUNTO'
  ): void {

    this.modalAction = action;

    if (action === 'ASUNTO_NUEVO') {
      this.modalTitle = 'Asunto Nuevo';
      this.resetFormRegistrarAsunto();
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileName = input.files?.[0]?.name ?? '';
  }

  onFileActuacionSelected(event: any): void {
    this.archivoActuacionSeleccionado = event.target.files[0];
  }

  guardarAsuntoNuevo(): void {

    if (this.showEtapaConocimiento) {
      this.mostrarErroresFormulario(this.RegistrarAsuntoPenalForm);
      if (this.RegistrarAsuntoPenalForm.invalid) {
        this.RegistrarAsuntoPenalForm.markAllAsTouched();
        console.log(this.RegistrarAsuntoPenalForm)
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

        console.log("error registrando medida de ejecucion")

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
      console.log(this.RegistrarActuacionForm)
      this.triggerAlert(
        'Complete los campos obligatorios',
        'warning'
      );

      return;
    }

    const request: CrearActuacionRequest =
      this.construirRequestActuacion();

    console.log(this.RegistrarActuacionForm.get('procesoId')?.value)  

    const procesoId:number =  Number(this.RegistrarActuacionForm.get('procesoId')?.value);
    console.log("proc id : ", procesoId)
    console.log("request actuacion : ",request);

    this.asuntoService.crearAsuntoPenalActuacion(procesoId, request, this.archivoActuacionSeleccionado).subscribe({
      next: (response) => {
        this.modalService.dismissAll();

        this.RegistrarActuacionForm.reset();
        console.log("actuacion: ",response)
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
      huboVictimas: false,

      medidaEjecucion: ''
    });
    this.selectedFileName = '';
    this.filtroDelito = '';
    this.filtroBienJuridico = '';
    this.currentStep = 1;
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

}
