import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  downloadFile(url: string): Observable<Blob> {
    return this.http.get(this.baseUrl+'/'+url, { responseType: 'blob' });
  }

}
