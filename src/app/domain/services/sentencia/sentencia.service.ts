import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { CreateSentenciaRequest, SentenciaResponse } from '../../models/sentencia.model';
import { map, Observable } from 'rxjs';
import { ApiResponse, DownloadUrlDTO } from '../../models/node2.model';

@Injectable({
  providedIn: 'root'
})
export class SentenciaService {

  private baseUrl = environment.apiUrl + '/sentencias';
  private baseUrl2 = environment.apiUrl + '/nodes';

  urlToView: string = '';

  constructor(private http: HttpClient) { }

  crearSentencia(proceso: CreateSentenciaRequest): Observable<SentenciaResponse> {
      return this.http.post<SentenciaResponse>(this.baseUrl, proceso );
    }

  listarDocumentos(tipo: string): Observable<SentenciaResponse[]> {
    return this.http.get<SentenciaResponse[]>(`${this.baseUrl}/tipo/${tipo}`);
  }

  getDownloadUrl(nodeId: string): Observable<DownloadUrlDTO> {
      return this.http.get<ApiResponse<DownloadUrlDTO>>(
        `${this.baseUrl2}/${nodeId}/downloadDoc`,
      ).pipe(
        map(response => {
          if (response.success && response.data) {
            return response.data;
          }
          throw new Error(response.errors || 'Error obteniendo URL de descarga');
        })
      );
    }
    getUrlFile(nodeId: string): string {
      this.getDownloadUrl(nodeId).subscribe({
        next: (downloadInfo) => {
          this.urlToView = downloadInfo.url;
        },
        error: (error) => {
          console.error('Error descargando archivo:', error);
        }
      });
      return this.urlToView;
    }
  
    downloadFile(nodeId: string): void {
      this.getDownloadUrl(nodeId).subscribe({
        next: (downloadInfo) => {
          const link = document.createElement('a');
          link.href = downloadInfo.url;
          link.download = downloadInfo.fileName;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        },
        error: (error) => {
          console.error('Error descargando archivo:', error);
        }
      });
    }
}
