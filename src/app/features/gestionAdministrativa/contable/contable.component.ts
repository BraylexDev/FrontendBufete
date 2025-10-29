import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DocumentoContable {
  id: number;
  mes: string;
  anio: number;
  tipoDocumento: string;
  estado: string;
  fecha?: Date;
  descripcion?: string;
}

@Component({
  selector: 'app-contable',
  imports: [FormsModule, CommonModule],
  templateUrl: './contable.component.html',
  styleUrl: './contable.component.scss'
})
export class ContableComponent {

  showModal: boolean = false;
  
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  anios: number[] = [];
  
  tiposDocumento = [
    'Factura',
    'Balance',
    'Declaración',
    'Soporte DIAN',
    'Recibo',
    'Comprobante'
  ];
  
  // Filtros
  mesSeleccionado: string = 'Abril';
  anioSeleccionado: number = 2025;
  tipoDocumentoFiltro: string = 'Factura';
  
  // Formulario modal
  formData = {
    tipoDocumento: 'Balance',
    fecha: '',
    descripcion: ''
  };
  
  selectedFile: File | null = null;
  
  // Datos de la tabla
  documentos: DocumentoContable[] = [
    { id: 1, mes: 'Abril', anio: 2025, tipoDocumento: 'Declaración', estado: 'Cargado' },
    { id: 2, mes: 'Abril', anio: 2025, tipoDocumento: 'Balance', estado: 'Cargado' },
    { id: 3, mes: 'Abril', anio: 2025, tipoDocumento: 'Factura', estado: 'Cargado' },
    { id: 4, mes: 'Abril', anio: 2025, tipoDocumento: 'Soporte DIAN', estado: 'Cargado' }
  ];
  
  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  
  ngOnInit(): void {
    // Generar anios (últimos 5 anios + próximos 2)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      this.anios.push(i);
    }
    
    // Establecer fecha actual en el formulario
    const today = new Date();
    this.formData.fecha = this.formatDate(today);
    
    this.calculateTotalPages();
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  get documentosFiltrados(): DocumentoContable[] {
    return this.documentos.filter(doc => {
      const mesMatch = doc.mes === this.mesSeleccionado;
      const anioMatch = doc.anio === this.anioSeleccionado;
      const tipoMatch = this.tipoDocumentoFiltro === '' || doc.tipoDocumento === this.tipoDocumentoFiltro;
      return mesMatch && anioMatch && tipoMatch;
    });
  }
  
  get documentosPaginados(): DocumentoContable[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.documentosFiltrados.slice(startIndex, endIndex);
  }
  
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.documentosFiltrados.length / this.itemsPerPage);
  }
  
  getPaginationPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  onFilterChange(): void {
    this.currentPage = 1;
    this.calculateTotalPages();
  }
  
  openModal(): void {
    this.showModal = true;
  }
  
  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
  
  onSubmit(): void {
    if (!this.formData.tipoDocumento || !this.formData.fecha || 
        !this.formData.descripcion || !this.selectedFile) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    // Extraer mes y anio de la fecha
    const fecha = new Date(this.formData.fecha);
    const mesIndex = fecha.getMonth();
    const anio = fecha.getFullYear();
    
    const nuevoDocumento: DocumentoContable = {
      id: this.documentos.length + 1,
      mes: this.meses[mesIndex],
      anio: anio,
      tipoDocumento: this.formData.tipoDocumento,
      estado: 'Cargado',
      fecha: fecha,
      descripcion: this.formData.descripcion
    };
    
    this.documentos.unshift(nuevoDocumento);
    console.log('Documento subido:', nuevoDocumento, 'Archivo:', this.selectedFile);
    
    alert('Documento contable subido exitosamente');
    this.closeModal();
    this.calculateTotalPages();
  }
  
  resetForm(): void {
    this.formData = {
      tipoDocumento: 'Balance',
      fecha: this.formatDate(new Date()),
      descripcion: ''
    };
    this.selectedFile = null;
  }
  
  editarDocumento(doc: DocumentoContable): void {
    console.log('Editar documento:', doc);
    // Implementar lógica de edición
  }
  
  eliminarDocumento(doc: DocumentoContable): void {
    if (confirm(`¿Está seguro de eliminar el documento ${doc.tipoDocumento} de ${doc.mes} ${doc.anio}?`)) {
      this.documentos = this.documentos.filter(d => d.id !== doc.id);
      this.calculateTotalPages();
      console.log('Documento eliminado:', doc);
    }
  }
  
  descargarDocumento(doc: DocumentoContable): void {
    console.log('Descargar documento:', doc);
    // Implementar lógica de descarga
    alert(`Descargando ${doc.tipoDocumento}...`);
  }
}
