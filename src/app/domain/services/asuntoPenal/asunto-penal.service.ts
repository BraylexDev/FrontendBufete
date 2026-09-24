import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AsuntoPenal, AsuntoPenalResponse } from '../../models/asuntoPenal/asuntoPenal.model';
import { ApiResponse } from '../../models/apiResponse/api-response.model';
import { JwtAuthResponse } from '../../models/auth/auth.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsuntoPenalService {

  private baseUrl = environment.apiUrl + '/procesos';

  constructor(private http: HttpClient) { }

  crearAsuntoPenal(request: AsuntoPenal): Observable<ApiResponse<AsuntoPenalResponse>> {
    return this.http.post<ApiResponse<AsuntoPenalResponse>>(`${this.baseUrl}`+"/penales", request);
  } 
}
