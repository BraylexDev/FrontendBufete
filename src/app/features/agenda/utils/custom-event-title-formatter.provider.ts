import { LOCALE_ID, Inject, Injectable } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { formatDate } from '@angular/common';

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
    constructor(@Inject(LOCALE_ID) private locale: string) {
        super();
    }

    override month(event: CalendarEvent): string {
        var str = event.title;
        var splitted = str.split(" <br> ", 2); 
        return `<b>${splitted[0]}</b> <br>${splitted[1]}`;
    }

    override week(event: CalendarEvent): string {
        var str = event.title;
        var splitted = str.split(" <br> ", 2); 
        return `<b>${splitted[0]}</b> <br>${splitted[1]}`;
    }

    override day(event: CalendarEvent): string {
        var str = event.title;
        var splitted = str.split(" <br> ", 2); 
        return `<b>${splitted[0]}</b> <br>${splitted[1]}`;
    }
}
