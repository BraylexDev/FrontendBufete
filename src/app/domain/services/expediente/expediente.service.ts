import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { CreateExpedienteDto, ExpedienteDTO } from '../../models/expediente';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ExpedienteService {

  private baseUrl = environment.apiUrl + '/expedientes';
  private readonly API_URL = `${environment.apiUrl}/expedientes`;

  constructor(private http: HttpClient) { }


  getExpedienteById(id: number): Observable<ApiResponse<ExpedienteDTO>> {
    return this.http.get<ApiResponse<ExpedienteDTO>>(`${this.API_URL}/${id}`);
  }

  getExpedientesByProceso(procesoId?: number): Observable<ApiResponse<ExpedienteDTO[]>> {
    return this.http.get<ApiResponse<ExpedienteDTO[]>>(`${this.API_URL}/proceso/${procesoId}`);
  }

  crearExpediente(expediente: CreateExpedienteDto  ): Observable<ApiResponse<ExpedienteDTO>> {
    return this.http.post<ApiResponse<ExpedienteDTO>>(this.baseUrl, expediente);
  }

  listarExpedientes(): Observable<ExpedienteDTO[]> {
    return this.http.get<ExpedienteDTO[]>(`${this.baseUrl}/expediente`);
  }

  obtenerExpediente(id: number): Observable<ExpedienteDTO> {
    return this.http.get<ExpedienteDTO>(`${this.baseUrl}/expediente/${id}`);
  }

  eliminarExpediente(id: number) {
    return this.http.delete<ExpedienteDTO>(`${this.baseUrl}/expediente/${id}`);
  }
}
