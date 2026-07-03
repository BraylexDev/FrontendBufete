# Gestión de Eliminación de Procesos y Expedientes

## 📋 Descripción

Se ha implementado un sistema robusto y seguro para eliminar procesos y expedientes en la aplicación Angular 19. El sistema permite que:

- ✅ El usuario que creó el proceso/expediente pueda eliminarlo
- ✅ Los usuarios con permisos administrativos (rol ADMIN) puedan eliminar cualquier proceso/expediente
- ✅ Se valide permiso antes de mostrar UI o permitir acción
- ✅ Se solicite confirmación antes de eliminar
- ✅ Se maneje errores de forma elegante

## 🏗️ Arquitectura

### Modelos Actualizados
- **ProcesoDTO**: Ahora incluye `createdById` para identificar al creador
- **ExpedienteDTO**: Ahora incluye `createdById` para identificar al creador

### Nuevos Servicios

#### 1. **PermissionService**
Valida permisos de eliminación:
```typescript
// Verificar si puede eliminar un proceso
const canDelete = permissionService.canDeleteProceso(proceso);

// Verificar si puede eliminar un expediente
const canDelete = permissionService.canDeleteExpediente(expediente);
```

#### 2. **DeletionService**
Maneja la eliminación con confirmación:
```typescript
// Eliminar con confirmación
deletionService.deleteWithConfirmation(proceso, 'proceso').subscribe({
  next: () => console.log('Eliminado'),
  error: (err) => console.error('Error:', err)
});
```

### Nuevos Componentes

#### **DeleteActionComponent**
Componente reutilizable que muestra botón de eliminar solo si hay permisos:

```typescript
// En template
<app-delete-action 
  [itemType]="'proceso'"
  [item]="proceso"
  (deleted)="onProcesoClosed()">
</app-delete-action>
```

### Nuevas Directivas

#### **CanDeleteDirective** (*appCanDelete)
Muestra/oculta contenido basado en permisos:

```html
<!-- El contenido solo será visible si el usuario puede eliminar -->
<div *appCanDelete="let _ ; item: proceso; type: 'proceso'">
  <button (click)="deleteProceso()">Eliminar</button>
</div>
```

## 🎯 Casos de Uso

### Caso 1: En una lista de procesos
```typescript
import { DeleteActionComponent } from '../../shared/components/delete-action/delete-action.component';

@Component({
  selector: 'app-procesos-list',
  standalone: true,
  imports: [CommonModule, DeleteActionComponent],
  template: `
    <div *ngFor="let proceso of procesos" class="proceso-item">
      <h4>{{ proceso.nombre }}</h4>
      <p>Creado por: {{ proceso.createdByNombre }}</p>
      
      <!-- Botón de eliminar solo aparece si tiene permisos -->
      <app-delete-action 
        [itemType]="'proceso'"
        [item]="proceso"
        (deleted)="onProcesoDeleted()">
      </app-delete-action>
    </div>
  `
})
export class ProcesosListComponent {
  procesos: ProcesoDTO[] = [];

  onProcesoDeleted(): void {
    // Recargar lista
    this.loadProcesos();
  }
}
```

### Caso 2: Con DeletionService manual
```typescript
import { DeletionService } from '../../shared/services/deletion.service';

@Component({...})
export class ProcesoDetailComponent {
  constructor(private deletionService: DeletionService) {}

  eliminarProceso(proceso: ProcesoDTO): void {
    this.deletionService.deleteWithConfirmation(proceso, 'proceso').subscribe({
      next: () => {
        alert('Proceso eliminado exitosamente');
        this.router.navigate(['/procesos']);
      },
      error: (err) => {
        if (err.message !== 'Eliminación cancelada por el usuario') {
          console.error('Error:', err);
        }
      }
    });
  }
}
```

### Caso 3: Con directiva (si se implementa)
```html
<div *appCanDelete="let _ ; item: proceso; type: 'proceso'">
  <button class="btn btn-danger" (click)="deleteProceso()">
    Eliminar Proceso
  </button>
</div>
```

## 🔐 Validación de Seguridad

### Frontend
- Se verifica rol del usuario (ADMIN)
- Se verifica si es el creador (comparando `createdById`)
- Solo se muestra UI si tiene permisos

### Backend (debe validar también)
1. Verificar token JWT
2. Extraer userId del token
3. Obtener proceso/expediente
4. Validar: `userId === createdById OR user.role === ADMIN`
5. Eliminar si validación pasa

**IMPORTANTE**: La validación del backend es crítica para la seguridad.

## 📦 Dependencias

- Angular 19+
- HttpClient (ya existe)
- AuthService (ya existe)
- RxJS (ya existe)

## 🚀 Próximos Pasos

1. **Backend**: Asegurar que endpoints `/procesos/{id}` y `/expedientes/{id}` DELETE validen permisos
2. **Backend**: Incluir `createdById` en respuestas DTO
3. **UI**: Integrar `DeleteActionComponent` en componentes de lista
4. **Testing**: Agregar tests para validaciones de permisos

## 📝 Notas Importantes

- ✅ Todos los servicios usan inyección de dependencias (DI)
- ✅ Los componentes son standalone (compatible con Angular 19)
- ✅ Uso de Signals para reactividad
- ✅ Sin romper código existente
- ✅ Compatible con arquitectura actual
