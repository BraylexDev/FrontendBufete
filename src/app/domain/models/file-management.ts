export interface NodeDto {
  id: string;
  expedienteId: number;
  parentId?: string;
  type: 'FILE' | 'FOLDER';
  name: string;
  description?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  sizeBytes?: number;
  itemCount?: number;
  lastAccessed?: Date;
  mimeType?: string;
  originalName?: string;
  currentVersion?: number;
  isImage?: boolean;
  downloadUrl?: string;
  thumbnailUrl?: string;
  children?: NodeDto[];
  breadcrumb?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface FileUploadResponse {
  nodeId: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  versionNumber: number;
  message: string;
}

export interface FileVersionDto {
  id: string;
  nodeId: string;
  versionNum: number;
  uploadedBy: number;
  uploaderName?: string;
  uploadedAt: Date;
  note?: string;
  isCurrent: boolean;
  sizeBytes: number;
  mimeType: string;
  downloadUrl?: string;
}

export interface MoveNodeRequest {
  targetParentId?: string;
}

export interface RenameNodeRequest {
  newName: string;
}