# 🧪 Guía de Pruebas - Gestión Integrada

## Descripción General

Este documento describe cómo probar la nueva funcionalidad de "Gestión Integrada" en la barra lateral, que incluye "Gestión de Procesos" y "Gestión de Expedientes".

## Requisitos Previos

- ✅ Aplicación compilada exitosamente
- ✅ Servidor backend en ejecución
- ✅ Base de datos con datos de prueba
- ✅ Usuario autenticado

## 📋 Plan de Pruebas

### 1. Verificación de Navegación

#### Prueba 1.1: Verificar que aparece la sección en la barra lateral
**Pasos:**
1. Iniciar la aplicación: `npm run start`
2. Navegar a `http://localhost:4200/admin`
3. Observar la barra lateral izquierda
4. Buscar la sección "Gestión Integrada"

**Resultado esperado:** 
- ✅ Aparece la sección "Gestión Integrada" en la barra lateral
- ✅ La sección contiene dos items: "Gestión de Procesos" y "Gestión de Expedientes"
- ✅ Los items tienen iconos (carpeta y documento)

#### Prueba 1.2: Navegar a Gestión de Procesos
**Pasos:**
1. En la barra lateral, hacer clic en "Gestión de Procesos"
2. Esperar a que cargue la página
3. Verificar la URL

**Resultado esperado:**
- ✅ URL cambia a `http://localhost:4200/admin/gestion-procesos`
- ✅ Se carga la tabla de procesos
- ✅ Aparece el título "Gestión de Procesos"

#### Prueba 1.3: Navegar a Gestión de Expedientes
**Pasos:**
1. En la barra lateral, hacer clic en "Gestión de Expedientes"
2. Esperar a que cargue la página
3. Verificar la URL

**Resultado esperado:**
- ✅ URL cambia a `http://localhost:4200/admin/gestion-expedientes`
- ✅ Se carga la tabla de expedientes
- ✅ Aparece el título "Gestión de Expedientes"

### 2. Pruebas de Gestión de Procesos

#### Prueba 2.1: Cargar lista de procesos
**Pasos:**
1. Navegar a `/admin/gestion-procesos`
2. Observar la tabla

**Resultado esperado:**
- ✅ Se muestran spinner de carga temporalmente
- ✅ Se carga la tabla con procesos
- ✅ Las columnas son: Nombre, Número, Cliente, Estado, Creado por, Acciones

#### Prueba 2.2: Búsqueda por nombre
**Pasos:**
1. En la barra de búsqueda, escribir el nombre de un proceso existente (ej: "Proceso Civil")
2. Presionar Enter o esperar a que se filtre automáticamente

**Resultado esperado:**
- ✅ La tabla se filtra mostrando solo procesos que contienen el nombre
- ✅ Si no hay resultados, aparece mensaje "No se encontraron procesos"

#### Prueba 2.3: Búsqueda por número
**Pasos:**
1. En la barra de búsqueda, escribir el número de proceso (ej: "2024-001")

**Resultado esperado:**
- ✅ La tabla filtra mostrando procesos que coinciden con el número

#### Prueba 2.4: Búsqueda por cliente
**Pasos:**
1. En la barra de búsqueda, escribir el nombre del cliente

**Resultado esperado:**
- ✅ La tabla filtra mostrando procesos del cliente

#### Prueba 2.5: Badges de estado
**Pasos:**
1. Observar la columna "Estado" en la tabla

**Resultado esperado:**
- ✅ Estados ACTIVO aparecen con fondo verde
- ✅ Estados PENDIENTE aparecen con fondo amarillo
- ✅ Estados CERRADO aparecen con fondo gris

#### Prueba 2.6: Eliminar un proceso
**Pasos:**
1. En la fila de un proceso, hacer clic en el botón de eliminar (icono de papelera)
2. Confirmar en el diálogo que aparece
3. Esperar respuesta del servidor

**Resultado esperado:**
- ✅ Aparece diálogo de confirmación: "¿Está seguro de que desea eliminar el proceso...?"
- ✅ Si hace clic en "OK", aparece alerta de éxito
- ✅ La tabla se recarga y el proceso desaparece
- ✅ Si hace clic en "Cancel", nada ocurre

### 3. Pruebas de Gestión de Expedientes

#### Prueba 3.1: Cargar lista de expedientes
**Pasos:**
1. Navegar a `/admin/gestion-expedientes`
2. Observar la tabla

**Resultado esperado:**
- ✅ Se muestran spinner de carga
- ✅ Se carga la tabla con expedientes
- ✅ Las columnas son: Nombre, Número Proceso, Nombre Proceso, Estado, Documentos, Creado por, Acciones

#### Prueba 3.2: Búsqueda por nombre de expediente
**Pasos:**
1. En la barra de búsqueda, escribir el nombre de un expediente

**Resultado esperado:**
- ✅ La tabla filtra mostrando expedientes que coinciden

#### Prueba 3.3: Búsqueda por número de proceso
**Pasos:**
1. En la barra de búsqueda, escribir el número del proceso asociado

**Resultado esperado:**
- ✅ La tabla filtra mostrando expedientes asociados a ese proceso

#### Prueba 3.4: Contador de documentos
**Pasos:**
1. Observar la columna "Documentos" en la tabla

**Resultado esperado:**
- ✅ Se muestra un badge con el número de documentos (ej: "5 doc")
- ✅ El contador es correcto según los documentos del expediente

#### Prueba 3.5: Eliminar un expediente
**Pasos:**
1. En la fila de un expediente, hacer clic en el botón de eliminar
2. Confirmar en el diálogo
3. Esperar respuesta

**Resultado esperado:**
- ✅ Aparece confirmación
- ✅ Si confirma, se elimina y se recarga la tabla
- ✅ Si cancela, nada ocurre

### 4. Pruebas de Autenticación

#### Prueba 4.1: Acceso sin autenticación
**Pasos:**
1. Cerrar la sesión (logout)
2. Intentar navegar directamente a `/admin/gestion-procesos`

**Resultado esperado:**
- ✅ Se redirige a `/login`
- ✅ Se muestra página de login

#### Prueba 4.2: Acceso con autenticación
**Pasos:**
1. Iniciar sesión con credenciales válidas
2. Navegar a `/admin/gestion-procesos`

**Resultado esperado:**
- ✅ Se permite el acceso
- ✅ Se carga la tabla de procesos

### 5. Pruebas de Responsividad

#### Prueba 5.1: Vista en desktop
**Pasos:**
1. Abrir en navegador desktop
2. Observar la tabla

**Resultado esperado:**
- ✅ Tabla se ve correctamente
- ✅ Todas las columnas son visibles
- ✅ Sin scroll horizontal innecesario

#### Prueba 5.2: Vista en tablet
**Pasos:**
1. Redimensionar navegador a 768px de ancho (o usar DevTools)
2. Observar la tabla

**Resultado esperado:**
- ✅ Tabla se adapta correctamente
- ✅ No hay overflow de contenido
- ✅ Texto legible

#### Prueba 5.3: Vista en mobile
**Pasos:**
1. Redimensionar navegador a 375px de ancho (o usar DevTools)
2. Observar la tabla

**Resultado esperado:**
- ✅ Tabla se comprime correctamente
- ✅ Scroll horizontal funciona si es necesario
- ✅ Botones son clickeables

### 6. Pruebas de Manejo de Errores

#### Prueba 6.1: Error al cargar procesos
**Pasos:**
1. Desconectar el backend o simular error de red
2. Navegar a `/admin/gestion-procesos`
3. Observar

**Resultado esperado:**
- ✅ Aparece mensaje de error: "Error al cargar procesos..."
- ✅ Hay botón para cerrar el error
- ✅ No aparece tabla

#### Prueba 6.2: Lista vacía
**Pasos:**
1. Asegurarse de que no hay procesos para el usuario
2. Navegar a `/admin/gestion-procesos`

**Resultado esperado:**
- ✅ Aparece mensaje "No hay procesos"
- ✅ Se sugiere crear uno nuevo
- ✅ Se muestra icono de carpeta vacía

### 7. Pruebas de Búsqueda

#### Prueba 7.1: Búsqueda con resultados vacíos
**Pasos:**
1. Buscar por un término que no existe

**Resultado esperado:**
- ✅ Aparece mensaje "No se encontraron procesos"
- ✅ La sugerencia es intentar con otros términos

#### Prueba 7.2: Limpiar búsqueda
**Pasos:**
1. Escribir algo en la búsqueda
2. Limpiar el campo
3. Esperar

**Resultado esperado:**
- ✅ Se muestran todos los procesos nuevamente
- ✅ La tabla se actualiza al instante

## 📝 Reporte de Pruebas

Crear un documento con los resultados:

```
Prueba | Resultado | Notas
------|-----------|-------
1.1   | ✅ PASS  | Sección aparece correctamente
1.2   | ✅ PASS  | Navegación funciona
... y así sucesivamente
```

## 🐛 Posibles Errores y Soluciones

### Error: "No se puede resolver el módulo..."
**Solución:** Ejecutar `npm install` y recompilar

### Error: "Expediente no definido"
**Solución:** Asegurar que el backend retorna los datos correctamente

### Error: "CORS error"
**Solución:** Verificar que el backend está corriendo y los CORS están configurados

### Error: "Eliminación fallida"
**Solución:** Verificar permisos del usuario en el backend

## 📊 Métricas de Éxito

- ✅ Compilación sin errores
- ✅ Navegación funciona
- ✅ Datos cargan correctamente
- ✅ Búsqueda es rápida y precisa
- ✅ Eliminación funciona
- ✅ Responsividad en todos los tamaños
- ✅ Manejo de errores adecuado
- ✅ No hay fugas de memoria

## 🎯 Conclusión

Si todas las pruebas pasan, la integración de "Gestión Integrada" es exitosa y está lista para producción.

---

**Última actualización:** 2 de Marzo, 2026
