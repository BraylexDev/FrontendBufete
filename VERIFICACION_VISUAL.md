# 🎬 Instrucciones Paso a Paso - Verificación de la División

## 1️⃣ Compilar la Aplicación

```bash
cd C:\Users\Braylex\Documents\GitHub\BufeteFrontEnd
ng serve --no-hmr
```

**Resultado esperado:**
```
✅ Application bundle generation complete
✅ Listening on localhost:4200
```

---

## 2️⃣ Abrir en Navegador

Abre: **http://localhost:4200/admin/home**

---

## 3️⃣ Verificar Navegación en Sidebar

### Paso 1: Localizar "Gestión Integrada"
- En la barra lateral izquierda
- Busca el grupo **"Gestión Integrada"**
- Debe tener icono de 📁

### Paso 2: Verificar las 3 Opciones
Dentro de "Gestión Integrada", debes ver:

```
📁 Gestión Integrada
├── 📂 Gestión de Procesos Penales y Civiles
├── 📂 Gestión de Procesos Administrativos
└── 📄 Gestión de Expedientes
```

**Si no ves esto:**
- [ ] Limpiar cache del navegador (Ctrl+Shift+Del)
- [ ] Refrescar página (F5)
- [ ] Cierra y abre el servidor

---

## 4️⃣ Verificar Componente Penal-Civil

### Acceder
1. Haz clic en **"Gestión de Procesos Penales y Civiles"**
2. URL debe cambiar a: `http://localhost:4200/admin/gestion-procesos-penales-civiles`

### Página debe mostrar:
- ✅ Encabezado: "Gestión de Procesos"
- ✅ Botón: "Crear Proceso / Expediente"
- ✅ Barra de búsqueda
- ✅ Spinner mientras carga

### Procesos mostrados:
- ✅ **SOLO** procesos con `tipoProceso = "Penal"` o `"Civil"`
- ✅ Si no hay, mostrará "No hay procesos"

### Campos visibles:
- ✅ Número de proceso (ej: 001-PENAL-2024)
- ✅ Nombre
- ✅ Botones: Editar (lápiz), Eliminar (papelera)

---

## 5️⃣ Verificar Componente Administrativos

### Acceder
1. Haz clic en **"Gestión de Procesos Administrativos"**
2. URL debe cambiar a: `http://localhost:4200/admin/gestion-procesos-administrativos`

### Página debe mostrar:
- ✅ Encabezado: "Gestión de Procesos"
- ✅ Botón: "Crear Proceso / Expediente"
- ✅ Barra de búsqueda
- ✅ Spinner mientras carga

### Procesos mostrados:
- ✅ **SOLO** procesos con `tipoProceso = "Administrativo"`
- ✅ Si no hay, mostrará "No hay procesos"
- ✅ Procesos "Penal" y "Civil" **NO deben aparecer**

### Campos visibles:
- ✅ Número de proceso (ej: 001-ADMIN-2024)
- ✅ Nombre
- ✅ Botones: Editar (lápiz), Eliminar (papelera)

---

## 6️⃣ Prueba de Creación de Proceso

### Crear un proceso Penal desde componente Penal-Civil

**Paso 1:** Estar en `/admin/gestion-procesos-penales-civiles`

**Paso 2:** Clic en "Crear Proceso / Expediente"

**Paso 3:** Completa el formulario:
```
Pestaña: "Proceso"
├── Número: 001-PRUEBA-PENAL
├── Nombre: Caso de Prueba Penal
├── Identificación Cliente: 123456789
├── Tipo de Proceso: Penal ← IMPORTANTE
└── Clic en "Guardar"
```

**Resultado esperado:**
- ✅ Modal desaparece
- ✅ Nuevo proceso aparece en la lista
- ✅ Mensaje de éxito

### Crear un proceso Administrativo desde componente Administrativo

**Paso 1:** Navegar a `/admin/gestion-procesos-administrativos`

**Paso 2:** Clic en "Crear Proceso / Expediente"

**Paso 3:** Completa el formulario:
```
Pestaña: "Proceso"
├── Número: 001-PRUEBA-ADMIN
├── Nombre: Caso de Prueba Administrativo
├── Identificación Cliente: 987654321
├── Tipo de Proceso: Administrativo ← IMPORTANTE
└── Clic en "Guardar"
```

**Resultado esperado:**
- ✅ Modal desaparece
- ✅ Nuevo proceso aparece en la lista
- ✅ Mensaje de éxito

---

## 7️⃣ Prueba de Búsqueda

### En Componente Penal-Civil:

**Paso 1:** Escribir en buscador: "Penal"

**Resultado:**
- ✅ Solo aparecen procesos que contienen "Penal"
- ✅ Procesos con "Administrativo" desaparecen

**Paso 2:** Limpiar buscador

**Resultado:**
- ✅ Reaparecen todos los procesos Penal y Civil

### En Componente Administrativo:

**Paso 1:** Escribir en buscador: "Admin"

**Resultado:**
- ✅ Solo aparecen procesos que contienen "Admin"
- ✅ Procesos de otros tipos desaparecen

---

## 8️⃣ Prueba de Edición

### Editar un proceso:

**Paso 1:** Clic en botón **Editar** (lápiz) de algún proceso

**Paso 2:** Modal abre en modo edición

**Paso 3:** Verificar que todos los campos se cargan:
- ✅ Número está pre-llenado
- ✅ Nombre está pre-llenado
- ✅ Cliente está pre-llenado
- ✅ **Tipo de Proceso está pre-llenado** ← IMPORTANTE

**Paso 4:** Modificar algún campo (ej: nombre)

**Paso 5:** Clic en "Guardar"

**Resultado:**
- ✅ Modal desaparece
- ✅ Cambios se reflejan en la lista
- ✅ Mensaje de éxito

---

## 9️⃣ Prueba de Eliminación

### Eliminar un proceso:

**Paso 1:** Clic en botón **Eliminar** (papelera) de algún proceso

**Paso 2:** Aparece confirmación: "¿Está seguro de que desea eliminar...?"

**Paso 3:** Clic en "Aceptar"

**Resultado:**
- ✅ Proceso desaparece de la lista
- ✅ Mensaje de éxito
- ✅ Cuenta de procesos disminuye

---

## 🔟 Prueba de Expedientes

### Expandir un proceso:

**Paso 1:** Clic en flecha **▶️** al inicio del proceso

**Paso 2:** Flecha cambia a **▼** (bajada)

**Paso 3:** Aparece cargador brevemente

**Resultado:**
- ✅ Se cargan los expedientes del proceso
- ✅ Se muestran indentados bajo el proceso
- ✅ Si no hay expedientes, aparece mensaje

### Crear expediente:

**Paso 1:** Ir a "Crear Proceso / Expediente"

**Paso 2:** Cambiar a pestaña **"Expediente"**

**Paso 3:** Completar formulario:
```
├── Proceso: Seleccionar uno existente
├── Nombre: Expediente Prueba
├── Número: EXP-001
└── Clic en "Guardar"
```

**Resultado:**
- ✅ Expediente aparece bajo el proceso
- ✅ Modal desaparece
- ✅ Mensaje de éxito

---

## 1️⃣1️⃣ Verificar Agrupación (Si eres ADMIN)

Si tu usuario tiene rol **ADMIN** o permisos especiales:

**Paso 1:** Ir a `/admin/gestion-procesos-penales-civiles`

**Paso 2:** Procesos deben estar agrupados:

```
┌─ Mis Procesos (destacado en amarillo)
│  ├── Proceso 1
│  └── Proceso 2
├─ Abogado 1
│  ├── Proceso 3
│  └── Proceso 4
└─ Abogado 2
   └── Proceso 5
```

**Paso 3:** Haz clic en grupo para expandir/contraer

**Resultado:**
- ✅ Cada grupo es expandible
- ✅ "Mis Procesos" aparece primero
- ✅ Otros abogados están en orden alfabético

---

## 1️⃣2️⃣ Verificar Permisos

### Si eres ABOGADO (no ADMIN):

**Paso 1:** Ir a `/admin/gestion-procesos-penales-civiles`

**Paso 2:** Procesos mostrados:
- ✅ **SOLO tus procesos** (creados por ti o asignados)
- ✅ **NO ves** procesos de otros abogados
- ✅ **NO hay agrupación** por usuario

**Paso 3:** Crear nuevo proceso

**Paso 4:** Actualizar página (F5)

**Resultado:**
- ✅ Tu nuevo proceso aparece en la lista
- ✅ Otros abogados no pueden ver tu proceso

---

## 1️⃣3️⃣ Comparar Comportamiento

### Entre Componente Penal-Civil y Administrativo:

| Característica | Penal-Civil | Administrativo |
|---|---|---|
| **URL** | `.../penal...` | `.../administrativo...` |
| **Procesos mostrados** | Solo Penal, Civil | Solo Administrativo |
| **Búsqueda** | ✅ Funciona | ✅ Funciona |
| **CRUD** | ✅ Funciona | ✅ Funciona |
| **Expedientes** | ✅ Funciona | ✅ Funciona |
| **Agrupación (ADMIN)** | ✅ Sí | ✅ Sí |
| **Permisos** | ✅ Respetados | ✅ Respetados |

---

## 🔍 Checklist de Verificación

### Navegación
- [ ] Sidebar muestra "Gestión Integrada" con 3 opciones
- [ ] Cada clic navega a la URL correcta
- [ ] Componente carga sin errores

### Filtrado Penal-Civil
- [ ] Solo muestra procesos Penal o Civil
- [ ] Procesos Administrativo NO aparecen
- [ ] Búsqueda funciona dentro del filtro

### Filtrado Administrativo
- [ ] Solo muestra procesos Administrativo
- [ ] Procesos Penal y Civil NO aparecen
- [ ] Búsqueda funciona dentro del filtro

### CRUD Penal-Civil
- [ ] [ ] Crear proceso Penal funciona
- [ ] [ ] Crear proceso Civil funciona
- [ ] [ ] Editar proceso funciona
- [ ] [ ] Eliminar proceso funciona

### CRUD Administrativo
- [ ] [ ] Crear proceso Administrativo funciona
- [ ] [ ] Editar proceso funciona
- [ ] [ ] Eliminar proceso funciona

### Expedientes
- [ ] [ ] Expandir proceso muestra expedientes
- [ ] [ ] Crear expediente funciona
- [ ] [ ] Editar expediente funciona
- [ ] [ ] Eliminar expediente funciona

### Permisos
- [ ] [ ] ADMIN ve todos agrupados
- [ ] [ ] ABOGADO ve solo sus procesos
- [ ] [ ] Permisos se respetan en acciones

### Console (F12)
- [ ] [ ] No hay errores en consola
- [ ] [ ] No hay warnings rojos
- [ ] [ ] Network sin 404s o 500s

---

## ❌ Si Algo No Funciona

### La navegación no muestra las nuevas opciones:
```
1. Ctrl+Shift+Del (Limpiar cache)
2. F5 (Refrescar)
3. Cierra navegador
4. Abre de nuevo
```

### Los procesos no se filtran:
```
1. Abre consola (F12)
2. Busca errores rojos
3. Verifica que procesos tengan campo "tipoProceso"
4. Verifica valores: "Penal", "Civil", "Administrativo"
```

### Modal no abre o da error:
```
1. Consola debe mostrar error específico
2. Verifica que ProcesoModalComponent exista
3. Verifica imports en app.routes.ts
```

### Build no compila:
```
1. ng build --configuration development
2. Revisa errores reportados
3. Verifica imports y rutas
```

---

## ✅ Conclusión

Si todos estos pasos funcionan correctamente, **la división está exitosa** y lista para usar en producción.

