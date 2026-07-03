# 🧪 TESTING GUIDE - Gestión de Eliminación

## Testing Manual

### 1️⃣ Navegar a Gestión de Procesos

```
URL: http://localhost:4200/gestion-procesos
```

**Verificar**:
- [ ] Página carga sin errores
- [ ] Tabla muestra procesos del usuario
- [ ] Columnas correctas (nombre, número, cliente, estado, creador, acciones)
- [ ] Spinner aparece mientras carga

---

### 2️⃣ Prueba de Búsqueda

```typescript
// Escribir en campo de búsqueda:
// 1. Por nombre
"Divorcio" → Filtra procesos con "Divorcio" en nombre
// 2. Por número
"P-001" → Filtra procesos con "P-001"
// 3. Por cliente
"Juan" → Filtra procesos del cliente "Juan"
```

**Verificar**:
- [ ] Búsqueda responde en tiempo real
- [ ] Resultados se filtran correctamente
- [ ] Mensaje "No se encontraron procesos" aparece si no hay resultados
- [ ] Limpiar búsqueda muestra todos nuevamente

---

### 3️⃣ Verificar Botón de Eliminar

**Si eres el creador del proceso**:
```
✅ El botón "🗑️ Eliminar" debe aparecer
```

**Si NO eres el creador y NO eres admin**:
```
❌ El botón "🗑️ Eliminar" NO debe aparecer
```

**Si eres admin**:
```
✅ El botón "🗑️ Eliminar" debe aparecer para todos
```

---

### 4️⃣ Probar Eliminación

**Pasos**:
1. Haz click en botón "🗑️ Eliminar"
2. Verifica que aparezca confirmación:
   ```
   "¿Está seguro de que desea eliminar el proceso "XXX"?"
   ```
3. Haz click en "Cancelar" → No debe eliminar
4. Haz click nuevamente en "🗑️ Eliminar"
5. Haz click en "Aceptar" → Debe eliminar

**Verificar**:
- [ ] Mensaje de confirmación es claro
- [ ] Botón "Eliminar" está deshabilitado durante la operación
- [ ] Aparece mensaje "Proceso eliminado exitosamente"
- [ ] La tabla se recarga automáticamente
- [ ] El proceso no aparece más en la lista

---

### 5️⃣ Probar Estados

#### Empty State (Sin procesos)
```
1. Eliminar todos los procesos
2. Página debe mostrar:
   - Ícono de carpeta vacía
   - "No hay procesos"
   - "Aún no tienes procesos registrados..."
```

#### Loading State
```
1. Abrir DevTools (F12)
2. Network → Throttle a 3G lento
3. Recargar página (F5)
4. Debe mostrar spinner de carga
```

#### Error State
```
1. Backend: Deshabilitar endpoint /procesos
2. Recargar página
3. Debe mostrar:
   - Alert rojo
   - "Error al cargar procesos"
   - Botón X para cerrar
```

---

### 6️⃣ Probar Responsividad

```
Desktop (1200px+):
- Tabla completa
- 7 columnas visibles
- Bien espaciada

Tablet (768px - 1199px):
- Tabla con scroll horizontal
- Funcional

Mobile (< 768px):
- Tabla con scroll horizontal
- Botones accesibles
```

---

## Testing de Componente GestionExpedientes

### 1️⃣ Navegar a Gestión de Expedientes

```
URL: http://localhost:4200/gestion-expedientes
```

**Verificar**:
- [ ] Página carga sin errores
- [ ] Tabla muestra expedientes
- [ ] Muestra: nombre, proceso, estado, creador, documentos, fecha

---

### 2️⃣ Verificar Badges de Estado

```
ACTIVO → Verde (bg-success)
PENDIENTE → Amarillo (bg-warning)
CERRADO → Gris (bg-secondary)
ARCHIVADO → Negro (bg-dark)
```

---

### 3️⃣ Verificar Formato de Fechas

```
Backend devuelve: "2024-02-03T10:30:00"
Se debe mostrar: "3/2/2024" (formato local)
```

---

## Testing de Permisos

### Escenario 1: Propio Proceso

```typescript
Usuario: Juan (ID=5, Role=ABOGADO)
Proceso creado por: Juan (createdById=5)

✅ Debe poder eliminar
```

**Pasos**:
1. Iniciar sesión como Juan
2. Ir a Gestión de Procesos
3. Buscar proceso creado por Juan
4. El botón "🗑️ Eliminar" debe aparecer
5. Eliminar debe funcionae

---

### Escenario 2: Proceso de Otro (Usuario No-Admin)

```typescript
Usuario: Juan (ID=5, Role=ABOGADO)
Proceso creado por: Pedro (createdById=7)

❌ No debe poder eliminar
```

**Pasos**:
1. Iniciar sesión como Juan
2. Ir a Gestión de Procesos
3. Buscar proceso creado por Pedro
4. El botón "🗑️ Eliminar" NO debe aparecer

---

### Escenario 3: Proceso de Otro (Admin)

```typescript
Usuario: Admin (ID=1, Role=ADMIN)
Proceso creado por: Pedro (createdById=7)

✅ Debe poder eliminar
```

**Pasos**:
1. Iniciar sesión como Admin
2. Ir a Gestión de Procesos
3. Buscar proceso creado por Pedro
4. El botón "🗑️ Eliminar" DEBE aparecer
5. Eliminar debe funcionar

---

## Testing de Errores Backend

### Simular Error 403 (Sin permisos)

```typescript
// En browser console
// Modificar manualmente el createdById de un proceso

// Esto simularía que el usuario intenta eliminar algo que no le pertenece
```

**Resultado esperado**:
- [ ] Alert rojo: "Error al eliminar el proceso"
- [ ] Tabla NO se recarga
- [ ] Proceso sigue en la lista

### Simular Error 500 (Error de servidor)

```
1. Backend: Simular error en DELETE endpoint
2. Hacer click en eliminar
3. Confirmar eliminación
```

**Resultado esperado**:
- [ ] Alert rojo: "Error al eliminar..."
- [ ] Tabla NO se recarga
- [ ] Botón se habilita nuevamente

---

## Testing en Console

### Verificar datos en memoria

```javascript
// En DevTools Console

// Procesos cargados
window.__procesos

// Permisos del usuario actual
window.__currentUser

// Estado de carga
window.__loading
```

---

## Testing de Integración

### Test 1: Flujo Completo

```
1. ✅ Abre Gestión de Procesos
2. ✅ Los procesos cargan
3. ✅ Busca un proceso
4. ✅ Filtra resultados
5. ✅ Hace click en eliminar
6. ✅ Confirma eliminación
7. ✅ Recibe confirmación
8. ✅ Proceso desaparece de tabla
```

---

### Test 2: Búsqueda + Eliminación

```
1. ✅ Busca proceso por nombre
2. ✅ Filtra correctamente
3. ✅ Elimina proceso filtrado
4. ✅ Búsqueda se limpia
5. ✅ Tabla recarga con todos los procesos restantes
```

---

### Test 3: Navegación + Estado

```
1. ✅ Abre Gestión de Procesos
2. ✅ Va a otra página
3. ✅ Vuelve a Gestión de Procesos
4. ✅ Procesos se recargan correctamente
```

---

## Testing de Accesibilidad

### Verificar Accesibilidad

```
1. Tab Navigation
   - Tab entre campos de búsqueda
   - Tab a botones de eliminar
   - Todos accesibles

2. Screen Readers
   - Labels claramente asociados
   - Aria-describedby presente
   - Roles adecuados

3. Keyboard Only
   - Enter para buscar
   - Tab para navegar
   - Enter para confirmar eliminación
```

---

## CheckList Final de Testing

### Procesos Generales
- [ ] Componente carga sin errores
- [ ] Datos se cargan correctamente
- [ ] Spinner aparece durante carga
- [ ] Error alert aparece si hay error
- [ ] Empty state aparece si no hay datos

### Búsqueda
- [ ] Search responde en tiempo real
- [ ] Filtra por nombre
- [ ] Filtra por número
- [ ] Filtra por cliente
- [ ] Limpiar búsqueda muestra todos

### Eliminación
- [ ] Botón aparece si tiene permisos
- [ ] Botón NO aparece si no tiene permisos
- [ ] Confirmación aparece
- [ ] Puede cancelar
- [ ] Puede confirmar
- [ ] Mensaje de éxito aparece
- [ ] Tabla se recarga
- [ ] Elemento desaparece

### Errores
- [ ] Error 403 manejado
- [ ] Error 500 manejado
- [ ] Error HTTP general manejado
- [ ] Mensajes de error claros

### UI/UX
- [ ] Responsive en mobile
- [ ] Responsive en tablet
- [ ] Responsive en desktop
- [ ] Colores coherentes
- [ ] Tipografía legible
- [ ] Iconos reconocibles

### Performance
- [ ] Tabla no se congela
- [ ] Búsqueda no lag
- [ ] Eliminación es rápida
- [ ] No hay memory leaks

---

## Comandos Útiles

### Ejecutar tests
```bash
npm test
```

### Build producción
```bash
npm run build
```

### Servidor desarrollo
```bash
npm start
```

### Lint
```bash
npm run lint
```

---

## Reporte de Issues

Si encuentras un issue, documenta:

```
Título: [BUG] Descripción breve

Descripción:
- Qué esperabas que pasara
- Qué pasó en realidad
- Pasos para reproducir

Navegador: Chrome/Firefox/Safari/Edge
Versión: X.X.X
OS: Windows/Mac/Linux
```

---

## ✅ Testing Checklist Rápido

Copy-paste en console para testing rápido:

```javascript
// Verificar componente existe
console.log('GestionProceso loaded:', !!document.querySelector('app-gestion-proceso'));

// Verificar tabla existe
console.log('Table loaded:', !!document.querySelector('table'));

// Verificar botones de eliminar
console.log('Delete buttons:', document.querySelectorAll('[itemType="proceso"]').length);

// Verificar búsqueda
console.log('Search input:', !!document.querySelector('input[type="search"]'));
```

---

¡Testing completado! 🎉
