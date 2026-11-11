
import { Component, inject, Input, OnInit } from '@angular/core';
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

  @Input() id!: string;
  @Input() jurisdiccion!: string;
  @Input() tipoAsunto!: string;

  private readonly route = inject(ActivatedRoute);

  expedienteId: string | null = null;
  expedienteName = 'Expediente';
  expedienteRootNodeId = '';
  folderNodeId = '';
  rootNodeId = '';

  activeTab = 'archivos';

  expe!: ExpedienteDTO;

  constructor(
    private router: Router,
    private svcExp: ExpedienteService
  ) {}

  ngOnInit(): void {

    this.expedienteId = this.route.snapshot.paramMap.get('id');
    const navigationState = history.state;

    this.folderNodeId =
    navigationState?.folderNodeId || '';
      
    this.route.queryParamMap.subscribe(params => {
      this.jurisdiccion = params.get('jurisdiccion') ?? '';
      this.tipoAsunto = params.get('tipoAsunto') ?? '';
      this.activeTab = params.get('tab') ?? 'archivos';

      const folderFromUrl = params.get('folderNodeId');

      if (folderFromUrl) {
        this.folderNodeId = folderFromUrl;
      }

      if (this.folderNodeId) {
        this.rootNodeId = this.folderNodeId;
      }
    });

    if (this.expedienteId) {
      this.cargarExpediente(this.expedienteId);
    }
  }

  cargarExpediente(id: string): void {

    this.svcExp.getExpedienteById(parseInt(id, 10))
      .subscribe({
        next: (data) => {
          this.expe = data.data;
          this.expedienteName = this.expe.nombre;
          this.expedienteRootNodeId = this.expe.rootNodeId;

          if (!this.folderNodeId) {
            this.rootNodeId = this.expedienteRootNodeId;
          }

          console.log('Raíz del expediente:', this.expedienteRootNodeId);
          console.log('Carpeta que se abrirá:', this.rootNodeId);
        },
        error: err => {
          console.error('Error fetching expediente:', err);
        }
      });
  }

  volver(): void {
    this.router.navigate(['/admin/gestion-procesos'], {
      queryParams: {
        jurisdiccion: this.jurisdiccion,
        tipoAsunto: this.tipoAsunto
      }
    });
  }
}
