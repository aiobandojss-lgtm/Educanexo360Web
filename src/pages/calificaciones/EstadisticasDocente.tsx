// src/pages/calificaciones/EstadisticasDocente.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  School,
  MenuBook,
  Timeline,
  Group,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import estadisticasService, {
  EstadisticasDocente as IEstadisticasDocente,
  FiltrosEstadisticas,
} from '../../services/estadisticasService';
import axiosInstance from '../../api/axiosConfig';
import { RootState } from '../../redux/store';

// Colores para gráficos
const COLORS = ['#003F91', '#5DA9E9', '#4CAF50', '#FFC107', '#F44336'];

const EstadisticasDocente = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [estadisticas, setEstadisticas] = useState<IEstadisticasDocente | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosEstadisticas>({
    periodo: "0",
    año_academico: new Date().getFullYear().toString(),
    asignaturaId: '',
    cursoId: '',
  });
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);

  const añosAcademicos = Array.from(
    { length: 5 },
    (_, i) => (new Date().getFullYear() - 2 + i).toString()
  );

  const periodos = [
    { valor: "0", etiqueta: 'Todos los periodos' },
    { valor: "1", etiqueta: 'Periodo 1' },
    { valor: "2", etiqueta: 'Periodo 2' },
    { valor: "3", etiqueta: 'Periodo 3' },
    { valor: "4", etiqueta: 'Periodo 4' },
  ];

  useEffect(() => {
    cargarDatos();
    cargarAsignaturas();
    cargarCursos();
  }, []);

  useEffect(() => {
    cargarEstadisticas();
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);
      await cargarEstadisticas();
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los datos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await estadisticasService.obtenerEstadisticasDocente(filtros);
      
      if (response.success) {
        setEstadisticas(response.data);
      } else {
        throw new Error('Error al cargar estadísticas');
      }
    } catch (err: any) {
      console.error('Error al cargar estadísticas:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar las estadísticas');
    }
  };

  const cargarAsignaturas = async () => {
    try {
      const response = await axiosInstance.get('/asignaturas');
      if (response.data?.success) {
        setAsignaturas(response.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar asignaturas:', err);
    }
  };

  const cargarCursos = async () => {
    try {
      const response = await axiosInstance.get('/cursos');
      if (response.data?.success) {
        setCursos(response.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
    }
  };

  const handleFiltroChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    if (name) {
      setFiltros((prevFiltros) => ({
        ...prevFiltros,
        [name]: value,
      }));
    }
  };

  const getColorByPromedio = (promedio: number) => {
    if (promedio >= 4.5) return '#4CAF50'; // Verde
    if (promedio >= 4.0) return '#8BC34A'; // Verde claro
    if (promedio >= 3.5) return '#CDDC39'; // Lima
    if (promedio >= 3.0) return '#FFC107'; // Amarillo
    if (promedio >= 2.5) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const getPorcentajeColor = (porcentaje: number) => {
    if (porcentaje >= 80) return 'success';
    if (porcentaje >= 60) return 'primary';
    if (porcentaje >= 40) return 'warning';
    return 'error';
  };

  // Datos simulados para demostración
  const datosSimulados: IEstadisticasDocente = {
    asignaturas: [
      { _id: '1', nombre: 'Matemáticas', promedio: 3.8, aprobados: 25, reprobados: 5, total: 30, porcentajeAprobados: 83.33, porcentajeReprobados: 16.67 },
      { _id: '2', nombre: 'Lenguaje', promedio: 4.2, aprobados: 28, reprobados: 2, total: 30, porcentajeAprobados: 93.33, porcentajeReprobados: 6.67 },
      { _id: '3', nombre: 'Ciencias', promedio: 3.6, aprobados: 22, reprobados: 8, total: 30, porcentajeAprobados: 73.33, porcentajeReprobados: 26.67 },
      { _id: '4', nombre: 'Sociales', promedio: 4.0, aprobados: 27, reprobados: 3, total: 30, porcentajeAprobados: 90, porcentajeReprobados: 10 },
    ],
    cursos: [
      { _id: '1', nombre: 'Curso A', grado: '9', grupo: 'A', promedio: 3.9, aprobados: 25, reprobados: 5, total: 30, porcentajeAprobados: 83.33, porcentajeReprobados: 16.67 },
      { _id: '2', nombre: 'Curso B', grado: '9', grupo: 'B', promedio: 4.1, aprobados: 28, reprobados: 2, total: 30, porcentajeAprobados: 93.33, porcentajeReprobados: 6.67 },
      { _id: '3', nombre: 'Curso C', grado: '10', grupo: 'A', promedio: 3.7, aprobados: 22, reprobados: 8, total: 30, porcentajeAprobados: 73.33, porcentajeReprobados: 26.67 },
    ],
    periodos: [
      { periodo: "1", año_academico: '2023', promedio: 3.7, aprobados: 70, reprobados: 20, total: 90, porcentajeAprobados: 77.78, porcentajeReprobados: 22.22 },
      { periodo: "2", año_academico: '2023', promedio: 3.9, aprobados: 75, reprobados: 15, total: 90, porcentajeAprobados: 83.33, porcentajeReprobados: 16.67 },
      { periodo: "3", año_academico: '2023', promedio: 4.1, aprobados: 80, reprobados: 10, total: 90, porcentajeAprobados: 88.89, porcentajeReprobados: 11.11 },
      { periodo: "4", año_academico: '2023', promedio: 4.0, aprobados: 78, reprobados: 12, total: 90, porcentajeAprobados: 86.67, porcentajeReprobados: 13.33 },
    ],
    general: {
      promedio: 3.9,
      aprobados: 303,
      reprobados: 57,
      total: 360,
      porcentajeAprobados: 84.17,
      porcentajeReprobados: 15.83,
    },
  };

  if (loading && !estadisticas) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Usar datos simulados para pruebas
  const datos = estadisticas || datosSimulados;

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Estadísticas Académicas
      </Typography>

      {/* Filtros */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="periodo-label">Periodo</InputLabel>
              <Select
                labelId="periodo-label"
                name="periodo"
                value={filtros.periodo}
                onChange={handleFiltroChange}
                label="Periodo"
                sx={{ borderRadius: 2 }}
              >
                {periodos.map((periodo) => (
                  <MenuItem key={periodo.valor} value={periodo.valor}>
                    {periodo.etiqueta}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="año-academico-label">Año Académico</InputLabel>
              <Select
                labelId="año-academico-label"
                name="año_academico"
                value={filtros.año_academico}
                onChange={handleFiltroChange}
                label="Año Académico"
                sx={{ borderRadius: 2 }}
              >
                {añosAcademicos.map((año) => (
                  <MenuItem key={año} value={año}>
                    {año}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="asignatura-label">Asignatura</InputLabel>
              <Select
                labelId="asignatura-label"
                name="asignaturaId"
                value={filtros.asignaturaId}
                onChange={handleFiltroChange}
                label="Asignatura"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas las asignaturas</MenuItem>
                {asignaturas.map((asignatura) => (
                  <MenuItem key={asignatura._id} value={asignatura._id}>
                    {asignatura.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="curso-label">Curso</InputLabel>
              <Select
                labelId="curso-label"
                name="cursoId"
                value={filtros.cursoId}
                onChange={handleFiltroChange}
                label="Curso"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todos los cursos</MenuItem>
                {cursos.map((curso) => (
                  <MenuItem key={curso._id} value={curso._id}>
                    {curso.nombre} ({curso.grado}° {curso.grupo})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error ? (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      ) : loading ? (
        <LinearProgress sx={{ mb: 3 }} />
      ) : (
        <Box>
          {/* Tarjetas de resumen */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Timeline />
                    <Typography variant="h3">Promedio General</Typography>
                  </Box>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="h1"
                      sx={{
                        fontSize: 64,
                        fontWeight: 'bold',
                        color: getColorByPromedio(datos.general.promedio),
                      }}
                    >
                      {datos.general.promedio.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {datos.general.total} calificaciones
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'success.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <CheckCircle />
                    <Typography variant="h3">Aprobados</Typography>
                  </Box>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="h1"
                      sx={{ fontSize: 64, fontWeight: 'bold', color: 'success.main' }}
                    >
                      {datos.general.aprobados}
                    </Typography>
                    <Chip
                      label={`${datos.general.porcentajeAprobados.toFixed(1)}%`}
                      color="success"
                      sx={{ fontWeight: 'bold', borderRadius: 8 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'error.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Cancel />
                    <Typography variant="h3">Reprobados</Typography>
                  </Box>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="h1"
                      sx={{ fontSize: 64, fontWeight: 'bold', color: 'error.main' }}
                    >
                      {datos.general.reprobados}
                    </Typography>
                    <Chip
                      label={`${datos.general.porcentajeReprobados.toFixed(1)}%`}
                      color="error"
                      sx={{ fontWeight: 'bold', borderRadius: 8 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box
                    sx={{
                      bgcolor: 'secondary.main',
                      color: 'white',
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Group />
                    <Typography variant="h3">Estudiantes</Typography>
                  </Box>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography
                      variant="h1"
                      sx={{ fontSize: 64, fontWeight: 'bold', color: 'secondary.main' }}
                    >
                      {datos.general.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total evaluados
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {/* Gráfico de barras para asignaturas */}
            <Grid item xs={12} md={8}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
                  <Typography variant="h3">Rendimiento por Asignatura</Typography>
                </Box>
                <Box sx={{ p: 2, height: 400 }}>
                  {datos.asignaturas.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={datos.asignaturas}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="nombre"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 5]}
                          ticks={[0, 1, 2, 3, 4, 5]}
                          label={{ value: 'Promedio', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip formatter={(value) => [Number(value).toFixed(2), 'Promedio']} />
                        <Legend />
                        <Bar
                          dataKey="promedio"
                          name="Promedio"
                          fill="#5DA9E9"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        No hay datos disponibles para mostrar
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Gráfico de pastel para aprobados/reprobados */}
            <Grid item xs={12} md={4}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                  height: '100%',
                }}
              >
                <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 2 }}>
                  <Typography variant="h3">Distribución de Resultados</Typography>
                </Box>
                <Box sx={{ p: 2, height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: 'Aprobados',
                            value: datos.general.aprobados,
                          },
                          {
                            name: 'Reprobados',
                            value: datos.general.reprobados,
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        labelLine={false}
                      >
                        <Cell key="cell-0" fill="#4CAF50" />
                        <Cell key="cell-1" fill="#F44336" />
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        itemStyle={{ color: '#333' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Tabla de cursos */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              mb: 3,
            }}
          >
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
              <Typography variant="h3">Rendimiento por Curso</Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell>Curso</TableCell>
                    <TableCell align="center">Promedio</TableCell>
                    <TableCell align="center">Aprobados</TableCell>
                    <TableCell align="center">Reprobados</TableCell>
                    <TableCell align="center">Total</TableCell>
                    <TableCell align="center">% Aprobación</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {datos.cursos.length > 0 ? (
                    datos.cursos.map((curso) => (
                      <TableRow
                        key={curso._id}
                        sx={{
                          '&:hover': { bgcolor: 'rgba(93, 169, 233, 0.08)' },
                          cursor: 'pointer',
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>
                          {curso.nombre} ({curso.grado}° {curso.grupo})
                        </TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: getColorByPromedio(curso.promedio),
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          >
                            {curso.promedio.toFixed(1)}
                          </Box>
                        </TableCell>
                        <TableCell align="center">{curso.aprobados}</TableCell>
                        <TableCell align="center">{curso.reprobados}</TableCell>
                        <TableCell align="center">{curso.total}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${curso.porcentajeAprobados.toFixed(1)}%`}
                            color={getPorcentajeColor(curso.porcentajeAprobados) as any}
                            sx={{ fontWeight: 'bold', borderRadius: 8 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="body1" color="text.secondary">
                          No hay datos disponibles para mostrar
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Gráfico de tendencia por periodos */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
              <Typography variant="h3">Tendencia por Periodos</Typography>
            </Box>
            <Box sx={{ p: 2, height: 400 }}>
              {datos.periodos.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={datos.periodos.map(p => ({
                      ...p,
                      name: `Periodo ${p.periodo} - ${p.año_academico}`
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis
                      domain={[0, 5]}
                      ticks={[0, 1, 2, 3, 4, 5]}
                      label={{ value: 'Promedio', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip formatter={(value) => [Number(value).toFixed(2), 'Promedio']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="promedio"
                      name="Promedio"
                      stroke="#003F91"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="porcentajeAprobados"
                      name="% Aprobación"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      dot={{ r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    No hay datos disponibles para mostrar
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default EstadisticasDocente;