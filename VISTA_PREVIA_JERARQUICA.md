# 🎨 Vista Previa - Estructura Jerárquica

## Interfaz de Usuario Actualizada

### Encabezado
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│  Gestión de Procesos                  [+ Crear Proceso / Expediente]
│  Esta pantalla permite visualizar y crear procesos o expedientes │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Barra de Búsqueda
```
┌─────────────────────────────────────────────────────────────────┐
│  🔍  Buscar...                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura Jerárquica

```
┌─────────────────────────────────────────────────────────────────┐
│ ▼ 📁 proc test 1.1                        [✏️ Editar] [🗑️ Eliminar]
│   ├─ 📄 EXP-Test1.1-Aux                   [✏️ Editar] [🗑️ Eliminar]
│   └─ 📄 EXP-Test1.1-Principal             [✏️ Editar] [🗑️ Eliminar]
│
│ ▶ 📁 proc test 1.2                        [✏️ Editar] [🗑️ Eliminar]
│
│ ▶ 📁 proc test 2.0                        [✏️ Editar] [🗑️ Eliminar]
│
│ ▼ 📁 proc test 3.0                        [✏️ Editar] [🗑️ Eliminar]
│   ├─ 📄 EXP-Test3.0-A                     [✏️ Editar] [🗑️ Eliminar]
│   ├─ 📄 EXP-Test3.0-B                     [✏️ Editar] [🗑️ Eliminar]
│   └─ ⏳ Cargando expedientes...
│
└─────────────────────────────────────────────────────────────────┘
```

## Estados Visuales

### 1. Proceso Contraído (Estado Inicial)
```
▶ 📁 proc test 1.1 ────────────────────── [✏️ Editar] [🗑️ Eliminar]
```
- Chevron apunta a la derecha (▶)
- Fondo gris claro
- Expedientes no visibles

### 2. Proceso Expandido
```
▼ 📁 proc test 1.1 ────────────────────── [✏️ Editar] [🗑️ Eliminar]
  ├─ 📄 EXP-Test1.1-Aux ───────────────── [✏️ Editar] [🗑️ Eliminar]
  └─ 📄 EXP-Test1.1-Principal ─────────── [✏️ Editar] [🗑️ Eliminar]
```
- Chevron apunta hacia abajo (▼)
- Expedientes anidados (indentados)
- Ícono de carpeta abierta (amarillo)
- Ícono de documentos (azul)

### 3. Proceso Cargando Expedientes
```
▼ 📁 proc test 2.0 ────────────────────── [✏️ Editar] [🗑️ Eliminar]
  ⏳ Cargando expedientes...
```

### 4. Proceso Sin Expedientes
```
▼ 📁 proc test 4.0 ────────────────────── [✏️ Editar] [🗑️ Eliminar]
  Sin expedientes
```

## Interacciones

### 1. Hacer Clic en Chevron
```
Antes:  ▶ 📁 proc test 1.1
         ↓ (clic)
Después: ▼ 📁 proc test 1.1
         ├─ 📄 EXP-Test1.1-Aux
         └─ 📄 EXP-Test1.1-Principal
```

### 2. Hacer Clic en Botón Editar Proceso
```
▼ 📁 proc test 1.1 [✏️ <-- clic]
   → Navega a /admin/editar-proceso/1
   → Se abre formulario de edición
```

### 3. Hacer Clic en Botón Eliminar Expediente
```
  📄 EXP-Test1.1-Aux [🗑️ <-- clic]
   → Se muestra diálogo de confirmación
   → Si confirma: "¿Está seguro de eliminar EXP-Test1.1-Aux?"
   → Se elimina y se recarga la lista
```

## Colores y Estilos

### Elementos
| Elemento | Color | Ícono |
|----------|-------|-------|
| Procesos | Gris (#f8f9fa) | 📁 Amarillo (#ffc107) |
| Expedientes | Blanco (#fafbfc) | 📄 Azul (#0d6efd) |
| Botón Editar | Azul (#0dcaf0) | ✏️ |
| Botón Eliminar | Rojo (#dc3545) | 🗑️ |
| Chevron Activo | Azul (#0d6efd) | ▼ |
| Chevron Inactivo | Gris (#033857) | ▶ |

### Estados
- **Default:** Fondo normal
- **Hover:** Sombra ligera + cambio de fondo
- **Expanded:** Chevron azul + fondo expandido

## Responsive

### Desktop (>1200px)
```
▼ 📁 proc test 1.1 [✏️ Editar] [🗑️ Eliminar]
  ├─ 📄 EXP-Test1.1-Aux [✏️ Editar] [🗑️ Eliminar]
```

### Tablet (768px - 1200px)
```
▼ 📁 proc test 1.1
    [✏️] [🗑️]
  ├─ 📄 EXP-Test1.1-Aux
      [✏️] [🗑️]
```

### Mobile (<768px)
```
▼ 📁 proc test 1.1
  [✏️] [🗑️]
  ├─ 📄 EXP-Test1.1-Aux
    [✏️] [🗑️]
```

## Flujo de Uso

### 1. Ver Procesos
```
1. Ir a /admin/gestion-procesos
2. Se cargan todos los procesos
3. Procesos mostrados contraídos por defecto
```

### 2. Ver Expedientes de un Proceso
```
1. Hacer clic en chevron del proceso
2. Se expande el proceso
3. Se cargan expedientes bajo demanda
4. Expedientes se muestran en la lista
```

### 3. Buscar Procesos
```
1. Escribir en barra de búsqueda
2. Procesos se filtran en tiempo real
3. Se mantiene el estado expandido
```

### 4. Editar Proceso
```
1. Hacer clic en botón [✏️ Editar] del proceso
2. (TODO: Navegar a página de edición)
3. Volver a lista de procesos
```

### 5. Eliminar Expediente
```
1. Expandir proceso
2. Hacer clic en botón [🗑️] del expediente
3. Confirmar eliminación
4. Expediente se elimina
5. Lista se recarga
```

---

**Nota:** Esta es una representación textual. La interfaz real tiene estilos CSS más elaborados, animaciones suaves, y es totalmente responsive.
