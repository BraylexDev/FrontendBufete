
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProcesoDTO } from '../../models/proceso';
import { ExpedienteDTO } from '../../models/expediente';

export interface ProcesoExpandible extends ProcesoDTO {
  expanded?: boolean;
  expedientes?: ExpedienteDTO[];
  cargandoExpedientes?: boolean;
  expedientesCargados?: boolean;
  mostrarTodasPersonas?: boolean;
}

export interface ProcesoState {
  procesos: ProcesoExpandible[];
  jurisdiccion: string;
  tipoAsunto: string;
  cargando: boolean;
}

const estadoInicial: ProcesoState = {
  procesos: [],
  jurisdiccion: '',
  tipoAsunto: '',
  cargando: false
};

@Injectable({
  providedIn: 'root'
})
export class ProcesoStateService {

  private readonly stateSubject =
    new BehaviorSubject<ProcesoState>(estadoInicial);

  readonly state$ = this.stateSubject.asObservable();

  get snapshot(): ProcesoState {
    return this.stateSubject.value;
  }

  guardarProcesos(procesos: ProcesoExpandible[]): void {
    this.actualizarEstado({ procesos });
  }

  guardarFiltros(jurisdiccion: string, tipoAsunto: string): void {
    this.actualizarEstado({
      jurisdiccion,
      tipoAsunto
    });
  }

  establecerCarga(cargando: boolean): void {
    this.actualizarEstado({ cargando });
  }

  actualizarProceso(procesoActualizado: ProcesoExpandible): void {
    const procesos = this.snapshot.procesos.map(proceso =>
      proceso.id === procesoActualizado.id
        ? procesoActualizado
        : proceso
    );

    this.actualizarEstado({ procesos });
  }

  limpiarEstado(): void {
    this.stateSubject.next(estadoInicial);
  }

  private actualizarEstado(
    cambios: Partial<ProcesoState>
  ): void {
    this.stateSubject.next({
      ...this.snapshot,
      ...cambios
    });
  }
}
