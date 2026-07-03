# Guía de Testing - División de Gestión de Procesos

## Verificación Visual

### 1. Verificar Navegación
- [ ] Abrir aplicación en http://localhost:4200/admin/home
- [ ] En la barra lateral, buscar sección **"Gestión Integrada"**
- [ ] Verificar que aparecen **3 opciones**:
  - ✅ Gestión de Procesos Penales y Civiles
  - ✅ Gestión de Procesos Administrativos
  - ✅ Gestión de Expedientes
- [ ] Hacer clic en cada una para verificar que carga correctamente

---

### 2. Testing Gestión de Procesos Penales y Civiles
**URL:** `http://localhost:4200/admin/gestion-procesos-penales-civiles`

#### Verificaciones:
- [ ] Página carga sin errores
- [ ] Spinner aparece brevemente durante carga
- [ ] **Solo se muestran procesos con tipo "Penal" o "Civil"**
  - Buscar manualmente si hay procesos de estos tipos en la BD
  - Si todos los procesos son "Administrativo", mostrará "No hay procesos"
  
#### Funcionalidades:
- [ ] Botón "Crear Proceso/Expediente" funciona
- [ ] Buscador filtra procesos correctamente
- [ ] Clic en expandir muestra expedientes
- [ ] Botones editar/eliminar aparecen
- [ ] Si usuario es ADMIN, agrupa por usuario

---

### 3. Testing Gestión de Procesos Administrativos
**URL:** `http://localhost:4200/admin/gestion-procesos-administrativos`

#### Verificaciones:
- [ ] Página carga sin errores
- [ ] Spinner aparece brevemente durante carga
- [ ] **Solo se muestran procesos con tipo "Administrativo"**
  - Verificar que procesos "Penal" y "Civil" **NO aparecen**
  
#### Funcionalidades:
- [ ] Botón "Crear Proceso/Expediente" funciona
- [ ] Buscador filtra procesos correctamente
- [ ] Clic en expandir muestra expedientes
- [ ] Botones editar/eliminar aparecen
- [ ] Si usuario es ADMIN, agrupa por usuario

---

### 4. Testing de Creación de Procesos

#### Caso 1: Crear Penal/Civil desde componente Penal-Civil
1. [ ] Navegar a `/admin/gestion-procesos-penales-civiles`
2. [ ] Clic en "Crear Proceso/Expediente"
3. [ ] Modal se abre correctamente
4. [ ] Completar formulario con:
   - Número: `001-TEST-PENAL`
   - Nombre: `Caso Penal Prueba`
   - Cliente: `123456789`
   - **Tipo de Proceso:** `Penal` ← **IMPORTANTE**
5. [ ] Clic en "Guardar"
6. [ ] Proceso aparece inmediatamente en la lista

#### Caso 2: Crear Administrativo desde componente Administrativo
1. [ ] Navegar a `/admin/gestion-procesos-administrativos`
2. [ ] Clic en "Crear Proceso/Expediente"
3. [ ] Modal se abre correctamente
4. [ ] Completar formulario con:
   - Número: `001-TEST-ADMIN`
   - Nombre: `Caso Administrativo Prueba`
   - Cliente: `987654321`
   - **Tipo de Proceso:** `Administrativo` ← **IMPORTANTE**
5. [ ] Clic en "Guardar"
6. [ ] Proceso aparece inmediatamente en la lista

---

### 5. Testing de Búsqueda/Filtrado

#### En componente Penal-Civil:
- [ ] Escribir parte del nombre de proceso "Penal"
- [ ] Solo aparecen procesos con ese nombre y tipo Penal/Civil
- [ ] Limpiar búsqueda

#### En componente Administrativo:
- [ ] Escribir parte del nombre de proceso "Admin"
- [ ] Solo aparecen procesos con ese nombre y tipo Administrativo
- [ ] Limpiar búsqueda

---

### 6. Testing de Edición

#### Paso 1: Abrir proceso para editar
1. [ ] En `/admin/gestion-procesos-penales-civiles`
2. [ ] Clic en botón "editar" (lápiz) de algún proceso
3. [ ] Modal abre en modo edición
4. [ ] Todos los campos están pre-llenados

#### Paso 2: Modificar tipo de proceso
1. [ ] Cambiar "Tipo de Proceso" a otro tipo (ej: de Penal a Civil)
2. [ ] Clic en "Guardar"
3. [ ] Proceso se actualiza (sigue visible porque sigue siendo Penal o Civil)

#### Paso 3: Verificar persistencia
1. [ ] Cerrar modal
2. [ ] Refresco de página (F5)
3. [ ] Datos se mantienen correctamente

---

### 7. Testing de Eliminación

#### En componente Penal-Civil:
1. [ ] Clic en botón "eliminar" (papelera) de algún proceso
2. [ ] Confirmar eliminación
3. [ ] Proceso desaparece de la lista
4. [ ] Mensaje de éxito aparece

#### En componente Administrativo:
1. [ ] Clic en botón "eliminar" (papelera) de algún proceso
2. [ ] Confirmar eliminación
3. [ ] Proceso desaparece de la lista
4. [ ] Mensaje de éxito aparece

---

### 8. Testing de Permisos

#### Si usuario es ADMIN:
- [ ] Accede a `/admin/gestion-procesos-penales-civiles` ✅
- [ ] Ve procesos **agrupados por usuario**
- [ ] Ve sección "Mis Procesos" si tiene procesos
- [ ] Cada grupo es expandible

#### Si usuario es ABOGADO:
- [ ] Accede a `/admin/gestion-procesos-penales-civiles` ✅
- [ ] Ve **solo sus procesos** (sin agrupación)
- [ ] NO ve procesos de otros abogados
- [ ] Lista se actualiza cuando crea nuevo proceso

---

### 9. Testing de Expedientes

#### Expandir proceso:
1. [ ] En lista de procesos, clic en flecha expandir
2. [ ] Cargador aparece brevemente
3. [ ] Expedientes aparecen en indentación
4. [ ] Si no hay expedientes, aparece mensaje

#### Crear expediente:
1. [ ] Clic en "Crear Proceso/Expediente"
2. [ ] Cambiar a pestaña "Expediente"
3. [ ] Seleccionar proceso existente
4. [ ] Completar datos del expediente
5. [ ] Guardar
6. [ ] Aparece bajo el proceso

#### Editar expediente:
1. [ ] Clic en botón editar del expediente
2. [ ] Modal abre con datos pre-llenados
3. [ ] Modificar datos
4. [ ] Guardar
5. [ ] Cambios se reflejan

#### Eliminar expediente:
1. [ ] Clic en botón eliminar del expediente
2. [ ] Confirmar
3. [ ] Expediente desaparece
4. [ ] Mensaje de éxito

---

## Verificación de Datos en Base de Datos

### Consultas útiles (ajustar según tu BD):

```sql
-- Ver procesos por tipo
SELECT id, nombre, tipoProceso, abogadoResponsableName FROM procesos;

-- Contar procesos por tipo
SELECT tipoProceso, COUNT(*) as total FROM procesos GROUP BY tipoProceso;

-- Ver procesos del usuario actual
SELECT * FROM procesos 
WHERE abogadoResponsableId = {userId} 
ORDER BY tipoProceso;
```

---

## Casos de Error Esperados

| Escenario | Comportamiento Esperado |
|-----------|------------------------|
| No hay procesos del tipo | Mostrar "No hay procesos" |
| Usuario sin permisos | Mostrar solo sus procesos |
| API error | Mostrar mensaje de error en alert |
| Eliminar sin confirmar | Cancelar operación |
| Campo requerido vacío | Mostrar error en formulario |

---

## Checklist Final

- [ ] **Navegación:** Ambos componentes aparecen en sidebar
- [ ] **Filtrado:** Cada componente muestra solo su tipo de proceso
- [ ] **CRUD:** Create, Read, Update, Delete funcionan en ambos
- [ ] **Expedientes:** Se pueden crear/editar/eliminar
- [ ] **Búsqueda:** Filtra correctamente en ambos componentes
- [ ] **Permisos:** Respeta roles de usuario
- [ ] **Agrupación:** Agrupa por usuario si es ADMIN
- [ ] **Errores:** Se manejan correctamente
- [ ] **Compilación:** Sin warnings ni errores ✅
- [ ] **Performance:** Carga rápida (< 2 segundos)

---

## Evidencia de Compilación

```
✅ Build exitoso en 5.602 segundos
✅ Sin errores de compilación
✅ main.js generado: 973.91 kB
✅ Todos los componentes incluidos en bundle
```

---

## Notas Importantes

1. **Template compartido:** Ambos componentes usan el mismo HTML/SCSS del original
   - Ventaja: Menos duplicación
   - Nota: Si necesitas cambiar UI, cambia en `gestion-proceso.html`

2. **Lógica centralizada:** Todos los métodos están en cada componente
   - Para mantenerlos en sincronía, se recomienda usar una clase base en el futuro

3. **Filtrado en cliente:** El filtro se aplica DESPUÉS de obtener datos
   - Si tienes muchos procesos, considera filtrar en el API

4. **Ruta original:** La ruta `/admin/gestion-procesos` aún existe (componente original)
   - Pero NO aparece en navegación
   - Puedes eliminarla del routing si no la necesitas

