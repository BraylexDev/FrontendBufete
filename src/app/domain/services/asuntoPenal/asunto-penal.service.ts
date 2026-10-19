import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AsuntoPenal, AsuntoPenalDetalleDTO, AsuntoPenalResponse, AsuntosPenalesPorProcedimientoDTO } from '../../models/asuntoPenal/asuntoPenal.model';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { JwtAuthResponse } from '../../models/auth/auth.model';
import { Observable } from 'rxjs';
import { RecursoExtraordinarioDTO, RecursoExtraordinarioRequest } from '../../models/asuntoPenal/recursoExtraordinario.model';
import { CrearActuacionRequest } from '../../models/actuacion.model';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AsuntoPenalService {

  private baseUrl = environment.apiUrl + '/procesos';

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  crearAsuntoPenal(request: AsuntoPenal): Observable<ApiResponse<AsuntoPenalResponse>> {
    return this.http.post<ApiResponse<AsuntoPenalResponse>>(`${this.baseUrl}`+"/penales", request);
  } 

  crearAsuntoPenalActuacion(procesoId: number, request: CrearActuacionRequest, archivoActuacion: File): Observable<ApiResponse<any>> {
    const formData = new FormData();

    formData.append('tipoActuacionId', request.tipoActuacionId.toString());
    const fechaFormateada = this.datePipe.transform(request.fechaActuacion, 'yyyy-MM-dd') || '';
    formData.append('fechaActuacion', fechaFormateada); // Asegúrate que venga como 'YYYY-MM-DD'
    formData.append('descripcion', request.descripcion);
    formData.append('file', archivoActuacion);


    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${procesoId}/actuacion`, formData);
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

  listarProcesosProcedimiento(): Observable<ApiResponse<AsuntosPenalesPorProcedimientoDTO[]>> {
    return this.http.get<ApiResponse<AsuntosPenalesPorProcedimientoDTO[]>>(`${this.baseUrl}`+"/penal/procedimientos");
  }
}
