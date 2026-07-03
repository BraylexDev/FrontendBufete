/**
 * GUÍA DE INTEGRACIÓN: Funcionalidad de Eliminación
 * 
 * Este archivo muestra cómo integrar la funcionalidad de eliminación
 * en componentes existentes de la aplicación.
 */

// ============================================
// EJEMPLO 1: Lista de Procesos con Eliminación
// ============================================

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcesoDTO } from '../../domain/models/proceso';
import { ProcesoService } from '../../domain/services/proceso/proceso.service';
import { DeleteActionComponent } from './shared/components/delete-action/delete-action.component';
import { DeletionService } from './shared/services/deletion.service';

/*
@Component({
  selector: 'app-procesos-list',
  standalone: true,
  imports: [CommonModule, DeleteActionComponent],
  template: `
    <div class="procesos-container">
      <h2>Mis Procesos</h2>
      
      <div class="procesos-grid" *ngIf="procesos.length > 0; else emptyState">
        <div class="proceso-card" *ngFor="let proceso of procesos">
          <div class="proceso-header">
            <h3>{{ proceso.nombre }}</h3>
            <span class="badge">{{ proceso.numeroProceso }}</span>
          </div>
          
          <div class="proceso-body">
            <p><strong>Cliente:</strong> {{ proceso.clienteNombre }}</p>
            <p><strong>Abogado:</strong> {{ proceso.abogadoResponsableNombre }}</p>
            <p><strong>Creado por:</strong> {{ proceso.createdByNombre }}</p>
            <p><strong>Estado:</strong> {{ proceso.estado }}</p>
          </div>
          
          <div class="proceso-actions">
            <!-- Botón de eliminar con validación de permisos -->
            <app-delete-action 
              [itemType]="'proceso'"
              [item]="proceso"
              (deleted)="onProcesoDeleted()">
            </app-delete-action>
          </div>
        </div>
      </div>
      
      <ng-template #emptyState>
        <p>No hay procesos disponibles</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .procesos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }
    
    .proceso-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      background: white;
    }
    
    .proceso-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 12px;
      border-top: 1px solid #eee;
      padding-top: 12px;
    }
  `]
})
export class ProcesosListComponent implements OnInit {
  procesos: ProcesoDTO[] = [];

  constructor(private procesoService: ProcesoService) {}

  ngOnInit(): void {
    this.loadProcesos();
  }

  private loadProcesos(): void {
    this.procesoService.listarProcesosByAbodado().subscribe({
      next: (response) => {
        this.procesos = response.data;
      },
      error: (err) => {
        console.error('Error al cargar procesos:', err);
      }
    });
  }

  onProcesoDeleted(): void {
    // Recargar la lista después de eliminar
    this.loadProcesos();
  }
}
*/

// ============================================
// EJEMPLO 2: Manejo Manual con DeletionService
// ============================================

/*
@Component({
  selector: 'app-proceso-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="proceso-detail" *ngIf="proceso">
      <h2>{{ proceso.nombre }}</h2>
      <p>{{ proceso.descripcion }}</p>
      
      <button 
        class="btn btn-danger"
        (click)="eliminarProceso()"
        [disabled]="isDeleting">
        {{ isDeleting ? 'Eliminando...' : 'Eliminar Proceso' }}
      </button>
    </div>
  `
})
export class ProcesoDetailComponent {
  proceso: ProcesoDTO | null = null;
  isDeleting = false;

  constructor(
    private deletionService: DeletionService,
    private router: Router
  ) {}

  eliminarProceso(): void {
    if (!this.proceso) return;

    this.isDeleting = true;

    this.deletionService.deleteWithConfirmation(this.proceso, 'proceso')
      .subscribe({
        next: () => {
          alert('Proceso eliminado exitosamente');
          this.router.navigate(['/procesos']);
        },
        error: (err) => {
          this.isDeleting = false;
          
          // No mostrar error si es cancelación del usuario
          if (err.message !== 'Eliminación cancelada por el usuario') {
            console.error('Error al eliminar:', err);
            alert('Error al eliminar el proceso. Por favor intente nuevamente.');
          }
        }
      });
  }
}
*/

// ============================================
// EJEMPLO 3: Tabla de Expedientes
// ============================================

/*
@Component({
  selector: 'app-expedientes-table',
  standalone: true,
  imports: [CommonModule, DeleteActionComponent],
  template: `
    <table class="table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Proceso</th>
          <th>Estado</th>
          <th>Creado por</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let expediente of expedientes">
          <td>{{ expediente.nombre }}</td>
          <td>{{ expediente.procesoNombre }}</td>
          <td>{{ expediente.estado }}</td>
          <td>{{ expediente.createdByNombre }}</td>
          <td>
            <app-delete-action 
              [itemType]="'expediente'"
              [item]="expediente"
              (deleted)="onExpedienteDeleted()">
            </app-delete-action>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class ExpedientesTableComponent implements OnInit {
  expedientes: ExpedienteDTO[] = [];

  constructor(private expedienteService: ExpedienteService) {}

  ngOnInit(): void {
    this.loadExpedientes();
  }

  private loadExpedientes(): void {
    this.expedienteService.listarExpedientes().subscribe({
      next: (data) => {
        this.expedientes = data;
      },
      error: (err) => {
        console.error('Error al cargar expedientes:', err);
      }
    });
  }

  onExpedienteDeleted(): void {
    this.loadExpedientes();
  }
}
*/

// ============================================
// RESUMEN DE INTEGRACIÓN
// ============================================

/**
 * PASOS PARA INTEGRAR EN UN COMPONENTE EXISTENTE:
 * 
 * 1. Importar DeleteActionComponent:
 *    import { DeleteActionComponent } from '@shared/components/delete-action/delete-action.component';
 *
 * 2. Agregar a imports del componente:
 *    imports: [CommonModule, DeleteActionComponent]
 *
 * 3. Asegurar que los DTOs incluyan createdById:
 *    - ProcesoDTO debe tener createdById
 *    - ExpedienteDTO debe tener createdById
 *
 * 4. Usar en el template:
 *    <app-delete-action 
 *      [itemType]="'proceso'"
 *      [item]="miProceso"
 *      (deleted)="onDeleted()">
 *    </app-delete-action>
 *
 * 5. Implementar manejador onDeleted():
 *    onDeleted(): void {
 *      // Recargar datos o navegar
 *      this.loadData();
 *    }
 *
 * 6. IMPORTANTE: Asegurar que el backend:
 *    - Incluya createdById en las respuestas
 *    - Valide permisos en DELETE endpoints
 *    - Retorne 403 Forbidden si no tiene permisos
 */

export {}; // Evitar errores de compilación
