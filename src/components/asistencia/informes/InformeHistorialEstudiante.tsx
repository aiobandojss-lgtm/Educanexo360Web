// src/components/asistencia/informes/InformeHistorialEstudiante.tsx
import React, { useState } from 'react';
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
import { Refresh as RefreshIcon, Search as SearchIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';
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
import { useInformeHistorial, useEstudiantes, useEscuela } from '../../../hooks/useAppQueries';
import type { ParamsHistorial } from '../../../services/asistenciaInformesService';
import { generarPdfHistorial } from '../../../utils/pdfGenerators/pdfHistorial';

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

  const { data: usuariosData } = useEstudiantes();
  const estudiantes: any[] = Array.isArray(usuariosData) ? usuariosData : [];

  const { data, isLoading, isError } = useInformeHistorial(
    queryEstId,
    queryParams,
    !!queryEstId
  );

  const [generandoPdf, setGenerandoPdf] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
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
              renderInput={(inputParams) => (
                <TextField
                  {...inputParams}
                  label="Buscar estudiante"
                  placeholder="Nombre o apellido..."
                  InputProps={{
                    ...inputParams.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon fontSize="small" sx={{ color: 'text.disabled', mr: 0.5 }} />
                        {inputParams.InputProps.startAdornment}
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
                          <TableCell>{format(new Date(reg.fecha), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{reg.diaSemana}</TableCell>
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
