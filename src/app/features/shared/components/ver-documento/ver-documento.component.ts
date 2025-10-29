import { Component, inject, AfterViewInit, OnInit  } from '@angular/core';
import { VerDocumentoService } from './ver-documento-service/ver-documento.service';
import { DomSanitizer, SafeResourceUrl, SafeHtml  } from '@angular/platform-browser';
import { NgxDocViewerModule } from 'ngx-doc-viewer';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ver-documento',
  imports: [NgxDocViewerModule],
  templateUrl: './ver-documento.component.html',
  styleUrl: './ver-documento.component.scss'
})
export class VerDocumentoComponent implements OnInit{
  documentData!: SafeResourceUrl;
  constructor(private urlService: VerDocumentoService, private sanitizer: DomSanitizer){
  } 
  ngOnInit() {
    const url: string = this.urlService.urlDocumentToConsult;
    console.log(url);
    this.documentData = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
