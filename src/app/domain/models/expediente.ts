export interface ExpedienteDTO {
    id: number;
    nombre: string;
    descripcion?: string;
    estado: string;
    fechaCreacion: string;
    fechaCierre?: string;
    procesoId: number;
    procesoNombre: string;
    procesoNumero: string;
    rootNodeId: string;
    orden: number;
    createdByNombre: string;
    createdById?: number;
    updatedAt: string;
    totalDocumentos: number;
    totalSize: number;
}
export interface CreateExpedienteDto {
    nombre: string;
    procesoId: number;
}