import { inject, Injectable } from '@angular/core';
import { User } from '../../models/user.model';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Role } from '../../models/role.model';
import { ApiResponse, PageResponse } from '../../models/apiResponse/api-response.model';
import { ChangePasswordRequest, CreateUsuarioRequest, EditUsuario, UpdateUsuarioRequest, Usuario, UsuarioFilter } from '../../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly http = inject(HttpClient); 
  private readonly apiUrl = environment.apiUrl +"/usuarios";

  /**
   * Obtiene una lista paginada de usuarios con filtros opcionales
   */
  getAllUsuarios(filter: UsuarioFilter = {}): Observable<ApiResponse<PageResponse<Usuario>>> {
    let params = new HttpParams();

    // Paginación y ordenamiento
    if (filter.page !== undefined) {
      params = params.set('page', filter.page.toString());
    }
    if (filter.size !== undefined) {
      params = params.set('size', filter.size.toString());
    }
    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
    }
    if (filter.sortDir) {
      params = params.set('sortDir', filter.sortDir);
    }

    // Filtros
    if (filter.nombre) {
      params = params.set('nombre', filter.nombre);
    }
    if (filter.apellido) {
      params = params.set('apellido', filter.apellido);
    }
    if (filter.email) {
      params = params.set('email', filter.email);
    }
    if (filter.activo !== undefined) {
      params = params.set('activo', filter.activo.toString());
    }

    return this.http.get<ApiResponse<PageResponse<Usuario>>>(this.apiUrl, { params });
  }

  /**
   * Obtiene un usuario por su ID
   */
  getUsuarioById(id: number): Observable<ApiResponse<EditUsuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo usuario en el sistema
   */
  createUsuario(request: CreateUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(this.apiUrl, request);
  }

  /**
   * Actualiza los datos de un usuario existente
   */
  updateUsuario(id: number, request: UpdateUsuarioRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`, request);
  }

  /**
   * Desactiva un usuario del sistema
   */
  deleteUsuario(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtiene la lista de todos los abogados activos
   */
  getAbogados(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/abogados`);
  }

  /**
   * Cambia la contrasena de un usuario
   */
  changePassword(id: number, request: ChangePasswordRequest): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/${id}/change-password`, request);
  }

   getUserID(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUsers(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}`);
  }
  /*
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}/rol`);
  }

  crearUsuario(nombre: string, apellido: string, email: string, contrasena: string, rolId: number): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.baseUrl}/usuarios`, { nombre, apellido, email, contrasena, rolId });
  }

  eliminarUsuario(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/usuario/${id}`);
  }

  obtenerUsuario(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/usuario/${id}`);
  }

  actualizar(id: number, nombre: string, apellido: string, email: string, contrasena: string, rol_id: number){
    return this.http.put<User>(`${this.baseUrl}/usuario/${id}`, { nombre, apellido, email, contrasena, rol_id });
  } */

}
