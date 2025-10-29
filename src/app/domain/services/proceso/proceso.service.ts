import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Documento } from '../../models/document';
import { Observable } from 'rxjs';
import { CreateProceso, Proceso, ProcesoDTO } from '../../models/proceso';
import { ApiResponse } from '../../models/apiResponse/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {

  private baseUrl = environment.apiUrl + '/procesos';
  constructor(private http: HttpClient) { }

  crearProceso(proceso: CreateProceso): Observable<ApiResponse<ProcesoDTO>> {
    return this.http.post<ApiResponse<ProcesoDTO>>(this.baseUrl, proceso );
  }

  listarProcesos(): Observable<Proceso[]> {
    return this.http.get<Proceso[]>(`${this.baseUrl}`);
  }

  listarProcesosByAbodado(): Observable<ApiResponse<ProcesoDTO[]>> {
    return this.http.get<ApiResponse<ProcesoDTO[]>>(`${this.baseUrl}/abogado`);
  }

  obtenerProceso(id: number): Observable<Proceso> {
    return this.http.get<Proceso>(`${this.baseUrl}/proceso/${id}`);
  }

  eliminarProceso(id: number) {
    return this.http.delete(`${this.baseUrl}/proceso/${id}`);
  }
}
