import { registerLocaleData } from '@angular/common';
import { Component, ChangeDetectionStrategy, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { CalendarEvent, CalendarView, CalendarMonthViewDay, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarEventTitleFormatter } from 'angular-calendar';
import { SharedModule } from '../../../shared/shared.module';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import localeEs from '@angular/common/locales/es';
import { EventModalComponent } from '../event-modal/event-modal.component';
import { CustomEventTitleFormatter } from '../../utils/custom-event-title-formatter.provider';

import {
  subMonths,
  addMonths,
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { Subject } from 'rxjs';
import { EventoData } from '../../utils/eventoData';
import { EventService } from '../../../../domain/services/event/event.service';
import { CreateEventoRequest, EventoDto } from '../../../../domain/models/event.model';
import { ProcesoService } from '../../../../domain/services/proceso/proceso.service';
import { Proceso, ProcesoDTO } from '../../../../domain/models/proceso';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';

registerLocaleData(localeEs);

/* NEWWWWWWWW */
type CalendarPeriod = 'day' | 'week' | 'month';

function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths,
  }[period](date, amount);
}

function subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: subDays,
    week: subWeeks,
    month: subMonths,
  }[period](date, amount);
}

function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth,
  }[period](date);
}

function endOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: endOfDay,
    week: endOfWeek,
    month: endOfMonth,
  }[period](date);
}

/* End neeeeewwww */

@Component({
  selector: 'app-calendar',
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar.component.html',
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }
  ],
  styleUrl: './calendar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CalendarComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  modalData!: {
    action: string;
    event: CalendarEvent;
  };
  activeDayIsOpen: boolean = false;

  refresh: Subject<void> = new Subject<void>();

  view: CalendarView | CalendarPeriod = CalendarView.Month;
  viewDate: Date = new Date();

  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
        this.activeDayIsOpen = false;
      },
    },
  ];

  events: CalendarEvent[] = [];
  eventos: EventoDto[] = [];

  locale: string = 'es';
  currentDate: Date = new Date();

  minDate: Date = subMonths(new Date(), 0);
  maxDate: Date = addMonths(new Date(), 12);
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;

  procesos!: ProcesoDTO[];

  ngOnInit(): void {
    this.loadEvents();
    
  }

  constructor(private modalService: NgbModal, private eventService: EventService, private processService: ProcesoService, private alertService: AlertService) {
    this.dateOrViewChanged();
    this.loadProcesos();
  }

  loadProcesos(){
    this.processService.listarProcesosByAbodado()
      .subscribe(
        {
          next: data => {
            this.procesos = data.data;
          }
        }
      );
  }

  loadEvents(): void {
    this.eventService.listarEventos().subscribe(
      (data) => {
        this.events = data.data.map((eventData) => ({
          id:eventData.id,
          start: new Date(eventData.fechaInicio),
          title: eventData.descripcion || eventData.titulo,
          allDay: eventData.allDay,
          actions: this.actions,
          resizable: { beforeStart: true, afterEnd: true },
          /* draggable: true */
        }));
        this.refresh.next();
        this.eventos = data.data;
      },
      (error) => {
        console.error('Error fetching events:', error);
      }
    );
  }

  /* -------------------------------------------------------------- */

  increment(): void {
    this.changeDate(addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= new Date(this.minDate.getTime() - 24 * 60 * 60 * 1000) && date <= this.maxDate;
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      endOfPeriod(this.view, subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  /* ------------------------------------------------------------------------ */

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      }
      else { this.activeDayIsOpen = true; }
      this.viewDate = date;
      if (!this.activeDayIsOpen) {
        this.openModal(date, true);
      }
    }
  }

  openModal(date: Date, all: boolean) {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    const modalRef = this.modalService.open(EventModalComponent);
    modalRef.componentInstance.procesos = this.procesos
    modalRef.componentInstance.modalTitle = 'Registrar Evento';
    modalRef.componentInstance.dataEvento = {
      evento: {
        titulo: '',
        tipoEventoId: 2,
        fechaInicio: '',
        allDay: false
      },
      infoCalendar: {
        start: date, title: '', end: date, allDay: all, actions: this.actions,
        resizable: { beforeStart: true, afterEnd: true, },
        /* draggable: true */
      }
    };
    modalRef.componentInstance.eventSaved.subscribe((newEvent: EventoData) => {
      if (newEvent.infoCalendar.end) {

        let fechaI: string = newEvent.infoCalendar.start.toISOString();

        let formData: CreateEventoRequest = {
          titulo: newEvent.evento.titulo,
          descripcion: newEvent.infoCalendar.title,
          tipoEventoId: 2,
          fechaInicio: fechaI,
          fechaFin: newEvent.evento.fechaFin,
          allDay: newEvent.evento.allDay || true,
          procesoId: newEvent.evento.procesoId,
          expedienteId: newEvent.evento.expedienteId
        }
        this.eventService.crearEvento(formData).subscribe({
          next: () => {
            this.events = [...this.events, newEvent.infoCalendar];
            this.refresh.next();
            this.eventService.notificarCambio();
          },
          error: (err) => {
            console.error('Error al guardar el evento', err);
          }
        });
      }
    });
  }

  hourSegmentClicked(date: Date) {
    this.openModal(date, false);
  }

  /* ---------------------------------End Modal ------------------------------- */

  handleEvent(action: string, event: CalendarEvent): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur();
    this.modalData = { event, action };

    if (action.toString() === "Deleted") {
      
      this.eventos.forEach(element => {
        if (element.id === event.id) {
          this.eventService.eliminarEvento(element.id || -1)
            .subscribe(
              () => {
                this.refresh.next();
                this.eventService.notificarCambio();
                this.triggerAlert('Eliminación Exitosa', 'success');
              }
            );
        }
      });
    }
    if (action.toString() === "Edited") {
      console.log('edit');
    }
    /* this.modal.open(this.modalContent, { size: 'lg' }); */
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('2', event);
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter((event) => event !== eventToDelete);
    console.log("delete");
  }

  setView(view: CalendarView) {
    this.view = view;
    console.log("sett");
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }
}
