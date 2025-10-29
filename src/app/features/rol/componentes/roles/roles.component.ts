import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SharedModule } from '../../../../features/shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

import { RoleService } from '../../../../domain/services/role/role.service';
import { Role } from '../../../../domain/models/role.model';
import { Permission } from '../../../../domain/models/permission.model';
import { map } from 'rxjs';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';

interface EditableRol extends Role {
  editing: boolean;
  permisosSet: Set<string>;
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    CardComponent,
    SharedModule,
    NgbDropdownModule
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent {
  /* count: number; */
  showMessagePerms = false;
  showMessageNom = false;

  idDelete: number = -1;

  form: FormGroup;
  permisos: Permission[] = [];
  roles: EditableRol[] = [];

  permissions: Permission[] = [];

  constructor(private svc: RoleService, private fb: FormBuilder, private alertService: AlertService, private changeDetectorRef: ChangeDetectorRef) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      permisos: [[], Validators.required]
    });

    this.svc.getPermissions()
      .subscribe(
        {
          next: data => this.permissions = data,
          error: err => console.error('Error fetching items', err)
        }
      )
    /* this.count = this.svc.ultimoRolId() + 1; */
  }

  get permisosControl(): FormControl<string[]> {
    return this.form.get('permisos') as FormControl<string[]>;
  }
  ngOnInit() {
    this.loadPermisos();
    this.loadRoles();
  }

  private loadPermisos() {
    this.svc.listarPermisos().subscribe(ps => this.permisos = ps);
  }

  private loadRoles() {
    this.svc.listarRoles().subscribe(rs => {
      this.roles = rs.map(r => ({
        ...r,
        editing: false,
        permisosSet: new Set(r.permisos.map(p => p.nombre))
      }));
    });

  }

  eliminarRol() {
    this.svc.eliminarRole(this.idDelete).subscribe(
      () => {
        this.loadRoles();
      }
    );
  }

  onSubmit() {
    if (this.permisosControl.value.length <= 1) {
      this.showMessagePerms = true;
    } else {
      this.showMessagePerms = false;
    }
    if (this.form.get('nombre')?.invalid) {
      this.showMessageNom = true;
    }
    else {
      this.showMessageNom = false;
    }
    if (!this.showMessageNom && !this.showMessagePerms) {
      /* this.crear(); */
      this.createRole()
    }
  }

  createRole() {
    const { nombre, permisos } = this.form.value;
    
    this.svc.crearRol(nombre, permisos.map((nombre: string) => `${nombre}`))
      .subscribe(() => {
        this.form.reset({ nombre: '', permisos: [] });
        this.triggerAlert('Registro Exitoso', 'success');
        this.loadRoles();
      });
  }

  eliminar() {
    this.svc.eliminarRole(this.idDelete);
    this.triggerAlert('Eliminación Exitosa', 'success');

    this.loadRoles();
    this.changeDetectorRef.detectChanges();
  }

  toggleEdit(r: EditableRol) {
    if (r.editing) {
      const permisosArr = Array.from(r.permisosSet);

      this.svc.actualizarPermisos(r.id, permisosArr).subscribe(() => {
        r.editing = false;
        this.loadRoles();
        this.triggerAlert('Actualización Exitosa', 'success');
      });
      
    } else {
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
      r.permisosSet.add(permisoNombre);
    } else {
      r.permisosSet.delete(permisoNombre);
    }
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }
}