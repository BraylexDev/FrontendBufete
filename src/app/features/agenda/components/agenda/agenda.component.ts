import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarComponent } from '../calendar/calendar.component';
import { SharedModule } from '../../../shared/shared.module';
import { EventService } from '../../../../domain/services/event/event.service';
import { EventoDto } from '../../../../domain/models/event.model';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agenda',
  imports: [CalendarComponent, SharedModule, CommonModule],
  providers: [
    DecimalPipe
  ],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss'
})
export class AgendaComponent implements OnInit, OnDestroy {

  private sub!: Subscription;
  eventos: EventoDto[] = [];

  paginaActual: number = 1;
  eventosPorPagina: number = 4;

  constructor(private eventService: EventService) {
  }
  ngOnInit(): void {
    this.loadEvents();
    this.sub = this.eventService.eventosActualizados$.subscribe(() => {
      this.loadEvents();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get eventosPaginados() {
    const inicio = (this.paginaActual - 1) * this.eventosPorPagina;
    const fin = inicio + this.eventosPorPagina;
    return this.eventos.slice(inicio, fin);
  }

  paginaSiguiente(): void {
    if (this.paginaActual < this.totalPaginas) {
      this.paginaActual++;
    }
  }

  paginaAnterior(): void {
    if (this.paginaActual > 1) {
      this.paginaActual--;
    }
  }

  // Calculamos el total de páginas dinámicamente
  get totalPaginas(): number {
    return Math.ceil(this.eventos.length / this.eventosPorPagina);
  }

  loadEvents(): void {
    this.eventService.listarEventos().subscribe(
      (data) => {
        this.eventos = data.data;
        this.eventos.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
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

  consguirProceso(str?: string): string {
    if (str) {
      return str.split('<br>')[0];
    }
    return '';
  }
  consguirTitulo(str?: string): string {
    if (str) {
      return str.split('<br>')[1];
    }
    return '';
  }

  formatFecha(date: string): string {
    const fecha = new Date(date);
    let fechaFormateada: string;
    fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return fechaFormateada;
  }

  formatDia(date: string): string {
    const fecha = new Date(date);
    let fechaFormateada: string;
    fechaFormateada = fecha.toLocaleDateString('es-ES', {
      day: '2-digit'
    });

    return fechaFormateada;
  }

  formatMes(date: string): string {
    const fecha = new Date(date);
    let fechaFormateada: string;
    fechaFormateada = fecha.toLocaleDateString('es-ES', {
      month: 'short'
    });

    return fechaFormateada;
  }

  formatAno(date: string): string {
    const fecha = new Date(date);
    let fechaFormateada: string;
    fechaFormateada = fecha.toLocaleDateString('es-ES', {
      year: 'numeric'
    });

    return fechaFormateada;
  }

  formatHora(date: string): string {
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
