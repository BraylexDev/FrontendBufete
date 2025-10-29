import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consultar',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './consultar.component.html',
  styleUrl: './consultar.component.scss'
})
export class ConsultarComponent {

  private router = inject(Router);

  nit: string = '';
  isValid: boolean = true;
  isEmpty: boolean = false;

  validar(cc: string){
    if(cc === ''){
      this.isEmpty = true;
    }
    if(cc === '123'){
      this.router.navigate(['/consulta/']);
    }
    this.isValid = false;
  }

  onFocus(){
    this.isEmpty = false;
    this.isValid = true;
  }
}
