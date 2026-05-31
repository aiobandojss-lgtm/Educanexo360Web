// src/pages/mensajes/AuditoriaMensajes.tsx
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowUp as CollapseIcon,
  Assessment as AuditIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
  const [detalleError, setDetalleError] = useState<Record<string, boolean>>({});

  // Dialog de contenido completo
  const [mensajeAbierto, setMensajeAbierto] = useState<MensajeAuditoria | null>(null);

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
    setDetalleError({});
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
    // Cache hit: detail already loaded for this search — handleBuscar clears this cache on each new search
    if (mensajesDetalle[docId]) return;
    setLoadingDetalle(prev => ({ ...prev, [docId]: true }));
    try {
      const result = await mensajeService.obtenerMensajesAuditoria({
        remitenteId: docId,
        desde: `${desde}T00:00:00.000Z`,
        hasta: `${hasta}T23:59:59.999Z`,
      });
      setMensajesDetalle(prev => ({ ...prev, [docId]: result.data }));
    } catch {
      setDetalleError(prev => ({ ...prev, [docId]: true }));
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
                          ? format(new Date(est.ultimoMensaje), 'dd MMM', { locale: es })
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
                            {!loadingDetalle[est.docenteId] && detalleError[est.docenteId] && (
                              <Alert severity="error" sx={{ m: 1 }}>
                                Error al cargar los mensajes. Intente nuevamente.
                              </Alert>
                            )}
                            {!loadingDetalle[est.docenteId] && !detalleError[est.docenteId] &&
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
                                        <TableCell sx={{ color: '#6b7280', fontSize: 12, fontWeight: 600 }} align="center">Ver</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {mensajesDetalle[est.docenteId].map(msg => (
                                        <TableRow key={msg._id}>
                                          <TableCell sx={{ fontSize: 12, color: '#374151' }}>
                                            {format(new Date(msg.createdAt), 'dd MMM', { locale: es })}
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
                                                background: msg.tipo === 'INDIVIDUAL' ? '#fef3c7' : '#d1fae5',
                                                color: msg.tipo === 'INDIVIDUAL' ? '#92400e' : '#059669',
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
                                          <TableCell align="center">
                                            <Tooltip title="Ver contenido del mensaje">
                                              <IconButton
                                                size="small"
                                                onClick={() => setMensajeAbierto(msg)}
                                                sx={{ color: '#0D9488' }}
                                              >
                                                <ViewIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
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
      {/* Dialog — contenido completo del mensaje */}
      <Dialog
        open={Boolean(mensajeAbierto)}
        onClose={() => setMensajeAbierto(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {mensajeAbierto && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {mensajeAbierto.asunto}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(mensajeAbierto.createdAt), "dd 'de' MMMM yyyy", { locale: es })}
                    {' · '}
                    {mensajeAbierto.tipo === 'INDIVIDUAL'
                      ? `Para: ${mensajeAbierto.destinatario.nombre} ${mensajeAbierto.destinatario.apellidos}`
                      : `Para: ${mensajeAbierto.cursoNombre ?? 'Curso'} (${mensajeAbierto.cantidadDestinatariosEstudiantes} estudiantes)`}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setMensajeAbierto(null)} sx={{ mt: -0.5 }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2 }}>
              <Box
                sx={{
                  '& p': { margin: '0 0 8px 0' },
                  '& ul, & ol': { paddingLeft: 3, margin: '0 0 8px 0' },
                  '& h1, & h2, & h3': { margin: '8px 0', fontWeight: 600 },
                  '& a': { color: '#059669' },
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#374151',
                }}
                dangerouslySetInnerHTML={{ __html: mensajeAbierto.contenido }}
              />
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 1.5 }}>
              <Button
                onClick={() => setMensajeAbierto(null)}
                variant="outlined"
                size="small"
                sx={{ borderColor: '#059669', color: '#059669' }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default AuditoriaMensajes;
