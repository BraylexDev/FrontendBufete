export interface NodeDTO {
    id: string;
    expedienteId?: number;
    expedienteNombre?: string;
    contableId?: number;
    parentId?: string;
    parentName?: string;
    type: 'FOLDER' | 'FILE';
    name: string;
    description?: string;
    modulo: 'DOCUMENTAL' | 'CONTABLE' | 'PLANTILLAS';
    createdByNombre: string;
    createdAt: string;
    updatedAt: string;
    sizeBytes: number;
    itemCount: number;
    lastAccessed?: string;
    currentVersionId?: string;
    mimeType?: string;
    versionNum?: number;
    originalName?: string;
    children?: NodeDTO[];
    path: string;
}

export interface CreateFolderRequest {
    name: string;
    description?: string;
    parentId: string;
}