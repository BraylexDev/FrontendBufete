import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CardComponent } from '../shared/components/card/card.component';
import { ProcesoService } from '../../domain/services/proceso/proceso.service';

interface Activity {
  type: string;
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
}

interface Event {
  title: string;
  description: string;
  date: Date;
}

interface User {
  nombre: string;
  apellido: string;
  rol: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SharedModule, RouterModule, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  totalProcesos = 0;
  totalExpedientes = 0;
  totalClientes = 0;

  constructor(private svc: ProcesoService){

  }

  ngOnInit() {
    this.cargarProcesos();
  }


  private loadStatistics() {
    this.totalProcesos = 45;
    this.totalExpedientes = 128;
    this.totalClientes = 89;
  }


  cargarProcesos(){
    this.svc.listarProcesosByAbodado()
      .subscribe(
        {
          next: (data) => {
              this.totalProcesos = data.data.length
          },
          error: err => console.error('Error fetching items', err)
        }
      )
  }
}