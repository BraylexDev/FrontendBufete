import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../../models/node2.model';
import { CategoriaDTO } from '../../models/categoria.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
 
  private baseUrl = environment.apiUrl + '/categoria';
  constructor(private http: HttpClient) { }

  listarCategorias(modulo: any): Observable<CategoriaDTO[]> {
    return this.http.post<CategoriaDTO[]>(this.baseUrl, modulo,  { headers: { 'Content-Type': 'application/json' } });
  }
}