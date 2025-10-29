import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { JwtAuthResponse, LoginRequest, User } from '../../models/auth/auth.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSignal = signal<User | null>(this.getUserFromStorage());
  private isAuthenticatedSignal = signal<boolean>(!!this.getUserFromStorage());

  currentUser = computed(() => this.currentUserSignal());
  isAuthenticated = computed(() => this.isAuthenticatedSignal());

  constructor(private http: HttpClient, private router: Router) {}

  /** Iniciar sesión */
  login(credentials: LoginRequest): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(`${this.API_URL}/signin`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.accessToken);
          const user: User = {
            email: response.email,
            nombre: response.name,
            role: response.rol
          };
          this.setUser(user);
          this.currentUserSignal.set(user);
          this.isAuthenticatedSignal.set(true);
          this.router.navigate(['/admin/home']);
        })
      );
  }

  /** Cerrar sesión */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser():string | undefined{
    return this.getRolUserFromStorage()?.nombre;
  }

  checkAuthentication(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }
  
  hasRole(requiredRoles: string[]): boolean {
    const userRole = this.getRolUserFromStorage()?.role;
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
  }

  hasAnyRole(roles: string[]): boolean {
    const userRole = this.currentUserSignal()?.role;
    return roles.some(role => userRole === role);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp;
      return (Math.floor((new Date).getTime() / 1000)) >= expiry;
    } catch {
      return true;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
  private getRolUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}