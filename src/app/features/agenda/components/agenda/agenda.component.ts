import { Component } from '@angular/core';
import { CalendarComponent } from '../calendar/calendar.component';
import { SharedModule } from '../../../shared/shared.module';
import { EventService } from '../../../../domain/services/event/event.service';
import { CalendarEvent } from 'angular-calendar';
import { EventoDto } from '../../../../domain/models/event.model';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-agenda',
  imports: [CalendarComponent, SharedModule, CommonModule],
  providers: [
    DecimalPipe
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent {

  eventos: EventoDto[] = [];

  constructor(private eventService: EventService) {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.listarEventos().subscribe(
      (data) => {
        this.eventos = data.data;
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  conseguirFecha(date: Date): string {
    const anio = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); // Sumar 1 al mes y asegurar 2 dígitos
    const dia = String(date.getDate()).padStart(2, '0'); // Asegurar 2 dígitos

    const fechaManual = `${dia}/${mes}/${anio}`;
    return fechaManual;
  }

  consguirProceso(str: string): string{
    return str.split('<br>')[0];
  }
  consguirTitulo(str: string): string{
    return str.split('<br>')[1];
  }

  formatFecha(date: string): string{
    const fecha = new Date(date);
    let fechaFormateada: string;
    fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }); 

    return fechaFormateada;

  }
  formatHora(date: string): string{
    const fecha = new Date(date);
    let horaFormateada: string;
    horaFormateada = fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return horaFormateada;
    
  }
}
