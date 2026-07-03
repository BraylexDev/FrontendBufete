import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DocumentoAdministrativo {
  id: string;
  nombre: string;
  tipo: string;
  tipoDocumento: string;
  descripcion?: string;
  fecha: Date;
  categoriaId: number;
  categoriaNombre: string;
  fileBlobId: string;
  sizeBytes?: number;
  mimeType?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class GestionAdministrativaService {
  private readonly baseUrl = `${environment.apiUrl}/nodes`;
  private readonly categoriaUrl = `${environment.apiUrl}/categoria`;
  private readonly plantillaUrl = `${environment.apiUrl}/plantilla`;

  constructor(private http: HttpClient) {}

  /**
   * Sube un documento administrativo (Constancia o Contable)
   */
  uploadDocumento(
    file: File,
    categoriaId: string,
    nombre: string,
    descripcion?: string
  ): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoriaId', categoriaId);
    formData.append('nombre', nombre);
    if (descripcion) {
      formData.append('description', descripcion);
    }

    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/uploadPlantilla`,
      formData
    );
  }

  /**
   * Lista documentos por módulo (CONSTANCIA_CARCELARIA o CONTABLE)
   */
  listarDocumentosPorModulo(modulo: 'CONSTANCIA_CARCELARIA' | 'CONTABLE'): Observable<DocumentoAdministrativo[]> {
    return this.http.post<any>(`${this.categoriaUrl}`, modulo).pipe(
      map(categorias => {
        // Aquí deberías hacer otra llamada para obtener los documentos por categoría
        // Por ahora retornamos un array vacío como ejemplo
        return [];
      })
    );
  }

  /**
   * Obtiene URL de descarga
   */
  getDownloadUrl(nodeId: string): Observable<{ url: string; fileName: string; mimeType: string }> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/${nodeId}/downloadDoc`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Obtiene URL de visualización
   */
  getViewUrl(nodeId: string): Observable<{ url: string; fileName: string }> {
    return this.http.get<ApiResponse<any>>(
      `${this.baseUrl}/${nodeId}/viewDoc`
    ).pipe(
      map(response => response.data)
    );
  }

  /**
   * Elimina un documento
   */
  deleteDocumento(nodeId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${nodeId}`);
  }

  /**
   * Descarga archivo
   */
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

  /**
   * Visualiza archivo en nueva pestaña
   */
  viewFile(nodeId: string): void {
    const newTab = window.open('', '_blank');
    this.getViewUrl(nodeId).subscribe({
      next: (viewInfo) => {
        if (newTab) {
          newTab.location.href = viewInfo.url;
        }
      },
      error: (error) => {
        console.error('Error visualizando archivo:', error);
        if (newTab) newTab.close();
      }
    });
  }

  /**
   * Valida el tipo de archivo
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(`.${extension}`) : false;
  }

  /**
   * Formatea tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}