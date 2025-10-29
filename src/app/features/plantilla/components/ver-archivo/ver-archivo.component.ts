import { Component } from '@angular/core';

@Component({
  selector: 'app-ver-archivo',
  standalone: true,
  imports: [],
  templateUrl: './ver-archivo.component.html',
  styleUrl: './ver-archivo.component.scss'
})
export class VerArchivoComponent {
  /* config: IConfig = {
    document: {
      fileType: "docx",
      key: "Khirz6zTPdfd7",
      title: "Example Document Title.docx",
      
      url: "/assets/docs/plantilla/ejm.docx",
    },
    documentType: "word",
    editorConfig: {
      callbackUrl: "https://example.com/url-to-callback.ashx",
    },
  }
  onDocumentReady = () => {
    console.log("Document is loaded");
  }
  onLoadComponentError = (errorCode: any, errorDescription: any) => {
    switch (errorCode) {
      case -1: // Unknown error loading component
        console.log(errorDescription);
        break;
      case -2: // Error load DocsAPI from http://documentserver/
        console.log(errorDescription);
        break;
      case -3: // DocsAPI is not defined
        console.log(errorDescription);
        break;
    }
  } */

}
