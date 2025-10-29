import { Permission } from "./permission.model";

export interface Role {
    id:number;
    nombre: string;
    permisos: Permission[];
}