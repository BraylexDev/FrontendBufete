import { Component, OnDestroy, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { AsuntoPenal, BienJuridico, Delito, Persona } from '../../../domain/models/asuntoPenal/asuntoPenal.model';
import { AsuntoPenalService } from '../../../domain/services/asuntoPenal/asunto-penal.service';
import { CardComponent } from '../../shared/components/card/card.component';
import { SharedModule } from '../../shared/shared.module';


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
  private asuntoService = inject(AsuntoPenalService)
  private authService = inject(AuthService);
  private router = inject(Router);

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

  competenciasAsunto = [
    {
      value: 'MUNICIPAL',
      label: 'MUNICIPAL'
    },
    {
      value: 'CIRCUITO',
      label: 'CIRCUITO'
    },
    {
      value: 'CIRCUITO_ESPECIALIZADO',
      label: 'CIRCUITO ESPECIALIZADO'
    },
  ]

  filtroDelito = '';
  filtroBienJuridico = '';

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

  procesos: ProcesoItem[] = [];
  modalAction: 'ASUNTO_NUEVO' | 'MODIFICAR_ACTUACION' | 'ESTADISTICA_AREA' | null = null;
  modalTitle = '';
  selectedFileName = '';
  currentStep = 1;

  constructor(private alertService: AlertService) {
    this.buscadorForm = this.fb.group({
      jurisdiccion: ['', Validators.required],
      asunto: [{ value: '', disabled: true }, Validators.required]
    });

    this.subForm = this.fb.group({
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
      delitosIds: this.fb.control<number[]>([], Validators.required),
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


    // Verificar si el usuario tiene permisos para ver todos los procesos
    this.mostrarAbogado = this.permissionService.canViewAllSystemProcesses();
    this.cargarProcesos();
    this.cargarBienesJuridicos();
    this.cargarDelitos();
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
        console.log(`❌ Campo inválido: ${campo}`);
        console.log('   Valor:', control.value);
        console.log('   Errores:', control.errors);
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
    return this.subForm.get('tipoAsuntoNuevo');
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

  /* siguientePaso(): void {
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
    if (this.currentStep === 3) {
      const stepTwoValid = this.subForm.get('numeroProceso')?.valid
        && this.subForm.get('nombreProceso')?.valid
        && this.subForm.get('identificacionCliente')?.valid;

      if (stepTwoValid) {
        this.currentStep = 4;
      } else {
        this.subForm.get('numeroProceso')?.markAsTouched();
        this.subForm.get('nombreProceso')?.markAsTouched();
        this.subForm.get('identificacionCliente')?.markAsTouched();
      }
    }
  } */
  siguientePaso(): void {

    if (this.currentStep === 1) {

      const controlesPaso1 = [
        'nunc',
        'tipoProcedimiento'
      ];

      let valido = true;

      controlesPaso1.forEach(nombre => {
        const control = this.subForm.get(nombre);

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

      const fiscal = this.subForm.get('fiscal');

      console.log('FORM:', fiscal);
      console.log('incalid:', fiscal?.invalid);
      this.mostrarErroresFormulario(this.subForm);

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
        const control = this.subForm.get(nombre);

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


  /* pasoAnterior(): void {
    if (this.currentStep > 1) {
      this.currentStep -= 1;
    }
  } */
  pasoAnterior(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFileName = input.files?.[0]?.name ?? '';
  }

  /* guardarAsuntoNuevo(): void {
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
  } */


  guardarAsuntoNuevo(): void {

    console.log("guadando asunto ...")
    console.log('FORM:', this.subForm);

    this.mostrarErroresFormulario(this.subForm);
    if (this.subForm.invalid) {
      this.subForm.markAllAsTouched();
      console.log("subfrom invalid");
      this.triggerAlert(
        'Complete los campos obligatorios',
        'warning'
      );

      return;
    }

    if (this.imputados.length === 0) {
      console.log("imputados 0");
      this.triggerAlert(
        'Debe agregar al menos un imputado',
        'warning'
      );

      return;
    }

    if (this.imputados.invalid) {
      console.log("imputados invalid");
      this.imputados.markAllAsTouched();

      this.triggerAlert(
        'Complete los datos obligatorios de los imputados',
        'warning'
      );

      return;
    }

    const request: AsuntoPenal =
      this.construirRequest();

    console.log('Request a enviar:', request);

    this.asuntoService.crearAsuntoPenal(request).subscribe({
      next: (response) => {

        console.log("response guardar asunto nuevo" + response);
        this.triggerAlert(
          'Registro exitoso',
          'success'
        );

        this.modalService.dismissAll();

        this.subForm.reset();

        this.imputados.clear();

        this.currentStep = 1;
      },

      error: (error) => {
        console.log("Error-...")
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
      archivo: null,
      delitosIds: [],
      bienesJuridicosIds: []
    });
    this.selectedFileName = '';
    this.filtroDelito = '';
    this.filtroBienJuridico = '';
    this.currentStep = 1;
  }

  /* private cargarProcesosMock(): ProcesoItem[] {
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
  } */

  private cargarProcesosAsunto(): ProcesoItem[] {
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
        console.log('Delitos cargados:', response.data);
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
        console.log('Bienes jurídicos cargados:', response);
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
    const ids = this.subForm.get('delitosIds')?.value ?? [];
    return this.delitos.filter(delito => delito.id !== undefined && ids.includes(delito.id));
  }

  get bienesJuridicosSeleccionados(): BienJuridico[] {
    const ids = this.subForm.get('bienesJuridicosIds')?.value ?? [];
    return this.bienesJuridicos.filter(bien => bien.id !== undefined && ids.includes(bien.id));
  }

  estaDelitoSeleccionado(id: number | undefined): boolean {
    return id !== undefined && (this.subForm.get('delitosIds')?.value ?? []).includes(id);
  }

  estaBienJuridicoSeleccionado(id: number | undefined): boolean {
    return id !== undefined && (this.subForm.get('bienesJuridicosIds')?.value ?? []).includes(id);
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
    const control = this.subForm.get(controlName);
    const ids: number[] = control?.value ?? [];
    const nuevosIds = ids.includes(id)
      ? ids.filter(selectedId => selectedId !== id)
      : [...ids, id];

    control?.setValue(nuevosIds);
    control?.markAsTouched();
  }


  get imputados(): FormArray {
    return this.subForm.get('imputados') as FormArray;
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
    return this.subForm.get('fiscal') as FormGroup;
  }

  private construirRequest(): AsuntoPenal {

    const formValue = this.subForm.getRawValue();

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
}
