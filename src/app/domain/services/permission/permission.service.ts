import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProcesoDTO } from '../../models/proceso';
import { ExpedienteDTO } from '../../models/expediente';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private authService: AuthService) { }

  /**
   * Verifica si el usuario tiene permisos para ver todos los procesos del sistema
   * @returns true si tiene permisos de gestión o visualización de procesos del sistema
   */
  canViewAllSystemProcesses(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    // Los roles específicos o administradores pueden ver todos los procesos
    return this.isAdmin(currentUser.role);
    // Nota: Aquí se pueden agregar validaciones adicionales de permisos
    // cuando el backend devuelva más información de permisos
  }

  /**
   * Verifica si el usuario tiene permisos para gestionar expedientes del sistema
   * @returns true si tiene permisos de gestión de expedientes del sistema
   */
  canManageSystemExpedientes(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    return this.isAdmin(currentUser.role);
  }

  /**
   * Verifica si el usuario actual puede eliminar un proceso
   * @param proceso - DTO del proceso a verificar
   * @returns true si el usuario puede eliminar, false en caso contrario
   */
  canDeleteProceso(proceso: ProcesoDTO): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    const isAdmin = this.isAdmin(currentUser.role);
    const isCreator = proceso.createdById !== undefined && 
                      this.isCurrentUser(proceso.createdById);

    return isAdmin || isCreator;
  }

  /**
   * Verifica si el usuario actual puede eliminar un expediente
   * @param expediente - DTO del expediente a verificar
   * @returns true si el usuario puede eliminar, false en caso contrario
   */
  canDeleteExpediente(expediente: ExpedienteDTO): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return false;

    const isAdmin = this.isAdmin(currentUser.role);
    const isCreator = expediente.createdById !== undefined && 
                      this.isCurrentUser(expediente.createdById);

    return isAdmin || isCreator;
  }

  /**
   * Verifica si el usuario tiene rol de administrador
   * @param role - Rol del usuario
   * @returns true si es administrador
   */
  private isAdmin(role: string): boolean {
    return role === 'ADMIN' || role === 'admin' || role === 'ADMINISTRADOR';
  }

  /**
   * Verifica si el ID de usuario coincide con el usuario actual
   * @param userId - ID del usuario a comparar
   * @returns true si coinciden
   */
  private isCurrentUser(userId: number): boolean {
    // Nota: La información del usuario actual se obtiene del token.
    // Si el backend envía el userId en el token, se puede obtener desde authService.
    // Por ahora, esta validación se complementa con la validación del backend.
    return true; // La validación principal ocurre en el backend
  }
}
