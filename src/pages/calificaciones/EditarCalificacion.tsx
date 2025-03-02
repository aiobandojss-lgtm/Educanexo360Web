// src/pages/calificaciones/EditarCalificacion.tsx
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
  TextField,
  CircularProgress,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Snackbar,
  Chip,
} from '@mui/material';
import { 
  ArrowBack, 
  Save,
  Assignment,
  Check,
  Edit as EditIcon,
  Cancel,
  Info
} from '@mui/icons-material';
import calificacionService from '../../services/calificacionService';
import { RootState } from '../../redux/store';
import { ICalificacion, ILogro } from '../../types/calificacion.types';
import axiosInstance from '../../api/axiosConfig';

interface CalificacionFormValues {
  estudianteId: string;
  asignaturaId: string;
  cursoId: string;
  periodo: number;
  año_academico: string;
  observaciones: string;
}

interface LogroCalificacion {
  logroId: string;
  calificacion: number;
  observacion: string;
  editando: boolean;
}

const EditarCalificacion = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [formValues, setFormValues] = useState<CalificacionFormValues>({
    estudianteId: '',
    asignaturaId: '',
    cursoId: '',
    periodo: 1,
    año_academico: new Date().getFullYear().toString(),
    observaciones: '',
  });
  const [calificacion, setCalificacion] = useState<ICalificacion | null>(null);
  const [logros, setLogros] = useState<ILogro[]>([]);
  const [logroCalificaciones, setLogroCalificaciones] = useState<LogroCalificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [asignaturaNombre, setAsignaturaNombre] = useState('');
  const [estudianteNombre, setEstudianteNombre] = useState('');
  const [cursoNombre, setCursoNombre] = useState('');
  const [modo, setModo] = useState<'crear' | 'editar'>(id ? 'editar' : 'crear');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        if (modo === 'editar' && id) {
          // Obtener la calificación existente
          const calificacionData = await calificacionService.obtenerCalificacionPorId(id);
          setCalificacion(calificacionData);
          
          // Actualizar valores del formulario
          setFormValues({
            estudianteId: calificacionData.estudianteId,
            asignaturaId: calificacionData.asignaturaId,
            cursoId: calificacionData.cursoId,
            periodo: calificacionData.periodo,
            año_academico: calificacionData.año_academico,
            observaciones: calificacionData.observaciones || ''
          });

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

          // Obtener los logros para esta asignatura y periodo
          const logrosData = await calificacionService.obtenerLogros({
            asignaturaId: calificacionData.asignaturaId,
            periodo: calificacionData.periodo,
            año_academico: calificacionData.año_academico,
            estado: 'ACTIVO'
          });
          setLogros(logrosData);

          // Inicializar las calificaciones de logros
          const logrosCalif = logrosData.map(logro => {
            // Buscar si ya hay una calificación para este logro
            const calExistente = calificacionData.calificaciones_logros.find(
              cl => cl.logroId === logro._id
            );

            return {
              logroId: logro._id,
              calificacion: calExistente ? calExistente.calificacion : 0,
              observacion: calExistente ? calExistente.observacion || '' : '',
              editando: false
            };
          });

          setLogroCalificaciones(logrosCalif);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('No se pudo cargar la información necesaria.');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, modo]);

  const handleObservacionesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      observaciones: e.target.value
    });
  };

  const handleEditarCalificacion = (index: number) => {
    const nuevasCalificaciones = [...logroCalificaciones];
    nuevasCalificaciones[index].editando = true;
    setLogroCalificaciones(nuevasCalificaciones);
  };

  const handleCancelarEdicion = (index: number) => {
    const nuevasCalificaciones = [...logroCalificaciones];
    nuevasCalificaciones[index].editando = false;
    
    // Si es una calificación existente, restaurar el valor original
    if (calificacion) {
      const logroId = nuevasCalificaciones[index].logroId;
      const calExistente = calificacion.calificaciones_logros.find(
        cl => cl.logroId === logroId
      );
      
      if (calExistente) {
        nuevasCalificaciones[index].calificacion = calExistente.calificacion;
        nuevasCalificaciones[index].observacion = calExistente.observacion || '';
      } else {
        nuevasCalificaciones[index].calificacion = 0;
        nuevasCalificaciones[index].observacion = '';
      }
    }
    
    setLogroCalificaciones(nuevasCalificaciones);
  };

  const handleCalificacionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const valorNumerico = parseFloat(value);
    
    if (!isNaN(valorNumerico) && valorNumerico >= 0 && valorNumerico <= 5) {
      const nuevasCalificaciones = [...logroCalificaciones];
      nuevasCalificaciones[index].calificacion = valorNumerico;
      setLogroCalificaciones(nuevasCalificaciones);
    }
  };

  //const handleObservacionLogroChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
  
  const handleObservacionLogroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const nuevasCalificaciones = [...logroCalificaciones];
    nuevasCalificaciones[index].observacion = e.target.value;
    setLogroCalificaciones(nuevasCalificaciones);
  };

  const handleGuardarCalificacion = async (index: number) => {
    const calificacionLogro = logroCalificaciones[index];
    
    try {
      if (calificacion) {
        // Actualizar calificación existente
        await calificacionService.actualizarCalificacionLogro(
          calificacion._id,
          {
            logroId: calificacionLogro.logroId,
            calificacion: calificacionLogro.calificacion,
            observacion: calificacionLogro.observacion
          }
        );
        
        // Marcar como no editando
        const nuevasCalificaciones = [...logroCalificaciones];
        nuevasCalificaciones[index].editando = false;
        setLogroCalificaciones(nuevasCalificaciones);
        
        // Mostrar mensaje de éxito
        setSuccess(true);
        
        // Actualizar la calificación local
        const calificacionActualizada = await calificacionService.obtenerCalificacionPorId(calificacion._id);
        setCalificacion(calificacionActualizada);
      }
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      setError('No se pudo guardar la calificación.');
    }
  };

  const handleGuardarTodo = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!calificacion) {
        // TODO: Implementar creación de nueva calificación
        return;
      }
      
      // Actualizar observaciones
      await calificacionService.actualizarCalificacion(calificacion._id, {
        observaciones: formValues.observaciones
      });
      
      // Actualizar todas las calificaciones de logros que no están en modo edición
      for (let index = 0; index < logroCalificaciones.length; index++) {
        const logroCal = logroCalificaciones[index];
        if (!logroCal.editando && logroCal.calificacion > 0) {
          // Verificar si ya existe una calificación para este logro
          const existeCalificacion = calificacion.calificaciones_logros.some(
            cl => cl.logroId === logroCal.logroId
          );
          
          if (existeCalificacion) {
            await calificacionService.actualizarCalificacionLogro(
              calificacion._id,
              {
                logroId: logroCal.logroId,
                calificacion: logroCal.calificacion,
                observacion: logroCal.observacion
              }
            );
          } else {
            await calificacionService.agregarCalificacionLogro(
              calificacion._id,
              {
                logroId: logroCal.logroId,
                calificacion: logroCal.calificacion,
                observacion: logroCal.observacion
              }
            );
          }
        }
      }
      
      // Mostrar mensaje de éxito y redirigir
      setSuccess(true);
      setTimeout(() => {
        navigate(`/calificaciones/${calificacion._id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error al guardar calificaciones:', err);
      setError('No se pudieron guardar todas las calificaciones.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  const handleVolver = () => {
    navigate(calificacion 
      ? `/calificaciones/${calificacion._id}` 
      : '/calificaciones/lista'
    );
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !['ADMIN', 'DOCENTE'].includes(user.tipo)) {
    return (
      <Box>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          No tiene permisos para editar calificaciones.
        </Alert>
      </Box>
    );
  }

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
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={handleGuardarTodo}
          disabled={saving}
          sx={{ borderRadius: 20 }}
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

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
                {modo === 'editar' ? 'Editar Calificaciones' : 'Nueva Calificación'}
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
                  Periodo {formValues.periodo}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Año Académico
                </Typography>
                <Typography variant="h3">
                  {formValues.año_academico}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Observaciones Generales
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={formValues.observaciones}
                  onChange={handleObservacionesChange}
                  placeholder="Ingrese observaciones generales sobre el desempeño del estudiante..."
                  InputProps={{ sx: { borderRadius: 2 } }}
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
                Calificar Logros
              </Typography>
              <Tooltip title="Ingrese las calificaciones de cada logro. La calificación debe estar entre 0 y 5.">
                <IconButton color="inherit">
                  <Info />
                </IconButton>
              </Tooltip>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'rgba(0, 0, 0, 0.03)' }}>
                  <TableRow>
                    <TableCell>Logro</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="center">Porcentaje</TableCell>
                    <TableCell align="center">Calificación</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logros.map((logro, index) => {
                    const logroCalif = logroCalificaciones[index];
                    const editando = logroCalif?.editando || false;
                    
                    return (
                      <TableRow 
                        key={logro._id}
                        sx={{ 
                          '&:hover': { 
                            bgcolor: 'rgba(93, 169, 233, 0.08)' 
                          },
                          bgcolor: editando ? 'rgba(93, 169, 233, 0.05)' : (
                            logroCalif?.calificacion > 0 ? 'rgba(76, 175, 80, 0.04)' : 'inherit'
                          )
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
                          {editando ? (
                            <Box sx={{ width: 130, margin: '0 auto' }}>
                              <TextField
                                type="number"
                                inputProps={{ 
                                  min: 0, 
                                  max: 5, 
                                  step: 0.1,
                                  style: { textAlign: 'center' }
                                }}
                                value={logroCalif?.calificacion || ''}
                                onChange={(e) => handleCalificacionChange(e as any, index)}
                                size="small"
                                fullWidth
                                sx={{ mb: 1 }}
                                placeholder="0.0 - 5.0"
                              />
                              <TextField
                                placeholder="Observación..."
                                value={logroCalif?.observacion || ''}
                                onChange={(e) => handleObservacionLogroChange(e, index)}
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                              />
                            </Box>
                          ) : (
                            <Box>
                              {logroCalif?.calificacion > 0 ? (
                                <>
                                  <Box sx={{ 
                                    display: 'inline-flex', 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '50%', 
                                    bgcolor: logroCalif.calificacion >= 3.5 
                                      ? 'success.main' 
                                      : (logroCalif.calificacion >= 3 
                                        ? 'primary.main' 
                                        : 'error.main'),
                                    color: 'white',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                                  }}>
                                    {logroCalif.calificacion.toFixed(1)}
                                  </Box>
                                  {logroCalif.observacion && (
                                    <Typography 
                                      variant="caption" 
                                      display="block" 
                                      color="text.secondary"
                                      sx={{ mt: 1 }}
                                    >
                                      {logroCalif.observacion.length > 20 
                                        ? logroCalif.observacion.substring(0, 20) + '...' 
                                        : logroCalif.observacion
                                      }
                                    </Typography>
                                  )}
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Sin calificar
                                </Typography>
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {editando ? (
                            <Box>
                              <IconButton 
                                color="success" 
                                onClick={() => handleGuardarCalificacion(index)}
                                sx={{ 
                                  mr: 1,
                                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(76, 175, 80, 0.2)'
                                  }
                                }}
                              >
                                <Check />
                              </IconButton>
                              <IconButton 
                                color="error"
                                onClick={() => handleCancelarEdicion(index)}
                                sx={{ 
                                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(244, 67, 54, 0.2)'
                                  }
                                }}
                              >
                                <Cancel />
                              </IconButton>
                            </Box>
                          ) : (
                            <IconButton 
                              color="primary"
                              onClick={() => handleEditarCalificacion(index)}
                              sx={{ 
                                bgcolor: 'rgba(93, 169, 233, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(93, 169, 233, 0.2)'
                                }
                              }}
                            >
                              <EditIcon />
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

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleGuardarTodo}
              disabled={saving}
              sx={{ borderRadius: 20 }}
            >
              {saving ? 'Guardando...' : 'Guardar Todos los Cambios'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Cambios guardados exitosamente"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default EditarCalificacion;