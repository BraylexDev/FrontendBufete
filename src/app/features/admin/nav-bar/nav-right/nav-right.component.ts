// angular import
import { Component, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../../../shared/shared.module';
import { AuthService } from '../../../../domain/services/auth/auth.service';
import { EventService } from '../../../../domain/services/event/event.service';
import { EventoDto } from '../../../../domain/models/event.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule, CommonModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig],
  animations: [
    trigger('slideInOutLeft', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
    trigger('slideInOutRight', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)' })),
      ]),
    ]),
  ],
})
export class NavRightComponent implements OnInit {
  visibleUserList: boolean;
  chatMessage: boolean;
  friendId!: number;
  nombre?: string;

  eventos: EventoDto[] = [];
  private sub!: Subscription;

  constructor(
    private authService: AuthService,
    private eventService: EventService
  ) {
    this.visibleUserList = false;
    this.chatMessage = false;
    this.nombre = authService.getUser();
  }
  ngOnInit(): void {
    this.loadEvents();
    this.sub = this.eventService.eventosActualizados$.subscribe(() => {
      this.loadEvents();
    });
  }

  logout(): void {
    this.authService.logout();
  }

  // public method
  // eslint-disable-next-line
  onChatToggle(friendID: any) {
    this.friendId = friendID;
    this.chatMessage = !this.chatMessage;
  }

  loadEvents(): void {
    this.eventService.listarEventos().subscribe(
      (data) => {
        this.eventos = data.data;
        this.eventos.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
        this.eventos = this.eventos.slice(0, 4);
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  convertDateToText(fechaString: string): string {
    const fechaObjeto: Date = new Date(fechaString);
    const formatter = new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const fechaTexto = formatter.format(fechaObjeto);
    return fechaTexto;
  }

  events24Horas(): boolean {

    const nowTimestamp = Date.now();
    const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
    const timestamp24HoursAgo = nowTimestamp + twentyFourHoursInMillis;

    const objetcsFiltres = this.eventos.filter(objeto => {
      const fechaObjeto = new Date(objeto.fechaInicio).getTime();

      return fechaObjeto < timestamp24HoursAgo;
    });
    if (objetcsFiltres.length > 0) {
      return true
    }
    return false;
  }
}
