// src/components/asistencia/informes/InformeHistorialEstudiante.tsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Autocomplete,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  PictureAsPdf as PdfIcon,
  LightbulbOutlined as LightbulbIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useQueries } from '@tanstack/react-query';
import { useInformeHistorial, useEstudiantes, useEscuela } from '../../../hooks/useAppQueries';
import cursoService from '../../../services/cursoService';
import type { ParamsHistorial } from '../../../services/asistenciaInformesService';
import { generarPdfHistorial } from '../../../utils/pdfGenerators/pdfHistorial';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Evita conversión UTC→local: extrae YYYY-MM-DD y crea fecha en hora local
const parseFechaLocal = (fechaStr: string): Date => {
  const [y, m, d] = fechaStr.substring(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO' | 'PERMISO';

const ESTADO_CONFIG: Record<EstadoAsistencia, { label: string; color: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  PRESENTE: { label: 'Presente', color: 'success' },
  AUSENTE: { label: 'Ausente', color: 'error' },
  TARDANZA: { label: 'Tardanza', color: 'warning' },
  JUSTIFICADO: { label: 'Justificado', color: 'info' },
  PERMISO: { label: 'Permiso', color: 'default' },
};

const PIE_COLORS = ['#059669', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

const InformeHistorialEstudiante: React.FC = () => {
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);
  const [params, setParams] = useState<ParamsHistorial>({
    desde: format(subMonths(new Date(), 2), 'yyyy-MM-dd'),
    hasta: format(new Date(), 'yyyy-MM-dd'),
  });
  const [queryParams, setQueryParams] = useState<ParamsHistorial>(params);
  const [queryEstId, setQueryEstId] = useState<string>('');

  const { user } = useSelector((state: RootState) => state.auth);

  // Para DOCENTE: cursoIds únicos de sus asignaturas asignadas
  const cursosDocente = useMemo(() =>
    user?.tipo === 'DOCENTE'
      ? [...new Set((user.info_academica?.asignaturas_asignadas ?? []).map((a) => a.cursoId))]
      : [],
  [user]);

  // Para otros roles: lista completa de estudiantes del colegio
  const { data: estudiantesData, isLoading: isLoadingTodos, isError: isErrorTodos } = useEstudiantes();

  // Para DOCENTE: estudiantes de cada uno de sus cursos (múltiples queries en paralelo)
  const cursosQueries = useQueries({
    queries: cursosDocente.map((cursoId) => ({
      queryKey: ['curso-estudiantes-historial', cursoId],
      queryFn: () => cursoService.obtenerEstudiantesCurso(cursoId),
      enabled: user?.tipo === 'DOCENTE',
    })),
  });

  const isLoadingEstudiantes = user?.tipo === 'DOCENTE'
    ? cursosQueries.some((q) => q.isLoading)
    : isLoadingTodos;
  const isErrorEstudiantes = user?.tipo === 'DOCENTE'
    ? cursosQueries.some((q) => q.isError)
    : isErrorTodos;

  const estudiantes: any[] = useMemo(() => {
    if (user?.tipo === 'DOCENTE') {
      const map = new Map<string, any>();
      cursosQueries.forEach((q) => {
        const lista: any[] = Array.isArray(q.data)
          ? q.data
          : Array.isArray((q.data as any)?.data)
          ? (q.data as any).data
          : [];
        lista.forEach((e) => map.set(e._id, e));
      });
      return [...map.values()];
    }
    return Array.isArray(estudiantesData) ? estudiantesData : [];
  }, [cursosQueries, estudiantesData, user]);

  const { data, isLoading, isError } = useInformeHistorial(
    queryEstId,
    queryParams,
    !!queryEstId
  );

  const [generandoPdf, setGenerandoPdf] = useState(false);
  const { data: escuela } = useEscuela();

  const handleDescargarPdf = () => {
    if (!data) return;
    setGenerandoPdf(true);
    try {
      generarPdfHistorial(
        data,
        escuela ?? null,
        `${user?.nombre ?? ''} ${user?.apellidos ?? ''}`.trim(),
        queryParams
      );
    } finally {
      setGenerandoPdf(false);
    }
  };

  const handleBuscar = () => {
    if (!estudianteSeleccionado) return;
    setQueryEstId(estudianteSeleccionado._id);
    setQueryParams({ ...params });
  };

  const interpretacion = useMemo(() => {
    if (!data) return null;

    const { resumen, registros, estudiante } = data;
    const { clasesTotales, ausentes, tardanzas, justificados, permisos, porcentajeAsistencia } = resumen;
    const nombre = `${estudiante.nombre} ${estudiante.apellidos}`;

    // Ausencias adicionales antes de cruzar el 70% crítico
    // (negativo = ya lo superó)
    const faltasAlCritico = Math.floor((porcentajeAsistencia - 70) * clasesTotales / 100);

    const mensajes: string[] = [];
    const acciones: string[] = [];

    // Nivel general de asistencia
    if (porcentajeAsistencia >= 90) {
      mensajes.push(
        `${nombre} mantiene una asistencia excelente del ${porcentajeAsistencia.toFixed(1)}% — no presenta riesgo académico por inasistencia en el período consultado.`
      );
    } else if (porcentajeAsistencia >= 80) {
      mensajes.push(
        `${nombre} tiene asistencia del ${porcentajeAsistencia.toFixed(1)}%, dentro del umbral aceptable. ${faltasAlCritico > 0 ? `Puede acumular ${faltasAlCritico} ausencias más antes de alcanzar el nivel crítico del 70%.` : 'Está muy cerca del límite crítico — requiere atención.'}`
      );
    } else if (porcentajeAsistencia >= 70) {
      mensajes.push(
        `${nombre} está en zona de alerta con ${porcentajeAsistencia.toFixed(1)}% — por debajo del umbral recomendado del 80%. ${faltasAlCritico > 0 ? `Le quedan solo ${faltasAlCritico} ausencia${faltasAlCritico > 1 ? 's' : ''} antes de alcanzar el nivel crítico del 70%, que implica riesgo de reprobación.` : 'Ha alcanzado el límite crítico del 70%.'}`
      );
      acciones.push('Notificar al acudiente sobre la situación actual de asistencia del estudiante.');
      acciones.push('Establecer seguimiento semanal de asistencia con el director de grupo.');
    } else {
      mensajes.push(
        `${nombre} está en nivel CRÍTICO con ${porcentajeAsistencia.toFixed(1)}% de asistencia — por debajo del 70%, umbral de riesgo de reprobación por inasistencia en la mayoría de instituciones educativas colombianas. Ha superado el límite en ${Math.abs(faltasAlCritico)} ausencia${Math.abs(faltasAlCritico) > 1 ? 's' : ''}.`
      );
      acciones.push('Convocar de inmediato al acudiente a comité de seguimiento académico.');
      acciones.push('Registrar el caso en el observador del estudiante con el detalle de las ausencias.');
      acciones.push('Verificar si existen justificaciones médicas o familiares que ameriten un proceso especial según el Manual de Convivencia.');
    }

    // Proporción de ausencias justificadas
    const totalAusencias = ausentes + justificados + permisos;
    if (totalAusencias > 0 && justificados > 0) {
      const pctJustificado = Math.round((justificados / totalAusencias) * 100);
      if (pctJustificado >= 50) {
        mensajes.push(
          `El ${pctJustificado}% de las inasistencias tienen justificación formal (${justificados} justificadas vs. ${ausentes} sin justificar). Esto reduce la gravedad del ausentismo registrado.`
        );
      } else if (ausentes > 2) {
        mensajes.push(
          `De las ${totalAusencias} inasistencias, solo ${justificados} están justificadas. Hay ${ausentes} ausencias sin justificación que afectan directamente el porcentaje de asistencia.`
        );
        acciones.push('Solicitar al acudiente documentación de soporte para las ausencias sin justificar, de existir causa válida.');
      }
    }

    // Tardanzas recurrentes
    if (clasesTotales > 0) {
      const pctTardanza = (tardanzas / clasesTotales) * 100;
      if (pctTardanza > 10) {
        mensajes.push(
          `El estudiante acumula ${tardanzas} tardanzas (${pctTardanza.toFixed(1)}% de las clases), lo cual puede indicar dificultades recurrentes para cumplir el horario de entrada.`
        );
        acciones.push('Conversar con el acudiente sobre las causas de las tardanzas: transporte, horario de trabajo familiar u otros factores.');
      }
    }

    // Análisis de rachas y tendencia reciente (requiere registros)
    if (registros.length >= 5) {
      // Racha de ausencias consecutivas
      let maxRacha = 0;
      let rachaActual = 0;
      registros.forEach((r) => {
        if (r.estado === 'AUSENTE') {
          rachaActual++;
          maxRacha = Math.max(maxRacha, rachaActual);
        } else {
          rachaActual = 0;
        }
      });
      if (maxRacha >= 3) {
        mensajes.push(
          `Se detectó una racha de ${maxRacha} ausencias consecutivas en el período. Este patrón puede indicar una situación de salud, familiar o social prolongada que merece atención especial.`
        );
        acciones.push('Investigar si la racha de ausencias consecutivas corresponde a una causa médica o social que requiera apoyo institucional.');
      }

      // Tendencia: primera mitad vs. segunda mitad del período
      const mitad = Math.floor(registros.length / 2);
      const ausentesPrimera = registros.slice(0, mitad).filter((r) => r.estado === 'AUSENTE').length;
      const ausentesSegunda = registros.slice(mitad).filter((r) => r.estado === 'AUSENTE').length;

      if (ausentesSegunda > ausentesPrimera + 1 && ausentesSegunda >= 3) {
        mensajes.push(
          `Tendencia preocupante: en la segunda mitad del período el estudiante tuvo ${ausentesSegunda} ausencias, frente a ${ausentesPrimera} en la primera — el ausentismo está empeorando progresivamente.`
        );
        acciones.push('El incremento de ausencias en la etapa más reciente requiere contacto urgente con el acudiente para identificar los factores actuales.');
      } else if (ausentesPrimera > ausentesSegunda + 1 && ausentesPrimera >= 3) {
        mensajes.push(
          `Tendencia positiva: el estudiante tuvo ${ausentesPrimera} ausencias en la primera mitad del período pero solo ${ausentesSegunda} en la segunda — la situación de asistencia está mejorando.`
        );
      }
    }

    let severity: 'success' | 'warning' | 'error';
    if (porcentajeAsistencia < 70) {
      severity = 'error';
    } else if (porcentajeAsistencia < 80) {
      severity = 'warning';
    } else {
      severity = 'success';
    }

    const titulo =
      severity === 'error'
        ? `${nombre} — nivel CRÍTICO: riesgo de reprobación por inasistencia`
        : severity === 'warning'
        ? `${nombre} — zona de alerta: seguimiento activo requerido`
        : porcentajeAsistencia >= 90
        ? `${nombre} — asistencia excelente`
        : `${nombre} — asistencia en nivel aceptable`;

    return { severity, titulo, mensajes, acciones };
  }, [data]);

  const pieData = data
    ? [
        { name: 'Presentes', value: data.resumen.presentes },
        { name: 'Ausentes', value: data.resumen.ausentes },
        { name: 'Tardanzas', value: data.resumen.tardanzas },
        { name: 'Justificados', value: data.resumen.justificados },
        { name: 'Permisos', value: data.resumen.permisos },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <Box>
      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
              options={estudiantes}
              getOptionLabel={(opt: any) => `${opt.nombre} ${opt.apellidos}`}
              value={estudianteSeleccionado}
              onChange={(_, val) => setEstudianteSeleccionado(val)}
              size="small"
              loading={isLoadingEstudiantes}
              noOptionsText={
                isErrorEstudiantes
                  ? 'Sin acceso a la lista de estudiantes'
                  : isLoadingEstudiantes
                  ? 'Cargando...'
                  : 'Sin estudiantes'
              }
              renderInput={(inputParams) => (
                <TextField
                  {...inputParams}
                  label="Buscar estudiante"
                  placeholder="Nombre o apellido..."
                  error={isErrorEstudiantes}
                  helperText={isErrorEstudiantes ? 'No se pudo cargar la lista. Verifique permisos.' : undefined}
                  InputProps={{
                    ...inputParams.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />
                        {inputParams.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {isLoadingEstudiantes ? <CircularProgress color="inherit" size={16} /> : null}
                        {inputParams.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuscar}
              startIcon={<RefreshIcon />}
              sx={{ borderRadius: 20 }}
              disabled={!estudianteSeleccionado}
            >
              Consultar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {!queryEstId && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Seleccione un estudiante y el rango de fechas para ver su historial de asistencia.
        </Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error al cargar el historial. Intente nuevamente.
        </Alert>
      )}

      {data && (
        <>
          {/* Botón PDF */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={generandoPdf ? <CircularProgress size={16} color="inherit" /> : <PdfIcon />}
              onClick={handleDescargarPdf}
              disabled={generandoPdf}
              sx={{ borderRadius: 20, textTransform: 'none' }}
            >
              {generandoPdf ? 'Generando...' : 'Descargar PDF'}
            </Button>
          </Box>
          {/* Encabezado del estudiante */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h3" color="white">
              {data.estudiante.nombre} {data.estudiante.apellidos}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              {data.estudiante.email}
            </Typography>
          </Paper>

          {/* Resumen estadístico */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Clases totales', value: data.resumen.clasesTotales, color: 'text.primary' },
              { label: 'Presentes', value: data.resumen.presentes, color: 'success.main' },
              { label: 'Ausentes', value: data.resumen.ausentes, color: 'error.main' },
              { label: 'Tardanzas', value: data.resumen.tardanzas, color: 'warning.main' },
              { label: '% Asistencia', value: `${data.resumen.porcentajeAsistencia.toFixed(1)}%`, color: 'primary.main' },
            ].map((stat) => (
              <Grid item xs={6} sm={4} md key={stat.label}>
                <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                  <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="h3" color={stat.color}>{stat.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

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

          {/* Gráfico de torta + tabla */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <Typography variant="h3" sx={{ mb: 2 }}>Distribución</Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: string) => [value, name]} />
                    <Legend iconType="circle" iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} md={8}>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', maxHeight: 380, overflow: 'auto' }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>Día</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>Asignatura</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }} align="center">Estado</TableCell>
                      <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>Observaciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.registros.map((reg, idx) => {
                      const conf = ESTADO_CONFIG[reg.estado] ?? { label: reg.estado, color: 'default' as const };
                      return (
                        <TableRow key={idx} hover>
                          <TableCell>{format(parseFechaLocal(reg.fecha), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{DIAS_SEMANA[parseFechaLocal(reg.fecha).getDay()]}</TableCell>
                          <TableCell>{reg.asignatura?.nombre ?? '—'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={conf.label}
                              color={conf.color}
                              size="small"
                              sx={{ borderRadius: 10, fontWeight: 600, fontSize: '0.7rem' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {reg.justificacion || reg.observaciones || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default InformeHistorialEstudiante;
