// src/pages/calificaciones/Boletin.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  Print,
  PictureAsPdf,
  ArrowBack,
  Info,
  Download,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { format } from 'date-fns';
import calificacionService from '../../services/calificacionService';
import { RootState } from '../../redux/store';
import { IBoletin } from '../../types/calificacion.types';
import axiosInstance from '../../api/axiosConfig';
import BoletinPDF from '../../components/calificaciones/BoletinPDF';

const Boletin = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Estados para el manejo de datos
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [estudianteId, setEstudianteId] = useState<string>('');
  const [periodos, setPeriodos] = useState<number[]>([1, 2, 3, 4]);
  const [periodo, setPeriodo] = useState<number>(1);
  const [añoAcademico, setAñoAcademico] = useState<string>(new Date().getFullYear().toString());
  const [boletin, setBoletin] = useState<IBoletin | null>(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  
  // Referencia para el componente de impresión
  const boletinImprimibleRef = useRef<HTMLDivElement>(null);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Si es estudiante, usar su propio ID
        if (user?.tipo === 'ESTUDIANTE') {
          setEstudianteId(user._id);
        } 
        // Si es padre, cargar sus estudiantes asociados
        else if (user?.tipo === 'PADRE') {
          // En un escenario real, aquí obtendríamos solo los estudiantes asociados al padre
          const estudiantesResponse = await axiosInstance.get('/usuarios', {
            params: { tipo: 'ESTUDIANTE' }
          });
          setEstudiantes(estudiantesResponse.data.data || []);
          
          // Si hay estudiantes, seleccionar el primero por defecto
          if (estudiantesResponse.data.data?.length > 0) {
            setEstudianteId(estudiantesResponse.data.data[0]._id);
          }
        }
        // Si es admin o docente, cargar todos los estudiantes
        else if (['ADMIN', 'DOCENTE'].includes(user?.tipo || '')) {
          const estudiantesResponse = await axiosInstance.get('/usuarios', {
            params: { tipo: 'ESTUDIANTE' }
          });
          setEstudiantes(estudiantesResponse.data.data || []);
        }

      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('No se pudieron cargar los datos iniciales.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user]);

  // Cargar boletín cuando cambian los filtros
  useEffect(() => {
    if (estudianteId) {
      cargarBoletin();
    }
  }, [estudianteId, periodo, añoAcademico]);

  // Función para cargar el boletín según los filtros seleccionados
  const cargarBoletin = async () => {
    try {
      setLoading(true);
      setError(null);

      const boletinData = await calificacionService.obtenerBoletinPeriodo({
        estudianteId,
        periodo,
        año_academico: añoAcademico
      });

      setBoletin(boletinData);
    } catch (err) {
      console.error('Error al cargar boletín:', err);
      setError('No se pudo cargar el boletín. Intente nuevamente más tarde.');
      setBoletin(null);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores de cambios en filtros
  const handleEstudianteChange = (event: SelectChangeEvent) => {
    setEstudianteId(event.target.value);
  };

  const handlePeriodoChange = (event: SelectChangeEvent) => {
    setPeriodo(Number(event.target.value));
  };

  const handleAñoChange = (event: SelectChangeEvent) => {
    setAñoAcademico(event.target.value);
  };

  // Función para imprimir el boletín
  const handleImprimir = () => {
    setImprimiendo(true);
    setShowPrintDialog(true);
    
    // Simulamos un tiempo de preparación para la impresión
    setTimeout(() => {
      if (boletinImprimibleRef.current) {
        // En una implementación real, usaríamos la biblioteca react-to-print
        // para manejar la impresión del componente
        window.print();
        setImprimiendo(false);
        setTimeout(() => setShowPrintDialog(false), 500);
      } else {
        setImprimiendo(false);
        setShowPrintDialog(false);
      }
    }, 1000);
  };

  // Función para exportar a PDF (simulada)
  const handleExportarPDF = () => {
    setImprimiendo(true);
    
    // En una implementación real, usaríamos una biblioteca como jsPDF
    // para generar el PDF a partir del contenido renderizado
    setTimeout(() => {
      // Simulación de generación de PDF
      alert('Boletín exportado como PDF correctamente');
      setImprimiendo(false);
    }, 1500);
  };

  // Función para obtener color según la calificación
  const getColorByCalificacion = (calificacion: number) => {
    if (calificacion >= 3.5) return 'success.main';
    if (calificacion >= 3.0) return 'primary.main';
    if (calificacion > 0) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Boletín de Calificaciones
      </Typography>

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
        <Grid container spacing={2} alignItems="center">
          {/* Mostrar selector de estudiante solo si no es estudiante */}
          {user?.tipo !== 'ESTUDIANTE' && (
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="estudiante-label">Estudiante</InputLabel>
                <Select
                  labelId="estudiante-label"
                  value={estudianteId}
                  onChange={handleEstudianteChange}
                  label="Estudiante"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">Seleccionar estudiante</MenuItem>
                  {estudiantes.map((estudiante) => (
                    <MenuItem key={estudiante._id} value={estudiante._id}>
                      {estudiante.nombre} {estudiante.apellidos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          <Grid item xs={12} sm={6} md={user?.tipo === 'ESTUDIANTE' ? 6 : 4}>
            <FormControl fullWidth size="small">
              <InputLabel id="periodo-label">Periodo</InputLabel>
              <Select
                labelId="periodo-label"
                value={periodo.toString()}
                onChange={handlePeriodoChange}
                label="Periodo"
                sx={{ borderRadius: 2 }}
              >
                {periodos.map((p) => (
                  <MenuItem key={p} value={p}>
                    Periodo {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={user?.tipo === 'ESTUDIANTE' ? 6 : 4}>
            <FormControl fullWidth size="small">
              <InputLabel id="año-label">Año Académico</InputLabel>
              <Select
                labelId="año-label"
                value={añoAcademico}
                onChange={handleAñoChange}
                label="Año Académico"
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value={(new Date().getFullYear()).toString()}>
                  {new Date().getFullYear()}
                </MenuItem>
                <MenuItem value={(new Date().getFullYear() - 1).toString()}>
                  {new Date().getFullYear() - 1}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Contenido del boletín */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      ) : boletin ? (
        <Box id="boletin-contenido">
          {/* Encabezado del boletín */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <Typography variant="h3" color="primary.main" gutterBottom>
                  {boletin.estudiante.nombre}
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Curso: {boletin.estudiante.curso}
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Periodo: {boletin.periodo} - Año: {boletin.año_academico}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="Imprimir boletín">
                    <IconButton 
                      color="primary" 
                      onClick={handleImprimir}
                      disabled={imprimiendo}
                      sx={{ 
                        bgcolor: 'rgba(93, 169, 233, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(93, 169, 233, 0.2)'
                        }
                      }}
                    >
                      {imprimiendo ? <CircularProgress size={24} /> : <Print />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Exportar como PDF">
                    <IconButton 
                      color="secondary"
                      onClick={handleExportarPDF}
                      disabled={imprimiendo}
                      sx={{ 
                        bgcolor: 'rgba(0, 63, 145, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0, 63, 145, 0.2)'
                        }
                      }}
                    >
                      {imprimiendo ? <CircularProgress size={24} color="secondary" /> : <PictureAsPdf />}
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Generado: {format(new Date(boletin.fecha_generacion), 'dd/MM/yyyy')}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Resumen de estadísticas */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 3,
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Info 
                  fontSize="large" 
                  color="primary" 
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" gutterBottom>
                  Asignaturas
                </Typography>
                <Typography variant="h2" color="primary.main">
                  {boletin.estadisticas.asignaturas_total}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 3,
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <TrendingUp 
                  fontSize="large" 
                  color="success" 
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" gutterBottom>
                  Aprobadas
                </Typography>
                <Typography variant="h2" color="success.main">
                  {boletin.estadisticas.asignaturas_aprobadas}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 3,
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <TrendingDown 
                  fontSize="large" 
                  color="error" 
                  sx={{ mb: 1 }}
                />
                <Typography variant="h5" gutterBottom>
                  Reprobadas
                </Typography>
                <Typography variant="h2" color="error.main">
                  {boletin.estadisticas.asignaturas_reprobadas}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                elevation={0} 
                sx={{ 
                  textAlign: 'center', 
                  p: 2, 
                  borderRadius: 3,
                  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                  <Box sx={{ 
                    width: 60, 
                    height: 60, 
                    borderRadius: '50%', 
                    bgcolor: boletin.estadisticas.promedio_general >= 3.5 
                      ? 'success.main' 
                      : (boletin.estadisticas.promedio_general >= 3 
                        ? 'primary.main' 
                        : 'error.main'),
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    margin: '0 auto',
                    fontSize: '1.5rem',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)'
                  }}>
                    {boletin.estadisticas.promedio_general.toFixed(1)}
                  </Box>
                </Box>
                <Typography variant="h5" gutterBottom>
                  Promedio
                </Typography>
                <Chip 
                  label={boletin.estadisticas.promedio_general >= 3 ? "Aprobado" : "Reprobado"}
                  color={boletin.estadisticas.promedio_general >= 3 ? "success" : "error"}
                  sx={{ fontWeight: 'bold', borderRadius: 8 }}
                />
              </Card>
            </Grid>
          </Grid>

          {/* Lista de asignaturas */}
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2,
            }}>
              <Typography variant="h3">
                Calificaciones por Asignatura
              </Typography>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell>Asignatura</TableCell>
                    <TableCell>Docente</TableCell>
                    <TableCell align="center">Logros Evaluados</TableCell>
                    <TableCell align="center">Promedio</TableCell>
                    <TableCell align="center">Estado</TableCell>
                    <TableCell align="center">Detalles</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {boletin.asignaturas.map((asignatura) => (
                    <TableRow 
                      key={asignatura.asignatura._id}
                      sx={{ 
                        '&:hover': { 
                          bgcolor: 'rgba(93, 169, 233, 0.08)' 
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500, color: 'primary.main' }}>
                        {asignatura.asignatura.nombre}
                      </TableCell>
                      <TableCell>{asignatura.asignatura.docente}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Typography>
                            {asignatura.progreso.logros_calificados} / {asignatura.progreso.total_logros}
                          </Typography>
                          <Tooltip title={`${asignatura.progreso.porcentaje_completado}% completado`}>
                            <Box sx={{ width: 70 }}>
                              <Divider 
                                sx={{ 
                                  borderTopWidth: 8, 
                                  borderRadius: 4,
                                  borderColor: 'rgba(0, 0, 0, 0.05)',
                                  '&::before': {
                                    width: `${asignatura.progreso.porcentaje_completado}%`,
                                    borderTopWidth: 8,
                                    borderTopStyle: 'solid',
                                    borderRadius: 4,
                                    borderColor: 'primary.main',
                                  }
                                }} 
                              />
                            </Box>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ 
                          display: 'inline-flex', 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: asignatura.promedio >= 3.5 
                            ? 'success.main' 
                            : (asignatura.promedio >= 3 
                              ? 'primary.main' 
                              : 'error.main'),
                          color: 'white',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                        }}>
                          {asignatura.promedio.toFixed(1)}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={asignatura.promedio >= 3 ? "Aprobado" : "Reprobado"} 
                          color={asignatura.promedio >= 3 ? "success" : "error"}
                          size="small"
                          sx={{ fontWeight: 'bold', borderRadius: 8 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            // Navegar a la vista detallada de calificaciones de esta asignatura
                            navigate(`/calificaciones/lista?estudianteId=${boletin.estudiante._id}&asignaturaId=${asignatura.asignatura._id}&periodo=${boletin.periodo}`);
                          }}
                          sx={{ borderRadius: 8 }}
                        >
                          Ver Detalles
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      ) : (
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          Seleccione un estudiante, periodo y año para visualizar el boletín.
        </Alert>
      )}
      
      {/* Diálogo para impresión */}
      <Dialog open={showPrintDialog} onClose={() => setShowPrintDialog(false)}>
        <DialogTitle>Imprimiendo Boletín</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>
              Preparando el boletín para imprimir...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Elemento oculto para impresión */}
      <Box sx={{ display: 'none' }}>
        <div ref={boletinImprimibleRef}>
          {boletin && <BoletinPDF boletin={boletin} />}
        </div>
      </Box>
    </Box>
  );
};

export default Boletin;