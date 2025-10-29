import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, CreateFolderRequest, DownloadUrlDTO, FileUploadResponse, NodeDTO } from '../../models/node2.model';

@Injectable({
  providedIn: 'root'
})
export class NodeService {
  private apiUrl = `${environment.apiUrl}/nodes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los hijos de un nodo (contenido de carpeta)
   */
  getNodeChildren(parentId: string): Observable<ApiResponse<NodeDTO[]>> {
    return this.http.get<ApiResponse<NodeDTO[]>>(`${this.apiUrl}/${parentId}/children`);
  }

  /**
   * Obtiene información de un nodo específico
   */
  getNodeById(id: string): Observable<ApiResponse<NodeDTO>> {
    return this.http.get<ApiResponse<NodeDTO>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea una nueva carpeta
   */
  createFolder(request: CreateFolderRequest): Observable<ApiResponse<NodeDTO>> {
    return this.http.post<ApiResponse<NodeDTO>>(`${this.apiUrl}/folders`, request);
  }

  /**
   * Sube un archivo
   */
  uploadFile(
    file: File,
    parentId: string,
    description?: string,
    note?: string
  ): Observable<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentId', parentId);
    
    if (description) {
      formData.append('description', description);
    }
    
    if (note) {
      formData.append('note', note);
    }

    return this.http.post<ApiResponse<FileUploadResponse>>(`${this.apiUrl}/uploadFile`, formData);
  }

  getDownloadUrlExpedient(nodeId: string): Observable<DownloadUrlDTO> {
    return this.http.get<ApiResponse<DownloadUrlDTO>>(
      `${this.apiUrl}/${nodeId}/downloadFileExpediente`,
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error(response.errors || 'Error obteniendo URL de descarga');
      })
    );
  }

  downloadFileInExpedient(nodeId: string): void {
    this.getDownloadUrlExpedient(nodeId).subscribe({
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
   * Sube un archivo
   */
  uploadFileNOexp(
    file: File,
    categoriaId: string,
    nombre?: string,
    description?: string
  ): Observable<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('categoriaId', categoriaId);
    
    if (description) {
      formData.append('description', description);
    }
    if (nombre) {
      formData.append('nombre', nombre);
    }
    return this.http.post<ApiResponse<FileUploadResponse>>(`${this.apiUrl}/uploadPlantilla`, formData);
  }

  /**
   * Sube un archivo
   */
  uploadFileSentencia(
    file: File,
    procesoId: string,
    expedienteId: string,
    nombre?: string,
    description?: string
  ): Observable<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('procesoId', procesoId);
    
    if (description) {
      formData.append('description', description);
    }
    if (nombre) {
      formData.append('nombre', nombre);
    }
    if (expedienteId) {
      formData.append('expedienteId', expedienteId);
    }
    return this.http.post<ApiResponse<FileUploadResponse>>(`${this.apiUrl}/uploadSentencia`, formData);
  }


  /**
   * Elimina un nodo
   */
  deleteNode(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtiene el icono apropiado basado en el tipo MIME
   */
  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'description';
    
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video_file';
    if (mimeType.startsWith('audio/')) return 'audio_file';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'folder_zip';
    if (mimeType.includes('text/')) return 'text_snippet';
    
    return 'insert_drive_file';
  }
}