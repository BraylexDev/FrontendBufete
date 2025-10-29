export interface Usuario {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    identificacion?: string;
    telefono?: string;
    direccion?: string;
    rolId: number;
    rolNombre?: string;
    activo?: boolean;
    nuevoUsuario?: boolean;
    createdAt?: string;
    updatedAt?: string;
    lastLogin?: string;
    contrasena: string;
}

export interface EditUsuario {
    id: number;
    nombre: string;
    apellido?: string;
    email: string;
    rolId: number;
    contrasena: string;
}

export interface CreateUsuarioRequest {
    nombre: string;
    apellido?: string;
    email: string;
    contrasena: string;
    identificacion?: string;
    telefono?: string;
    direccion?: string;
    rolId: number;
}

export interface UpdateUsuarioRequest {
    nombre?: string;
    apellido?: string;
    email?: string;
    identificacion?: string;
    telefono?: string;
    direccion?: string;
    rolId?: number;
    activo?: boolean;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

export interface UsuarioFilter {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    nombre?: string;
    apellido?: string;
    email?: string;
    activo?: boolean;
}