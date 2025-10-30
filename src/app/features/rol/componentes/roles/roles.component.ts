import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SharedModule } from '../../../../features/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { RoleService } from '../../../../domain/services/role/role.service';
import { Role } from '../../../../domain/models/role.model';
import { Permission } from '../../../../domain/models/permission.model';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';

declare var bootstrap: any;

interface EditableRol extends Role {
  editing: boolean;
}

interface PermissionsByModule {
  [key: string]: Permission[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    CardComponent,
    SharedModule,
    NgbDropdownModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  showMessagePerms = false;
  showMessageNom = false;
  searchTerm = '';

  form: FormGroup;
  permisos: Permission[] = [];
  roles: EditableRol[] = [];
  filteredRoles: EditableRol[] = [];
  permissions: Permission[] = [];
  permissionsByModule: PermissionsByModule = {};
  rolToDelete: EditableRol | null = null;

  constructor(
    private svc: RoleService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      permisos: [[], Validators.required]
    });
  }

  get permisosControl(): FormControl<string[]> {
    return this.form.get('permisos') as FormControl<string[]>;
  }

  ngOnInit() {
    this.loadPermisos();
    this.loadRoles();
  }

  private loadPermisos() {
    this.svc.listarPermisos().subscribe({
      next: (ps) => {
        this.permisos = ps;
        this.permissions = ps;
        this.groupPermissionsByModule(ps);
      },
      error: (err) => {
        console.error('Error cargando permisos', err);
        this.triggerAlert('Error cargando permisos', 'danger');
      }
    });
  }

  private groupPermissionsByModule(permisos: Permission[]) {
    this.permissionsByModule = permisos.reduce((acc, permiso) => {
      const modulo = 'GENERAL';
      if (!acc[modulo]) {
        acc[modulo] = [];
      }
      acc[modulo].push(permiso);
      return acc;
    }, {} as PermissionsByModule);
  }

  private loadRoles() {
    this.svc.listarRoles().subscribe({
      next: (rs) => {
        this.roles = rs.map(r => ({
        ...r,
        editing: false
      }));
        this.filteredRoles = [...this.roles];
      },
      error: (err) => {
        console.error('Error cargando roles', err);
        this.triggerAlert('Error cargando roles', 'danger');
      }
    });
  }

  filterRoles() {
    const term = this.searchTerm.toLowerCase();
    this.filteredRoles = this.roles.filter(rol =>
      rol.nombre.toLowerCase().includes(term)
    );
  }

  onSubmit() {
    this.showMessagePerms = false;
    this.showMessageNom = false;

    if (this.permisosControl.value.length < 1) {
      this.showMessagePerms = true;
      this.triggerAlert('Debe seleccionar al menos un permiso', 'warning');
      return;
    }

    if (this.form.get('nombre')?.invalid) {
      this.showMessageNom = true;
      this.form.get('nombre')?.markAsTouched();
      return;
    }

    this.createRole();
  }

  createRole() {
    const { nombre, permisos } = this.form.value;

    this.svc.crearRol(nombre, permisos).subscribe({
      next: () => {
        this.resetForm();
        this.triggerAlert('Rol creado exitosamente', 'success');
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error creando rol', err);
        this.triggerAlert('Error al crear el rol', 'danger');
      }
    });
  }

  resetForm() {
    this.form.reset({
      nombre: '',
      descripcion: '',
      permisos: []
    });
    this.showMessagePerms = false;
    this.showMessageNom = false;
  }

  toggleEdit(r: EditableRol) {
    if (r.editing) {
      // Guardar cambios
      const permisosArr = Array.from(r.permisos);

      this.svc.actualizarPermisos(r.id, permisosArr).subscribe({
        next: () => {
          r.editing = false;
          this.loadRoles();
          this.triggerAlert('Permisos actualizados exitosamente', 'success');
        },
        error: (err) => {
          console.error('Error actualizando permisos', err);
          this.triggerAlert('Error al actualizar permisos', 'danger');
        }
      });
    } else {
      // Activar modo edición
      r.editing = true;
    }
  }

  onPermisoToggle(permisoNombre: string, checked: boolean) {
    const control = this.form.get('permisos')!;
    const currentValue: string[] = control.value || [];

    if (checked) {
      if (!currentValue.includes(permisoNombre)) {
        control.setValue([...currentValue, permisoNombre]);
      }
    } else {
      control.setValue(currentValue.filter(nombre => nombre !== permisoNombre));
    }
  }

  onPermisoRowToggle(r: EditableRol, permisoNombre: string, checked: boolean) {
    if (checked) {
      r.permisos.push(permisoNombre);
    } else {
      r.permisos = r.permisos.filter(item => item !== permisoNombre)
    }
  }

  tienePermiso(permisos: string[], permiso: string): boolean{
    return permisos.includes(permiso);
  }

  confirmarEliminacion(rol: EditableRol) {
    this.rolToDelete = rol;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }

  eliminarRol() {
    if (!this.rolToDelete) return;

    this.svc.eliminarRole(this.rolToDelete.id).subscribe({
      next: () => {
        this.triggerAlert('Rol eliminado exitosamente', 'success');
        this.loadRoles();
        this.rolToDelete = null;
      },
      error: (err) => {
        console.error('Error eliminando rol', err);
        this.triggerAlert('Error al eliminar el rol', 'danger');
      }
    });
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }
}