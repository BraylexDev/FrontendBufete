import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { ProcesoDTO } from '../../../../domain/models/proceso';
import { ExpedienteService } from '../../../../domain/services/expediente/expediente.service';
import { ExpedienteDTO } from '../../../../domain/models/expediente';
import { CreateSentenciaRequest, SentenciaResponse } from '../../../../domain/models/sentencia.model';
import { SentenciaService } from '../../../../domain/services/sentencia/sentencia.service';
import { NodeService } from '../../../../domain/services/folder/node.service';
import { catchError, concat, debounceTime, distinctUntilChanged, map, Observable, of, Subject, switchMap, tap } from 'rxjs';
import { PermissionService } from '../../../../domain/services/permission/permission.service';

@Component({
  selector: 'app-sentencia-modal',
  imports: [CommonModule, SharedModule, FormsModule, NgSelectModule],
  templateUrl: './sentencia-modal.component.html',
  styleUrl: './sentencia-modal.component.scss'
})
export class SentenciaModalComponent implements OnInit {

  @Input() modalTitle: string = '';
  @Input() tipoSentencia: string = 'SENTENCIA'; // Default to SENTENCIA
  @Input() expedientes: ProcesoDTO[] = []; 
  @Output() sentenciaGuardada = new EventEmitter<SentenciaResponse>();

  tiposDocumento = ['Condenatoria', 'Absolutoria', 'Mixta', 'Apelación', 'Casación'];
  procesos: ProcesoDTO[] = [];

  form: FormGroup;

  formData = {
    nombre: '',
    tipoDocumento:'',
    description: '',
    procesoId: ''
  };

  selectedFile: File | null = null;
  procesoSeleccionado: number | string = '';
  expedienteSeleccionado: number | string = '';

  /* nueva implementacion buscador */
  expedienteSeleccionadoId?: number; // Almacenará el ID seleccionado
  expedientes$!: Observable<ProcesoDTO[]>; 
  expedientesInput$ = new Subject<string>();
  cargando = false;

  esAdministrador: boolean = false;

  constructor(
    public activeModal: NgbActiveModal, 
    private procesoService: ProcesoService, 
    private expedienteService: ExpedienteService,
    private sentenciaService: SentenciaService,
    private nodeService: NodeService,
    private fb: FormBuilder,
    private permissionService: PermissionService
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      tipoDocumento: [''],
      description: [''],
      procesoId: ['', Validators.required],
    });

    this.esAdministrador = this.permissionService.canViewAllSystemProcesses();

  }

  ngOnInit(): void {
    // Cargar procesos
    /* this.procesos = this.expedientes; */
    
    this.inicializarBuscadorAsincrono();
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


  /* cargarProcesos(): void {
    this.procesoService.listarProcesosByAbodado().subscribe({
      next: (data) => {
        this.procesos = data.data;
      },
      error: (err) => console.error('Error cargando procesos:', err)
    });
  } */

  onProcesoChange(procesoId: number | string): void {
    this.procesoSeleccionado = procesoId;
    this.formData.procesoId = String(procesoId);
    this.expedientes = [];
    this.expedienteSeleccionado = '';
    
    // Cargar expedientes del proceso seleccionado
    if (procesoId) {
      this.expedienteService.getExpedientesByProceso(Number(procesoId)).subscribe({
        next: (data: any) => {
          this.expedientes = data.data || [];
        },
        error: (err: any) => console.error('Error cargando expedientes:', err)
      });
    }
  }

  onExpedienteChange(expedienteId: number | string): void {
    this.expedienteSeleccionado = expedienteId;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  saveEvent(): void {
    if (this.form.invalid) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }


    // Subir el archivo
    if (this.selectedFile) {

      const { nombre, tipoDocumento, description, procesoId } = this.form.value;
      
      this.nodeService.uploadFileSentencia(
        this.selectedFile,
        procesoId,
        tipoDocumento,
        this.tipoSentencia,
        nombre,
        description
      ).subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            console.log('Archivo subido exitosamente:', response.data);
            // Emitir evento de éxito (en este caso sin sentencia, solo archivo)
            this.sentenciaGuardada.emit();
            this.activeModal.close(response.data);
          }
        },
        error: (err: any) => {
          console.error('Error al subir archivo:', err);
          alert('Error al subir el archivo. Por favor intente nuevamente.');
        }
      });
    } else {
      alert('Por favor seleccione un archivo');
    }
  }

  private validarFormulario(): boolean {
    return !!(
      this.formData.nombre.trim() &&
      this.formData.procesoId &&
      this.selectedFile
    );
  }

  cancelar(): void {
    this.activeModal.dismiss('cancel');
  }
}
