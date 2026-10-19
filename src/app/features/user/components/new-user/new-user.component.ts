import { Component } from '@angular/core';

import { SharedModule } from '../../../../features/shared/shared.module';

import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CardComponent } from '../../../shared/components/card/card.component';
import { UserService } from '../../../../domain/services/user/user.service';
import { Role } from '../../../../domain/models/role.model';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  showPassword = false;

  constructor(private svc: UserService, private fb: FormBuilder, private rolsvc: RoleService, private alertService: AlertService

  ) {

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      rol_id: ['', Validators.required],
      contrasena: ['', Validators.required],
      confirmContrasena: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
    );    
  }

  ngOnInit(): void {
    this.cargarPermisos();  
  }
  
  cargarPermisos() {
    this.rolsvc.listarRoles().subscribe({
      next: data => {
        this.roles = data;
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

  isFieldInvalidPassword(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  passwordMatchValidator(
    control: AbstractControl,
  ): { [key: string]: boolean } | null {
    const password = control.get('contrasena');
    const confirmPassword = control.get('confirmContrasena');

    if (!password || !confirmPassword) return null;

    if (password.value && confirmPassword.value) {
      return password.value === confirmPassword.value
        ? null
        : { passwordMismatch: true };
    }

    return null;
  }

  get passwordMismatch(): boolean {
    return (
      (this.form.hasError('passwordMismatch') &&
        this.form.get('confirmContrasena')?.touched) ||
      false
    );
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  triggerAlert(message: string, type: AlertType) {
    this.alertService.showAlert(message, type);
  }


}

