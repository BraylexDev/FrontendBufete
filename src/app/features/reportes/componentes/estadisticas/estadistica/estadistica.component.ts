import { Component } from '@angular/core';
import { SharedModule } from '../../../../shared/shared.module';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { ChartDB } from '../../../../../domain/services/chartData/chartData';

@Component({
  selector: 'app-estadistica',
  imports: [SharedModule, NgApexchartsModule],
  templateUrl: './estadistica.component.html',
  styleUrl: './estadistica.component.scss'
})
export class EstadisticaComponent {

  cards = [
    {
      background: 'bg-c-blue',
      title: 'Total Sentencias',
      icon: 'icon-shopping-cart',
      text: 'Completed Orders',
      number: '12',
      no: '351'
    },
    {
      background: 'bg-c-green',
      title: 'Fallos Favorables',
      icon: 'icon-tag',
      text: 'This Month',
      number: '8',
      no: '213'
    },
    {
      background: 'bg-c-yellow',
      title: 'Tiempo promedio',
      icon: 'icon-repeat',
      text: 'This Month',
      number: '26 días',
      no: '$5,032'
    }
  ];

  chartDB: any;
  bar2CAC!: ApexOptions;
  data: any;

  line2CAC!: ApexOptions;

  constructor(){
    this.chartDB = ChartDB;
    const {bar2CAC} =this.chartDB;

    this.line2CAC = {
      chart: {
        height: 300,
        type: 'line',
        animations: {
          enabled: true,
          /* easing: 'linear', */
          dynamicAnimation: {
            speed: 2000
          }
        },
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      series: [
        {
          data: this.data
        }
      ],
      colors: ['#4680ff'],
      title: {
        text: 'Dynamic Updating Chart',
        align: 'left'
      },
      markers: {
        size: 0
      },
      xaxis: {
        type: 'datetime',
        range: 777600000
      },
      yaxis: {
        max: 100
      },
      legend: {
        show: false
      }
    };

    this.bar2CAC = bar2CAC;

  }

}
