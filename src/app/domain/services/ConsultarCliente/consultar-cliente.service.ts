import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'; 

@Injectable({
  providedIn: 'root'
})
export class ConsultarClienteService {
  private idSource = new BehaviorSubject<string>(localStorage.getItem('clienteId') || '');  // Inicia con el valor guardado en localStorage si existe
  currentId = this.idSource.asObservable();

  changeId(id: string) {
    this.idSource.next(id);
    localStorage.setItem('clienteId', id);  // Guarda el ID en localStorage
  }
}
