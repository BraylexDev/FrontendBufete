export interface EventoDto {
    id?: number;

    titulo: string;
    descripcion?: string;

    tipoEventoId: number;
    tipoEventoNombre?: string;
    tipoEventoColor?: string;

    fechaInicio: string;
    fechaFin?: string;
    allDay?: boolean;

    procesoId?: number;
    procesoNombre?: string;

    expedienteId?: number;
    expedienteNombre?: string;

    responsableId?: number;
    responsableNombre?: string;

    createdAt?: string;
    updatedAt?: string;
}

export interface CreateEventoRequest {
    titulo: string;
    descripcion?: string;
    tipoEventoId: number;
    fechaInicio: string;
    fechaFin?: string;
    allDay: boolean;
    procesoId?: number;
    expedienteId?: number;
}
