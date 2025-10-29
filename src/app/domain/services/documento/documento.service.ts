import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { GuardarDocumento } from '../../models/guardarDocument';
import { Observable } from 'rxjs';
import { Documento } from '../../models/document';
import { TablaDocumento } from '../../models/sentenciasTable';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {

  private baseUrl = environment.secUrl + '/api';

  constructor(private http: HttpClient) { }

  crearDocumento(guardarDoc: GuardarDocumento): Observable<Documento> {
    return this.http.post<Documento>(`${this.baseUrl}/documento`, { guardarDoc });
  }

  listarDocumentos(): Observable<TablaDocumento[]> {
    return this.http.get<TablaDocumento[]>(`${this.baseUrl}/documento`);
  }

  obtenerDocumento(id:number): Observable<Documento>{
    return this.http.get<Documento>(`${this.baseUrl}/documento/${id}`);
  }

  eliminarDocumento(id: number) {
    return this.http.delete(`${this.baseUrl}/documento/${id}`);
  }
}
