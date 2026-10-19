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
    tipoDocumento: string;
    fechaSentencia: string;
    procesoNunc: string;
    clienteNumeroDocumento: string;
    abogadoNombre: string;
    fileBlobId: string;
    createdById: number;
}