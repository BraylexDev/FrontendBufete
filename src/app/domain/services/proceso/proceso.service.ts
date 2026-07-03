import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Documento } from '../../models/document';
import { Observable } from 'rxjs';
import { CreateProceso, EditProcesoRequest, Proceso, ProcesoDTO } from '../../models/proceso';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { PermissionService } from '../permission/permission.service';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  private baseUrl = environment.apiUrl + '/procesos';
  
  constructor(
    private http: HttpClient,
    private permissionService: PermissionService
  ) { }

  crearProceso(proceso: CreateProceso): Observable<ApiResponse<ProcesoDTO>> {
    return this.http.post<ApiResponse<ProcesoDTO>>(this.baseUrl, proceso );
  }

  actualizarProceso(id: number, proceso: EditProcesoRequest): Observable<ApiResponse<ProcesoDTO>> {
    return this.http.put<ApiResponse<ProcesoDTO>>(`${this.baseUrl}/${id}`, proceso);
  }

  listarProcesos(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.baseUrl}`);
  }

  listarProcesosByAbodado(): Observable<ApiResponse<ProcesoDTO[]>> {
    return this.http.get<ApiResponse<ProcesoDTO[]>>(`${this.baseUrl}/abogado`);
  }

  /**
   * Lista todos los procesos del sistema (de todos los abogados)
   * Solo disponible para usuarios con permisos especiales
   * @returns Observable con todos los procesos del sistema
   */
  listarTodosProcesos(): Observable<ApiResponse<ProcesoDTO[]>> {
    return this.http.get<ApiResponse<ProcesoDTO[]>>(`${this.baseUrl}/sistema`);
  }

  obtenerProceso(id: number): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.baseUrl}/${id}`);
  }

  /**
   * Verifica si el usuario actual puede eliminar un proceso
   * @param proceso - DTO del proceso a verificar
   * @returns true si puede eliminarlo
   */
  canDelete(proceso: ProcesoDTO): boolean {
    return this.permissionService.canDeleteProceso(proceso);
  }

  /**
   * Elimina un proceso
   * @param id - ID del proceso a eliminar
   * @returns Observable con la respuesta del servidor
   */
  eliminarProceso(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}



