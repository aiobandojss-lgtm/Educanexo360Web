# Auditoría de Comunicados Docentes — Plan de Implementación Frontend

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Crear la pantalla `/mensajes/auditoria` que permite a RECTOR, COORDINADOR y ADMIN ver cuántos mensajes envió cada docente en un periodo, con detalle expandible por docente. Incluye tab en MensajesLayout, ítem en sidebar y fix de mensajes duplicados en Enviados (ya resuelto en backend — el frontend solo verifica que funcione).

**Architecture:** Nueva página `AuditoriaMensajes.tsx` como hija de `MensajesLayout` (ruta `/mensajes/auditoria`). Dos llamadas al backend bajo demanda: estadísticas al buscar, detalle de mensajes al expandir una fila. Los dropdowns de filtro (docentes/cursos) se cargan al montar con servicios existentes.

**Tech Stack:** React 18, TypeScript strict, MUI v5, date-fns, Lucide React, axiosInstance, Redux (solo para leer `user` del estado), React Router v6.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `src/types/auditoria.types.ts` | Crear | Interfaces `EstadisticaDocente`, `MensajeAuditoria` |
| `src/services/mensajeService.ts` | Modificar | Agregar `obtenerEstadisticasDocentes` y `obtenerMensajesAuditoria` |
| `src/pages/mensajes/AuditoriaMensajes.tsx` | Crear | Página completa: filtros + tabla resumen + detalle expandible |
| `src/routes/AppRoutes.tsx` | Modificar | Lazy import + ruta protegida `/mensajes/auditoria` |
| `src/pages/mensajes/MensajesLayout.tsx` | Modificar | Agregar tab "Auditoría" condicional para roles admin |
| `src/components/layout/NavigationMenu.tsx` | Modificar | Agregar ítem "Auditoría" en submenú de Mensajería |

---

## Task 1: TypeScript types para auditoría

**Files:**
- Create: `src/types/auditoria.types.ts`

- [ ] **Step 1.1: Crear el archivo de tipos**

```typescript
// src/types/auditoria.types.ts

export interface CursoResumen {
  _id: string;
  nombre: string;
}

export interface EstadisticaDocente {
  docenteId: string;
  nombre: string;
  apellidos: string;
  count: number;
  ultimoMensaje: string | null;
  cursos: CursoResumen[];
}

export interface DestinatarioResumen {
  _id: string;
  nombre: string;
  apellidos: string;
}

export interface MensajeAuditoriaIndividual {
  _id: string;
  asunto: string;
  createdAt: string;
  tipo: 'INDIVIDUAL';
  destinatario: DestinatarioResumen;
  cursoNombre?: never;
  cantidadDestinatariosEstudiantes?: never;
}

export interface MensajeAuditoriaGrupal {
  _id: string;
  asunto: string;
  createdAt: string;
  tipo: 'GRUPAL' | 'INSTITUCIONAL';
  cursoNombre: string | null;
  cantidadDestinatariosEstudiantes: number;
  destinatario?: never;
}

export type MensajeAuditoria = MensajeAuditoriaIndividual | MensajeAuditoriaGrupal;

export interface EstadisticasDocentesParams {
  desde: string;
  hasta: string;
  cursoId?: string;
  docenteId?: string;
}

export interface MensajesAuditoriaParams {
  remitenteId: string;
  desde: string;
  hasta: string;
  pagina?: number;
  limite?: number;
}
```

- [ ] **Step 1.2: Verificar que TypeScript compila sin errores**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores (o solo los mismos errores pre-existentes que ya había).

- [ ] **Step 1.3: Commit**

```bash
git add src/types/auditoria.types.ts
git commit -m "feat: agregar tipos TypeScript para auditoría de comunicados"
```

---

## Task 2: Funciones de servicio en mensajeService

**Files:**
- Modify: `src/services/mensajeService.ts` — agregar al final del objeto `mensajeService`, antes del `export default`

- [ ] **Step 2.1: Agregar imports de tipos al inicio del archivo**

En `src/services/mensajeService.ts`, agregar después de la línea 1 (`// src/services/mensajeService.ts`):

```typescript
import type {
  EstadisticaDocente,
  MensajeAuditoria,
  EstadisticasDocentesParams,
  MensajesAuditoriaParams,
} from '../types/auditoria.types';
```

- [ ] **Step 2.2: Agregar las dos funciones nuevas**

En `src/services/mensajeService.ts`, agregar ANTES de la sección `// Exportar todas las funciones` (aproximadamente línea 733):

```typescript
// Estadísticas de comunicados por docente (para auditoría — solo RECTOR/COORDINADOR/ADMIN)
const obtenerEstadisticasDocentes = async (
  params: EstadisticasDocentesParams
): Promise<{ data: EstadisticaDocente[]; meta: { desde: string; hasta: string; totalDocentes: number } }> => {
  try {
    const query = new URLSearchParams({ desde: params.desde, hasta: params.hasta });
    if (params.cursoId) query.append('cursoId', params.cursoId);
    if (params.docenteId) query.append('docenteId', params.docenteId);
    const response = await axiosInstance.get(`/mensajes/estadisticas-docentes?${query.toString()}`);
    return response.data;
  } catch (error) {
    console.error('[Frontend] Error obteniendo estadísticas de docentes:', error);
    throw error;
  }
};

// Lista de mensajes enviados por un docente específico (detalle expandible)
const obtenerMensajesAuditoria = async (
  params: MensajesAuditoriaParams
): Promise<{ data: MensajeAuditoria[]; meta: { total: number; pagina: number; limite: number; paginas: number } }> => {
  try {
    const query = new URLSearchParams({
      remitenteId: params.remitenteId,
      desde: params.desde,
      hasta: params.hasta,
      pagina: String(params.pagina ?? 1),
      limite: String(params.limite ?? 20),
    });
    const response = await axiosInstance.get(`/mensajes/auditoria?${query.toString()}`);
    return response.data;
  } catch (error) {
    console.error('[Frontend] Error obteniendo mensajes de auditoría:', error);
    throw error;
  }
};
```

- [ ] **Step 2.3: Agregar las funciones al objeto de exportación**

Localizar el objeto `const mensajeService = { ... }` al final del archivo y agregar las dos funciones nuevas:

```typescript
  obtenerEstadisticasDocentes,
  obtenerMensajesAuditoria,
```

- [ ] **Step 2.4: Verificar compilación**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 2.5: Commit**

```bash
git add src/services/mensajeService.ts
git commit -m "feat: agregar obtenerEstadisticasDocentes y obtenerMensajesAuditoria al servicio de mensajes"
```

---

## Task 3: Página AuditoriaMensajes

**Files:**
- Create: `src/pages/mensajes/AuditoriaMensajes.tsx`

- [ ] **Step 3.1: Crear el archivo completo**

```tsx
// src/pages/mensajes/AuditoriaMensajes.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Assessment as AuditIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { RootState } from '../../redux/store';
import mensajeService from '../../services/mensajeService';
import usuarioService, { IUsuario } from '../../services/usuarioService';
import cursoService, { CursoDto } from '../../services/cursoService';
import type { EstadisticaDocente, MensajeAuditoria } from '../../types/auditoria.types';

const getFirstDayOfMonth = (): string => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
};

const getLastDayOfMonth = (): string => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
};

const getBadgeStyles = (count: number): React.CSSProperties => {
  if (count === 0) return { background: '#e5e7eb', color: '#374151' };
  if (count <= 2) return { background: '#fee2e2', color: '#dc2626' };
  return { background: '#d1fae5', color: '#059669' };
};

const AuditoriaMensajes: React.FC = () => {
  // Filtros
  const [desde, setDesde] = useState(getFirstDayOfMonth());
  const [hasta, setHasta] = useState(getLastDayOfMonth());
  const [docenteId, setDocenteId] = useState('');
  const [cursoId, setCursoId] = useState('');

  // Dropdowns
  const [docentes, setDocentes] = useState<IUsuario[]>([]);
  const [cursos, setCursos] = useState<CursoDto[]>([]);
  const [loadingFiltros, setLoadingFiltros] = useState(true);

  // Resultados
  const [estadisticas, setEstadisticas] = useState<EstadisticaDocente[]>([]);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
  const [errorEstadisticas, setErrorEstadisticas] = useState('');
  const [buscado, setBuscado] = useState(false);

  // Detalle expandible
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mensajesDetalle, setMensajesDetalle] = useState<Record<string, MensajeAuditoria[]>>({});
  const [loadingDetalle, setLoadingDetalle] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const cargarFiltros = async () => {
      try {
        const [docentesData, cursosData] = await Promise.all([
          usuarioService.obtenerUsuarios({ tipo: 'DOCENTE' }),
          cursoService.obtenerCursos(),
        ]);
        setDocentes(docentesData);
        setCursos(cursosData);
      } catch {
        // Los filtros son opcionales; si fallan, igual se puede buscar sin filtrar
      } finally {
        setLoadingFiltros(false);
      }
    };
    cargarFiltros();
  }, []);

  const handleBuscar = async () => {
    if (!desde || !hasta) return;
    setLoadingEstadisticas(true);
    setErrorEstadisticas('');
    setBuscado(true);
    setExpandedId(null);
    setMensajesDetalle({});
    try {
      const result = await mensajeService.obtenerEstadisticasDocentes({
        desde: `${desde}T00:00:00.000Z`,
        hasta: `${hasta}T23:59:59.999Z`,
        ...(docenteId && { docenteId }),
        ...(cursoId && { cursoId }),
      });
      setEstadisticas(result.data);
    } catch {
      setErrorEstadisticas('Error al cargar las estadísticas. Verifique la conexión e intente de nuevo.');
    } finally {
      setLoadingEstadisticas(false);
    }
  };

  const handleToggleDetalle = async (docId: string) => {
    if (expandedId === docId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(docId);
    if (mensajesDetalle[docId]) return; // Ya cargado, no volver a pedir
    setLoadingDetalle(prev => ({ ...prev, [docId]: true }));
    try {
      const result = await mensajeService.obtenerMensajesAuditoria({
        remitenteId: docId,
        desde: `${desde}T00:00:00.000Z`,
        hasta: `${hasta}T23:59:59.999Z`,
      });
      setMensajesDetalle(prev => ({ ...prev, [docId]: result.data }));
    } catch {
      setMensajesDetalle(prev => ({ ...prev, [docId]: [] }));
    } finally {
      setLoadingDetalle(prev => ({ ...prev, [docId]: false }));
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} color="primary.main" mb={3}>
        Auditoría de Comunicados Docentes
      </Typography>

      {/* Zona de filtros */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e5e7eb' }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          textTransform="uppercase"
          letterSpacing={1}
          fontWeight={600}
          display="block"
          mb={2}
        >
          Filtros
        </Typography>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Desde"
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Hasta"
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Docente</InputLabel>
              <Select
                value={docenteId}
                onChange={e => setDocenteId(e.target.value)}
                label="Docente"
                disabled={loadingFiltros}
              >
                <MenuItem value="">Todos los docentes</MenuItem>
                {docentes.map(d => (
                  <MenuItem key={d._id} value={d._id}>
                    {d.nombre} {d.apellidos}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Curso</InputLabel>
              <Select
                value={cursoId}
                onChange={e => setCursoId(e.target.value)}
                label="Curso"
                disabled={loadingFiltros}
              >
                <MenuItem value="">Todos los cursos</MenuItem>
                {cursos.map(c => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuscar}
              disabled={loadingEstadisticas || !desde || !hasta}
              sx={{ height: 40, background: '#059669', '&:hover': { background: '#047857' } }}
            >
              {loadingEstadisticas ? <CircularProgress size={20} color="inherit" /> : 'Buscar'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Estado inicial — sin búsqueda */}
      {!buscado && (
        <Box textAlign="center" py={8} color="text.secondary">
          <AuditIcon sx={{ fontSize: 56, mb: 1, opacity: 0.25, color: '#059669' }} />
          <Typography variant="body2">
            Selecciona un período y haz clic en <strong>Buscar</strong> para ver el reporte
          </Typography>
        </Box>
      )}

      {/* Error */}
      {buscado && errorEstadisticas && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorEstadisticas}</Alert>
      )}

      {/* Tabla de resultados */}
      {buscado && !loadingEstadisticas && !errorEstadisticas && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, border: '1px solid #e5e7eb', overflow: 'hidden' }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    background: '#f9fafb',
                    fontWeight: 600,
                    color: '#6b7280',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  },
                }}
              >
                <TableCell>Docente</TableCell>
                <TableCell>Curso(s)</TableCell>
                <TableCell align="center">Mensajes enviados</TableCell>
                <TableCell align="center">Último envío</TableCell>
                <TableCell align="center">Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estadisticas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    No se encontraron docentes para los filtros seleccionados
                  </TableCell>
                </TableRow>
              ) : (
                estadisticas.map(est => (
                  <React.Fragment key={est.docenteId}>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {est.nombre} {est.apellidos}
                      </TableCell>
                      <TableCell sx={{ color: '#6b7280', fontSize: 13 }}>
                        {est.cursos.length > 0
                          ? est.cursos.map(c => c.nombre).join(', ')
                          : '—'}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          component="span"
                          sx={{
                            ...getBadgeStyles(est.count),
                            borderRadius: '12px',
                            px: 1.5,
                            py: 0.5,
                            fontWeight: 700,
                            fontSize: 13,
                            display: 'inline-block',
                          }}
                        >
                          {est.count === 0 ? 'Sin mensajes' : est.count}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#6b7280', fontSize: 13 }}>
                        {est.ultimoMensaje
                          ? format(new Date(est.ultimoMensaje), 'dd MMM')
                          : '—'}
                      </TableCell>
                      <TableCell align="center">
                        {est.count > 0 && (
                          <IconButton
                            size="small"
                            onClick={() => handleToggleDetalle(est.docenteId)}
                            sx={{ color: '#0D9488' }}
                          >
                            {expandedId === est.docenteId ? <CollapseIcon /> : <ExpandIcon />}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Fila de detalle expandible */}
                    <TableRow>
                      <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandedId === est.docenteId} unmountOnExit>
                          <Box
                            sx={{
                              m: 1,
                              ml: 2,
                              borderLeft: '3px solid #059669',
                              pl: 2,
                              background: '#f0fdf4',
                              borderRadius: 1,
                              py: 1,
                            }}
                          >
                            {loadingDetalle[est.docenteId] && (
                              <Box display="flex" justifyContent="center" py={2}>
                                <CircularProgress size={20} sx={{ color: '#059669' }} />
                              </Box>
                            )}
                            {!loadingDetalle[est.docenteId] &&
                              mensajesDetalle[est.docenteId] && (
                                mensajesDetalle[est.docenteId].length === 0 ? (
                                  <Typography variant="body2" color="text.secondary" py={1}>
                                    No se encontraron mensajes para este período
                                  </Typography>
                                ) : (
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Fecha</TableCell>
                                        <TableCell sx={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Asunto</TableCell>
                                        <TableCell sx={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Destinatario</TableCell>
                                        <TableCell sx={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }}>Tipo</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {mensajesDetalle[est.docenteId].map(msg => (
                                        <TableRow key={msg._id}>
                                          <TableCell sx={{ fontSize: 12, color: '#374151' }}>
                                            {format(new Date(msg.createdAt), 'dd MMM')}
                                          </TableCell>
                                          <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                                            {msg.asunto}
                                          </TableCell>
                                          <TableCell sx={{ fontSize: 12, color: '#374151' }}>
                                            {msg.tipo === 'INDIVIDUAL'
                                              ? `👤 ${msg.destinatario.nombre} ${msg.destinatario.apellidos}`
                                              : `📚 Masivo → ${msg.cursoNombre ?? 'Curso N/A'} (${msg.cantidadDestinatariosEstudiantes} est.)`}
                                          </TableCell>
                                          <TableCell>
                                            <Box
                                              component="span"
                                              sx={{
                                                background: msg.tipo === 'INDIVIDUAL' ? '#f3e8ff' : '#dbeafe',
                                                color: msg.tipo === 'INDIVIDUAL' ? '#7c3aed' : '#1d4ed8',
                                                borderRadius: '4px',
                                                px: 0.75,
                                                py: 0.25,
                                                fontSize: 11,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {msg.tipo === 'INDIVIDUAL' ? 'Individual' : 'Masivo'}
                                            </Box>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )
                              )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
          {/* Leyenda */}
          <Box sx={{ px: 2, py: 1, borderTop: '1px solid #f3f4f6', textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              🔴 1–2 mensajes &nbsp;|&nbsp; 🟢 3 o más &nbsp;|&nbsp; ⬜ Sin mensajes &nbsp;|&nbsp; El conteo excluye copias automáticas a acudientes
            </Typography>
          </Box>
        </TableContainer>
      )}
    </Box>
  );
};

export default AuditoriaMensajes;
```

- [ ] **Step 3.2: Verificar compilación**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores nuevos. Si hay error de tipo en `msg.destinatario` o `msg.cursoNombre`, verificar que los tipos discriminados `MensajeAuditoriaIndividual` / `MensajeAuditoriaGrupal` estén correctos en `auditoria.types.ts`.

- [ ] **Step 3.3: Commit**

```bash
git add src/pages/mensajes/AuditoriaMensajes.tsx
git commit -m "feat: crear página AuditoriaMensajes con filtros y tabla expandible"
```

---

## Task 4: Ruta, tab y navegación

**Files:**
- Modify: `src/routes/AppRoutes.tsx`
- Modify: `src/pages/mensajes/MensajesLayout.tsx`
- Modify: `src/components/layout/NavigationMenu.tsx`

### 4a: Ruta en AppRoutes.tsx

- [ ] **Step 4.1: Agregar lazy import de AuditoriaMensajes**

En `src/routes/AppRoutes.tsx`, localizar el bloque de imports de mensajería (cerca de la línea 37–41) y agregar:

```typescript
const AuditoriaMensajes = lazy(() => import('../pages/mensajes/AuditoriaMensajes'));
```

- [ ] **Step 4.2: Agregar la ruta protegida**

En `src/routes/AppRoutes.tsx`, dentro del bloque `<Route path="mensajes" element={<MensajesLayout />}>`, agregar DESPUÉS de la última ruta existente de mensajes (antes del cierre `</Route>` del bloque mensajes):

```tsx
<Route
  path="auditoria"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "RECTOR", "COORDINADOR"]}>
      <AuditoriaMensajes />
    </ProtectedRoute>
  }
/>
```

### 4b: Tab en MensajesLayout.tsx

- [ ] **Step 4.3: Agregar variable `puedeVerAuditoria`**

En `src/pages/mensajes/MensajesLayout.tsx`, después de la línea donde se define `puedeTenerBorradores`, agregar:

```typescript
const puedeVerAuditoria = ['ADMIN', 'RECTOR', 'COORDINADOR'].includes(user?.tipo || '');
```

- [ ] **Step 4.4: Actualizar `getActiveTab()` para la ruta auditoria**

Localizar la función `getActiveTab()` y agregar ANTES de `return 0;` al final:

```typescript
if (location.pathname.includes('auditoria')) return puedeTenerBorradores ? 5 : 4;
```

- [ ] **Step 4.5: Actualizar `tabIndexMapping()` para incluir auditoria**

Localizar el `return` final de `tabIndexMapping()` (el que tiene `recibidos: 0, enviados: 1, borradores: 2, ...`) y reemplazarlo con:

```typescript
return {
  recibidos: 0,
  enviados: 1,
  borradores: 2,
  archivados: 3,
  eliminados: 4,
  ...(puedeVerAuditoria && { auditoria: 5 }),
};
```

- [ ] **Step 4.6: Agregar el tab en el JSX**

Localizar el bloque `<Tabs ...>` en el JSX de `MensajesLayout` y agregar el tab de Auditoría DESPUÉS de `<Tab label="Eliminados" />`:

```tsx
{puedeVerAuditoria && <Tab label="Auditoría" />}
```

### 4c: Ítem en NavigationMenu.tsx

- [ ] **Step 4.7: Agregar ítem de Auditoría al submenú de Mensajería**

En `src/components/layout/NavigationMenu.tsx`, localizar el array `children` del ítem "Mensajería" y agregar al FINAL (después del ítem "Eliminados"):

```typescript
{
  title: 'Auditoría',
  icon: <BarChart2 {...iconProps} />,
  path: '/mensajes/auditoria',
  allowedRoles: ['ADMIN', 'RECTOR', 'COORDINADOR'],
},
```

`BarChart2` ya está importado de lucide-react en la línea 39 del archivo.

- [ ] **Step 4.8: Verificar compilación completa**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 4.9: Commit**

```bash
git add src/routes/AppRoutes.tsx src/pages/mensajes/MensajesLayout.tsx src/components/layout/NavigationMenu.tsx
git commit -m "feat: agregar ruta, tab y nav de auditoría de comunicados docentes"
```

---

## Task 5: Verificación manual en el navegador

- [ ] **Step 5.1: Iniciar el servidor de desarrollo**

```bash
npm run dev
```

- [ ] **Step 5.2: Verificar como RECTOR o ADMIN**

1. Iniciar sesión con un usuario RECTOR o ADMIN.
2. En el sidebar de Mensajería → verificar que aparece el ítem **"Auditoría"**.
3. Navegar a `/mensajes/auditoria`.
4. Verificar que el tab **"Auditoría"** está activo (posición 6, después de Eliminados).
5. Los dropdowns Docente y Curso deben cargarse.
6. Ingresar un rango de fechas y hacer clic en **Buscar**.
7. La tabla debe mostrar todos los docentes de la escuela con sus conteos. Los de count=0 aparecen primero con badge gris "Sin mensajes".
8. Hacer clic en el ícono de expansión de un docente con mensajes → debe cargar y mostrar la sublista con Fecha, Asunto, Destinatario y Tipo.
9. Hacer clic nuevamente → se colapsa.
10. Hacer clic en otro docente → se expande el nuevo y el anterior queda colapsado.

- [ ] **Step 5.3: Verificar como DOCENTE**

1. Iniciar sesión con un usuario DOCENTE.
2. Verificar que el ítem "Auditoría" NO aparece en el sidebar.
3. Intentar navegar manualmente a `/mensajes/auditoria` → debe redirigir (ProtectedRoute lo bloquea).
4. Verificar la bandeja "Enviados" — los mensajes de copia automática a acudientes ya NO deben aparecer (fix del backend).

- [ ] **Step 5.4: Commit final si todo está OK**

```bash
git add -A
git commit -m "feat: auditoría de comunicados docentes completada — filtros, tabla resumen, detalle expandible, fix enviados"
```

---

## Auto-review contra el spec

| Requisito del spec | Task que lo cubre |
|--------------------|-------------------|
| Filtros: fecha, docente, curso | Task 3 — zona de filtros |
| Conteo por docente (acciones, no destinatarios) | Task 3 — estadísticas del Endpoint 1 |
| Docentes con 0 mensajes visibles (primeros en tabla) | Task 3 — badge "Sin mensajes", ordenado por backend |
| Badge verde ≥3 / rojo 1-2 / gris 0 | Task 3 — `getBadgeStyles()` |
| Detalle bajo demanda (Endpoint 2 al expandir) | Task 3 — `handleToggleDetalle()` |
| Masivo muestra curso + cantidad | Task 3 — discriminación por `msg.tipo` |
| Individual muestra nombre del estudiante | Task 3 — `msg.destinatario.nombre` |
| Ruta `/mensajes/auditoria` protegida | Task 4a |
| Tab "Auditoría" en MensajesLayout | Task 4b |
| Ítem sidebar solo para ADMIN/RECTOR/COORDINADOR | Task 4c |
| Paleta verde/teal (#059669, #0D9488) | Task 3 — sx en Button, badges, border |
| Fix enviados duplicados | Backend ya lo resolvió — verificado en Step 5.3 |
