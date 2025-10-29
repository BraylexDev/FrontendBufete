import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FileExplorerComponent } from '../../../../fileExplorer/file-explorer/file-explorer.component';
import { ExpedienteService } from '../../../../../domain/services/expediente/expediente.service';
import { ExpedienteDTO } from '../../../../../domain/models/expediente';
@Component({
  selector: 'app-expediente-detail',
  standalone: true,
  imports: [CommonModule, FileExplorerComponent],
  templateUrl: './expediente-detail.component.html',
  styleUrl: './expediente-detail.component.scss'
})
export class ExpedienteDetailComponent implements OnInit {
  expedienteId: string | null = null;
  expedienteName: string = 'Expediente';
  rootNodeId: string = '';
  activeTab: string = 'archivos';

  expe!: ExpedienteDTO;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svcExp: ExpedienteService
  ) {}

  ngOnInit() {
    // OPCIÓN 1: Obtener parámetros de la ruta
    this.expedienteId = this.route.snapshot.paramMap.get('id');
    
    // OPCIÓN 2: Obtener query params
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
      if (params['rootNodeId']) {
        this.rootNodeId = params['rootNodeId'];
      }
    });

    // OPCIÓN 3: Obtener estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      if (state.rootNodeId) {
        this.rootNodeId = state.rootNodeId;
      }
    }

    // Cargar datos del expediente
    if (this.expedienteId) {
      this.cargarExpediente(this.expedienteId);
    }
  }

  cargarExpediente(id: string) {
    this.svcExp.getExpedienteById(parseInt(id))
        .subscribe(
          {
            next: (data) => {
              this.expe = data.data;
              this.rootNodeId = this.expe.rootNodeId;
              this.expedienteName = this.expe.nombre;
            },
            error: err => console.error('Error fetching items', err)
          }
        )
  }

  volver() {
    this.router.navigate(['/expedientes']);
  }
}
