import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { DeleteActionComponent } from '../../../shared/components/delete-action/delete-action.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-gestion-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, DeleteActionComponent, CardComponent],
  templateUrl: './gestion-expedientes.html',
  styleUrl: './gestion-expedientes.scss'
})
export class GestionExpedientesComponent implements OnInit {
  private expedienteService = inject(ExpedienteService);

  expedientes: ExpedienteDTO[] = [];
  expedientesFiltrados: ExpedienteDTO[] = [];
  filtroBusqueda: string = '';
  cargando: boolean = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarExpedientes();
  }

  cargarExpedientes(): void {
    this.cargando = true;
    this.error = null;

    this.expedienteService.listarExpedientes().subscribe({
      next: (data) => {
        this.expedientes = data || [];
        this.actualizarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
        this.error = 'Error al cargar expedientes. Por favor intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  actualizarFiltro(): void {
    const filtro = this.filtroBusqueda.toLowerCase().trim();

    if (!filtro) {
      this.expedientesFiltrados = [...this.expedientes];
    } else {
      this.expedientesFiltrados = this.expedientes.filter(e =>
        e.nombre?.toLowerCase().includes(filtro) ||
        e.procesoNombre?.toLowerCase().includes(filtro) ||
        e.createdByNombre?.toLowerCase().includes(filtro)
      );
    }
  }

  onBusquedaChange(): void {
    this.actualizarFiltro();
  }

  onExpedienteEliminado(): void {
    // Recargar la lista después de eliminar
    this.cargarExpedientes();
  }

  /**
   * Obtiene el badge de estado apropiado
   */
  getEstadoBadgeClass(estado: string | undefined): string {
    switch (estado?.toUpperCase()) {
      case 'ACTIVO':
        return 'bg-success';
      case 'PENDIENTE':
        return 'bg-warning';
      case 'CERRADO':
        return 'bg-secondary';
      case 'ARCHIVADO':
        return 'bg-dark';
      default:
        return 'bg-light text-dark';
    }
  }

  /**
   * Formatea la fecha para mostrar
   */
  formatDate(date: string | undefined): string {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-ES');
    } catch {
      return date;
    }
  }
}
