# 🔄 Flujo de Eliminación - Diagrama y Lógica

## Flujo General de Eliminación

```
┌─────────────────────────────────────────────────────────────────┐
│                    Usuario Selecciona Eliminar                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌─────────────────────────────────────┐
        │  DeleteActionComponent.onDelete()  │
        └────────────┬────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────┐
        │  Validar Permisos (canDelete)   │
        │  PermissionService.canDelete()  │
        └────────┬─────────────────────┬──┘
                 │                     │
              ✅ SÍ                  ❌ NO
                 │                     │
                 ▼                     ▼
        ┌──────────────────┐   ┌────────────────────┐
        │ Mostrar          │   │ Ocultar botón de   │
        │ Confirmación     │   │ eliminación        │
        └────┬─────────────┘   │ (no hacer nada)    │
             │                 └────────────────────┘
             ▼
    ┌──────────────────────┐
    │ Usuario Confirma?    │
    └────┬────────────┬────┘
         │            │
      ✅ SÍ       ❌ NO
         │            │
         ▼            ▼
    ┌───────────┐  (Cancelar)
    │ Eliminar  │
    │  HTTP     │
    │ DELETE    │
    └─────┬─────┘
          │
          ▼
    ┌──────────────────┐
    │  Respuesta       │
    │  del Backend     │
    └────┬──────┬─────┘
         │      │
      ✅ 200  ❌ Error
         │      │
         ▼      ▼
    ┌────────┐ ┌──────────┐
    │ Éxito  │ │  Error   │
    │ Emitir │ │ Mostrar  │
    │ evento │ │ Mensaje  │
    │ deleted│ │ Consola  │
    └────────┘ └──────────┘
         │
         ▼
    Recargar Datos
```

## Flujo de Validación de Permisos

```
┌─────────────────────────────────────────────────────────┐
│  PermissionService.canDeleteProceso(proceso)           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────┐
    │ Obtener usuario actual del token │
    │ AuthService.currentUser()        │
    └───────────┬──────────────────────┘
                │
                ▼
    ┌──────────────────────┐
    │ ¿Usuario encontrado? │
    └────┬────────────┬────┘
         │            │
      ✅ SÍ       ❌ NO
         │            │
         ▼            ▼
    ┌──────────────┐  ┌────────┐
    │ Continuar    │  │ return │
    │              │  │ false  │
    └────┬─────────┘  └────────┘
         │
         ▼
    ┌──────────────────────┐
    │ ¿Rol = ADMIN?        │
    └────┬────────────┬────┘
         │            │
      ✅ SÍ       ❌ NO
         │            │
         ▼            ▼
    ┌────────┐   ┌────────────────────────┐
    │ return │   │ ¿userId = createdById? │
    │ true   │   └───┬────────────────┬───┘
    └────────┘       │              │
                  ✅ SÍ          ❌ NO
                     │              │
                     ▼              ▼
                ┌────────┐     ┌────────┐
                │ return │     │ return │
                │ true   │     │ false  │
                └────────┘     └────────┘
```

## Diagrama de Componentes y Servicios

```
┌────────────────────────────────────────────────────────────────┐
│                        COMPONENTES UI                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐        ┌──────────────────┐            │
│  │ DeleteAction     │        │ Componentes      │            │
│  │ Component        │        │ Existentes       │            │
│  │ (standalone)     │───────▶│ (procesos, etc)  │            │
│  └────────┬─────────┘        └──────────────────┘            │
│           │ emite (deleted)                                   │
│           │                                                   │
└───────────┼───────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│                       SERVICIOS                               │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ DeletionService                                          │ │
│  │ • deleteWithConfirmation()                               │ │
│  │ • canDelete()                                            │ │
│  │ • delete()                                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│           │                                                    │
│           ├─────────────────────┬─────────────────────┐        │
│           ▼                     ▼                     ▼        │
│  ┌────────────────────┐ ┌───────────────┐ ┌───────────────┐  │
│  │ ProcesoService     │ │ Expediente    │ │ Permission    │  │
│  │                    │ │ Service       │ │ Service       │  │
│  │ • eliminarProceso()│ │               │ │               │  │
│  │ • canDelete()      │ │ • eliminar... │ │ • canDelete...│  │
│  │ • HTTP DELETE      │ │ • canDelete() │ │ • isAdmin()   │  │
│  │                    │ │ • HTTP DELETE │ │ • isCreator() │  │
│  └────────────────────┘ └───────────────┘ └───────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│                      AUTENTICACIÓN                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ AuthService                                              │ │
│  │ • currentUser() - obtiene usuario del token              │ │
│  │ • currentUser().role - obtiene rol                       │ │
│  │ • getToken() - obtiene JWT token                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
            │
            ▼
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND / API                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  DELETE /api/procesos/{id}                                    │
│  • Valida token JWT                                           │
│  • Obtiene userId del token                                   │
│  • Verifica: userId == createdById OR user.role == ADMIN      │
│  • Retorna 403 Forbidden si no autorizado                     │
│  • Elimina y retorna 200 OK                                   │
│                                                                │
│  DELETE /api/expedientes/{id}                                 │
│  • Misma validación que procesos                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos - Get Proceso con createdById

```
Backend Response:
{
  "id": 1,
  "nombre": "Proceso A",
  "numeroProceso": "P-001",
  "createdById": 5,              ◄── IMPORTANTE: Debe incluir esto
  "createdByNombre": "Juan Pérez",
  "estado": "ACTIVO",
  "clienteId": 1,
  "abogadoResponsableId": 2,
  ...
}
        │
        ▼
ProcesoDTO (Frontend)
        │
        ▼
PermissionService.canDeleteProceso()
        │
        ├─ currentUser.role == 'ADMIN'?  → YES: return true
        │
        └─ createdById == currentUserId? → YES: return true
                                         → NO: return false
        │
        ▼
DeleteActionComponent mostrará/ocultará botón
```

## Validación de Seguridad en Capas

```
┌─────────────────────────────────────────────────────┐
│        CAPA 1: Frontend - UI (DeleteActionComponent)│
│  Objetivo: Mejorar UX - no mostrar botones sin      │
│  permiso pero NO es seguro                          │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
         USUARIO VE BOTÓN Y HACE CLICK
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│   CAPA 2: Frontend - Validación (PermissionService)│
│  Objetivo: Evitar enviar request innecesarios       │
│  NO es seguro contra manipulación                   │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
         HTTP DELETE /api/procesos/{id}
         + JWT Token en Header
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│      CAPA 3: Backend - Autenticación (Filtro)      │
│  Objetivo: Validar que el token es válido           │
│  Verifica: Token correcto, no expirado              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│  CAPA 4: Backend - Autorización (Negocio)          │
│  Objetivo: Validar que el usuario tiene permiso     │
│  Verifica: userId == createdById OR user.role==ADMIN│
│  ⚠️ ESTA ES LA CAPA CRÍTICA DE SEGURIDAD           │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
             Eliminar del Base de Datos
```

## Casos de Uso y Respuestas

### Caso 1: Usuario Admin elimina cualquier proceso
```
Usuario: Admin (role=ADMIN)
Acción: Intenta eliminar proceso creado por otro
Frontend: ✅ canDelete() = true (es admin)
Backend: ✅ Valida JWT → Extrae userId → Verifica role=ADMIN → ✅ Elimina
Resultado: 200 OK - Proceso eliminado
```

### Caso 2: Usuario no-admin elimina su propio proceso
```
Usuario: Juan (id=5, role=ABOGADO)
Acción: Intenta eliminar proceso que él creó (createdById=5)
Frontend: ✅ canDelete() = true (es creador)
Backend: ✅ Valida JWT → userId=5 → Verifica userId==createdById → ✅ Elimina
Resultado: 200 OK - Proceso eliminado
```

### Caso 3: Usuario no-admin intenta eliminar proceso de otro
```
Usuario: Juan (id=5, role=ABOGADO)
Acción: Intenta eliminar proceso creado por otro (createdById=7)
Frontend: ❌ canDelete() = false → Botón no aparece/deshabilitado
Backend: ❌ (si logra hacer request) Valida JWT → userId=5 ≠ createdById=7 
         y role≠ADMIN → 403 Forbidden
Resultado: No se elimina, usuario no puede ni intentarlo
```

### Caso 4: Usuario no autenticado
```
Usuario: No hay usuario (token = null)
Acción: Intenta acceder a Delete
Frontend: ❌ canDelete() = false → Botón no aparece
Backend: ❌ Sin token JWT → 401 Unauthorized
Resultado: No se elimina, se redirige a login
```

## Recomendaciones de Seguridad

1. ✅ **Validar en Frontend**: Para mejorar UX
2. ✅ **Validar en Backend**: Para seguridad real (crítico)
3. ✅ **Usar JWT**: Para autenticación
4. ✅ **Incluir userId en JWT**: Para verificación rápida
5. ✅ **Logs**: Registrar quién intenta eliminar qué
6. ✅ **Rate limiting**: Limitar intentos de eliminación
7. ✅ **Soft delete**: Considerar marcar como eliminado en lugar de borrar
