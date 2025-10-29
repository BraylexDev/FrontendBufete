import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbItem, NodeDTO, NodeType } from '../../../domain/models/node2.model';
import { NodeService } from '../../../domain/services/folder/node.service';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss']
})
export class FileExplorerComponent implements OnInit {
  @Input() rootNodeId!: string;

  currentNodes: NodeDTO[] = [];
  currentParentId: string = '';
  breadcrumbs: BreadcrumbItem[] = [];
  loading = false;
  error: string | null = null;

  // Para modales
  showCreateFolderModal = false;
  showUploadFileModal = false;
  showDeleteConfirmModal = false;

  // Formularios
  newFolderName = '';
  newFolderDescription = '';
  selectedFile: File | null = null;
  fileDescription = '';
  fileNote = '';

  // Selección
  selectedNode: NodeDTO | null = null;

  // Vistas
  viewMode: 'grid' | 'list' = 'list';

  // Tipos
  NodeType = NodeType;

  constructor(private nodeService: NodeService) { }

  ngOnInit() {

    if (this.rootNodeId) {
      this.loadNodeContent(this.rootNodeId);
    } else {
    }
  }

  onNodeDoubleClick(node: NodeDTO): void {
    if (node.type === 'FOLDER') {
    } else {
      this.downloadFile(node);
    }
  }

  loadNodeContent(nodeId: string) {
    this.loading = true;
    this.error = null;
    this.currentParentId = nodeId;

    this.nodeService.getNodeChildren(nodeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.currentNodes = response.data;
          this.updateBreadcrumbs(nodeId);
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el contenido';
        this.loading = false;
      }
    });
  }

  updateBreadcrumbs(nodeId: string) {
    this.nodeService.getNodeById(nodeId).subscribe({
      next: (response) => {
        if(!this.breadcrumbs.some(item => item.id === response.data.id))
        {
          if (response.success && response.data.path) {
            const info = { id: response.data.id, name: response.data.path, path: '' }
            const pathParts = response.data.path.split('/').filter(p => p);
            this.breadcrumbs.push(info);
          }
        }
      }
    });
  }

  onNodeClick(node: NodeDTO) {
    if (node.type === NodeType.FOLDER) {
      this.currentParentId = node.id;
      this.loadNodeContent(node.id);
    } else {
      this.onFileClick(node);
    }
  }

  onFileClick(node: NodeDTO) {
    // Implementar vista previa o descarga
    this.selectedNode = node;
  }

  goToFolder(breadcrumb: BreadcrumbItem) {
    if (breadcrumb.id) {
      this.loadNodeContent(breadcrumb.id);
      const indice = this.breadcrumbs.findIndex(crumb => crumb.id === breadcrumb.id);
      const cantidadAEliminar = this.breadcrumbs.length - indice;
      this.breadcrumbs.splice(indice, cantidadAEliminar);
    }
  }

  goBack() {
    if (this.breadcrumbs.length > 1) {
      const previousBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 2];
      if (previousBreadcrumb.id) {
        this.loadNodeContent(previousBreadcrumb.id);
        const indice = this.breadcrumbs.findIndex(crumb => crumb.id === previousBreadcrumb.id);
        const cantidadAEliminar = this.breadcrumbs.length - indice;
        this.breadcrumbs.splice(indice, cantidadAEliminar);
      }
    }
  }

  // CREAR CARPETA
  openCreateFolderModal() {

    if (!this.currentParentId) {
      this.error = 'No se puede crear carpeta: falta el ID del nodo padre';
      return;
    }

    this.newFolderName = '';
    this.newFolderDescription = '';
    this.showCreateFolderModal = true;
  }

  closeCreateFolderModal() {
    this.showCreateFolderModal = false;
  }

  createFolder() {
    if (!this.newFolderName.trim()) {
      return;
    }

    if (!this.currentParentId) {
      this.error = 'Error: No se puede determinar la ubicación de la carpeta';
      return;
    }
    this.loading = true;
    this.error = null;

    this.nodeService.createFolder({
      name: this.newFolderName,
      description: this.newFolderDescription,
      parentId: this.currentParentId
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadNodeContent(this.currentParentId);
          this.closeCreateFolderModal();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al crear la carpeta';
        this.loading = false;
      }
    });
  }

  // SUBIR ARCHIVO
  openUploadFileModal() {

    if (!this.currentParentId) {
      this.error = 'No se puede subir archivo: falta el ID del nodo padre';
      return;
    }

    this.selectedFile = null;
    this.fileDescription = '';
    this.fileNote = '';
    this.showUploadFileModal = true;
  }

  closeUploadFileModal() {
    this.showUploadFileModal = false;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  downloadFile(node: NodeDTO): void {
    if (node.type !== 'FILE') return;
    this.nodeService.downloadFileInExpedient(node.id);
  }

  uploadFile() {

    if (!this.selectedFile) {
      return;
    }

    if (!this.currentParentId) {
      this.error = 'Error: No se puede determinar la ubicación del archivo';
      return;
    }

    this.loading = true;
    this.error = null;

    this.nodeService.uploadFile(
      this.selectedFile,
      this.currentParentId,
      this.fileDescription,
      this.fileNote
    ).subscribe({
      next: (response) => {
        if (response.success) {
          
          this.loadNodeContent(this.currentParentId);
          this.closeUploadFileModal();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al subir el archivo';
        this.loading = false;
      }
    });
  }

  // ELIMINAR
  openDeleteConfirmModal(node: NodeDTO) {
    this.selectedNode = node;
    this.showDeleteConfirmModal = true;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.selectedNode = null;
  }

  confirmDelete() {
    if (!this.selectedNode) return;

    this.loading = true;
    this.nodeService.deleteNode(this.selectedNode.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadNodeContent(this.currentParentId);
          this.closeDeleteConfirmModal();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al eliminar';
        this.loading = false;
      }
    });
  }

  // UTILIDADES
  getFileIcon(node: NodeDTO): string {
    if (node.type === NodeType.FOLDER) {
      return 'folder';
    }
    return this.nodeService.getFileIcon(node.mimeType || '');
  }

  formatFileSize(bytes?: number): string {
    if (!bytes) return '0 Bytes';
    return this.nodeService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'list' ? 'grid' : 'list';
  }
}