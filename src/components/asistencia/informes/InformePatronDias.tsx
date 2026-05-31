// src/components/asistencia/informes/InformePatronDias.tsx
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
} from '@mui/material';
import { Refresh as RefreshIcon, LightbulbOutlined as LightbulbIcon } from '@mui/icons-material';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { useInformePatronDias } from '../../../hooks/useAppQueries';
import { useCursos } from '../../../hooks/useAppQueries';
import type { ParamsPatronDias } from '../../../services/asistenciaInformesService';

const InformePatronDias: React.FC = () => {
  const [params, setParams] = useState<ParamsPatronDias>({
    desde: format(subMonths(new Date(), 2), 'yyyy-MM-dd'),
    hasta: format(new Date(), 'yyyy-MM-dd'),
    cursoId: '',
  });
  const [queryParams, setQueryParams] = useState<ParamsPatronDias>(params);

  const { data: cursosData } = useCursos();
  const cursos: any[] = (cursosData as any)?.data || (Array.isArray(cursosData) ? cursosData : []);

  const { data, isLoading, isError } = useInformePatronDias(
    {
      ...queryParams,
      cursoId: queryParams.cursoId || undefined,
    },
    true
  );

  const handleBuscar = () => {
    setQueryParams({ ...params });
  };

  const chartData = data?.dias?.map((d) => ({
    dia: d.nombreDia,
    Ausentismo: Number(d.porcentajeAusentismo.toFixed(1)),
    Ausencias: d.ausencias,
    Tardanzas: d.tardanzas,
  })) ?? [];

  const radarData = data?.dias?.map((d) => ({
    dia: d.nombreDia.substring(0, 3),
    valor: Number(d.porcentajeAusentismo.toFixed(1)),
  })) ?? [];

  const maxAusentismo = Math.max(...(data?.dias?.map(d => d.porcentajeAusentismo) ?? [0]));

  const interpretacion = useMemo(() => {
    if (!data?.dias || data.dias.length === 0) return null;

    const dias = data.dias;
    const peorDia  = dias.reduce((a, b) => a.porcentajeAusentismo > b.porcentajeAusentismo ? a : b);
    const mejorDia = dias.reduce((a, b) => a.porcentajeAusentismo < b.porcentajeAusentismo ? a : b);
    const promedioAusentismo = dias.reduce((s, d) => s + d.porcentajeAusentismo, 0) / dias.length;
    const rango = peorDia.porcentajeAusentismo - mejorDia.porcentajeAusentismo;

    // Detección de patrón lunes/viernes vs. días intermedios (mar-jue)
    const lunes    = dias.find((d) => d.diaSemana === 1);
    const viernes  = dias.find((d) => d.diaSemana === 5);
    const diasMedio = dias.filter((d) => d.diaSemana >= 2 && d.diaSemana <= 4);
    const promedioMedio =
      diasMedio.length > 0
        ? diasMedio.reduce((s, d) => s + d.porcentajeAusentismo, 0) / diasMedio.length
        : promedioAusentismo;

    const hayPatronLunes   = !!lunes   && lunes.porcentajeAusentismo   > promedioMedio * 1.3;
    const hayPatronViernes = !!viernes && viernes.porcentajeAusentismo > promedioMedio * 1.3;

    const mensajes: string[] = [];
    const acciones: string[] = [];

    mensajes.push(
      `El día con mayor ausentismo es el ${peorDia.nombreDia} con ${peorDia.porcentajeAusentismo.toFixed(1)}% (${peorDia.ausencias} ${peorDia.ausencias === 1 ? 'ausencia registrada' : 'ausencias registradas'}). El día con menor ausentismo es el ${mejorDia.nombreDia} con ${mejorDia.porcentajeAusentismo.toFixed(1)}%.`
    );

    if (hayPatronLunes && hayPatronViernes) {
      mensajes.push(
        `Se detecta un patrón de inicio y fin de semana: el lunes (${lunes!.porcentajeAusentismo.toFixed(1)}%) y el viernes (${viernes!.porcentajeAusentismo.toFixed(1)}%) concentran significativamente más ausencias que los días intermedios (promedio ${promedioMedio.toFixed(1)}%).`
      );
      acciones.push('Investigar factores asociados al lunes y viernes: compromisos familiares, fatiga acumulada, desmotivación al inicio o cierre de semana.');
      acciones.push('Evaluar si las actividades de esos días son suficientemente motivadoras. Considerar reforzar el lunes con actividades dinámicas y el viernes con cierres de semana atractivos.');
    } else if (hayPatronLunes) {
      mensajes.push(
        `Se detecta un patrón de inicio de semana: el lunes (${lunes!.porcentajeAusentismo.toFixed(1)}%) concentra significativamente más ausencias que el promedio de días intermedios (${promedioMedio.toFixed(1)}%).`
      );
      acciones.push('Revisar factores que dificultan la asistencia los lunes: distancia, transporte desde el fin de semana u otras causas familiares.');
    } else if (hayPatronViernes) {
      mensajes.push(
        `Se detecta un patrón de cierre de semana: el viernes (${viernes!.porcentajeAusentismo.toFixed(1)}%) concentra significativamente más ausencias que el promedio de días intermedios (${promedioMedio.toFixed(1)}%).`
      );
      acciones.push('Investigar si el viernes concentra fatiga acumulada o compromisos familiares de fin de semana. Reforzar la motivación con actividades relevantes ese día.');
    }

    if (rango > 15) {
      acciones.push(
        `La brecha de ${rango.toFixed(1)} puntos entre el día más y menos problemático indica concentración clara. Intervenir específicamente en el ${peorDia.nombreDia} puede tener alto impacto con bajo esfuerzo.`
      );
    } else if (rango <= 5) {
      mensajes.push(
        `El ausentismo está distribuido de forma relativamente uniforme entre los días de la semana (brecha de solo ${rango.toFixed(1)} puntos). No hay un día aislado responsable — el problema tiene causas más generales.`
      );
    }

    if (promedioAusentismo > 20) {
      mensajes.push(
        `El ausentismo promedio del ${promedioAusentismo.toFixed(1)}% es alto en todos los días de la semana. Esto sugiere un problema sistémico que va más allá de patrones específicos por día.`
      );
      acciones.push('Convocar análisis institucional del ausentismo. Revisar factores estructurales: clima escolar, situaciones socioeconómicas, relevancia del contenido para las familias.');
    } else if (promedioAusentismo > 10) {
      mensajes.push(
        `El ausentismo promedio es moderado (${promedioAusentismo.toFixed(1)}%). Hay margen de mejora, especialmente en los días de mayor pico.`
      );
    } else {
      mensajes.push(
        `El nivel de ausentismo promedio es bajo (${promedioAusentismo.toFixed(1)}%), lo cual indica una asistencia saludable en todos los días de la semana.`
      );
      if (!hayPatronLunes && !hayPatronViernes) {
        acciones.push('Mantener las condiciones actuales y comunicar el buen desempeño de asistencia a la comunidad educativa como refuerzo positivo.');
      }
    }

    let severity: 'success' | 'warning' | 'error';
    if (peorDia.porcentajeAusentismo > 25 || promedioAusentismo > 20) {
      severity = 'error';
    } else if (peorDia.porcentajeAusentismo > 15 || promedioAusentismo > 10) {
      severity = 'warning';
    } else {
      severity = 'success';
    }

    const titulo =
      severity === 'error'
        ? `Alta concentración de ausentismo — el ${peorDia.nombreDia} es el día crítico`
        : severity === 'warning'
        ? `Patrón moderado — el ${peorDia.nombreDia} concentra el mayor ausentismo`
        : `Patrón de asistencia saludable — sin concentración crítica por día`;

    return { severity, titulo, mensajes, acciones };
  }, [data]);

  return (
    <Box>
      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Grid container spacing={2} alignItems="flex-end">
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

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error al cargar el patrón. Intente nuevamente.
        </Alert>
      ) : !data?.dias?.length ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No hay datos para el rango seleccionado.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Gráfico de barras */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Typography variant="h3" sx={{ mb: 3 }}>Ausentismo por día de la semana</Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="pct" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="abs" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: string) =>
                      name === 'Ausentismo' ? [`${value}%`, name] : [value, name]
                    }
                  />
                  <Legend />
                  <Bar yAxisId="pct" dataKey="Ausentismo" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.Ausentismo === maxAusentismo ? '#ef4444' : '#059669'}
                      />
                    ))}
                  </Bar>
                  <Bar yAxisId="abs" dataKey="Tardanzas" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Radar */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Typography variant="h3" sx={{ mb: 1 }}>Patrón semanal</Typography>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="dia" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10 }} />
                  <Radar
                    name="% Ausentismo"
                    dataKey="valor"
                    stroke="#ef4444"
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                  <Tooltip formatter={(v: any) => [`${v}%`, '% Ausentismo']} />
                </RadarChart>
              </ResponsiveContainer>
            </Paper>
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

          {/* Tabla detalle */}
          <Grid item xs={12}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }}>Día</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Clases</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Estudiantes</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Ausencias</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Tardanzas</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">% Ausentismo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.dias.map((d) => (
                    <TableRow
                      key={d.diaSemana}
                      hover
                      sx={{ bgcolor: d.porcentajeAusentismo === maxAusentismo ? 'rgba(239,68,68,0.05)' : 'inherit' }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{d.nombreDia}</TableCell>
                      <TableCell align="center">{d.totalClases}</TableCell>
                      <TableCell align="center">{d.totalEstudiantes}</TableCell>
                      <TableCell align="center">
                        <Typography
                          color={d.ausencias > 0 ? 'error.main' : 'text.primary'}
                          fontWeight={d.porcentajeAusentismo === maxAusentismo ? 700 : 400}
                        >
                          {d.ausencias}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{d.tardanzas}</TableCell>
                      <TableCell align="center">
                        <Typography
                          fontWeight={700}
                          color={
                            d.porcentajeAusentismo > 20
                              ? 'error.main'
                              : d.porcentajeAusentismo > 10
                              ? 'warning.main'
                              : 'success.main'
                          }
                        >
                          {d.porcentajeAusentismo.toFixed(1)}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default InformePatronDias;
