import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Constancia {
  id: number;
  idCliente: string;
  cliente: string;
  nombreDocumento: string;
  fechaSubida: string;
  tipoDocumentoCliente?: string;
  descripcion?: string;
}

@Component({
  selector: 'app-constancia-carcelaria',
  imports: [FormsModule, CommonModule],
  templateUrl: './constancia-carcelaria.component.html',
  styleUrl: './constancia-carcelaria.component.scss'
})
export class ConstanciaCarcelariaComponent {

  showModal: boolean = false;
  
  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  anios: number[] = [];
  
  tiposDocumentoCliente = [
    { value: 'CC', label: 'Cédula de Ciudadanía (CC)' },
    { value: 'NIT', label: 'NIT' },
    { value: 'TI', label: 'Tarjeta de Identidad (TI)' },
    { value: 'CE', label: 'Cédula de Extranjería (CE)' },
    { value: 'PP', label: 'Pasaporte (PP)' }
  ];
  
  // Filtros
  mesSeleccionado: string = 'Abril';
  anioSeleccionado: number = 2025;
  searchTerm: string = '';
  
  // Formulario modal
  formData = {
    tipoDocumentoCliente: 'CC',
    numeroDocumento: '',
    nombreCliente: '',
    nombreDocumento: '',
    fecha: '',
    descripcion: ''
  };
  
  selectedFile: File | null = null;
  
  // Datos de la tabla
  constancias: Constancia[] = [
    {
      id: 1,
      idCliente: '1067921325',
      cliente: 'Pepito Perez',
      nombreDocumento: 'Constancia Visita Carcelaria',
      fechaSubida: '15/02/2023',
      tipoDocumentoCliente: 'CC'
    }
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
  
  get constanciasFiltradas(): Constancia[] {
    return this.constancias.filter(constancia => {
      const searchLower = this.searchTerm.toLowerCase();
      const matchesSearch = !this.searchTerm || 
        constancia.idCliente.toLowerCase().includes(searchLower) ||
        constancia.cliente.toLowerCase().includes(searchLower) ||
        constancia.nombreDocumento.toLowerCase().includes(searchLower);
      
      return matchesSearch;
    });
  }
  
  get constanciasPaginadas(): Constancia[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.constanciasFiltradas.slice(startIndex, endIndex);
  }
  
  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.constanciasFiltradas.length / this.itemsPerPage);
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
  
  onSearchChange(): void {
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
    if (!this.formData.tipoDocumentoCliente || !this.formData.numeroDocumento || 
        !this.formData.nombreCliente || !this.formData.nombreDocumento ||
        !this.formData.fecha || !this.formData.descripcion || !this.selectedFile) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }
    
    const nuevaConstancia: Constancia = {
      id: this.constancias.length + 1,
      idCliente: this.formData.numeroDocumento,
      cliente: this.formData.nombreCliente,
      nombreDocumento: this.formData.nombreDocumento,
      fechaSubida: 'Cargado',
      tipoDocumentoCliente: this.formData.tipoDocumentoCliente,
      descripcion: this.formData.descripcion
    };
    
    this.constancias.unshift(nuevaConstancia);
    
    alert('Constancia subida exitosamente');
    this.closeModal();
    this.calculateTotalPages();
  }
  
  resetForm(): void {
    this.formData = {
      tipoDocumentoCliente: 'CC',
      numeroDocumento: '',
      nombreCliente: '',
      nombreDocumento: '',
      fecha: this.formatDate(new Date()),
      descripcion: ''
    };
    this.selectedFile = null;
  }
  
  editarConstancia(constancia: Constancia): void {
    console.log('Editar constancia:', constancia);
    // Implementar lógica de edición
  }
  
  eliminarConstancia(constancia: Constancia): void {
    if (confirm(`¿Está seguro de eliminar la constancia de ${constancia.cliente}?`)) {
      this.constancias = this.constancias.filter(c => c.id !== constancia.id);
      this.calculateTotalPages();
      console.log('Constancia eliminada:', constancia);
    }
  }
  
  descargarConstancia(constancia: Constancia): void {
    console.log('Descargar constancia:', constancia);
    // Implementar lógica de descarga
    alert(`Descargando constancia de ${constancia.cliente}...`);
  }
  
  getTipoDocumentoLabel(tipo: string): string {
    const tipoDoc = this.tiposDocumentoCliente.find(t => t.value === tipo);
    return tipoDoc ? tipoDoc.label : tipo;
  }
}
