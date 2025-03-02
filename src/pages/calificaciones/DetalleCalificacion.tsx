// src/pages/calificaciones/DetalleCalificacion.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { 
  ArrowBack, 
  Edit,
  Assignment,
  Check,
  Close
} from '@mui/icons-material';
import { format } from 'date-fns';
import calificacionService from '../../services/calificacionService';
import { RootState } from '../../redux/store';
import { ICalificacion, ILogro } from '../../types/calificacion.types';
import axiosInstance from '../../api/axiosConfig';

const DetalleCalificacion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [calificacion, setCalificacion] = useState<ICalificacion | null>(null);
  const [logros, setLogros] = useState<ILogro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [estudianteNombre, setEstudianteNombre] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchCalificacion = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener la calificación
        const calificacionData = await calificacionService.obtenerCalificacionPorId(id);
        setCalificacion(calificacionData);

        // Obtener los logros de esta asignatura y periodo
        const logrosData = await calificacionService.obtenerLogros({
          asignaturaId: calificacionData.asignaturaId,
          periodo: calificacionData.periodo,
          año_academico: calificacionData.año_academico,
          estado: 'ACTIVO'
        });
        setLogros(logrosData);

        // Obtener nombres de entidades relacionadas
        const asignaturaResponse = await axiosInstance.get(`/asignaturas/${calificacionData.asignaturaId}`);
        if (asignaturaResponse.data.data) {
          setAsignaturaNombre(asignaturaResponse.data.data.nombre);
        }

        const estudianteResponse = await axiosInstance.get(`/usuarios/${calificacionData.estudianteId}`);
        if (estudianteResponse.data.data) {
          setEstudianteNombre(`${estudianteResponse.data.data.nombre} ${estudianteResponse.data.data.apellidos}`);
        }

        const cursoResponse = await axiosInstance.get(`/cursos/${calificacionData.cursoId}`);
        if (cursoResponse.data.data) {
          setCursoNombre(cursoResponse.data.data.nombre);
        }

      } catch (err) {
        console.error('Error al cargar la calificación:', err);
        setError('No se pudo cargar la información de la calificación.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalificacion();
  }, [id]);

  const handleVolver = () => {
    navigate('/calificaciones/lista');
  };

  const handleEditar = () => {
    navigate(`/calificaciones/editar/${id}`);
  };

  const getEstadoCalificacion = (promedio: number) => {
    if (promedio >= 3.5) return { label: 'Excelente', color: 'success' };
    if (promedio >= 3.0) return { label: 'Aprobado', color: 'primary' };
    if (promedio > 0) return { label: 'Reprobado', color: 'error' };
    return { label: 'Sin calificar', color: 'default' };
  };

  const getColorByTipo = (tipo: string) => {
    switch (tipo) {
      case 'COGNITIVO':
        return 'primary';
      case 'PROCEDIMENTAL':
        return 'secondary';
      case 'ACTITUDINAL':
        return 'success';
      default:
        return 'default';
    }
  };

  // Obtener la calificación de un logro específico
  const getCalificacionLogro = (logroId: string) => {
    if (!calificacion) return null;
    return calificacion.calificaciones_logros.find(cl => cl.logroId === logroId);
  };

  // Calcular porcentaje de logros calificados
  const calcularProgreso = () => {
    if (!calificacion || !logros.length) return 0;
    const logrosCalificados = calificacion.calificaciones_logros.length;
    return Math.round((logrosCalificados / logros.length) * 100);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !calificacion) {
    return (
      <Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleVolver}
          sx={{ mb: 2, borderRadius: 20 }}
        >
          Volver
        </Button>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || 'No se encontró la calificación solicitada.'}
        </Alert>
      </Box>
    );
  }

  const estado = getEstadoCalificacion(calificacion.promedio_periodo);
  const progreso = calcularProgreso();

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleVolver}
          sx={{ borderRadius: 20 }}
        >
          Volver
        </Button>
        
        {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            onClick={handleEditar}
            sx={{ borderRadius: 20 }}
          >
            Editar Calificaciones
          </Button>
        )}
      </Box>

      {/* Información de la calificación */}
      <Grid container spacing={3}>
        {/* Resumen */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%', 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              borderTopLeftRadius: 12, 
              borderTopRightRadius: 12 
            }}>
              <Typography variant="h3">
                Detalles de Calificación
              </Typography>
            </Box>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Asignatura
                </Typography>
                <Typography variant="h3" color="primary.main">
                  {asignaturaNombre}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Estudiante
                </Typography>
                <Typography variant="h3">
                  {estudianteNombre}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Curso
                </Typography>
                <Typography variant="h3">
                  {cursoNombre}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Periodo
                </Typography>
                <Typography variant="h3">
                  Periodo {calificacion.periodo}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Año Académico
                </Typography>
                <Typography variant="h3">
                  {calificacion.año_academico}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de Actualización
                </Typography>
                <Typography variant="h3">
                  {format(new Date(calificacion.updatedAt), 'dd/MM/yyyy')}
                </Typography>
              </Box>
              
              <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                <Typography variant="h3" gutterBottom>
                  Promedio
                </Typography>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: calificacion.promedio_periodo >= 3.5 
                    ? 'success.main' 
                    : (calificacion.promedio_periodo >= 3 
                      ? 'primary.main' 
                      : 'error.main'),
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 24,
                  margin: '0 auto',
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)'
                }}>
                  {calificacion.promedio_periodo.toFixed(1)}
                </Box>
                <Chip 
                  label={estado.label} 
                  color={estado.color as any} 
                  sx={{ mt: 1, fontWeight: 'bold', borderRadius: 8 }} 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabla de logros */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              bgcolor: 'secondary.main', 
              color: 'white', 
              p: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="h3">
                Logros y Calificaciones
              </Typography>
              <Chip 
                icon={<Assignment />} 
                label={`${calificacion.calificaciones_logros.length} de ${logros.length} logros calificados`} 
                sx={{ 
                  bgcolor: 'white', 
                  fontWeight: 'bold',
                  borderRadius: 8
                }} 
              />
            </Box>
            
            {/* Barra de progreso */}
            <Box sx={{ px: 2, pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progreso de calificaciones
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {progreso}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={progreso} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  mb: 2
                }} 
              />
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell>Logro</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="center">Porcentaje</TableCell>
                    <TableCell align="center">Calificación</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logros.map((logro) => {
                    const calificacionLogro = getCalificacionLogro(logro._id);
                    const calificado = Boolean(calificacionLogro);
                    const nota = calificado ? calificacionLogro!.calificacion : null;
                    
                    return (
                      <TableRow 
                        key={logro._id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'rgba(93, 169, 233, 0.08)' 
                          },
                          bgcolor: calificado ? 'rgba(76, 175, 80, 0.04)' : 'inherit'
                        }}
                      >
                        <TableCell>
                          <Typography variant="subtitle2" color="primary.main">
                            {logro.nombre}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {logro.descripcion}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={logro.tipo} 
                            color={getColorByTipo(logro.tipo) as any}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 'bold',
                              borderRadius: 8
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle2">
                            {logro.porcentaje}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {calificado ? (
                            <Box sx={{ 
                              display: 'inline-flex', 
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%', 
                              bgcolor: nota! >= 3.5 
                                ? 'success.main' 
                                : (nota! >= 3 
                                  ? 'primary.main' 
                                  : 'error.main'),
                              color: 'white',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                            }}>
                              {nota!.toFixed(1)}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Sin calificar
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {calificado ? (
                            <IconButton 
                              color="success" 
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(76, 175, 80, 0.2)'
                                }
                              }}
                            >
                              <Check />
                            </IconButton>
                          ) : (
                            <IconButton 
                              color="error" 
                              size="small"
                              sx={{ 
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(244, 67, 54, 0.2)'
                                }
                              }}
                            >
                              <Close />
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

          {/* Observaciones */}
          {calificacion.observaciones && (
            <Card 
              elevation={0} 
              sx={{ 
                mt: 3, 
                p: 2, 
                borderRadius: 3,
                boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h3" color="primary.main" gutterBottom>
                Observaciones
              </Typography>
              <Typography variant="body1">
                {calificacion.observaciones}
              </Typography>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetalleCalificacion;