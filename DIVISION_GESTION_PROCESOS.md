# División del Componente "Gestión de Procesos"

## Resumen General

El componente original `GestionProcesoComponent` ha sido dividido en **dos componentes especializados** que filtran procesos según su tipo (`tipoProceso`):

1. **Gestión de Procesos Penales y Civiles** - Muestra procesos con `tipoProceso: "Penal"` o `tipoProceso: "Civil"`
2. **Gestión de Procesos Administrativos** - Muestra procesos con `tipoProceso: "Administrativo"`

Ambos componentes mantienen **exactamente el mismo comportamiento** que el componente original, incluyendo:
- Vista jerárquica (Proceso → Expedientes)
- Filtrado por búsqueda
- Agrupación por usuario (si tiene permisos)
- Sección "Mis Procesos" destacada
- Crear, editar, eliminar procesos y expedientes
- Permisos de visualización

---

## Archivos Creados

### 1. Componente Penales y Civiles
**Ruta:** `/src/app/features/procesos/gestion-proceso-penales-civiles/gestion-proceso-penales-civiles.ts`

```typescript
// Filtro principal en cargarProcesos():
const procesosFiltrados = (response.data || []).filter(p => 
  p.tipoProceso === 'Penal' || p.tipoProceso === 'Civil'
);
```

**Características:**
- Selector: `app-gestion-proceso-penales-civiles`
- Template compartido: `../gestion-proceso/gestion-proceso.html`
- Estilos compartidos: `../gestion-proceso/gestion-proceso.scss`
- Ruta: `/admin/gestion-procesos-penales-civiles`

### 2. Componente Administrativos
**Ruta:** `/src/app/features/procesos/gestion-proceso-administrativos/gestion-proceso-administrativos.ts`

```typescript
// Filtro principal en cargarProcesos():
const procesosFiltrados = (response.data || []).filter(p => 
  p.tipoProceso === 'Administrativo'
);
```

**Características:**
- Selector: `app-gestion-proceso-administrativos`
- Template compartido: `../gestion-proceso/gestion-proceso.html`
- Estilos compartidos: `../gestion-proceso/gestion-proceso.scss`
- Ruta: `/admin/gestion-procesos-administrativos`

---

## Archivos Modificados

### 1. `src/app/app.routes.ts`

**Importaciones agregadas:**
```typescript
import { GestionProcesoPenalesCivilesComponent } from './features/procesos/gestion-proceso-penales-civiles/gestion-proceso-penales-civiles';
import { GestionProcesoAdministrativosComponent } from './features/procesos/gestion-proceso-administrativos/gestion-proceso-administrativos';
```

**Rutas agregadas en la sección `admin`:**
```typescript
{
    path: 'gestion-procesos-penales-civiles',
    component: GestionProcesoPenalesCivilesComponent,
    canActivate: [authGuard]
},
{
    path: 'gestion-procesos-administrativos',
    component: GestionProcesoAdministrativosComponent,
    canActivate: [authGuard]
},
```

### 2. `src/app/features/admin/navigation/navigation.ts`

**Reemplazo de la sección "Gestión Integrada":**

**Antes:**
```typescript
{
  id: 'management',
  title: 'Gestión Integrada',
  type: 'group',
  icon: 'icon-layers',
  children: [
    {
      id: 'gestion-procesos',
      title: 'Gestión de Procesos',
      type: 'item',
      url: '/admin/gestion-procesos',
      icon: 'feather icon-folder',
    },
    {
      id: 'gestion-expedientes',
      title: 'Gestión de Expedientes',
      type: 'item',
      url: '/admin/gestion-expedientes',
      icon: 'feather icon-file-text',
    },
  ]
}
```

**Después:**
```typescript
{
  id: 'management',
  title: 'Gestión Integrada',
  type: 'group',
  icon: 'icon-layers',
  children: [
    {
      id: 'gestion-procesos-penales-civiles',
      title: 'Gestión de Procesos Penales y Civiles',
      type: 'item',
      url: '/admin/gestion-procesos-penales-civiles',
      icon: 'feather icon-folder',
    },
    {
      id: 'gestion-procesos-administrativos',
      title: 'Gestión de Procesos Administrativos',
      type: 'item',
      url: '/admin/gestion-procesos-administrativos',
      icon: 'feather icon-folder',
    },
    {
      id: 'gestion-expedientes',
      title: 'Gestión de Expedientes',
      type: 'item',
      url: '/admin/gestion-expedientes',
      icon: 'feather icon-file-text',
    },
  ]
}
```

---

## Comportamiento Idéntico

Ambos componentes heredan **todos los métodos** del original:

| Método | Descripción |
|--------|-------------|
| `cargarProcesos()` | Carga procesos filtrados por tipo + búsqueda |
| `agruparProcesosPorUsuario()` | Agrupa por usuario si tiene permisos |
| `actualizarFiltro()` | Aplica filtro de búsqueda en tiempo real |
| `toggleExpanded()` | Expande/contrae proceso para ver expedientes |
| `cargarExpedientesDelProceso()` | Carga expedientes bajo demanda |
| `openModal()` | Abre modal para crear proceso/expediente |
| `editarProceso()` | Abre modal en modo edición |
| `eliminarProceso()` | Elimina proceso con confirmación |
| `editarExpediente()` | Edita expediente existente |
| `eliminarExpediente()` | Elimina expediente con confirmación |

---

## Estructura de Carpetas

```
src/app/features/procesos/
├── gestion-proceso/
│   ├── gestion-proceso.ts              (Componente original - sin cambios)
│   ├── gestion-proceso.html            (Template compartido)
│   ├── gestion-proceso.scss            (Estilos compartidos)
│   └── gestion-proceso.spec.ts
│
├── gestion-proceso-penales-civiles/
│   └── gestion-proceso-penales-civiles.ts    (Nuevo ✨)
│
├── gestion-proceso-administrativos/
│   └── gestion-proceso-administrativos.ts    (Nuevo ✨)
│
└── proceso-modal/
    ├── proceso-modal.component.ts
    ├── proceso-modal.component.html
    └── ...
```

---

## Flujo de Filtrado

### Componente Penales y Civiles
```
1. Usuario navega a /admin/gestion-procesos-penales-civiles
2. ngOnInit() → cargarProcesos()
3. API retorna todos los procesos
4. Se filtra: p.tipoProceso === 'Penal' || p.tipoProceso === 'Civil'
5. Se agrupa por usuario (si aplica)
6. Se muestra en tabla/árbol
```

### Componente Administrativos
```
1. Usuario navega a /admin/gestion-procesos-administrativos
2. ngOnInit() → cargarProcesos()
3. API retorna todos los procesos
4. Se filtra: p.tipoProceso === 'Administrativo'
5. Se agrupa por usuario (si aplica)
6. Se muestra en tabla/árbol
```

---

## Ruta de Navegación en la UI

En la barra lateral izquierda:
```
📁 Gestión Integrada
├── 📂 Gestión de Procesos Penales y Civiles
├── 📂 Gestión de Procesos Administrativos
└── 📄 Gestión de Expedientes
```

---

## Validación de Compilación

✅ **Build exitoso en 5.6 segundos**
- Sin errores de compilación
- Todos los imports correctos
- Rutas configuradas correctamente
- Componentes reconocidos por Angular

---

## Próximos Pasos (Opcional)

Para mejorar aún más:

1. **Crear componente base reutilizable**: Extraer la lógica común a una clase base para evitar duplicación
   ```typescript
   export class GestionProcesoBaseComponent implements OnInit {
     // Lógica común aquí
     abstract tiposPermitidos: string[];
   }
   ```

2. **Parámetro de filtro dinámico**: Pasar el tipo de proceso como parámetro
   ```typescript
   constructor(
     private tiposProceso: string[] // ['Penal', 'Civil']
   ) {}
   ```

3. **Etiquetas visuales**: Mostrar badges con el tipo de proceso en la UI

---

## Resumen de Cambios

| Acción | Cantidad |
|--------|----------|
| Archivos creados | 2 nuevos componentes |
| Archivos modificados | 2 (app.routes.ts, navigation.ts) |
| Líneas de código agregadas | ~600 (incluyendo comentarios) |
| Errores de compilación | 0 ✅ |
| Tiempo de build | 5.6 segundos |

