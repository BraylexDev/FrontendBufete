import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AsuntoPenal, AsuntoPenalDetalleDTO, AsuntoPenalResponse } from '../../models/asuntoPenal/asuntoPenal.model';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { JwtAuthResponse } from '../../models/auth/auth.model';
import { Observable } from 'rxjs';
import { RecursoExtraordinarioDTO, RecursoExtraordinarioRequest } from '../../models/asuntoPenal/recursoExtraordinario.model';

@Injectable({
  providedIn: 'root'
})
export class AsuntoPenalService {

  private baseUrl = environment.apiUrl + '/procesos';

  constructor(private http: HttpClient) { }

  crearAsuntoPenal(request: AsuntoPenal): Observable<ApiResponse<AsuntoPenalResponse>> {
    return this.http.post<ApiResponse<AsuntoPenalResponse>>(`${this.baseUrl}`+"/penales", request);
  } 

  obtenerAsuntoPenal(procesoId: number): Observable<ApiResponse<AsuntoPenalDetalleDTO>> {
    return this.http.get<ApiResponse<AsuntoPenalDetalleDTO>>(`${this.baseUrl}/${procesoId}/penal`);
  }

  actualizarAsuntoPenal(procesoId: number, request: AsuntoPenal): Observable<ApiResponse<AsuntoPenalResponse>> {
    return this.http.put<ApiResponse<AsuntoPenalResponse>>(`${this.baseUrl}/${procesoId}/penal`, request);
  }

  subirRecExtraordinario(procesoId: number, request: RecursoExtraordinarioRequest): Observable<ApiResponse<RecursoExtraordinarioDTO>> {
    return this.http.post<ApiResponse<RecursoExtraordinarioDTO>>(`${this.baseUrl}/${procesoId}/recursoExtra`, request);
  }
}
