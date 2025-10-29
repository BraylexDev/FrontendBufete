import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'angular-calendar';
import { CalendarHeaderComponent } from './calendar-header.component';

registerLocaleData(localeEs);

@NgModule({
    imports: [CommonModule, FormsModule, CalendarModule, CalendarHeaderComponent],
    exports: [CalendarHeaderComponent],
})
export class DemoUtilsModule { }
