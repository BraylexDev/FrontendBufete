export enum NodeType {
    FOLDER = 'FOLDER',
    FILE = 'FILE'
}

export enum Modulo {
    EXPEDIENTE = 'EXPEDIENTE',
    CONTABLE = 'CONTABLE'
}

export interface NodeDTO {
    id: string;
    expedienteId?: number;
    expedienteNombre?: string;
    contableId?: number;
    parentId?: string;
    parentName?: string;
    type: NodeType;
    name: string;
    description?: string;
    modulo: Modulo;
    createdByNombre?: string;
    createdAt: string;
    updatedAt: string;
    sizeBytes?: number;
    itemCount?: number;
    lastAccessed?: string;

    // Para archivos
    currentVersionId?: string;
    mimeType?: string;
    versionNum?: number;
    originalName?: string;

    // Para carpetas
    children?: NodeDTO[];
    path?: string;
}

export interface CreateFolderRequest {
    name: string;
    description?: string;
    parentId: string;
}

export interface FileUploadRequest {
    file: File;
    description?: string;
    parentId: string;
    note?: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    errors?: any;
}

export interface BreadcrumbItem {
    id: string;
    name: string;
    path: string;
}

export interface FileUploadResponse {
    nodeId: string;
    name: string;
    sizeBytes: number;
    mimeType: string;
    versionNumber: number;
    message: string;
}

export interface DownloadUrlDTO {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  expiresInSeconds: number;
}