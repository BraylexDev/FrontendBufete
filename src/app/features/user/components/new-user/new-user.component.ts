import { Component } from '@angular/core';

import { SharedModule } from '../../../../features/shared/shared.module';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CardComponent } from '../../../shared/components/card/card.component';
import { UserService } from '../../../../domain/services/user/user.service';
import { Role } from '../../../../domain/models/role.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../domain/models/user.model';
import { RoleService } from '../../../../domain/services/role/role.service';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';
import { AlertComponent } from '../../../shared/alert/component/alert.component';
import { CreateUsuarioRequest } from '../../../../domain/models/usuario.model';

//import { ColorPickerModule } from 'ngx-color-picker';

@Component({
  selector: 'app-new-user',
  imports: [CardComponent, SharedModule, NgbDropdownModule],
  templateUrl: './new-user.component.html',
  styleUrl: './new-user.component.scss'
})
export class NewUserComponent {
  count: number = 0;
  form: FormGroup;
  roles: Role[] = [];
  users!: User;

  rolMap = new Map<number, string>();

  constructor(private svc: UserService, private fb: FormBuilder, private rolsvc: RoleService, private alertService: AlertService

  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      contrasena: ['', Validators.required],
      rol_id: ['', Validators.required],
    });

    console.log("Formulario de usuario creado");
    
  }

  ngOnInit(): void {
    this.cargarPermisos();  
  }
  
  cargarPermisos() {
    this.rolsvc.listarRoles().subscribe({
      next: data => {
        this.roles = data;
        console.log("Roles cargados:", this.roles);
        this.rolMap = new Map(data.map(r => [r.id, r.nombre]));
      }
    });
  }


  create() {
    const { nombre, apellido, email, contrasena: contrasena, rol_id } = this.form.value;
    const rols = this.roles.find(obj => obj.id === Number.parseInt(rol_id)) as Role;

    this.form.reset({ nombre: '', apellido: '', email: '', contrasena: '', rol_id: '' });

    const newUser: CreateUsuarioRequest = {
      nombre: nombre,
      apellido: apellido,
      email: email,
      contrasena: contrasena,
      rolId: rol_id
    }

    this.svc.createUsuario(newUser)             
      .subscribe(() => {
        this.form.reset({ nombre: '', apellido: '', email: '', contrasena: '', rol_id: '' });
      });
    this.triggerAlert('Registro Exitoso', 'success');
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }


}

