import { Component } from '@angular/core';
import { Alert, AlertService } from '../service/alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {

  alerts: Alert[] = [];
  show: boolean = false;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts
    })
  }

  getIcon(type: string): string {
    switch (type) {
      case 'danger':
        return 'bi bi-x-circle'
      case 'info':
        return 'bi bi-info-circle'
      case 'success':
        return 'bi bi-check-circle'
      case 'warning':
        return 'bi bi-exclamation-circle'
      default:
        return ''
    }
  }

  closeAlert(id: number) {
    this.alertService.removeAlert(id)
  }

}
