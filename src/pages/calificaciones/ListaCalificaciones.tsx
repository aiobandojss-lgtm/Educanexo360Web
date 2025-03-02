// src/pages/calificaciones/ListaCalificaciones.tsx (completo)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  Card,
} from '@mui/material';
import { Edit, Visibility } from '@mui/icons-material';
import { RootState } from '../../redux/store';
import calificacionService from '../../services/calificacionService';
import { ICalificacion, IAsignatura, ICurso, IEstudiante } from '../../types/calificacion.types';
import axiosInstance from '../../api/axiosConfig';

const ListaCalificaciones = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [calificaciones, setCalificaciones] = useState<ICalificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [estudiantes, setEstudiantes] = useState<IEstudiante[]>([]);
  const [asignaturas, setAsignaturas] = useState<IAsignatura[]>([]);
  const [cursos, setCursos] = useState<ICurso[]>([]);
  const [estudianteId, setEstudianteId] = useState<string>('');
  const [asignaturaId, setAsignaturaId] = useState<string>('');
  const [cursoId, setCursoId] = useState<string>('');
  const [periodo, setPeriodo] = useState<number>(0);
  const [añoAcademico, setAñoAcademico] = useState<string>(new Date().getFullYear().toString());
  
  // Cargar filtros y datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        
        // Cargar cursos
        const cursosResponse = await axiosInstance.get('/cursos');
        setCursos(cursosResponse.data.data || []);
        
        // Cargar asignaturas
        const asignaturasResponse = await axiosInstance.get('/asignaturas');
        setAsignaturas(asignaturasResponse.data.data || []);
        
        // Cargar estudiantes (solo si es necesario)
        if (['ADMIN', 'DOCENTE'].includes(user?.tipo || '')) {
          const estudiantesResponse = await axiosInstance.get('/usuarios', {
            params: { tipo: 'ESTUDIANTE' }
          });
          setEstudiantes(estudiantesResponse.data.data || []);
        }
        
        // Si es estudiante, filtrar por su ID automáticamente
        if (user?.tipo === 'ESTUDIANTE') {
          setEstudianteId(user._id);
        }
        // Si es padre, cargar estudiantes asociados (ajustar según tu modelo de datos)
        else if (user?.tipo === 'PADRE') {
          // Lógica para obtener estudiantes asociados al padre
        }
        
        // Cargar calificaciones según el rol
        await fetchCalificaciones();
        
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Intente de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    cargarDatos();
  }, [user]);
  
  // Cargar calificaciones con filtros
  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      
      // Aplicar filtros según valores seleccionados
      if (estudianteId) params.estudianteId = estudianteId;
      if (asignaturaId) params.asignaturaId = asignaturaId;
      if (cursoId) params.cursoId = cursoId;
      if (periodo > 0) params.periodo = periodo;
      if (añoAcademico) params.año_academico = añoAcademico;
      
      // Si es estudiante, siempre filtrar por su ID
      if (user?.tipo === 'ESTUDIANTE') {
        params.estudianteId = user._id;
      }
      
      const response = await calificacionService.obtenerCalificaciones(params);
      setCalificaciones(response);
      
    } catch (err) {
      console.error('Error al obtener calificaciones:', err);
      setError('Error al cargar las calificaciones. Intente de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFiltrar = () => {
    fetchCalificaciones();
  };
  
  const handleLimpiarFiltros = () => {
    // Mantener estudianteId si es estudiante
    if (user?.tipo === 'ESTUDIANTE') {
      setAsignaturaId('');
      setPeriodo(0);
    } else {
      setEstudianteId('');
      setAsignaturaId('');
      setCursoId('');
      setPeriodo(0);
    }
    fetchCalificaciones();
  };
  
  const handleVerDetalle = (id: string) => {
    navigate(`/calificaciones/${id}`);
  };
  
  const handleEditar = (id: string) => {
    navigate(`/calificaciones/editar/${id}`);
  };
  
  const getEstadoCalificacion = (promedio: number) => {
    if (promedio >= 3.5) return { label: 'Excelente', color: 'success' };
    if (promedio >= 3.0) return { label: 'Aprobado', color: 'primary' };
    if (promedio > 0) return { label: 'Reprobado', color: 'error' };
    return { label: 'Sin calificar', color: 'default' };
  };
  
  // Función para encontrar nombres de entidades por ID
  const getEstudianteNombre = (id: string) => {
    const estudiante = estudiantes.find(e => e._id === id);
    return estudiante ? `${estudiante.nombre} ${estudiante.apellidos}` : 'Desconocido';
  };
  
  const getAsignaturaNombre = (id: string) => {
    const asignatura = asignaturas.find(a => a._id === id);
    return asignatura ? asignatura.nombre : 'Desconocida';
  };
  
  const getCursoNombre = (id: string) => {
    const curso = cursos.find(c => c._id === id);
    return curso ? curso.nombre : 'Desconocido';
  };
  
  return (
    <Box>
      {/* Filtros */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Typography variant="h3" color="primary.main" gutterBottom>
          Filtros
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          {/* Solo mostrar selector de estudiante para docentes y admin */}
          {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="estudiante-label">Estudiante</InputLabel>
                <Select
                  labelId="estudiante-label"
                  value={estudianteId}
                  onChange={(e) => setEstudianteId(e.target.value)}
                  label="Estudiante"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estudiantes.map((estudiante) => (
                    <MenuItem key={estudiante._id} value={estudiante._id}>
                      {estudiante.nombre} {estudiante.apellidos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="asignatura-label">Asignatura</InputLabel>
              <Select
                labelId="asignatura-label"
                value={asignaturaId}
                onChange={(e) => setAsignaturaId(e.target.value)}
                label="Asignatura"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="">Todas</MenuItem>
                {asignaturas.map((asignatura) => (
                  <MenuItem key={asignatura._id} value={asignatura._id}>
                    {asignatura.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="curso-label">Curso</InputLabel>
                <Select
                  labelId="curso-label"
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  label="Curso"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {cursos.map((curso) => (
                    <MenuItem key={curso._id} value={curso._id}>
                      {curso.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="periodo-label">Periodo</InputLabel>
              <Select
                labelId="periodo-label"
                value={periodo}
                onChange={(e) => setPeriodo(Number(e.target.value))}
                label="Periodo"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={0}>Todos</MenuItem>
                <MenuItem value={1}>Primer Periodo</MenuItem>
                <MenuItem value={2}>Segundo Periodo</MenuItem>
                <MenuItem value={3}>Tercer Periodo</MenuItem>
                <MenuItem value={4}>Cuarto Periodo</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Año Académico"
              value={añoAcademico}
              onChange={(e) => setAñoAcademico(e.target.value)}
              size="small"
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleFiltrar}
                fullWidth
                sx={{ borderRadius: 20 }}
              >
                Filtrar
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleLimpiarFiltros}
                fullWidth
                sx={{ borderRadius: 20 }}
              >
                Limpiar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabla de calificaciones */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : calificaciones.length === 0 ? (
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          No se encontraron calificaciones con los filtros seleccionados.
        </Alert>
      ) : (
        <Card 
          elevation={0} 
          sx={{ 
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estudiante</TableCell>
                  )}
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asignatura</TableCell>
                  {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Curso</TableCell>
                  )}
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Periodo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Año Académico</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Promedio</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Logros Calificados</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calificaciones.map((calificacion) => {
                  const estado = getEstadoCalificacion(calificacion.promedio_periodo);
                  const logrosTotales = calificacion.calificaciones_logros.length;
                  
                  return (
                    <TableRow key={calificacion._id} sx={{ 
                      '&:hover': { 
                        bgcolor: 'rgba(93, 169, 233, 0.08)' 
                      }
                    }}>
                      {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
                        <TableCell>{getEstudianteNombre(calificacion.estudianteId)}</TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
                        {getAsignaturaNombre(calificacion.asignaturaId)}
                      </TableCell>
                      {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
                        <TableCell>{getCursoNombre(calificacion.cursoId)}</TableCell>
                      )}
                      <TableCell>{`Periodo ${calificacion.periodo}`}</TableCell>
                      <TableCell>{calificacion.año_academico}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ 
                          display: 'inline-flex', 
                          width: 45, 
                          height: 45, 
                          borderRadius: '50%', 
                          bgcolor: calificacion.promedio_periodo >= 3.5 
                            ? 'success.main' 
                            : (calificacion.promedio_periodo >= 3 
                              ? 'primary.main' 
                              : 'error.main'),
                          color: 'white',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          {calificacion.promedio_periodo.toFixed(1)}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={estado.label} 
                          color={estado.color as any}
                          size="small"
                          sx={{ 
                            borderRadius: 8,
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {logrosTotales} logro(s)
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary"
                          onClick={() => handleVerDetalle(calificacion._id)}
                          sx={{ 
                            bgcolor: 'rgba(93, 169, 233, 0.1)',
                            mr: 1,
                            '&:hover': {
                              bgcolor: 'rgba(93, 169, 233, 0.2)'
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        
                        {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
                          <IconButton 
                            color="secondary"
                            onClick={() => handleEditar(calificacion._id)}
                            sx={{ 
                              bgcolor: 'rgba(0, 63, 145, 0.1)',
                              '&:hover': {
                                bgcolor: 'rgba(0, 63, 145, 0.2)'
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default ListaCalificaciones;