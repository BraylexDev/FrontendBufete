export interface CreateSentenciaRequest {
    nombre: string;
    tipoSentencia: string;
    fechaSentencia: string;
    procesoId: number;
    clienteId: number;
    abogadoId: number;
}

export interface SentenciaResponse {
    id: number;
    nombre: string;
    tipoSentencia: string;
    fechaSentencia: string;
    procesoId: string;
    clienteId: string;
    abogadoId: string;
    fileBlobId: string;
    createdById: number;
}