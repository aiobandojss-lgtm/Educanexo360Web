// src/components/asistencia/informes/InformeTendencia.tsx
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
} from '@mui/material';
import { Refresh as RefreshIcon, LightbulbOutlined as LightbulbIcon } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useInformeTendencia } from '../../../hooks/useAppQueries';
import { useCursos } from '../../../hooks/useAppQueries';
import type { ParamsTendencia } from '../../../services/asistenciaInformesService';

const InformeTendencia: React.FC = () => {
  const [params, setParams] = useState<ParamsTendencia>({
    desde: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    hasta: format(new Date(), 'yyyy-MM-dd'),
    agrupacion: 'semana',
    cursoId: '',
  });
  const [queryParams, setQueryParams] = useState<ParamsTendencia>(params);

  const { data: cursosData } = useCursos();
  const cursos: any[] = (cursosData as any)?.data || (Array.isArray(cursosData) ? cursosData : []);

  const { data, isLoading, isError } = useInformeTendencia(
    {
      ...queryParams,
      cursoId: queryParams.cursoId || undefined,
    },
    true
  );

  const handleBuscar = () => {
    setQueryParams({ ...params });
  };

  const interpretacion = useMemo(() => {
    if (!data?.tendencia || data.tendencia.length < 2) return null;

    const puntos = data.tendencia;
    const primero = puntos[0];
    const ultimo  = puntos[puntos.length - 1];
    const delta   = ultimo.porcentajeAsistencia - primero.porcentajeAsistencia;

    const mejor = puntos.reduce((a, b) => a.porcentajeAsistencia > b.porcentajeAsistencia ? a : b);
    const peor  = puntos.reduce((a, b) => a.porcentajeAsistencia < b.porcentajeAsistencia ? a : b);
    const rango = mejor.porcentajeAsistencia - peor.porcentajeAsistencia;

    const ultimos3 = puntos.slice(-3);
    const declinaConsecutivo = ultimos3.length >= 2 && ultimos3.every(
      (p, i) => i === 0 || p.porcentajeAsistencia < ultimos3[i - 1].porcentajeAsistencia
    );
    const mejoraConsecutiva = ultimos3.length >= 2 && ultimos3.every(
      (p, i) => i === 0 || p.porcentajeAsistencia > ultimos3[i - 1].porcentajeAsistencia
    );

    const mensajes: string[] = [];
    const acciones: string[] = [];

    if (delta > 2) {
      mensajes.push(
        `La asistencia muestra una tendencia positiva: mejoró ${delta.toFixed(1)} puntos porcentuales entre el primer y el último período analizado (de ${primero.porcentajeAsistencia.toFixed(1)}% a ${ultimo.porcentajeAsistencia.toFixed(1)}%).`
      );
    } else if (delta < -2) {
      mensajes.push(
        `La asistencia muestra una tendencia negativa: cayó ${Math.abs(delta).toFixed(1)} puntos porcentuales entre el primer y el último período analizado (de ${primero.porcentajeAsistencia.toFixed(1)}% a ${ultimo.porcentajeAsistencia.toFixed(1)}%).`
      );
    } else {
      mensajes.push(
        `La asistencia se mantuvo estable durante el período analizado: ${primero.porcentajeAsistencia.toFixed(1)}% → ${ultimo.porcentajeAsistencia.toFixed(1)}% (variación de ${Math.abs(delta).toFixed(1)} puntos porcentuales).`
      );
    }

    mensajes.push(
      `Mejor período: ${mejor.periodo} con ${mejor.porcentajeAsistencia.toFixed(1)}%. Peor período: ${peor.periodo} con ${peor.porcentajeAsistencia.toFixed(1)}% (brecha de ${rango.toFixed(1)} puntos).`
    );

    if (declinaConsecutivo) {
      mensajes.push(
        `Alerta: los últimos ${ultimos3.length} períodos muestran un descenso consecutivo en la asistencia. Esta tendencia sostenida requiere atención inmediata.`
      );
      acciones.push('Investigar las causas del descenso sostenido: ¿coincide con cambios en el calendario, períodos de evaluaciones u otros factores externos?');
    } else if (mejoraConsecutiva) {
      mensajes.push(
        `Tendencia reciente positiva: los últimos ${ultimos3.length} períodos muestran mejora consecutiva en la asistencia.`
      );
    }

    if (ultimo.porcentajeAsistencia < 70) {
      acciones.push('El último período registra asistencia por debajo del 70% — revisar el informe de Riesgo para identificar estudiantes en situación crítica.');
      acciones.push('Considerar convocar comité de seguimiento académico urgente.');
    } else if (ultimo.porcentajeAsistencia < 80) {
      acciones.push('El último período está por debajo del umbral recomendado del 80%. Reforzar el seguimiento de los estudiantes con mayor ausentismo.');
    } else if (!mejoraConsecutiva) {
      acciones.push('Mantener las estrategias actuales de seguimiento de asistencia.');
    }

    if (rango > 15) {
      acciones.push(`Alta variabilidad entre períodos (brecha de ${rango.toFixed(1)} puntos). Identificar los factores que generan los picos de ausentismo.`);
    }

    if (mejoraConsecutiva && ultimo.porcentajeAsistencia >= 85) {
      acciones.push('Comunicar el logro al equipo docente y a los acudientes como refuerzo positivo de la comunidad educativa.');
    }

    let severity: 'success' | 'warning' | 'error';
    if (ultimo.porcentajeAsistencia < 70 || (delta < -5 && declinaConsecutivo)) {
      severity = 'error';
    } else if (ultimo.porcentajeAsistencia < 80 || delta < -2 || declinaConsecutivo) {
      severity = 'warning';
    } else {
      severity = 'success';
    }

    const titulo =
      severity === 'error'
        ? declinaConsecutivo
          ? 'Tendencia crítica — asistencia en descenso sostenido'
          : mejoraConsecutiva
          ? 'Situación crítica — asistencia mejorando pero en nivel de riesgo'
          : delta < -2
          ? 'Tendencia crítica — asistencia en descenso'
          : 'Situación crítica — asistencia en nivel de riesgo'
        : severity === 'warning'
        ? 'Tendencia moderada — requiere seguimiento activo'
        : delta > 2
        ? 'Tendencia positiva — la asistencia está mejorando'
        : 'Asistencia estable durante el período analizado';

    return { severity, titulo, mensajes, acciones };
  }, [data]);

  // Preparar datos para el gráfico
  const chartData = data?.tendencia?.map((p) => ({
    periodo: p.periodo,
    'Asistencia (%)': Number(p.porcentajeAsistencia.toFixed(1)),
    Ausentes: p.ausentes,
    Tardanzas: p.tardanzas,
  })) ?? [];

  return (
    <Box>
      {/* Filtros */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Grid container spacing={2} alignItems="flex-end">
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
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Agrupación"
              select
              size="small"
              fullWidth
              value={params.agrupacion}
              onChange={(e) => setParams(p => ({ ...p, agrupacion: e.target.value as 'semana' | 'mes' }))}
            >
              <MenuItem value="semana">Por semana</MenuItem>
              <MenuItem value="mes">Por mes</MenuItem>
            </TextField>
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

      {/* Gráfico */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          Error al cargar la tendencia. Verifique los filtros e intente nuevamente.
        </Alert>
      ) : chartData.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No hay datos para el rango seleccionado.
        </Alert>
      ) : (
        <>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', mb: 3 }}>
            <Typography variant="h3" sx={{ mb: 3 }}>
              Tendencia de asistencia — {data?.puntos} {data?.puntos === 1 ? 'punto' : 'puntos'} ({data?.agrupacion})
            </Typography>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="periodo"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  yAxisId="pct"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  yAxisId="abs"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: any, name: string) =>
                    name === 'Asistencia (%)' ? [`${value}%`, name] : [value, name]
                  }
                />
                <Legend />
                <Line
                  yAxisId="pct"
                  type="monotone"
                  dataKey="Asistencia (%)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="abs"
                  type="monotone"
                  dataKey="Ausentes"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  strokeDasharray="5 3"
                />
                <Line
                  yAxisId="abs"
                  type="monotone"
                  dataKey="Tardanzas"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  strokeDasharray="5 3"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          {/* Datos insuficientes para calcular tendencia */}
          {!interpretacion && chartData.length < 2 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Se necesitan al menos 2 períodos para calcular la tendencia. Amplíe el rango de fechas o cambie la agrupación.
            </Alert>
          )}

          {/* Diagnóstico e Interpretación */}
          {interpretacion && (
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
          )}
        </>
      )}
    </Box>
  );
};

export default InformeTendencia;
