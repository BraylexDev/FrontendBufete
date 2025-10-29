
export interface Documento {
    id?: number;
    nombre: string;
    tipo: string;
    tipo_contable: string;
    descripcion: string;
    url: string;
    fecha_creacion: Date;
    expediente_id: number;
    usuario_id: number;
}