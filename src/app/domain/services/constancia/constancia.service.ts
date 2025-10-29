import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Constancia {
  id: number;
  idCliente: string;
  cliente: string;
  nombreDocumento: string;
  fechaSubida: string;
  tipoDocumentoCliente?: string;
  descripcion?: string;
  archivoUrl?: string;
}

export interface ConstanciaFormData {
  tipoDocumentoCliente: string;
  numeroDocumento: string;
  nombreCliente: string;
  nombreDocumento: string;
  fecha: string;
  descripcion: string;
  archivo?: File;
}


@Injectable({
  providedIn: 'root'
})
export class ConstanciaService {

  private constanciasSubject = new BehaviorSubject<Constancia[]>([
    {
      id: 1,
      idCliente: '1067921325',
      cliente: 'Pepito Perez',
      nombreDocumento: 'Constancia Visita Carcelaria',
      fechaSubida: 'Cargado',
      tipoDocumentoCliente: 'CC',
      descripcion: 'Constancia de visita realizada en establecimiento carcelario'
    }
  ]);

  constancias$ = this.constanciasSubject.asObservable();

  constructor() { }

  // Obtener todas las constancias
  getConstancias(): Observable<Constancia[]> {
    return this.constancias$;
  }

  // Obtener constancia por ID
  getConstanciaById(id: number): Observable<Constancia | undefined> {
    const constancias = this.constanciasSubject.value;
    const constancia = constancias.find(c => c.id === id);
    return of(constancia).pipe(delay(100));
  }

  // Crear nueva constancia
  crearConstancia(formData: ConstanciaFormData): Observable<Constancia> {
    const constancias = this.constanciasSubject.value;
    const nuevaConstancia: Constancia = {
      id: this.getNextId(),
      idCliente: formData.numeroDocumento,
      cliente: formData.nombreCliente,
      nombreDocumento: formData.nombreDocumento,
      fechaSubida: 'Cargado',
      tipoDocumentoCliente: formData.tipoDocumentoCliente,
      descripcion: formData.descripcion,
      archivoUrl: formData.archivo ? URL.createObjectURL(formData.archivo) : undefined
    };

    this.constanciasSubject.next([nuevaConstancia, ...constancias]);
    return of(nuevaConstancia).pipe(delay(500));
  }

  // Actualizar constancia
  actualizarConstancia(id: number, formData: Partial<ConstanciaFormData>): Observable<Constancia | null> {
    const constancias = this.constanciasSubject.value;
    const index = constancias.findIndex(c => c.id === id);

    if (index === -1) {
      return of(null);
    }

    const constanciaActualizada = {
      ...constancias[index],
      ...(formData.numeroDocumento && { idCliente: formData.numeroDocumento }),
      ...(formData.nombreCliente && { cliente: formData.nombreCliente }),
      ...(formData.nombreDocumento && { nombreDocumento: formData.nombreDocumento }),
      ...(formData.tipoDocumentoCliente && { tipoDocumentoCliente: formData.tipoDocumentoCliente }),
      ...(formData.descripcion && { descripcion: formData.descripcion }),
      ...(formData.archivo && { archivoUrl: URL.createObjectURL(formData.archivo) })
    };

    constancias[index] = constanciaActualizada;
    this.constanciasSubject.next([...constancias]);
    return of(constanciaActualizada).pipe(delay(500));
  }

  // Eliminar constancia
  eliminarConstancia(id: number): Observable<boolean> {
    const constancias = this.constanciasSubject.value;
    const nuevasConstancias = constancias.filter(c => c.id !== id);
    this.constanciasSubject.next(nuevasConstancias);
    return of(true).pipe(delay(300));
  }

  // Filtrar constancias
  filtrarConstancias(searchTerm: string, mes?: string, año?: number): Observable<Constancia[]> {
    let constancias = this.constanciasSubject.value;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      constancias = constancias.filter(c =>
        c.idCliente.toLowerCase().includes(searchLower) ||
        c.cliente.toLowerCase().includes(searchLower) ||
        c.nombreDocumento.toLowerCase().includes(searchLower)
      );
    }

    // Aquí puedes agregar lógica adicional para filtrar por mes y año
    // si tus constancias tienen fecha real

    return of(constancias).pipe(delay(100));
  }

  // Descargar constancia (simula descarga)
  descargarConstancia(constancia: Constancia): Observable<Blob> {
    // En producción, aquí harías una llamada HTTP para obtener el archivo
    const blob = new Blob(['Contenido del documento'], { type: 'application/pdf' });
    return of(blob).pipe(delay(500));
  }

  // Obtener siguiente ID
  private getNextId(): number {
    const constancias = this.constanciasSubject.value;
    return constancias.length > 0 
      ? Math.max(...constancias.map(c => c.id)) + 1 
      : 1;
  }

  // Validar número de documento (ejemplo)
  validarNumeroDocumento(tipo: string, numero: string): boolean {
    const patterns: { [key: string]: RegExp } = {
      'CC': /^\d{6,10}$/,
      'NIT': /^\d{9,10}$/,
      'TI': /^\d{10,11}$/,
      'CE': /^\d{6,7}$/,
      'PP': /^[A-Z]{1,2}\d{6,9}$/
    };

    return patterns[tipo] ? patterns[tipo].test(numero) : true;
  }
}
