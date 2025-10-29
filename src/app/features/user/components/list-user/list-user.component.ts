import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CardComponent } from "../../../shared/components/card/card.component";
import { UserService } from '../../../../domain/services/user/user.service';
import { User } from '../../../../domain/models/user.model';
import { NgFor, NgIf } from '@angular/common';
import { Role } from '../../../../domain/models/role.model';
import { RoleService } from '../../../../domain/services/role/role.service';
import { Router, RouterModule } from '@angular/router';
import { EditUserService } from '../edit-user/service/edit-user.service';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';
import { SharedModule } from '../../../shared/shared.module';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { Usuario, UsuarioFilter } from '../../../../domain/models/usuario.model';
import { ApiResponse } from '../../../../domain/models/apiResponse/api-response.model';

@Component({
  selector: 'app-list-user',
  imports: [CardComponent, NgFor, NgIf, RouterModule, SharedModule],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss'
})
export class ListUserComponent implements OnInit {
  private router = inject(Router);

  userAeliminar!: number;
  rolActual!: Role;
  userApiresponse!:  ApiResponse<Usuario[]>;

  users: Usuario[] = [];
  roles: Role[] = [];

  rolMap = new Map<number, string>();

  constructor(private svc: UserService, private rolsvc: RoleService, private editService: EditUserService, private alertService: AlertService, private changeDetectorRef: ChangeDetectorRef) {
  }
  ngOnInit(): void {
    this.cargarUsers();
    this.cargarRoles();
  }

  /**
   * Métodos de ejemplo para acciones sobre usuarios
   */
  viewUsuario(id: number): void {
    console.log('Ver usuario:', id);
    // Implementar navegación o modal
  }

  editUsuario(id: number): void {
    console.log('Editar usuario:', id);
    // Implementar navegación o modal
  }

  /* deleteUsuario(id: number): void {
    console.log('Eliminar usuario:', id);
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.usuarioService.deleteUsuario(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              alert('Usuario eliminado exitosamente');
              this.loadUsuarios();
            }
          },
          error: (err) => {
            alert('Error al eliminar el usuario');
            console.error('Error eliminando usuario:', err);
          }
        });
    } 
  }*/

  /* ---------------FIN NUEVA IMPLEMENTACION ----------------------*/


  cargarUsers() {
    this.svc.getUsers()
      .subscribe(
        {
          next: (data) => {
            this.userApiresponse = data;
            this.users = this.userApiresponse.data;
          },
          error: err => console.error('Error fetching items', err)
        }
      );
  }
 
  cargarRoles() {
    this.rolsvc.listarRoles().subscribe({
      next: data => {
        this.roles = data;
        this.rolMap = new Map(data.map(r => [r.id, r.nombre]));
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  nombreRol(id: number) {
    this.rolsvc.obtenerRol(id).subscribe({
      next: data => {
        this.rolActual = data;
      }
    });
  }

  obtenerRol(rolId: number): string {
    return this.rolMap.get(rolId) ?? 'Desconocido';
  }

  nav(par: number | undefined = 0) {
    this.asignarUserToEdit(par);
    this.router.navigate(['/admin/editarUsuario']);
  }

  asignarUserToEdit(par: number | undefined = 0) {
    this.editService.userToEdit = par;
  }

  eliminar() {
    this.svc.deleteUsuario(this.editService.userToEdit)
      .subscribe(
        () => {
          this.triggerAlert('Eliminación Exitosa', 'success');
          this.cargarUsers();
          this.changeDetectorRef.detectChanges();
        }
      );
  }
 
  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }

}
