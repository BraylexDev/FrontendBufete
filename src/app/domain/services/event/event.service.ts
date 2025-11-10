import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CreateEventoRequest, EventoDto } from '../../models/event.model';
import { ApiResponse } from '../../models/node2.model';

@Injectable({ providedIn: 'root' })
export class EventService {

  private baseUrl = environment.apiUrl + '/eventos';
  private eventosActualizados = new BehaviorSubject<void>(undefined);
  eventosActualizados$ = this.eventosActualizados.asObservable();

  constructor(private http: HttpClient) { }

  notificarCambio() {
    this.eventosActualizados.next();
  }

  crearEvento(evento: CreateEventoRequest): Observable<ApiResponse<EventoDto>> {
    return this.http.post<ApiResponse<EventoDto>>(this.baseUrl, evento);
  }

  listarEventos(): Observable<ApiResponse<EventoDto[]>> {
    return this.http.get<ApiResponse<EventoDto[]>>(`${this.baseUrl}/usuario`);
  }

  /* eliminarEvento(id: Date){
    return this.http.delete<EventoModel>(`${this.baseUrl}/evento/${id}`);
  } */
  eliminarEvento(id: number){
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /* eliminarUsuario(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/usuario/${id}`);
  } */

  actualizarEvento(id: number, titulo: string, fecha_inicio: Date, fecha_fin: Date, all_day: boolean, proceso_id: number, responsable_id: number) {
    return this.http.put<EventoDto>(`${this.baseUrl}/${id}`, { titulo, fecha_inicio, fecha_fin, all_day, proceso_id, responsable_id });
  }

  
}
