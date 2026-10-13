export interface RecursoExtraordinarioDTO {
    id: number;
    procesoId: number;
    expedienteId: number;
    abogadoId: number;  
    contexto: string;
    fechaPresentacion: Date;
    documentoNodeId: string;
}

export interface RecursoExtraordinarioRequest {
    expedienteId: number;
    contexto: string;
    fechaPresentacion: Date;
    documentoNodeId: string;
}