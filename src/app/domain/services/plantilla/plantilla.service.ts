import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { PlantillaDto } from '../../models/plantilla.model';
import { map, Observable } from 'rxjs';
import { ApiResponse, DownloadUrlDTO } from '../../models/node2.model';

@Injectable({
  providedIn: 'root'
})
export class PlantillaService {

  private baseUrl = environment.apiUrl + '/plantilla';
  private baseUrl2 = environment.apiUrl + '/nodes';

  urlToView: string = '';

  constructor(private http: HttpClient) { }

  listarPlantillas(): Observable<PlantillaDto[]> {
    return this.http.get<PlantillaDto[]>(`${this.baseUrl}`);
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

  getViewUrl(nodeId: string): Observable<DownloadUrlDTO> {
    return this.http.get<ApiResponse<DownloadUrlDTO>>(
      `${this.baseUrl2}/${nodeId}/viewDoc`,
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

  viewFile(nodeId: string): void {
    const newTab = window.open('', '_blank');
    this.getViewUrl(nodeId).subscribe({
      next: (downloadInfo) => {
        if (newTab) {
          newTab.location.href = downloadInfo.url; // ahora se debería mostrar en la pestaña
        }
      },
      error: (error) => {
        console.error('Error descargando archivo:', error);
        if (newTab) newTab.close();
      }
    });
  }

  downloadFile(nodeId: string): void {
    this.getDownloadUrl(nodeId).subscribe({
      next: (downloadInfo) => {
        if (downloadInfo.mimeType != "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const link = document.createElement('a');
          link.href = downloadInfo.url;
          link.download = downloadInfo.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        else{
          this.viewFile(nodeId);
        }
      },
      error: (error) => {
        console.error('Error descargando archivo:', error);
      }
    });
  }

}
