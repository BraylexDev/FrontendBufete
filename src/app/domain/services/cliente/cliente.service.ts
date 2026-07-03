import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ClienteDTO } from '../../models/cliente.model';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/node2.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private baseUrl = environment.apiUrl + '/clientes';

  constructor(private http: HttpClient) { }


  getClienteById(identificacion: string): Observable<ApiResponse<ClienteDTO>> {
    return this.http.get<ApiResponse<ClienteDTO>>(`${this.baseUrl}/consulta/${identificacion}`);
  }

  
}
