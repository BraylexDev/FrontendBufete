# ✅ Checklist de Implementación - Gestión de Eliminación

## 🎯 Fase 1: Modelos (COMPLETADO)

- [x] **ProcesoDTO** - Agregado campo `createdById: number`
  - Ubicación: `src/app/domain/models/proceso.ts`
  
- [x] **ExpedienteDTO** - Agregado campo `createdById: number`
  - Ubicación: `src/app/domain/models/expediente.ts`

## 🎯 Fase 2: Servicios de Backend (PENDIENTE - Backend)

- [ ] Endpoint `DELETE /procesos/{id}`
  - Validar que solo el creador o admin pueden eliminar
  - Incluir `createdById` en respuestas GET
  
- [ ] Endpoint `DELETE /expedientes/{id}`
  - Validar que solo el creador o admin pueden eliminar
  - Incluir `createdById` en respuestas GET

## 🎯 Fase 3: Servicios Frontend (COMPLETADO)

- [x] **PermissionService** - Valida permisos
  - Ubicación: `src/app/domain/services/permission/permission.service.ts`
  - Métodos: `canDeleteProceso()`, `canDeleteExpediente()`
  
- [x] **ProcesoService** - Extendido
  - Ubicación: `src/app/domain/services/proceso/proceso.service.ts`
  - Nuevo método: `canDelete()`
  
- [x] **ExpedienteService** - Extendido
  - Ubicación: `src/app/domain/services/expediente/expediente.service.ts`
  - Nuevo método: `canDelete()`
  
- [x] **DeletionService** - Manejo centralizado
  - Ubicación: `src/app/shared/services/deletion.service.ts`
  - Métodos: `deleteWithConfirmation()`, `canDelete()`, `delete()`

## 🎯 Fase 4: Componentes Frontend (COMPLETADO)

- [x] **DeleteActionComponent** - Botón reutilizable
  - Ubicación: `src/app/shared/components/delete-action/delete-action.component.ts`
  - Valida permisos antes de mostrar
  - Solicita confirmación
  - Maneja errores

## 🎯 Fase 5: Directivas Frontend (COMPLETADO)

- [x] **CanDeleteDirective** - Control condicional
  - Ubicación: `src/app/shared/directives/can-delete.directive.ts`
  - Muestra/oculta contenido basado en permisos

## 🎯 Fase 6: Tests (COMPLETADO)

- [x] **PermissionService.spec.ts** - Tests unitarios
  - Ubicación: `src/app/domain/services/permission/permission.service.spec.ts`

## 🎯 Fase 7: Integración en Componentes (PENDIENTE)

- [ ] Integrar en componentes que muestren procesos
  - Revisar: `src/app/features/reportes/`
  - Revisar: `src/app/features/procesos/`
  - Revisar: `src/app/features/home/`
  
- [ ] Integrar en componentes que muestren expedientes
  - Revisar: `src/app/features/fileExplorer/`
  - Revisar: `src/app/features/gestionAdministrativa/`

## 🎯 Fase 8: Documentación (COMPLETADO)

- [x] **DELETION_FEATURE_README.md** - Documentación principal
  - Arquitectura
  - Casos de uso
  - Validación de seguridad
  
- [x] **INTEGRATION_GUIDE.ts** - Guía de integración
  - Ejemplos de código
  - Paso a paso
  - Patrones de uso

## 🎯 Fase 9: Validación de Seguridad (PENDIENTE)

- [ ] **Verificar roles en AuthService**
  - El AuthService debe devolver el rol correctamente
  - Los roles deben estar normalizados (ej: ADMIN, ADMINISTRADOR)

- [ ] **Verificar token JWT**
  - El token debe contener userId
  - O se debe almacenar userId en localStorage

- [ ] **Backend - Validaciones obligatorias**
  - [ ] El endpoint DELETE debe validar permisos
  - [ ] Retornar 403 si no tiene permisos
  - [ ] Retornar 404 si no existe el recurso
  - [ ] Retornar 200 y el objeto eliminado al éxito

## 🎯 Próximos Pasos

### 1️⃣ Validar Backend
```bash
# Verificar que los endpoints DELETE validen permisos
GET /procesos/1  # Debe incluir createdById
DELETE /procesos/1  # Debe validar permisos (401/403)
```

### 2️⃣ Actualizar Modelos (si es necesario)
Asegurarse que el backend devuelve `createdById` en todas las respuestas GET.

### 3️⃣ Integrar en Componentes
Seguir la guía en `INTEGRATION_GUIDE.ts` para integrar la funcionalidad.

### 4️⃣ Testear
```bash
npm test  # Ejecutar tests
npm run e2e  # Tests end-to-end (si existen)
```

### 5️⃣ Verificar Roles
Confirmar con el equipo de backend cuál es el nombre correcto del rol administrativo:
- ADMIN
- ADMINISTRADOR
- ADMIN_USER
- etc.

## 🔧 Configuración de Roles (en PermissionService)

Si el rol administrativo es diferente al esperado, actualizar `isAdmin()`:

```typescript
private isAdmin(role: string): boolean {
  return role === 'ADMIN' || role === 'admin' || role === 'ADMINISTRADOR' || role === 'TU_ROL_AQUI';
}
```

## 📊 Estado Actual

✅ **Frontend**: 100% Completado
- ✅ Modelos actualizados
- ✅ Servicios implementados
- ✅ Componentes creados
- ✅ Directivas creadas
- ✅ Tests base agregados
- ✅ Documentación completa

⏳ **Backend**: Pendiente validación
- ⏳ Endpoints DELETE deben validar permisos
- ⏳ DTOs deben incluir createdById

⏳ **Integración**: Pendiente en componentes existentes
- ⏳ Importar DeleteActionComponent
- ⏳ Usar en templates
- ⏳ Conectar eventos

## 💡 Tips Importantes

1. **Seguridad**: La validación del backend es CRÍTICA. No confiar solo en el frontend.
2. **UX**: Mostrar mensaje claro cuando no hay permisos.
3. **Feedback**: Confirmar acción antes de eliminar.
4. **Errores**: Capturar y mostrar errores del servidor.
5. **Performance**: Solo recargar lo necesario después de eliminar.

## 📞 Soporte

Si hay preguntas sobre:
- **Permisos**: Ver `PermissionService`
- **Eliminación**: Ver `DeletionService`
- **UI**: Ver `DeleteActionComponent`
- **Integración**: Ver `INTEGRATION_GUIDE.ts`
- **Documentación**: Ver `DELETION_FEATURE_README.md`
