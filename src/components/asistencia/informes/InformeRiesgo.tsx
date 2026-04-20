// src/components/asistencia/informes/InformeRiesgo.tsx
import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { format, subMonths } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useInformeRiesgo, useCursos, useEscuela } from '../../../hooks/useAppQueries';
import type { ParamsRiesgo } from '../../../services/asistenciaInformesService';
import { generarPdfRiesgo } from '../../../utils/pdfGenerators/pdfRiesgo';

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

  const { data, isLoading, isError, refetch } = useInformeRiesgo(
    {
      ...queryParams,
      cursoId: queryParams.cursoId || undefined,
    },
    true
  );

  const [generandoPdf, setGenerandoPdf] = useState(false);
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: escuela } = useEscuela();

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
        nombreCurso
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

      {/* Botón PDF — visible cuando hay estudiantes en riesgo */}
      {(data?.estudiantes?.length ?? 0) > 0 && (
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
                <Typography variant="h3" color="text.primary">{data.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total en riesgo</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'error.light', bgcolor: 'error.50' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="error.main">{data.criticos}</Typography>
                <Typography variant="body2" color="text.secondary">Críticos (&lt;{data.umbral - 10}%)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid', borderColor: 'warning.light', bgcolor: '#fffbeb' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="warning.main">{data.alertas}</Typography>
                <Typography variant="body2" color="text.secondary">En alerta (umbral {data.umbral}%)</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
      ) : data?.estudiantes?.length === 0 ? (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          No hay estudiantes en riesgo con los filtros seleccionados.
        </Alert>
      ) : data?.estudiantes ? (
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
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Nivel</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.estudiantes.map((est) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </Box>
  );
};

export default InformeRiesgo;
