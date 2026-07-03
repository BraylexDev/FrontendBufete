import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { CreateExpedienteDto, ExpedienteDTO } from '../../models/expediente';
import { PermissionService } from '../permission/permission.service';

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

  constructor(
    private http: HttpClient,
    private permissionService: PermissionService
  ) { }

  getExpedienteById(id: number): Observable<ApiResponse<ExpedienteDTO>> {
    return this.http.get<ApiResponse<ExpedienteDTO>>(`${this.API_URL}/${id}`);
  }

  getExpedientesByProceso(procesoId?: number): Observable<ApiResponse<ExpedienteDTO[]>> {
    return this.http.get<ApiResponse<ExpedienteDTO[]>>(`${this.API_URL}/proceso/${procesoId}`);
  }

  crearExpediente(expediente: CreateExpedienteDto  ): Observable<ApiResponse<ExpedienteDTO>> {
    return this.http.post<ApiResponse<ExpedienteDTO>>(this.baseUrl, expediente);
  }

  actualizarExpediente(id: number, expediente: ExpedienteDTO): Observable<ApiResponse<ExpedienteDTO>> {
    return this.http.put<ApiResponse<ExpedienteDTO>>(`${this.baseUrl}/${id}`, expediente);
  }

  listarExpedientes(): Observable<ExpedienteDTO[]> {
    return this.http.get<ExpedienteDTO[]>(`${this.baseUrl}/expediente`);
  }

  obtenerExpediente(id: number): Observable<ExpedienteDTO> {
    return this.http.get<ExpedienteDTO>(`${this.baseUrl}/expediente/${id}`);
  }

  /**
   * Verifica si el usuario actual puede eliminar un expediente
   * @param expediente - DTO del expediente a verificar
   * @returns true si puede eliminarlo
   */
  canDelete(expediente: ExpedienteDTO): boolean {
    return this.permissionService.canDeleteExpediente(expediente);
  }

  /**
   * Elimina un expediente
   * @param id - ID del expediente a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarExpediente(id: number) {
    return this.http.delete<ExpedienteDTO>(`${this.baseUrl}/${id}`);
  }
}

