import { Role } from './role.model';

export interface User {
    id?: number;
    nombre: string;
    identificacion: string;
    apellido: string;
    email: string;
    contrasena: string;
    rolId: number;
}