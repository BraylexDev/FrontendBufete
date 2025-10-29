import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, map, catchError, throwError, BehaviorSubject } from 'rxjs';
import { 
  NodeDto, 
  CreateFolderRequest, 
  MoveNodeRequest, 
  RenameNodeRequest,
  FileUploadResponse,
  FileVersionDto,
  ApiResponse, 
  } from '../../models/file-management';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileManagementService {
  private readonly apiUrl = environment.apiUrl + '/nodes';
  private currentFolderSubject = new BehaviorSubject<string | null>(null);
  private breadcrumbSubject = new BehaviorSubject<{ id: string | null; name: string }[]>([
    { id: null, name: 'Root' }
  ]);
  
  currentFolder$ = this.currentFolderSubject.asObservable();
  breadcrumb$ = this.breadcrumbSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const userId = localStorage.getItem('userId') || '2';
    return new HttpHeaders({
      'User-Id': 2
    });
  }

  // Navegación
  navigateToFolder(parentId: string | null, folderName?: string): void {
    this.currentFolderSubject.next(parentId);
    this.updateBreadcrumb(parentId, folderName);
  }

  private updateBreadcrumb(parentId: string | null, folderName?: string): void {
    const current = this.breadcrumbSubject.value;
    if (parentId === null) {
      this.breadcrumbSubject.next([{ id: null, name: 'Root' }]);
    } else if (folderName) {
      this.breadcrumbSubject.next([...current, { id: parentId, name: folderName }]);
    }
  }

  navigateToBreadcrumb(index: number): void {
    const breadcrumb = this.breadcrumbSubject.value;
    const targetLevel = breadcrumb[index];
    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    
    this.breadcrumbSubject.next(newBreadcrumb);
    this.currentFolderSubject.next(targetLevel.id);
  }

  // Operaciones principales
  getFolderContents(expedienteId: number, parentId?: string): Observable<NodeDto[]> {
    const params = parentId ? `?parentId=${parentId}` : '';
    return this.http.get<NodeDto[]>(`${this.apiUrl}/${expedienteId}/archivos${params}`);
  }

  createFolder(expedienteId: number, request: CreateFolderRequest): Observable<ApiResponse<NodeDto>> {
    return this.http.post<ApiResponse<NodeDto>>(
      `${this.apiUrl}/${expedienteId}/archivos/carpetas`,
      request,
      { headers: this.getHeaders() }
    );
  }

  uploadFile(expedienteId: number, file: File, parentId?: string, description?: string, note?: string): Observable<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (parentId) formData.append('parentId', parentId);
    if (description) formData.append('description', description);
    if (note) formData.append('note', note);

    return this.http.post<ApiResponse<FileUploadResponse>>(
      `${this.apiUrl}/${expedienteId}/archivos/subir`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  getDownloadUrl(expedienteId: number, nodeId: string): Observable<string> {
    return this.http.get<ApiResponse<string>>(
      `${this.apiUrl}/${expedienteId}/archivos/${nodeId}/descargar`,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }

  moveNode(expedienteId: number, nodeId: string, request: MoveNodeRequest): Observable<ApiResponse<NodeDto>> {
    return this.http.put<ApiResponse<NodeDto>>(
      `${this.apiUrl}/${expedienteId}/archivos/${nodeId}/mover`,
      request,
      { headers: this.getHeaders() }
    );
  }

  renameNode(expedienteId: number, nodeId: string, request: RenameNodeRequest): Observable<ApiResponse<NodeDto>> {
    return this.http.put<ApiResponse<NodeDto>>(
      `${this.apiUrl}/${expedienteId}/archivos/${nodeId}/renombrar`,
      request,
      { headers: this.getHeaders() }
    );
  }

  deleteNode(expedienteId: number, nodeId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${expedienteId}/archivos/${nodeId}`,
      { headers: this.getHeaders() }
    );
  }

  getFileVersions(expedienteId: number, nodeId: string): Observable<FileVersionDto[]> {
    return this.http.get<ApiResponse<FileVersionDto[]>>(
      `${this.apiUrl}/${expedienteId}/archivos/${nodeId}/versiones`,
      { headers: this.getHeaders() }
    ).pipe(map(response => response.data));
  }

  uploadNewVersion(expedienteId: number, nodeId: string, file: File, note?: string): Observable<ApiResponse<FileUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (note) formData.append('note', note);

    return this.http.post<ApiResponse<FileUploadResponse>>(
      `${this.apiUrl}/${expedienteId}/archivos/${nodeId}/nueva-version`,
      formData,
      { headers: this.getHeaders() }
    );
  }

  searchFiles(expedienteId: number, query: string, type?: string, parentId?: string): Observable<NodeDto[]> {
    let params = `?query=${encodeURIComponent(query)}`;
    if (type) params += `&type=${type}`;
    if (parentId) params += `&parentId=${parentId}`;

    return this.http.get<ApiResponse<NodeDto[]>>(
      `${this.apiUrl}/${expedienteId}/archivos/buscar${params}`
    ).pipe(map(response => response.data));
  }

  // Utilidades
  getFileIcon(node: NodeDto): string {
    if (node.type === 'FOLDER') return 'folder';
    
    if (node.isImage) return 'image';
    
    if (!node.mimeType) return 'description';
    
    if (node.mimeType.includes('pdf')) return 'picture_as_pdf';
    if (node.mimeType.includes('word')) return 'description';
    if (node.mimeType.includes('excel') || node.mimeType.includes('spreadsheet')) return 'table_chart';
    if (node.mimeType.includes('powerpoint') || node.mimeType.includes('presentation')) return 'slideshow';
    if (node.mimeType.includes('text')) return 'article';
    if (node.mimeType.includes('video')) return 'video_file';
    if (node.mimeType.includes('audio')) return 'audio_file';
    if (node.mimeType.includes('zip') || node.mimeType.includes('compressed')) return 'folder_zip';
    
    return 'description';
  }

  formatFileSize(bytes?: number): string {
    if (!bytes || bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
