import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../domain/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  mostrarMensaje = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    console.log('Login form values:', this.loginForm.value);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.loginForm.get("password")?.reset();
        if (error.status === 200) {
          this.errorMessage.set('Correo o Contraseña Incorrectos.');
        } else if (error.status === 0) {
          this.errorMessage.set('No se pudo conectar con el servidor. Contacte a soporte técnico');
        } else {
          this.errorMessage.set('Ha ocurrido un error inesperado. Contacte a soporte técnico');
        }
      },
      complete: () => {
        this.isLoading.set(false);
        this.loginForm.get("password")?.setValue("");
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }
}