# Spec: Auditoría de Comunicados Docentes + Fix Enviados Duplicados

**Fecha:** 2026-05-30  
**Estado:** Aprobado — pendiente implementación backend  
**Roles beneficiados:** RECTOR, COORDINADOR, ADMIN  
**Scope:** Funcionalidad de supervisión (no es parte del core); pantalla sencilla con uniformidad de colores verde/teal de la app.

---

## Contexto

El rector, coordinador y admin necesitan verificar que los docentes estén enviando comunicados a los estudiantes. Hoy no existe forma de hacer ese seguimiento sin revisar mensaje por mensaje. Se requiere una pantalla de auditoría con filtros y conteos por docente.

Adicionalmente, cuando un docente envía un mensaje a un estudiante, el sistema genera automáticamente una copia al acudiente. Hoy ambas aparecen en la bandeja "Enviados" del docente, generando ruido visual (si el docente tiene 30 estudiantes y envía un masivo, ve 60 entradas). Se corrige ocultando la copia automática.

---

## Parte 1 — Cambios en el Backend

> **Este bloque es el contrato que el backend debe implementar antes de comenzar el frontend.**

### 1.1 Nuevos campos en el modelo de Mensaje

Agregar los siguientes campos al modelo `IMensaje` / `mensaje.model.ts`:

```
esCopiaAcudiente: Boolean       (default: false)
cursoIds:         [ObjectId]    (optional, ref: 'Curso')
```

**Campo `esCopiaAcudiente`:**  
Identifica los mensajes que el sistema generó automáticamente como copia al acudiente cuando un docente escribe a un estudiante. Permite filtrarlos en la bandeja Enviados y excluirlos del conteo de auditoría.  
Se establece en `true` en el servicio de mensajería, en el punto donde se crea la copia para el acudiente.

**Campo `cursoIds`:**  
Persiste los cursos destinatarios de un mensaje GRUPAL/masivo. Cuando el servicio `crearMensaje` recibe `cursoIds` en el payload (mensajes grupales), guarda esos IDs en el documento Mensaje además de resolver los estudiantes individuales en `destinatarios[]`.

**Por qué es necesario:** sin este campo, los mensajes GRUPAL no tienen referencia al curso original una vez que se resuelven a IDs de estudiantes. Es la única forma confiable de obtener `cursoNombre` en el endpoint de auditoría.

**Compatibilidad con datos históricos:** mensajes anteriores al despliegue tendrán `cursoIds: []`. El endpoint de auditoría devolverá `cursoNombre: null` para esos registros; el frontend mostrará un fallback como "Curso N/A".

---

### 1.2 Endpoint 1 — Estadísticas por docente

```
GET /api/mensajes/estadisticas-docentes
```

**Auth:** Solo roles `RECTOR`, `COORDINADOR`, `ADMIN`.

**Query params:**

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `desde` | Date (ISO) | Sí | Fecha inicio del periodo |
| `hasta` | Date (ISO) | Sí | Fecha fin del periodo (inclusivo, hasta las 23:59:59) |
| `cursoId` | ObjectId | No | Filtrar solo docentes de ese curso |
| `docenteId` | ObjectId | No | Filtrar por un docente específico |

**Lógica de negocio:**
- El punto de partida es la colección de **usuarios con tipo `DOCENTE`** de la escuela — NO la colección de mensajes. Esto garantiza que los docentes que enviaron **0 mensajes** en el periodo también aparezcan en la respuesta (son los más importantes para el rector).
- Hacer un `$lookup` (left join) desde usuarios hacia mensajes, filtrando por rango de fechas, excluyendo `esCopiaAcudiente === true` y excluyendo tipo `BORRADOR`.
- Para cada docente, obtener los cursos que dicta desde `info_academica.asignaturas_asignadas[].cursoId` (extraer los `cursoId` distintos y hacer lookup a la colección `Curso` para obtener el nombre). La respuesta al frontend es `cursos: [{ _id, nombre }]`.
- Ordenar: primero los que tienen `count === 0` (mayor urgencia), luego por `count` ascendente.

**Respuesta esperada:**

```json
{
  "success": true,
  "data": [
    {
      "docenteId": "507f...",
      "nombre": "Juan",
      "apellidos": "Pérez",
      "count": 12,
      "ultimoMensaje": "2026-05-28T14:30:00.000Z",
      "cursos": [
        { "_id": "507f...", "nombre": "6°A" },
        { "_id": "507f...", "nombre": "7°B" }
      ]
    },
    {
      "docenteId": "507f...",
      "nombre": "María",
      "apellidos": "García",
      "count": 1,
      "ultimoMensaje": "2026-05-05T09:00:00.000Z",
      "cursos": [
        { "_id": "507f...", "nombre": "7°B" }
      ]
    },
    {
      "docenteId": "507f...",
      "nombre": "Pedro",
      "apellidos": "Mora",
      "count": 0,
      "ultimoMensaje": null,
      "cursos": [
        { "_id": "507f...", "nombre": "9°A" }
      ]
    }
  ],
  "meta": {
    "desde": "2026-05-01T00:00:00.000Z",
    "hasta": "2026-05-30T23:59:59.000Z",
    "totalDocentes": 3
  }
}
```

**Nota técnica:** Implementar con MongoDB aggregation pipeline (`$match` → `$group` → `$lookup` cursos → `$sort`). Evitar N+1 queries.

---

### 1.3 Endpoint 2 — Lista de mensajes de un docente (detalle)

```
GET /api/mensajes/auditoria
```

**Auth:** Solo roles `RECTOR`, `COORDINADOR`, `ADMIN`.

**Query params:**

| Param | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `remitenteId` | ObjectId | Sí | ID del docente cuya lista se quiere ver |
| `desde` | Date (ISO) | Sí | Fecha inicio del periodo |
| `hasta` | Date (ISO) | Sí | Fecha fin del periodo |
| `pagina` | Number | No | Default: 1 |
| `limite` | Number | No | Default: 20 |

**Lógica de negocio:**
- Filtrar mensajes donde `remitente._id === remitenteId`
- Filtrar por rango de fechas `createdAt` entre `desde` y `hasta`
- Excluir `esCopiaAcudiente === true`
- Excluir tipo `BORRADOR`
- `tipo === 'INDIVIDUAL'`: incluir `destinatario: { _id, nombre, apellidos }` (el estudiante destinatario)
- `tipo === 'GRUPAL'` o `tipo === 'INSTITUCIONAL'`: incluir `cursoNombre` + `cantidadDestinatariosEstudiantes` (contar solo destinatarios de tipo ESTUDIANTE, excluir acudientes del conteo)
- Nota: los mensajes masivos se almacenan en BD como `GRUPAL` — el tipo `MASIVO` no existe en el enum del backend
- Ordenar por `createdAt` descendente

**Respuesta esperada:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f...",
      "asunto": "Aviso recuperación parcial",
      "createdAt": "2026-05-28T14:30:00.000Z",
      "tipo": "GRUPAL",
      "cursoNombre": "6°A",
      "cantidadDestinatariosEstudiantes": 28
    },
    {
      "_id": "507f...",
      "asunto": "Calificaciones período 2",
      "createdAt": "2026-05-22T10:00:00.000Z",
      "tipo": "INDIVIDUAL",
      "destinatario": {
        "_id": "507f...",
        "nombre": "Ana",
        "apellidos": "Rodríguez"
      }
    }
  ],
  "meta": {
    "total": 12,
    "pagina": 1,
    "limite": 20,
    "paginas": 1
  }
}
```

---

### 1.4 Fix en endpoint existente — Bandeja Enviados del docente

**Endpoint afectado:** `GET /api/mensajes?bandeja=enviados`

**Cambio:** Agregar al filtro de consulta: `esCopiaAcudiente: { $ne: true }`.

Esto hace que los mensajes marcados como copia automática al acudiente no aparezcan en la bandeja Enviados del docente. La copia sigue llegando al acudiente — solo se oculta de la vista del remitente.

**No se requiere ningún cambio en el frontend para este fix** una vez que el backend lo aplique, ya que el frontend simplemente renderiza lo que recibe.

---

## Parte 2 — Cambios en el Frontend

> **El frontend inicia solo después de que el backend haya implementado y validado los dos endpoints y el fix de enviados.**

### 2.1 Nueva página: AuditoriaMensajes

**Archivo:** `src/pages/mensajes/AuditoriaMensajes.tsx`  
**Ruta:** `/mensajes/auditoria`  
**Roles con acceso:** `RECTOR`, `COORDINADOR`, `ADMIN`

**Estructura de la página:**

**Zona de filtros:**
- `DatePicker` Desde / Hasta — default: primer y último día del mes actual
- `Select` Docente — opciones: todos + lista de docentes de la escuela (reutilizar endpoint de usuarios)
- `Select` Curso — opciones: todos + lista de cursos (reutilizar endpoint de cursos)
- Botón "Buscar" — dispara la llamada al Endpoint 1

**Tabla de resumen (Endpoint 1):**
- Columnas: Docente | Curso(s) | Mensajes enviados | Último envío | Acción
- Badge de conteo: verde (`#059669`) si count ≥ 3, rojo (`#EF4444`) si count entre 1 y 2, gris con texto "Sin mensajes" si count === 0
- Ordenar la tabla: primero count === 0 (mayor urgencia), luego ascendente por count
- Fila expandible: al hacer click en "Ver mensajes" llama al Endpoint 2 y muestra la sublista
- Estado de carga: skeleton o spinner por fila

**Sublista de mensajes (Endpoint 2 — bajo demanda):**
- Se muestra inline dentro de la fila expandida
- Columnas: Fecha | Asunto | Destinatario | Tipo
- Masivo: "📚 Masivo → [NombreCurso] ([N] est.)"
- Individual: "👤 [Nombre Apellidos]"
- Paginación si `meta.paginas > 1`

### 2.2 Nuevas funciones en mensajeService

```typescript
// Estadísticas por docente para auditoría
obtenerEstadisticasDocentes(params: {
  desde: string;
  hasta: string;
  cursoId?: string;
  docenteId?: string;
}): Promise<EstadisticaDocente[]>

// Lista detallada de mensajes de un docente
obtenerMensajesAuditoria(params: {
  remitenteId: string;
  desde: string;
  hasta: string;
  pagina?: number;
  limite?: number;
}): Promise<PaginatedResponse<MensajeAuditoria>>
```

### 2.3 Ruta y navegación

- Agregar ruta en `AppRoutes.tsx`:  
  `<ProtectedRoute allowedRoles={["ADMIN", "RECTOR", "COORDINADOR"]}>`  
  → `<AuditoriaMensajes />`

- Agregar ítem en el sidebar (dentro de la sección de Mensajería), visible solo para esos tres roles:  
  Icono: `AssessmentOutlined` o `FactCheckOutlined` — texto: "Auditoría"

### 2.4 Colores

Respetar la paleta verde/teal de la app:
- Primario: `#059669` (Emerald-600)
- Secundario: `#0D9488` (Teal-600)
- Error/bajo: `#EF4444`
- Fondos sutiles: `#f0fdf4` (Emerald-50)

---

## Resumen de cambios

| Componente | Cambio | Quién |
|-----------|--------|-------|
| `mensaje.model.ts` | Agregar campos `esCopiaAcudiente: Boolean` y `cursoIds: [ObjectId]` | Backend |
| Servicio de mensajes | Marcar `esCopiaAcudiente: true` al crear copia para acudiente | Backend |
| Servicio de mensajes | Persistir `cursoIds` al crear mensajes GRUPAL/masivo | Backend |
| `GET /api/mensajes?bandeja=enviados` | Excluir `esCopiaAcudiente: true` | Backend |
| `GET /api/mensajes/estadisticas-docentes` | Nuevo endpoint — agregación por docente | Backend |
| `GET /api/mensajes/auditoria` | Nuevo endpoint — lista paginada por remitente | Backend |
| `AuditoriaMensajes.tsx` | Nueva página con filtros + tabla + detalle expandible | Frontend |
| `mensajeService.ts` | 2 nuevas funciones de servicio | Frontend |
| `AppRoutes.tsx` | Nueva ruta protegida | Frontend |
| Sidebar / navegación | Nuevo ítem "Auditoría" visible para 3 roles | Frontend |

---

## Secuencia de trabajo recomendada

1. Backend implementa los cambios (modelo + 2 endpoints + fix enviados)
2. Backend valida y despliega
3. Frontend implementa `AuditoriaMensajes.tsx` + servicio + ruta + nav
4. QA: probar con usuario RECTOR, COORDINADOR, ADMIN; verificar que DOCENTE no ve la ruta

---

## Fuera de scope (para versiones futuras)

- Exportar auditoría a Excel/PDF
- Notificación automática al rector si un docente lleva X días sin enviar mensajes
- Umbral configurable (hoy hardcodeado en 3 mensajes para el color del badge)
