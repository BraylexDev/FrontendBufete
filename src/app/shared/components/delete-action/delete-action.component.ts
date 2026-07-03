import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcesoDTO } from '../../../domain/models/proceso';
import { ExpedienteDTO } from '../../../domain/models/expediente';
import { ProcesoService } from '../../../domain/services/proceso/proceso.service';
import { ExpedienteService } from '../../../domain/services/expediente/expediente.service';

export type ItemType = 'proceso' | 'expediente';

@Component({
  selector: 'app-delete-action',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-buttons" *ngIf="canDelete()">
      <button 
        class="btn btn-sm btn-danger"
        (click)="onDelete()"
        [disabled]="isDeleting()"
        title="Eliminar">
        <span *ngIf="!isDeleting()">🗑️ Eliminar</span>
        <span *ngIf="isDeleting()">Eliminando...</span>
      </button>
    </div>
  `,
  styles: [`
    .action-buttons {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.3s ease;
    }
    
    .btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .btn-danger:hover:not(:disabled) {
      background-color: #c82333;
    }
  `]
})
export class DeleteActionComponent {
  @Input() itemType: ItemType = 'proceso';
  @Input() item: ProcesoDTO | ExpedienteDTO | null = null;
  @Output() deleted = new EventEmitter<void>();
  
  isDeleting = computed(() => this._isDeleting);
  private _isDeleting = false;

  constructor(
    private procesoService: ProcesoService,
    private expedienteService: ExpedienteService
  ) {}

  canDelete(): boolean {
    if (!this.item) return false;
    
    if (this.itemType === 'proceso') {
      return this.procesoService.canDelete(this.item as ProcesoDTO);
    } else {
      return this.expedienteService.canDelete(this.item as ExpedienteDTO);
    }
  }

  onDelete(): void {
    if (!this.item || !this.canDelete()) return;

    const confirmMessage = this.itemType === 'proceso' 
      ? `¿Está seguro de que desea eliminar el proceso "${(this.item as ProcesoDTO).nombre}"?`
      : `¿Está seguro de que desea eliminar el expediente "${(this.item as ExpedienteDTO).nombre}"?`;

    if (!confirm(confirmMessage)) return;

    this._isDeleting = true;
    const id = this.item.id as number;

    if (!id) {
      this._isDeleting = false;
      alert('Error: No se pudo identificar el elemento a eliminar');
      return;
    }

    const deleteCall = this.itemType === 'proceso'
      ? this.procesoService.eliminarProceso(id)
      : this.expedienteService.eliminarExpediente(id);

    deleteCall.subscribe({
      next: () => {
        this._isDeleting = false;
        alert(`${this.itemType === 'proceso' ? 'Proceso' : 'Expediente'} eliminado exitosamente`);
        this.deleted.emit();
      },
      error: (err) => {
        this._isDeleting = false;
        console.error(`Error al eliminar ${this.itemType}:`, err);
        alert(`Error al eliminar el ${this.itemType}. Por favor intente nuevamente.`);
      }
    });
  }
}
