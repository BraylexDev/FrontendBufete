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

export interface ProcesoDetalle {
    id: number;
    numeroProceso: string;
    estado: string;
    fechaInicio: Date;
    fechaCierre: Date;

    jurisdiccionNombre: string;
    asuntoNombre: string;
    etapaActualNombre: string;

    abogadoResponsableNombre: string;
    tipoProcedimientoNorma: string;
}

export interface ProcesoPenalDetalle {
    procesoId: number;
    nunc: string;
    competencia: string;
    huboVictimas: boolean;
    tipoJuzgado: string;
    etapaProceso: string;
}
export interface ImputacionDetalle {
    descripcion: string;
}

export interface ParticipanteDetalle {
    id: number;
    rol: string;
    privacionLibertad?: boolean;
    tipoDetencion?: string;
    establecimientoOResidencia: string;
    personaId: number;
    tipoDocumento: string;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    lugarResidencia: string;
    email: string;
    telefono: string;
}

export interface CatalogoRelacionDetalle {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
}

export interface FiscalDetalle {
    id: number;
    nombreFiscal: string;
    unidad: string;
    correo: string;
    telefono: string;   
}

interface JuzgadoDetalle {
    id: number;
    tipoJuzgado: string;
    nombreJuzgado: string;
}

interface ExpedienteDetalle {
    id: number;
    nombre: string;
    estado: string;
    rootNodeId: string;
    orden: number;
    fechaCreacion: Date;
    fechaCierre: Date;
}

export interface ActuacionDTO {
    id: number;
    procesoId: number;
    expedienteId: number;
    tipoActuacionId: number;
    tipoActuacionCodigo: string;
    tipoActuacionNombre: string;
    fechaActuacion: Date;
    contexto: string;
    observaciones: string;
}

export interface TerminoDTO {
    id: number;
    actuacionId: number;
    reglaTerminoId: number;
    fechaInicio: Date;
    diasPlazo: number;
    fechaVencimiento: Date;
    eventoId: number;
}

export interface EventoDetalle {
    id: number;
    titulo: string;
    descripcion: string;
    tipoEventoId: number;
    fechaInicio: Date;
    fechaFin: Date;
    allDay: boolean;
    expedienteId: number;
    terminoProcesoId: number;
}

export interface AsuntoPenalDetalleDTO {
    proceso: ProcesoDetalle;
    procesoPenal: ProcesoPenalDetalle;
    imputacion: ImputacionDetalle;
    participantes: ParticipanteDetalle[];
    delitos: CatalogoRelacionDetalle[];
    bienesJuridicos: CatalogoRelacionDetalle[];
    fiscal: FiscalDetalle;
    juzgado: JuzgadoDetalle[];
    expediente: ExpedienteDetalle[];
    actuaciones: ActuacionDTO[];
    terminos: TerminoDTO[];
    eventos: EventoDetalle[];
}