import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Documento } from '../../models/document';
import { Observable } from 'rxjs';
import { CreateProceso, EditProcesoRequest, Proceso, ProcesoDTO } from '../../models/proceso';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { PermissionService } from '../permission/permission.service';
import { TerminoDTO } from '../../models/asuntoPenal/asuntoPenal.model';

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

  listarExpedientesByAbogado(termino?: string): Observable<ApiResponse<ProcesoDTO[]>> {
    let params = new HttpParams();
    if (termino) {
      params = params.set('q', termino); // Añade ?q=termino a la URL si existe
    }
    return this.http.get<ApiResponse<ProcesoDTO[]>>(`${this.baseUrl}/abogado`, { params });
  }

  listarExpedientesAdministrador(termino?: string): Observable<ApiResponse<ProcesoDTO[]>> {
    let params = new HttpParams();
    if (termino) {
      params = params.set('q', termino); // Añade ?q=termino a la URL si existe
    }
    return this.http.get<ApiResponse<ProcesoDTO[]>>(`${this.baseUrl}/administrador`, { params });
  }

  listarProcesosByAbodado(): Observable<ApiResponse<ProcesoDTO[]>> {
    return this.http.get<ApiResponse<ProcesoDTO[]>>(`${this.baseUrl}/abogado`);
  }

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

  obtenerTerminos(idProceso: number){
    return this.http.get<ApiResponse<TerminoDTO[]>>(`${this.baseUrl}/${idProceso}/terminos`);
  }
}



