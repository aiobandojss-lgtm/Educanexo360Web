// src/pages/calificaciones/BoletinFinal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CircularProgress,
  Alert,
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
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { 
  Print,
  PictureAsPdf,
  TrendingUp,
  TrendingDown,
  Info,
} from '@mui/icons-material';
import { format } from 'date-fns';
import calificacionService from '../../services/calificacionService';
import { RootState } from '../../redux/store';
import axiosInstance from '../../api/axiosConfig';

// Interfaces para el boletín final
interface Asignatura {
  asignatura: {
    _id: string;
    nombre: string;
    docente: string;
  };
  periodos: {
    periodo: number;
    promedio: number;
    observaciones: string;
    logros_calificados: any[];
    total_logros_calificados: number;
  }[];
  promedio_final: number;
  estado: string;
}

interface BoletinFinalData {
  estudiante: {
    _id: string;
    nombre: string;
    curso: string;
  };
  año_academico: string;
  fecha_generacion: string;
  asignaturas: Asignatura[];
  estadisticas: {
    asignaturas_total: number;
    asignaturas_aprobadas: number;
    asignaturas_reprobadas: number;
    asignaturas_sin_calificar: number;
    promedio_general: number;
    resultado_final: string;
  };
}

const BoletinFinal = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Estados para manejo de datos
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [estudianteId, setEstudianteId] = useState<string>('');
  const [añoAcademico, setAñoAcademico] = useState<string>(new Date().getFullYear().toString());
  const [boletinFinal, setBoletinFinal] = useState<BoletinFinalData | null>(null);
  
  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  
  // Referencia para impresión
  const boletinFinalRef = useRef<HTMLDivElement>(null);

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
          // En un escenario real, obtendríamos solo los estudiantes asociados al padre
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
      cargarBoletinFinal();
    }
  }, [estudianteId, añoAcademico]);

  // Función para cargar el boletín final
  const cargarBoletinFinal = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await calificacionService.obtenerBoletinFinal({
        estudianteId,
        año_academico: añoAcademico
      });

      // Transform response to match BoletinFinalData structure
      const transformedData: BoletinFinalData = {
        estudiante: response.estudiante,
        año_academico: response.año_academico,
        fecha_generacion: response.fecha_generacion,
        asignaturas: response.asignaturas.map(asig => ({
          asignatura: asig.asignatura,
          periodos: Array(4).fill(null).map((_, index) => ({
            periodo: index + 1,
            promedio: asig.promedio,
            observaciones: asig.observaciones,
            logros_calificados: asig.logros,
            total_logros_calificados: asig.logros.length
          })),
          promedio_final: asig.promedio,
          estado: asig.promedio >= 3.0 ? 'APROBADA' : 'REPROBADA'
        })),
        estadisticas: {
          asignaturas_total: response.asignaturas.length,
          asignaturas_aprobadas: response.asignaturas.filter(a => a.promedio >= 3.0).length,
          asignaturas_reprobadas: response.asignaturas.filter(a => a.promedio < 3.0).length,
          asignaturas_sin_calificar: 0,
          promedio_general: response.asignaturas.reduce((acc, curr) => acc + curr.promedio, 0) / response.asignaturas.length,
          resultado_final: response.asignaturas.every(a => a.promedio >= 3.0) ? 'APROBADO' : 'REPROBADO'
        }
      };

      setBoletinFinal(transformedData);
    } catch (err) {
      console.error('Error al cargar boletín final:', err);
      setError('No se pudo cargar el boletín final. Intente nuevamente más tarde.');
      setBoletinFinal(null);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores de cambios en filtros
  const handleEstudianteChange = (event: SelectChangeEvent) => {
    setEstudianteId(event.target.value);
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
      if (boletinFinalRef.current) {
        // En una implementación real, usaríamos la biblioteca react-to-print
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
    setTimeout(() => {
      // Simulación de generación de PDF
      alert('Boletín final exportado como PDF correctamente');
      setImprimiendo(false);
    }, 1500);
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Boletín Final de Calificaciones
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
            <Grid item xs={12} sm={6}>
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
          
          <Grid item xs={12} sm={user?.tipo === 'ESTUDIANTE' ? 12 : 6}>
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
      ) : boletinFinal ? (
        <Box id="boletin-final-contenido">
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
                  {boletinFinal.estudiante.nombre}
                </Typography>
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  Curso: {boletinFinal.estudiante.curso}
                </Typography>
                <Typography variant="h5" color="text.secondary">
                  Año Académico: {boletinFinal.año_academico}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Tooltip title="Imprimir boletín final">
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
                  Generado: {format(new Date(boletinFinal.fecha_generacion), 'dd/MM/yyyy')}
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
                  {boletinFinal.estadisticas.asignaturas_total}
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
                  {boletinFinal.estadisticas.asignaturas_aprobadas}
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
                  {boletinFinal.estadisticas.asignaturas_reprobadas}
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
                    bgcolor: boletinFinal.estadisticas.promedio_general >= 3.5 
                      ? 'success.main' 
                      : (boletinFinal.estadisticas.promedio_general >= 3 
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
                    {boletinFinal.estadisticas.promedio_general.toFixed(1)}
                  </Box>
                </Box>
                <Typography variant="h5" gutterBottom>
                  Promedio
                </Typography>
                <Chip 
                  label={boletinFinal.estadisticas.resultado_final}
                  color={boletinFinal.estadisticas.resultado_final === 'APROBADO' ? "success" : "error"}
                  sx={{ fontWeight: 'bold', borderRadius: 8 }}
                />
              </Card>
            </Grid>
          </Grid>

          {/* Tabla de asignaturas */}
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
                Calificaciones por Asignatura y Periodo
              </Typography>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell>Asignatura</TableCell>
                    <TableCell>Docente</TableCell>
                    {[1, 2, 3, 4].map(p => (
                      <TableCell key={p} align="center">
                        Periodo {p}
                      </TableCell>
                    ))}
                    <TableCell align="center">Nota Final</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {boletinFinal.asignaturas.map((asignatura) => (
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
                      
                      {/* Periodos */}
                      {[1, 2, 3, 4].map(periodo => {
                        const periodData = asignatura.periodos.find(p => p.periodo === periodo);
                        return (
                          <TableCell key={periodo} align="center">
                            {periodData ? (
                              <Box sx={{ 
                                display: 'inline-flex', 
                                width: 35, 
                                height: 35, 
                                borderRadius: '50%', 
                                bgcolor: periodData.promedio >= 3.5 
                                  ? 'success.main' 
                                  : (periodData.promedio >= 3 
                                    ? 'primary.main' 
                                    : 'error.main'),
                                color: 'white',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                              }}>
                                {periodData.promedio.toFixed(1)}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        );
                      })}
                      
                      {/* Promedio final */}
                      <TableCell align="center">
                        <Box sx={{ 
                          display: 'inline-flex', 
                          width: 40, 
                          height: 40, 
                          borderRadius: '50%', 
                          bgcolor: asignatura.promedio_final >= 3.5 
                            ? 'success.main' 
                            : (asignatura.promedio_final >= 3 
                              ? 'primary.main' 
                              : 'error.main'),
                          color: 'white',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)'
                        }}>
                          {asignatura.promedio_final.toFixed(1)}
                        </Box>
                      </TableCell>
                      
                      {/* Estado */}
                      <TableCell align="center">
                        <Chip 
                          label={asignatura.estado === 'APROBADA' ? "Aprobada" : "Reprobada"} 
                          color={asignatura.estado === 'APROBADA' ? "success" : "error"}
                          size="small"
                          sx={{ fontWeight: 'bold', borderRadius: 8 }}
                        />
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
          Seleccione un estudiante y año académico para visualizar el boletín final.
        </Alert>
      )}
      
      {/* Diálogo para impresión */}
      <Dialog open={showPrintDialog} onClose={() => setShowPrintDialog(false)}>
        <DialogTitle>Imprimiendo Boletín Final</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>
              Preparando el boletín para imprimir...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BoletinFinal;