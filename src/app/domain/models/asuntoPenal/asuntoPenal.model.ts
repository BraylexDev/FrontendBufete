export interface Delito {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion: string;
}

export interface BienJuridico {
    id?: number;
    codigo: string;
    nombre: string;
    descripcion: string;
}

export interface Persona {
    id?: number;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    privacionLibertad?: boolean;
    tipoDetencion?: string;
    establecimientoOResidencia: string;
}

export interface Fiscal {
    id?: number;
    nombreFiscal: string;
    unidad: string;
    correo: string;
    telefono: string;
}

export interface Juzgado {
    id?: number;
    tipoJuzgado: string;
    nombreJuzgado: string;
}

export interface Competencia {
    id?: number;
    municipal: string;
    circuito: string;
    circuitoEspecializado: string;
}


export interface AsuntoPenal {
    jurisdiccionId?: number;
    asuntoId?: number;
    etapaId?: number;
    tipoProcedimientoId?: number;
    huboVictimas: boolean;

    etapaProceso: string;
    competenciaAsunto: string;
    tipoJuzgado: string;

    nunc: string;
    imputados: Persona[];
    /* victimas: Persona[]; */
    delitosIds: number[];
    bienesJuridicosIds: number[];
    /* imputacion: string; */
    /* competencia: Competencia; */
    /* fiscal: Fiscal; */
}

export interface AsuntoPenal {
    jurisdiccionId?: number;
    asuntoId?: number;
    etapaId?: number;
    tipoProcedimientoId?: number;
    huboVictimas: boolean;

    etapaProceso: string;
    competenciaAsunto: string;
    tipoJuzgado: string;

    nunc: string;
    imputados: Persona[];
    /* victimas: Persona[]; */
    delitosIds: number[];
    bienesJuridicosIds: number[];
    /* imputacion: string; */
    /* competencia: Competencia; */
    fiscal: Fiscal;
}

export interface AsuntoPenalResponse {
    procesoId?: number;
    expedienteId?: number;
    jurisdiccionId?: number;
    asuntoId?: number;
    etapaId?: number;
    tipoProcedimientoId?: number;
    nunc: string;
    huboVictimas: boolean;
    participantesIds: number[];
    delitosIds: number[];
    bienesJuridicosIds: number[];
    rootNodeId: string;
}