import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type AlertType = 'success' | 'danger' | 'info' | 'warning'

export interface Alert {
	/* title: string */
	message: string
	type: AlertType
	id: number
	show: boolean
	/* url: string */
}


@Injectable({
	providedIn: 'root'
})
export class AlertService {

	constructor() { }

	private alertsSubject = new Subject<Alert[]>();
	alerts$ = this.alertsSubject.asObservable();
	private alerts: Alert[] = [];
	private idCounter = 0;

	showAlert(message: string, type: AlertType) {
		const alert: Alert = { message, type, id: this.idCounter++, show: false }
		this.alerts = [alert, ...this.alerts]
		this.alertsSubject.next(this.alerts)

		setTimeout(() => {
			alert.show = true
			this.alertsSubject.next(this.alerts)
		}, 10) // Pequeño retraso para activar la animación de fade-in

		setTimeout(() => {
			this.fadeOutAlert(alert.id)
		}, 4000) // Iniciar desvanecimiento después de 3 segundos
	}

	fadeOutAlert(id: number) {
		const alert = this.alerts.find(alert => alert.id === id)
		if (alert) {
			alert.show = false
			this.alertsSubject.next(this.alerts)
			setTimeout(() => {
				this.removeAlert(id)
			}, 500) 
		}
	}

	removeAlert(id: number) {
		this.alerts = this.alerts.filter(alert => alert.id !== id)
		this.alertsSubject.next(this.alerts)
	}

}
