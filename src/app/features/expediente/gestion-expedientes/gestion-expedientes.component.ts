import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-gestion-expedientes',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent],
  templateUrl: './gestion-expedientes.component.html',
  styleUrl: './gestion-expedientes.component.scss'
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
      next: (response: any) => {
        // Manejar tanto si la respuesta es un array como si tiene una propiedad 'data'
        this.expedientes = Array.isArray(response) ? response : (response?.data || []);
        this.actualizarFiltro();
        this.cargando = false;
      },
      error: (err: any) => {
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
        e.procesoNumero?.toLowerCase().includes(filtro) ||
        e.procesoNombre?.toLowerCase().includes(filtro)
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

  eliminarExpediente(expediente: ExpedienteDTO): void {
    if (!expediente.id) return;
    
    if (!confirm(`¿Está seguro de que desea eliminar el expediente "${expediente.nombre}"?`)) {
      return;
    }

    this.expedienteService.eliminarExpediente(expediente.id).subscribe({
      next: () => {
        alert('Expediente eliminado exitosamente');
        this.cargarExpedientes();
      },
      error: (err: any) => {
        console.error('Error al eliminar expediente:', err);
        alert('Error al eliminar el expediente. Por favor intente nuevamente.');
      }
    });
  }

  getEstadoBadgeClass(estado: string | undefined): string {
    switch (estado) {
      case 'ACTIVO':
        return 'bg-success';
      case 'PENDIENTE':
        return 'bg-warning';
      case 'CERRADO':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return '-';
    }
  }
}
