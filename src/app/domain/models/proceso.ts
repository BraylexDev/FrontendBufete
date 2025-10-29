
export interface CreateProceso {
    numeroProceso: string;
    nombre: string;
    clienteId: string;
    abogadoResponsableId: number;
    tipoDocumentoCliente: string;
}

export interface Proceso {
    id: number;
    numeroProceso: string;
    nombre: string;
    descripcion: string;
    tipoProceso: string;
    fechaInicio: Date;
    abogadoResponsableId: number;
    clienteId: number;
}
export interface ProcesoDTO {
    id?: number;
    numeroProceso: string;
    nombre: string;
    descripcion?: string;
    tipoProceso?: string;
    estado?: string;
    fechaCreacion?: Date;
    fechaInicio?: Date;
    fechaCierre?: Date;
    clienteId: number;
    clienteNombre?: string;
    abogadoResponsableId: number;
    abogadoResponsableNombre?: string;
    juzgado?: string;
    radicado?: string;
    demandante?: string;
    demandado?: string;
    cuantia?: number;
    observaciones?: string;
    activo?: boolean;
    createdByNombre?: string;
    createdAt?: Date;
    updatedAt?: Date;
    totalExpedientes?: number;
    totalEventos?: number;
}