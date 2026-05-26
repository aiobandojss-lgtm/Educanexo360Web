// src/components/asistencia/informes/InformeRiesgo.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  LightbulbOutlined as LightbulbIcon,
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useInformeRiesgo, useCursos, useEscuela, useAlertasAsistencia } from '../../../hooks/useAppQueries';
import type { ParamsRiesgo, EstudianteRiesgo, AlertaAsistencia } from '../../../services/asistenciaInformesService';
import { generarPdfRiesgo } from '../../../utils/pdfGenerators/pdfRiesgo';

// Faltas restantes antes de cruzar el umbral crítico del 70%
// Usa ausentismo efectivo derivado del % (incluye tardanzas/justificados como el backend)
// Positivo = aún tiene margen | Negativo = ya lo superó
const faltasAlCritico = (est: EstudianteRiesgo): number => {
  const ausentesEfectivos = Math.round(est.clasesTotales * (1 - est.porcentajeAsistencia / 100));
  return Math.floor(est.clasesTotales * 0.30) - ausentesEfectivos;
};

const InformeRiesgo: React.FC = () => {
  const [params, setParams] = useState<ParamsRiesgo>({
    umbral: 80,
    cursoId: '',
    desde: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    hasta: format(new Date(), 'yyyy-MM-dd'),
  });
  const [queryParams, setQueryParams] = useState<ParamsRiesgo>(params);

  const { data: cursosData } = useCursos();
  const cursos: any[] = (cursosData as any)?.data || (Array.isArray(cursosData) ? cursosData : []);

  const { data, isLoading, isError } = useInformeRiesgo(
    {
      ...queryParams,
      cursoId: queryParams.cursoId || undefined,
    },
    true
  );

  const [generandoPdf, setGenerandoPdf] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: escuela } = useEscuela();

  const { data: alertasData = [] } = useAlertasAsistencia(
    { cursoId: queryParams.cursoId || undefined },
    true
  );

  // Mapa estudianteId → alerta de mayor nivel para lookup O(1)
  const ORDEN_NIVEL: Record<string, number> = { INMINENTE: 3, CRITICO: 2, ALERTA: 1 };
  const alertaPorEstudiante = useMemo(() => {
    const mapa = new Map<string, AlertaAsistencia>();
    for (const alerta of alertasData) {
      const idEst = alerta.estudianteId._id;
      const existente = mapa.get(idEst);
      if (!existente || ORDEN_NIVEL[alerta.nivel] > ORDEN_NIVEL[existente.nivel]) {
        mapa.set(idEst, alerta);
      }
    }
    return mapa;
  }, [alertasData]);

  const estudiantesFiltrados = useMemo(() => {
    if (!data?.estudiantes) return [];
    if (user?.tipo !== 'DOCENTE') return data.estudiantes;
    const cursosDocente = new Set(
      (user.info_academica?.asignaturas_asignadas ?? []).map((a) => a.cursoId)
    );
    if (cursosDocente.size === 0) return data.estudiantes;
    return data.estudiantes.filter((e) => cursosDocente.has(e.curso._id));
  }, [data, user]);

  const totalFiltrado    = estudiantesFiltrados.length;
  const criticosFiltrado = estudiantesFiltrados.filter((e) => e.nivelRiesgo === 'CRITICO').length;
  const alertasFiltrado  = estudiantesFiltrados.filter((e) => e.nivelRiesgo === 'ALERTA').length;

  const interpretacion = useMemo(() => {
    if (!data) return null;

    if (totalFiltrado === 0) {
      return {
        severity: 'success' as const,
        titulo: 'Asistencia institucional en nivel favorable',
        mensajes: [
          `Ningún estudiante presenta riesgo de pérdida del año por inasistencia en el período consultado.`,
          `Todos los estudiantes mantienen asistencia superior al umbral institucional del ${queryParams.umbral}%.`,
        ],
        acciones: [] as string[],
      };
    }

    const mensajes: string[] = [];
    const acciones: string[] = [];

    if (criticosFiltrado > 0) {
      mensajes.push(
        `${criticosFiltrado} estudiante${criticosFiltrado > 1 ? 's' : ''} ${criticosFiltrado > 1 ? 'tienen' : 'tiene'} asistencia por debajo del 70% — umbral crítico de pérdida del año establecido en la mayoría de instituciones educativas colombianas. Con este nivel de inasistencia, el estudiante puede ser REPROBADO independientemente de sus calificaciones académicas.`
      );
      acciones.push('Convocar de inmediato al acudiente y al estudiante a comité de seguimiento académico.');
      acciones.push('Registrar las ausencias y el proceso en el observador del estudiante.');
      acciones.push('Verificar si existen justificaciones médicas o familiares que ameriten un proceso especial según el Manual de Convivencia.');
    }

    if (alertasFiltrado > 0) {
      mensajes.push(
        `${alertasFiltrado} estudiante${alertasFiltrado > 1 ? 's' : ''} ${alertasFiltrado > 1 ? 'están' : 'está'} por debajo del umbral institucional del ${queryParams.umbral}% pero aún por encima del límite crítico del 70%. Revise la columna "Faltas al 70%" para ver cuántas ausencias adicionales puede acumular cada uno antes de entrar en zona crítica.`
      );
      acciones.push('Notificar formalmente a los acudientes por escrito o a través de la plataforma.');
      acciones.push('Establecer un plan de seguimiento semanal de asistencia con el director de grupo.');
    }

    return {
      severity: criticosFiltrado > 0 ? 'error' as const : 'warning' as const,
      titulo: criticosFiltrado > 0
        ? 'Situación crítica — intervención urgente requerida'
        : 'Estudiantes en zona de alerta — seguimiento necesario',
      mensajes,
      acciones,
    };
  }, [data, totalFiltrado, criticosFiltrado, alertasFiltrado, queryParams.umbral]);

  const handleDescargarPdf = () => {
    if (!data) return;
    setGenerandoPdf(true);
    try {
      const cursoObj = cursos.find((c: any) => c._id === queryParams.cursoId);
      const nombreCurso = cursoObj
        ? `${cursoObj.nombre} ${cursoObj.grado}-${cursoObj.grupo}`
        : undefined;
      generarPdfRiesgo(
        data,
        escuela ?? null,
        `${user?.nombre ?? ''} ${user?.apellidos ?? ''}`.trim(),
        queryParams,
        nombreCurso,
        estudiantesFiltrados,
        { total: totalFiltrado, criticos: criticosFiltrado, alertas: alertasFiltrado },
        interpretacion
          ? { titulo: interpretacion.titulo, mensajes: interpretacion.mensajes, acciones: interpretacion.acciones }
          : undefined,
      );
    } finally {
      setGenerandoPdf(false);
    }
  };

  const handleBuscar = () => {
    setQueryParams({ ...params });
  };

  const nivelColor = (nivel: 'CRITICO' | 'ALERTA') =>
    nivel === 'CRITICO' ? 'error' : 'warning';

  const nivelIcon = (nivel: 'CRITICO' | 'ALERTA') =>
    nivel === 'CRITICO' ? <ErrorIcon fontSize="small" /> : <WarningIcon fontSize="small" />;

  return (
    <Box>
      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Umbral (%)"
              type="number"
              size="small"
              fullWidth
              value={params.umbral}
              onChange={(e) => setParams(p => ({ ...p, umbral: Number(e.target.value) }))}
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Desde"
              type="date"
              size="small"
              fullWidth
              value={params.desde}
              onChange={(e) => setParams(p => ({ ...p, desde: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Hasta"
              type="date"
              size="small"
              fullWidth
              value={params.hasta}
              onChange={(e) => setParams(p => ({ ...p, hasta: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Curso"
              select
              size="small"
              fullWidth
              value={params.cursoId}
              onChange={(e) => setParams(p => ({ ...p, cursoId: e.target.value }))}
            >
              <MenuItem value="">Todos los cursos</MenuItem>
              {cursos.map((c: any) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombre} {c.grado}-{c.grupo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuscar}
              startIcon={<RefreshIcon />}
              sx={{ borderRadius: 20 }}
            >
              Consultar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Botón PDF */}
      {totalFiltrado > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={generandoPdf ? <CircularProgress size={16} color="inherit" /> : <PdfIcon />}
            onClick={handleDescargarPdf}
            disabled={generandoPdf}
            sx={{ borderRadius: 20, textTransform: 'none' }}
          >
            {generandoPdf ? 'Generando...' : 'Descargar PDF'}
          </Button>
        </Box>
      )}

      {/* Resumen */}
      {data && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="text.primary">{totalFiltrado}</Typography>
                <Typography variant="body2" color="text.secondary">Total en riesgo</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'error.light', bgcolor: 'error.50' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="error.main">{criticosFiltrado}</Typography>
                <Typography variant="body2" color="text.secondary">Críticos (&lt;70%)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'warning.light', bgcolor: '#fffbeb' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">{alertasFiltrado}</Typography>
                <Typography variant="body2" color="text.secondary">En alerta (umbral {queryParams.umbral}%)</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Diagnóstico e Interpretación */}
      {interpretacion && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            borderLeft: '4px solid',
            borderColor:
              interpretacion.severity === 'success' ? 'success.main'
              : interpretacion.severity === 'error' ? 'error.main'
              : 'warning.main',
            bgcolor:
              interpretacion.severity === 'success' ? '#f0fdf4'
              : interpretacion.severity === 'error' ? '#fff5f5'
              : '#fffbeb',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LightbulbIcon
              fontSize="small"
              sx={{
                color:
                  interpretacion.severity === 'success' ? 'success.main'
                  : interpretacion.severity === 'error' ? 'error.main'
                  : 'warning.main',
              }}
            />
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={
                interpretacion.severity === 'success' ? 'success.dark'
                : interpretacion.severity === 'error' ? 'error.dark'
                : 'warning.dark'
              }
            >
              {interpretacion.titulo}
            </Typography>
          </Box>
          {interpretacion.mensajes.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 0.75, color: 'text.primary', lineHeight: 1.6 }}>
              • {msg}
            </Typography>
          ))}
          {interpretacion.acciones.length > 0 && (
            <>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Acciones recomendadas
              </Typography>
              {interpretacion.acciones.map((acc, i) => (
                <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                  {i + 1}. {acc}
                </Typography>
              ))}
            </>
          )}
        </Paper>
      )}

      {/* Tabla */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error al cargar el informe. Verifique los filtros e intente nuevamente.
        </Alert>
      ) : estudiantesFiltrados.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          No hay estudiantes en riesgo con los filtros seleccionados.
        </Alert>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estudiante</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Curso</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Clases</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Ausencias</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Tardanzas</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">% Asistencia</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                  <Tooltip title="Ausencias disponibles antes de alcanzar el 70% crítico (negativo = ya lo superó)">
                    <span>Faltas al 70%</span>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Nivel</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Alerta enviada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estudiantesFiltrados.map((est) => {
                const faltas = faltasAlCritico(est);
                const faltasColor =
                  faltas > 3 ? 'warning.main'
                  : faltas > 0 ? 'error.light'
                  : 'error.main';
                const faltasLabel =
                  faltas > 0 ? `+${faltas}`
                  : faltas === 0 ? 'Límite'
                  : String(faltas);
                const faltasTooltip =
                  faltas > 0
                    ? `Puede faltar ${faltas} clase${faltas > 1 ? 's' : ''} más antes de alcanzar el nivel CRÍTICO`
                    : faltas === 0
                    ? 'Está exactamente en el límite crítico del 70%'
                    : `Ha superado el límite crítico en ${Math.abs(faltas)} ausencia${Math.abs(faltas) > 1 ? 's' : ''}`;
                return (
                  <TableRow key={est.estudianteId} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{est.nombre} {est.apellidos}</TableCell>
                    <TableCell>{est.curso.nombre} {est.curso.grado}-{est.curso.grupo}</TableCell>
                    <TableCell align="center">{est.clasesTotales}</TableCell>
                    <TableCell align="center">
                      <Typography color="error.main" fontWeight={600}>{est.ausencias}</Typography>
                    </TableCell>
                    <TableCell align="center">{est.tardanzas}</TableCell>
                    <TableCell align="center">
                      <Typography
                        fontWeight={700}
                        color={est.nivelRiesgo === 'CRITICO' ? 'error.main' : 'warning.main'}
                      >
                        {est.porcentajeAsistencia.toFixed(1)}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={faltasTooltip}>
                        <Typography variant="body2" fontWeight={700} color={faltasColor}>
                          {faltasLabel}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={est.nivelRiesgo === 'CRITICO' ? 'Asistencia crítica' : 'En alerta'}>
                        <Chip
                          icon={nivelIcon(est.nivelRiesgo)}
                          label={est.nivelRiesgo}
                          color={nivelColor(est.nivelRiesgo)}
                          size="small"
                          sx={{ fontWeight: 600, borderRadius: 10 }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      {(() => {
                        const alerta = alertaPorEstudiante.get(est.estudianteId);
                        if (!alerta) {
                          return (
                            <Chip
                              label="Sin alerta"
                              size="small"
                              sx={{ bgcolor: '#e0e0e0', color: '#757575', fontWeight: 500 }}
                            />
                          );
                        }
                        const config: Record<string, { label: string; bg: string }> = {
                          ALERTA:    { label: 'ALERTA',    bg: '#F59E0B' },
                          CRITICO:   { label: 'CRÍTICO',   bg: '#EF4444' },
                          INMINENTE: { label: 'INMINENTE', bg: '#7F1D1D' },
                        };
                        const { label, bg } = config[alerta.nivel];
                        const fecha = new Date(alerta.fechaEnvio).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short',
                        });
                        return (
                          <Tooltip title={`Enviada el ${fecha}`} arrow>
                            <Chip
                              label={label}
                              size="small"
                              sx={{ bgcolor: bg, color: '#fff', fontWeight: 700, cursor: 'default' }}
                            />
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InformeRiesgo;
