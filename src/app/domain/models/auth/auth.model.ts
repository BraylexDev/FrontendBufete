export interface LoginRequest {
    email: string;
    password: string;
}

export interface JwtAuthResponse {
    accessToken: string;
    tokenType: string;
    email: string;
    rol: string;
    name: string;
}

export interface User {
    email: string;
    nombre: string;
    role: string;
}