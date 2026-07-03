# ⚙️ CONFIGURACIÓN Y SETUP

## 🔧 Configuración Requerida

### 1. Backend - DTOs

Asegúrate de que tus DTOs incluyan `createdById`:

```java
// ProcesoDTO.java
@Data
public class ProcesoDTO {
    private Integer id;
    private String nombre;
    private String numeroProceso;
    private Integer clienteId;
    private Integer abogadoResponsableId;
    
    // 👇 IMPORTANTE: Agregar estos campos
    private Integer createdById;      // ID del usuario que creó
    private String createdByNombre;   // Nombre del usuario que creó
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // ... otros campos
}

// ExpedienteDTO.java
@Data
public class ExpedienteDTO {
    private Integer id;
    private String nombre;
    private Integer procesoId;
    
    // 👇 IMPORTANTE: Agregar
    private Integer createdById;      // ID del usuario que creó
    private String createdByNombre;   // Nombre del usuario que creó
    
    private LocalDateTime createdAt;
    // ... otros campos
}
```

---

### 2. Backend - Endpoints DELETE

Asegúrate de validar permisos en los endpoints DELETE:

```java
// ProcesosController.java
@DeleteMapping("/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> deleteProceso(@PathVariable Integer id, @AuthenticationPrincipal UserDetails userDetails) {
    try {
        Proceso proceso = procesoService.obtenerById(id);
        
        if (proceso == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Obtener ID del usuario actual
        Usuario usuario = usuarioService.obtenerPorEmail(userDetails.getUsername());
        
        // Validar permisos
        boolean isCreator = proceso.getCreatedById().equals(usuario.getId());
        boolean isAdmin = usuarioService.isAdmin(usuario);
        
        if (!isCreator && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse(false, "No tienes permisos para eliminar este proceso", null));
        }
        
        // Eliminar
        procesoService.eliminar(id);
        
        return ResponseEntity.ok(new ApiResponse(true, "Proceso eliminado exitosamente", null));
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ApiResponse(false, "Error al eliminar: " + e.getMessage(), null));
    }
}

// Similar para ExpedientesController
@DeleteMapping("/expediente/{id}")
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> deleteExpediente(@PathVariable Integer id, @AuthenticationPrincipal UserDetails userDetails) {
    // Mismo patrón que arriba
}
```

---

### 3. Backend - Método isAdmin en UserService

```java
// UserService.java
public boolean isAdmin(Usuario usuario) {
    return usuario.getRol() != null && 
           (usuario.getRol().getNombre().equals("ADMIN") ||
            usuario.getRol().getNombre().equals("ADMINISTRADOR"));
}
```

---

### 4. Backend - JPA Entities

Asegúrate de que tus entidades JPA tengan auditoría:

```java
@Entity
@Data
public class Proceso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    // ... campos del proceso
    
    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private Usuario createdBy;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

### 5. Frontend - AuthService

Verifica que tu AuthService devuelva el rol correctamente:

```typescript
// auth.service.ts
login(credentials: LoginRequest): Observable<JwtAuthResponse> {
  return this.http.post<JwtAuthResponse>(`${this.API_URL}/signin`, credentials)
    .pipe(
      tap(response => {
        // Asegurar que el rol se guarda correctamente
        const user: User = {
          email: response.email,
          nombre: response.name,
          role: response.rol  // ✅ Verificar que esto viene del backend
        };
        this.setUser(user);
        this.currentUserSignal.set(user);
      })
    );
}
```

---

### 6. Frontend - PermissionService (Roles)

Actualiza los roles según tu sistema:

```typescript
// permission.service.ts
private isAdmin(role: string): boolean {
  return role === 'ADMIN' || 
         role === 'admin' || 
         role === 'ADMINISTRADOR' ||
         role === 'ADMIN_SYSTEM';  // Agregar los que uses
}
```

---

### 7. Frontend - Rutas (app.routes.ts)

Agrega las rutas para los componentes:

```typescript
// app.routes.ts
import { GestionProceso } from './features/procesos/gestion-proceso/gestion-proceso';
import { GestionExpedientesComponent } from './features/fileExplorer/gestion-expedientes/gestion-expedientes.component';

export const routes: Routes = [
  // ... otras rutas
  
  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'gestion-procesos',
        component: GestionProceso
      },
      {
        path: 'gestion-expedientes',
        component: GestionExpedientesComponent
      }
      // ... otras rutas
    ]
  }
];
```

---

### 8. Frontend - Interceptor HTTP

Verifica que tu interceptor incluya el JWT token:

```typescript
// auth.interceptor.ts
intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
  const token = this.authService.getToken();
  
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  return next.handle(request);
}
```

---

### 9. Backend - Manejo de Excepciones Global

Considera agregar un exception handler:

```java
@ControllerAdvice
public class GlobalExceptionHandler {
  
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<?> handleAccessDenied(AccessDeniedException ex) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
      .body(new ApiResponse(false, "Acceso denegado", null));
  }
  
  @ExceptionHandler(Exception.class)
  public ResponseEntity<?> handleGeneral(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(new ApiResponse(false, "Error interno: " + ex.getMessage(), null));
  }
}
```

---

### 10. Variantes de Roles en Diferentes Sistemas

Si tu sistema usa roles diferentes, actualiza `PermissionService`:

```typescript
// Si usas roles simples (STRING)
private isAdmin(role: string): boolean {
  return ['ADMIN', 'ADMIN_SYSTEM', 'SUPER_USER', 'ROOT'].includes(role);
}

// Si usas roles con permisos
private isAdmin(role: string): boolean {
  const adminPermissions = ['DELETE_PROCESO', 'DELETE_EXPEDIENTE', 'MANAGE_ALL'];
  return this.userPermissions.some(p => adminPermissions.includes(p));
}

// Si usas roles en minúsculas
private isAdmin(role: string): boolean {
  return role?.toLowerCase() === 'admin';
}
```

---

## 🚀 Pasos de Implementación

### Paso 1: Actualizar Backend
```bash
1. Agregar createdById a DTOs
2. Actualizar entidades JPA
3. Modificar endpoints DELETE
4. Testear permisos
```

### Paso 2: Verificar Frontend
```bash
1. AuthService devuelve rol
2. PermissionService tiene roles correctos
3. DTOs tienen createdById
4. Interceptor incluye token
```

### Paso 3: Rutas y Componentes
```bash
1. Agregar rutas (app.routes.ts)
2. Importar componentes
3. Verificar módulos
```

### Paso 4: Testing
```bash
1. npm start (servidor)
2. Probar gestión-procesos
3. Probar permisos
4. Probar eliminación
```

---

## 📋 Checklist de Configuración

- [ ] Backend: DTOs actualizados con createdById
- [ ] Backend: Entidades JPA con auditoría
- [ ] Backend: Endpoints DELETE validan permisos
- [ ] Backend: Retorna 403 si no autorizado
- [ ] Frontend: AuthService devuelve rol correcto
- [ ] Frontend: PermissionService tiene roles correctos
- [ ] Frontend: Rutas configuradas
- [ ] Frontend: Interceptor incluye JWT
- [ ] Frontend: Componentes importados
- [ ] npm start ejecuta sin errores
- [ ] Tabla de procesos carga
- [ ] Botón de eliminar aparece (con permisos)
- [ ] Eliminación funciona

---

## 🔍 Debugging

### Si el botón NO aparece

```typescript
// Verificar permisos
console.log('Current User:', authService.currentUser());
console.log('Can Delete:', permissionService.canDeleteProceso(proceso));
console.log('Role:', authService.currentUser()?.role);
console.log('CreatedById:', proceso.createdById);
```

### Si la eliminación falla

```typescript
// Verificar request
// DevTools → Network → DELETE request
// Headers → Authorization: Bearer {token}
// Response → 403 Forbidden OR 401 Unauthorized

// Verificar token
console.log('Token:', authService.getToken());
console.log('Token válido:', !authService.isTokenExpired(token));
```

### Si createdById es null

```javascript
// En DevTools Console
const procesos = document.querySelectorAll('tr');
console.table(procesos.map(p => ({
  nombre: p.cells[0].textContent,
  createdById: p.proceso?.createdById  // Verificar
})));
```

---

## 🆘 Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| Botón no aparece | Sin permisos | Verificar createdById |
| 403 Forbidden | Backend rechaza | Validar token JWT |
| 401 Unauthorized | Token inválido | Volver a login |
| Tabla vacía | Endpoint no devuelve datos | Verificar backend |
| createdById es null | DTO incompleto | Agregar campo en backend |
| Role es undefined | AuthService no guarda rol | Verificar login |

---

## 📞 Support

Si necesitas ayuda:

1. Revisa los diagramas en `DELETION_FLOW_DIAGRAM.md`
2. Sigue la guía en `INTEGRATION_GUIDE.ts`
3. Consulta la documentación en `DELETION_FEATURE_README.md`
4. Ejecuta tests en `TESTING_GUIDE.md`

---

¡Configuración lista! 🎉
