import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../../../shared/components/card/card.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../domain/services/user/user.service';
import { RoleService } from '../../../../domain/services/role/role.service';
import { Role } from '../../../../domain/models/role.model';
import { User } from '../../../../domain/models/user.model';
import { EditUserService } from './service/edit-user.service';
import { RouterModule } from '@angular/router';
import { AlertService, AlertType } from '../../../shared/alert/service/alert.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../domain/models/apiResponse/api-response.model';
import { EditUsuario, Usuario } from '../../../../domain/models/usuario.model';
@Component({
  selector: 'app-edit-user',
  imports: [CardComponent, SharedModule, NgbDropdownModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {

  userApiresponse!:  ApiResponse<EditUsuario>;

  userToEdit: User = {} as User;
  paramEdit: number;

  form: FormGroup;
  roles: Role[] = [];
  users!: EditUsuario;
  rolMap = new Map<number, string>();

  myData$!: Observable<User>;
  showPassword = false;

  constructor(private svc: UserService, private fb: FormBuilder, private rolsvc: RoleService, private editService: EditUserService, private alertService: AlertService) {

    this.paramEdit = this.editService.userToEdit;

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', Validators.required],
      contrasena: ['', Validators.required],
      rol_id: ['', Validators.required],
      confirmContrasena: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
    );

    this.rolsvc.listarRoles().subscribe({
      next: data => {
        this.roles = data;
        this.rolMap = new Map(data.map(r => [r.id, r.nombre]));
      }
    });
    this.svc.getUsuarioById(this.paramEdit)
      .subscribe(
        {
          next: (data) => {
            this.userApiresponse = data;
            this.users = this.userApiresponse.data;
            this.form = this.fb.group({
              nombre: [this.users.nombre, Validators.required],
              apellido: [this.users.apellido, Validators.required],
              email: [this.users.email, Validators.required],
              contrasena: ['', Validators.required],
              confirmContrasena: ['', Validators.required],
              rol_id: [this.users.rolId, Validators.required],
            });
          }
        }
      );
      /* this.myData$ = this.svc.getUserID(this.paramEdit); */
      this.svc.getUserID(this.paramEdit);
      
      /* (
        {
          next: data => {
            this.form = this.fb.group({
              nombre: [data.nombre, Validators.required],
              apellido: [data.apellido, Validators.required],
              email: [data.email, Validators.required],
              contrasena: [data.contrasena, Validators.required],
              rol_id: [data.rol_id, Validators.required],
            });
          }
        }
      ); */
  }

  editUser() {
    const { nombre, apellido, email, contrasena, rol_id } = this.form.value;
    const nuevoRol = this.roles.find(obj => obj.id === Number.parseInt(rol_id)) as Role;
    /* console.log(rols); */
    /* const newUser: User = { id: this.userToEdit.id, nombre: nombre, identificacion: '', apellido: apellido, email: email, contrasena: contrasena, rolId: rol_id } */
    this.form.reset({ nombre: '', apellido: '', email: '', contrasena: '', rol_id: '' });
    this.actualizarUser();

    this.triggerAlert('Actualización Exitosa', 'success');
  }

  /* actualizarUser(){
    const { nombre, apellido, email, contrasena, rol_id } = this.form.value;
    this.svc.actualizar(this.paramEdit, nombre, apellido, email, contrasena, rol_id)
      .subscribe(
          () => {
            this.triggerAlert('Actualización Exitosa', 'success');
            this.form.reset({ nombre: '', apellido: '', email: '', contrasena: '', rol_id: '' });
          }
      );
  } */
  actualizarUser() {
    const { nombre, apellido, email, contrasena, rol_id } = this.form.value;
    const newUser: User = {identificacion: "0",  nombre: nombre, apellido: apellido, email: email, contrasena: contrasena, rolId: Number.parseInt(rol_id) }
    this.svc.updateUsuario( this.paramEdit, newUser )
      .subscribe(
        (response) => {
          this.triggerAlert('Actualización Exitosa', 'success');
          this.form.reset({ nombre: '', apellido: '', email: '', contrasena: '', rol_id: '' });
        }
      );
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
