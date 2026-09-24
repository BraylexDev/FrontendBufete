import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Delito } from '../../models/asuntoPenal/asuntoPenal.model';
import { ApiResponse } from '../../models/apiResponse/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class DelitoService {

  private baseUrl = environment.apiUrl + '/delitos';

  constructor(private http: HttpClient) { }

  getDelitos() {
    return this.http.get<ApiResponse<Delito[]>>(`${this.baseUrl}`);
  } 

}
