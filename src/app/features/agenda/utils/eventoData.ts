import { CalendarEvent } from "angular-calendar";
import { EventoDto } from "../../../domain/models/event.model";

export interface EventoData {
    evento: EventoDto;
    infoCalendar: CalendarEvent; 
}