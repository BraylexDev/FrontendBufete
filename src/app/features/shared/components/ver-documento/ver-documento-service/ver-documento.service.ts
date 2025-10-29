import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VerDocumentoService {

  private urlDocumento!: string;

  constructor() { }

  set urlDocumentToConsult(url) {
    this.urlDocumento = url;
  }

  get urlDocumentToConsult() {
    return this.urlDocumento;
  }
}
