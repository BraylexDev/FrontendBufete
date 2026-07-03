import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ProcesoDTO } from '../../domain/models/proceso';
import { ExpedienteDTO } from '../../domain/models/expediente';
import { ProcesoService } from '../../domain/services/proceso/proceso.service';
import { ExpedienteService } from '../../domain/services/expediente/expediente.service';

export type DeletableItem = ProcesoDTO | ExpedienteDTO;
export type ItemType = 'proceso' | 'expediente';

@Injectable({
  providedIn: 'root'
})
export class DeletionService {

  constructor(
    private procesoService: ProcesoService,
    private expedienteService: ExpedienteService
  ) { }

  /**
   * Solicita confirmación y elimina un ítem
   * @param item - Ítem a eliminar
   * @param itemType - Tipo de ítem
   * @returns Observable de la eliminación
   */
  deleteWithConfirmation(item: DeletableItem, itemType: ItemType): Observable<any> {
    if (!this.canDelete(item, itemType)) {
      return throwError(() => new Error('Sin permisos para eliminar este elemento'));
    }

    const confirmMessage = this.getConfirmationMessage(item, itemType);
    
    if (!confirm(confirmMessage)) {
      return throwError(() => new Error('Eliminación cancelada por el usuario'));
    }

    return this.delete(item, itemType);
  }

  /**
   * Verifica si se puede eliminar un ítem
   * @param item - Ítem a verificar
   * @param itemType - Tipo de ítem
   * @returns true si puede eliminarse
   */
  canDelete(item: DeletableItem, itemType: ItemType): boolean {
    if (itemType === 'proceso') {
      return this.procesoService.canDelete(item as ProcesoDTO);
    } else {
      return this.expedienteService.canDelete(item as ExpedienteDTO);
    }
  }

  /**
   * Elimina un ítem
   * @param item - Ítem a eliminar
   * @param itemType - Tipo de ítem
   * @returns Observable de la eliminación
   */
  delete(item: DeletableItem, itemType: ItemType): Observable<any> {
    if (itemType === 'proceso') {
      return this.procesoService.eliminarProceso(item.id);
    } else {
      return this.expedienteService.eliminarExpediente(item.id);
    }
  }

  /**
   * Obtiene el mensaje de confirmación apropiado
   * @param item - Ítem a eliminar
   * @param itemType - Tipo de ítem
   * @returns Mensaje de confirmación
   */
  private getConfirmationMessage(item: DeletableItem, itemType: ItemType): string {
    const itemName = itemType === 'proceso' 
      ? (item as ProcesoDTO).nombre 
      : (item as ExpedienteDTO).nombre;
    
    const typeLabel = itemType === 'proceso' ? 'proceso' : 'expediente';
    
    return `¿Está seguro de que desea eliminar el ${typeLabel} "${itemName}"? Esta acción no se puede deshacer.`;
  }
}
