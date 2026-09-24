import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BienJuridico } from '../../models/asuntoPenal/asuntoPenal.model';
import { ApiResponse } from '../../models/apiResponse/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class BienJuridicoService {

  private baseUrl = environment.apiUrl + '/bienes-juridicos';

  constructor(private http: HttpClient) { }

  getBienesJuridicos() {
    return this.http.get<ApiResponse<BienJuridico[]>>(`${this.baseUrl}`);
  } 
}
