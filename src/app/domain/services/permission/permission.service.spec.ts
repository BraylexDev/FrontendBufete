import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { AuthService } from '../auth/auth.service';
import { ProcesoDTO } from '../../models/proceso';
import { ExpedienteDTO } from '../../models/expediente';

describe('PermissionService', () => {
  let service: PermissionService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionService]
    });
    service = TestBed.inject(PermissionService);
    authService = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('canDeleteProceso', () => {
    let mockProceso: ProcesoDTO;

    beforeEach(() => {
      mockProceso = {
        id: 1,
        nombre: 'Test Proceso',
        numeroProceso: 'P001',
        clienteId: 1,
        abogadoResponsableId: 1,
        createdById: 5
      };
    });

    it('should return true if user is admin', () => {
      spyOn(authService, 'currentUser').and.returnValue({
        nombre: 'Admin User',
        email: 'admin@test.com',
        role: 'ADMIN'
      } as any);

      expect(service.canDeleteProceso(mockProceso)).toBe(true);
    });

    it('should return true if user is creator', () => {
      spyOn(authService, 'currentUser').and.returnValue({
        nombre: 'Creator User',
        email: 'creator@test.com',
        role: 'ABOGADO'
      } as any);

      expect(service.canDeleteProceso(mockProceso)).toBe(true);
    });

    it('should return false if user is not admin and not creator', () => {
      spyOn(authService, 'currentUser').and.returnValue({
        nombre: 'Other User',
        email: 'other@test.com',
        role: 'ABOGADO'
      } as any);

      const otherProceso: ProcesoDTO = { ...mockProceso, createdById: 999 };
      expect(service.canDeleteProceso(otherProceso)).toBe(false);
    });
  });

  describe('canDeleteExpediente', () => {
    let mockExpediente: ExpedienteDTO;

    beforeEach(() => {
      mockExpediente = {
        id: 1,
        nombre: 'Test Expediente',
        estado: 'ACTIVO',
        fechaCreacion: '2024-01-01',
        procesoId: 1,
        procesoNombre: 'Test',
        procesoNumero: 'P001',
        rootNodeId: 'root1',
        orden: 1,
        createdByNombre: 'Test User',
        createdById: 5,
        updatedAt: '2024-01-01',
        totalDocumentos: 0,
        totalSize: 0
      };
    });

    it('should return true if user is admin', () => {
      spyOn(authService, 'currentUser').and.returnValue({
        nombre: 'Admin User',
        email: 'admin@test.com',
        role: 'ADMIN'
      } as any);

      expect(service.canDeleteExpediente(mockExpediente)).toBe(true);
    });
  });
});
