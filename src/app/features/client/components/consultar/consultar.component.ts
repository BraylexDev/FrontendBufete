import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../../../domain/services/cliente/cliente.service';
import { ConsultarClienteService } from '../../../../domain/services/ConsultarCliente/consultar-cliente.service';

@Component({
  selector: 'app-consultar',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.scss'
})
export class ConsultarComponent {

  private router = inject(Router);
  isLoading = signal(false);
  errorMessage = signal('');
  constructor(
    private authService: ClienteService,
    private infoclienteService: ConsultarClienteService
  ) {
  }

  nit: string = '';
  isValid: boolean = true;
  isEmpty: boolean = false;

  validar(cc: string) {
    if (cc === '') {
      this.isEmpty = true;
    }
    else {
      this.authService.getClienteById(cc).subscribe({
        next: (data) => {
          this.router.navigate(['/consulta/']);
          console.log(data);
          this.infoclienteService.changeId(cc);  // Enviar el dato al servicio
        },
        error: (error) => {
          this.isLoading.set(false);
          if (error.status === 401) {
            this.errorMessage.set('Usuario No Encontrado.');
          } else if (error.status === 0) {
            this.errorMessage.set('No se pudo conectar con el servidor.');
          }
        }
      });
    }
    if (cc === '123') {
      this.router.navigate(['/consulta/']);
    }
    this.isValid = false;
  }

  onFocus() {
    this.isEmpty = false;
    this.isValid = true;
  }

  sendIdToOtherComponent(id: string) {
    
  }
}
