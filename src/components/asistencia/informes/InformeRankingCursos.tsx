// src/components/asistencia/informes/InformeRankingCursos.tsx
import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
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
  CircularProgress,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  EmojiEvents as TrophyIcon,
  LightbulbOutlined as LightbulbIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { useInformeRankingCursos } from '../../../hooks/useAppQueries';
import type { ParamsRanking } from '../../../services/asistenciaInformesService';

const COLORES_RANKING = ['#f59e0b', '#94a3b8', '#b45309', '#059669', '#0d9488', '#3b82f6'];

const InformeRankingCursos: React.FC = () => {
  const [params, setParams] = useState<ParamsRanking>({
    desde: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    hasta: format(new Date(), 'yyyy-MM-dd'),
  });
  const [queryParams, setQueryParams] = useState<ParamsRanking>(params);

  const { user } = useSelector((state: RootState) => state.auth);
  const { data, isLoading, isError } = useInformeRankingCursos(queryParams, true);

  const handleBuscar = () => {
    setQueryParams({ ...params });
  };

  const rankingFiltrado = useMemo(() => {
    if (!data?.ranking) return [];
    if (user?.tipo !== 'DOCENTE') return data.ranking;
    const cursosDocente = new Set(
      (user.info_academica?.asignaturas_asignadas ?? []).map((a) => a.cursoId)
    );
    if (cursosDocente.size === 0) return data.ranking;
    return data.ranking
      .filter((r) => cursosDocente.has(r.cursoId))
      .map((r, i) => ({ ...r, posicion: i + 1 }));
  }, [data, user]);

  const interpretacion = useMemo(() => {
    if (!rankingFiltrado || rankingFiltrado.length === 0) return null;

    const lider  = rankingFiltrado[0];
    const ultimo = rankingFiltrado[rankingFiltrado.length - 1];
    const promedio = rankingFiltrado.reduce((s, r) => s + r.porcentajeAsistencia, 0) / rankingFiltrado.length;
    const brecha   = lider.porcentajeAsistencia - ultimo.porcentajeAsistencia;

    const bajoDe70 = rankingFiltrado.filter((r) => r.porcentajeAsistencia < 70);
    const bajoDe80 = rankingFiltrado.filter((r) => r.porcentajeAsistencia < 80);
    const sobre90  = rankingFiltrado.filter((r) => r.porcentajeAsistencia >= 90);

    const mensajes: string[] = [];
    const acciones: string[] = [];

    mensajes.push(
      `El promedio institucional de asistencia es del ${promedio.toFixed(1)}%. ${lider.nombre} ${lider.grado}-${lider.grupo} lidera con ${lider.porcentajeAsistencia.toFixed(1)}% y ${ultimo.nombre} ${ultimo.grado}-${ultimo.grupo} ocupa el último lugar con ${ultimo.porcentajeAsistencia.toFixed(1)}%.`
    );

    if (brecha > 20) {
      mensajes.push(
        `Existe una brecha significativa de ${brecha.toFixed(1)} puntos entre el mejor y el peor curso. Esta desigualdad sugiere que hay factores específicos de algunos grupos — docente a cargo, dinámica del grupo, horario — que están incidiendo de forma diferencial en el ausentismo.`
      );
      acciones.push(`Analizar qué hace diferente a ${lider.nombre} ${lider.grado}-${lider.grupo}: prácticas del docente, actividades, clima de aula. Replicar esas prácticas en los cursos con menor asistencia.`);
    } else if (brecha <= 5 && rankingFiltrado.length > 1) {
      mensajes.push(
        `Los cursos presentan niveles de asistencia muy similares (brecha de solo ${brecha.toFixed(1)} puntos), lo cual indica un comportamiento institucional homogéneo.`
      );
    }

    if (bajoDe70.length > 0) {
      const nombresC = bajoDe70.map((r) => `${r.nombre} ${r.grado}-${r.grupo} (${r.porcentajeAsistencia.toFixed(1)}%)`).join(', ');
      mensajes.push(
        `${bajoDe70.length} curso${bajoDe70.length > 1 ? 's tienen' : ' tiene'} asistencia por debajo del umbral crítico del 70%: ${nombresC}.`
      );
      acciones.push('Revisar el informe de Riesgo filtrado por estos cursos para identificar estudiantes críticos de forma individual.');
      acciones.push('Convocar al docente director de los cursos en nivel crítico a reunión urgente de seguimiento.');
    } else if (bajoDe80.length > 0) {
      const nombresA = bajoDe80.map((r) => `${r.nombre} ${r.grado}-${r.grupo} (${r.porcentajeAsistencia.toFixed(1)}%)`).join(', ');
      mensajes.push(
        `${bajoDe80.length} curso${bajoDe80.length > 1 ? 's están' : ' está'} por debajo del umbral recomendado del 80%: ${nombresA}.`
      );
      acciones.push('Fortalecer el seguimiento de asistencia en estos cursos. Notificar a los directores de grupo para implementar plan de mejora.');
    }

    if (sobre90.length === rankingFiltrado.length) {
      mensajes.push(`Todos los cursos mantienen asistencia superior al 90% — desempeño institucional sobresaliente en asistencia.`);
      acciones.push('Reconocer el desempeño en comunicaciones a la comunidad educativa como refuerzo positivo.');
    } else if (sobre90.length > 0) {
      mensajes.push(
        `${sobre90.length} curso${sobre90.length > 1 ? 's se destacan' : ' se destaca'} con asistencia superior al 90%, siendo referente${sobre90.length > 1 ? 's' : ''} institucional${sobre90.length > 1 ? 'es' : ''}.`
      );
    }

    if (ultimo.porcentajeAsistencia < 75 && rankingFiltrado.length > 1) {
      acciones.push(`${ultimo.nombre} ${ultimo.grado}-${ultimo.grupo} requiere atención prioritaria con ${ultimo.porcentajeAsistencia.toFixed(1)}% de asistencia — iniciar plan de mejora de forma inmediata.`);
    }

    let severity: 'success' | 'warning' | 'error';
    if (bajoDe70.length > 0 || promedio < 75) {
      severity = 'error';
    } else if (bajoDe80.length > 0 || promedio < 85) {
      severity = 'warning';
    } else {
      severity = 'success';
    }

    const titulo =
      severity === 'error'
        ? 'Ranking institucional con cursos en nivel crítico — intervención requerida'
        : severity === 'warning'
        ? 'Ranking institucional — algunos cursos requieren seguimiento activo'
        : 'Ranking institucional favorable — buen desempeño general en asistencia';

    return { severity, titulo, mensajes, acciones };
  }, [rankingFiltrado]);

  const barColor = (index: number) => COLORES_RANKING[index] ?? '#059669';

  const chartData = rankingFiltrado.map((r) => ({
    name: `${r.grado}-${r.grupo}`,
    'Asistencia (%)': Number(r.porcentajeAsistencia.toFixed(1)),
  }));

  return (
    <Box>
      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
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
          <Grid item xs={12} sm={4}>
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

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error al cargar el ranking. Intente nuevamente.
        </Alert>
      ) : !rankingFiltrado.length ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No hay datos para el rango seleccionado.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Gráfico de barras */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Typography variant="h3" sx={{ mb: 3 }}>Comparativa por curso</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <RechartsTooltip formatter={(v: any) => [`${v}%`, 'Asistencia']} />
                  <Bar dataKey="Asistencia (%)" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={barColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Tabla de ranking */}
          <Grid item xs={12} md={6}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">#</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Curso</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Estudiantes</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="right">% Asistencia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingFiltrado.map((fila) => (
                    <TableRow key={fila.cursoId} hover>
                      <TableCell align="center">
                        {fila.posicion <= 3 ? (
                          <Tooltip title={`Posición ${fila.posicion}`}>
                            <TrophyIcon
                              fontSize="small"
                              sx={{ color: COLORES_RANKING[fila.posicion - 1] }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">{fila.posicion}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{fila.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fila.grado} - {fila.grupo}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{fila.totalEstudiantes}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                          <Box sx={{ width: 60 }}>
                            <LinearProgress
                              variant="determinate"
                              value={fila.porcentajeAsistencia}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'grey.100',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: fila.porcentajeAsistencia >= 90
                                    ? 'success.main'
                                    : fila.porcentajeAsistencia >= 75
                                    ? 'warning.main'
                                    : 'error.main',
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color={
                              fila.porcentajeAsistencia >= 90
                                ? 'success.main'
                                : fila.porcentajeAsistencia >= 75
                                ? 'warning.main'
                                : 'error.main'
                            }
                          >
                            {fila.porcentajeAsistencia.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Diagnóstico e Interpretación */}
          {interpretacion && (
            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
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
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default InformeRankingCursos;
