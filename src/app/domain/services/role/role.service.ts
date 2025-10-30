import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface RolUpdateDTO{
  permisos: Set<string>;
}

@Injectable({ providedIn: 'root' })
export class RoleService {

  private baseUrl = environment.apiUrl + '/rol';
  private permisosUrl = environment.apiUrl +'/permisos';

 /*  private baseUrlPermisos = environment.apiUrlPermisos;
  private baseUrlRol = environment.apiUrlRoles; */
/* 
  private _roles = new BehaviorSubject<Role[]>([]);
  readonly roles$ = this._roles.asObservable();
 */
  constructor(private http: HttpClient) { }

  getPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.permisosUrl}`);
    /* return this.http.get<Permission[]>(`${this.baseUrlPermisos}`); */
  }

  listarPermisos(): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.permisosUrl}`);
    /* return this.http.get<Permission[]>(`${this.baseUrlPermisos}`); */
  }
  
  listarRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.baseUrl}`);
  } 
  
  
  crearRol(nombre: string, permisos: string[]): Observable<Role> {
    return this.http.post<Role>(`${this.baseUrl}`, {nombre, permisos });
  }

  actualizarPermisos(id: number, permisos: string[]): Observable<Role> {
    const body = { permisos };
    console.log(permisos);
    
    return this.http.post<Role>(`${this.baseUrl}/${id}`,body );
  }

  obtenerRol(id: number): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  eliminarRole(id: number) {
    return this.http.delete<Role>(`${this.baseUrl}/${id}`);
  }
}