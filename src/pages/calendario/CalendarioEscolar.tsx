// src/pages/calendario/CalendarioEscolar.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  CalendarMonth as CalendarIcon,
  Event as EventIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Today as TodayIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { RootState } from '../../redux/store';
import { useNotificacion } from '../../components/common/Notificaciones';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Yup from 'yup';
import { Formik, Form } from 'formik';

// Interfaz para evento
interface EventoCalendario {
  _id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  tipo: 'ACADEMICO' | 'ADMINISTRATIVO' | 'FESTIVO' | 'OTRO';
  escuelaId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Esquema de validación para eventos
const eventoSchema = Yup.object().shape({
  titulo: Yup.string().required('El título es requerido').max(100, 'Máximo 100 caracteres'),
  descripcion: Yup.string().max(500, 'Máximo 500 caracteres'),
  fecha: Yup.date().required('La fecha es requerida'),
  horaInicio: Yup.string(),
  horaFin: Yup.string(),
  tipo: Yup.string().required('El tipo es requerido'),
});

const CalendarioEscolar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { mostrarNotificacion } = useNotificacion();
  
  // Estados
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<EventoCalendario | null>(null);
  const [dialogEvento, setDialogEvento] = useState(false);
  const [dialogDetalleEvento, setDialogDetalleEvento] = useState(false);
  const [dialogConfirmacion, setDialogConfirmacion] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determinar si el usuario puede crear/editar eventos
  const puedeEditarEventos = ['ADMIN', 'DOCENTE'].includes(user?.tipo || '');
  
  // Cargar eventos
  useEffect(() => {
    cargarEventos();
  }, [currentDate]);
  
  const cargarEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      // En una implementación real, haríamos la llamada a la API
      // const response = await axiosInstance.get('/eventos', {
      //   params: { startDate, endDate }
      // });
      // setEventos(response.data.data);
      
      // Para este ejemplo, generamos datos de muestra
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEventos(generarEventosMuestra());
      
    } catch (err: any) {
      console.error('Error al cargar eventos:', err);
      setError('No se pudieron cargar los eventos. ' + (err.response?.data?.message || 'Error del servidor'));
    } finally {
      setLoading(false);
    }
  };
  
  // Generar eventos de muestra para el demo
  const generarEventosMuestra = (): EventoCalendario[] => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    
    const eventos: EventoCalendario[] = [
      {
        _id: '1',
        titulo: 'Entrega de boletines',
        descripcion: 'Entrega de boletines del primer periodo a padres de familia',
        fecha: format(addDays(startDate, 10), 'yyyy-MM-dd'),
        horaInicio: '08:00',
        horaFin: '12:00',
        tipo: 'ACADEMICO',
        escuelaId: user?.escuelaId || '',
        createdBy: user?._id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '2',
        titulo: 'Día festivo - No hay clases',
        descripcion: 'Festivo nacional',
        fecha: format(addDays(startDate, 15), 'yyyy-MM-dd'),
        tipo: 'FESTIVO',
        escuelaId: user?.escuelaId || '',
        createdBy: user?._id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: '3',
        titulo: 'Reunión de profesores',
        descripcion: 'Reunión general de profesores para evaluación del periodo',
        fecha: format(addDays(startDate, 20), 'yyyy-MM-dd'),
        horaInicio: '14:00',
        horaFin: '16:00',
        tipo: 'ADMINISTRATIVO',
        escuelaId: user?.escuelaId || '',
        createdBy: user?._id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    return eventos;
  };
  
  // Navegar al mes anterior
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  // Navegar al mes siguiente
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  // Ir al mes actual
  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Abrir diálogo para crear evento
  const handleNuevoEvento = () => {
    setEventoSeleccionado(null);
    setDialogEvento(true);
  };
  
  // Abrir diálogo para editar evento
  const handleEditarEvento = (evento: EventoCalendario) => {
    setEventoSeleccionado(evento);
    setDialogEvento(true);
  };
  
  // Ver detalle de evento
  const handleVerEvento = (evento: EventoCalendario) => {
    setEventoSeleccionado(evento);
    setDialogDetalleEvento(true);
  };
  
  // Confirmar eliminación de evento
  const handleConfirmarEliminar = (evento: EventoCalendario) => {
    setEventoSeleccionado(evento);
    setDialogConfirmacion(true);
  };
  
  // Eliminar evento
  const handleEliminarEvento = async () => {
    if (!eventoSeleccionado) return;
    
    try {
      setLoading(true);
      
      // En una implementación real, haríamos la llamada a la API
      // await axiosInstance.delete(`/eventos/${eventoSeleccionado._id}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar lista de eventos
      setEventos(prev => prev.filter(e => e._id !== eventoSeleccionado._id));
      
      // Cerrar diálogo
      setDialogConfirmacion(false);
      setEventoSeleccionado(null);
      
      // Notificar
      mostrarNotificacion('Evento eliminado exitosamente', 'success');
      
    } catch (err: any) {
      console.error('Error al eliminar evento:', err);
      mostrarNotificacion(
        'Error al eliminar el evento: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Guardar evento (crear o actualizar)
  const handleGuardarEvento = async (values: any) => {
    try {
      setLoading(true);
      
      const eventoData = {
        ...values,
        escuelaId: user?.escuelaId,
      };
      
      if (eventoSeleccionado) {
        // En una implementación real, haríamos la llamada a la API para actualizar
        // await axiosInstance.put(`/eventos/${eventoSeleccionado._id}`, eventoData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Actualizar lista de eventos
        setEventos(prev => prev.map(e => 
          e._id === eventoSeleccionado._id 
            ? { ...eventoSeleccionado, ...eventoData, updatedAt: new Date().toISOString() } 
            : e
        ));
        
        mostrarNotificacion('Evento actualizado exitosamente', 'success');
      } else {
        // En una implementación real, haríamos la llamada a la API para crear
        // const response = await axiosInstance.post('/eventos', eventoData);
        // const nuevoEvento = response.data.data;
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Crear un evento simulado para el ejemplo
        const nuevoEvento: EventoCalendario = {
          _id: Date.now().toString(),
          ...eventoData,
          createdBy: user?._id || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Actualizar lista de eventos
        setEventos(prev => [...prev, nuevoEvento]);
        
        mostrarNotificacion('Evento creado exitosamente', 'success');
      }
      
      // Cerrar diálogo
      setDialogEvento(false);
      setEventoSeleccionado(null);
      
    } catch (err: any) {
      console.error('Error al guardar evento:', err);
      mostrarNotificacion(
        'Error al guardar el evento: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar el calendario
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    // Encabezados de días de la semana
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    // Renderizar días de la semana
    const weekDays = diasSemana.map(dia => (
      <Box 
        key={dia} 
        sx={{ 
          width: '14.2%', 
          textAlign: 'center', 
          py: 1,
          fontWeight: 'bold',
          color: dia === 'Dom' ? 'error.main' : 'inherit',
        }}
      >
        {dia}
      </Box>
    ));
    
    // Mientras no lleguemos a la fecha final
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        // Eventos para este día
        const dayFormatted = format(day, 'yyyy-MM-dd');
        const dayEventos = eventos.filter(evento => evento.fecha === dayFormatted);
        
        // Determinar el color de fondo
        const isSameMonthValue = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        
        days.push(
          <Box
            key={day.toString()}
            onClick={() => dayEventos.length > 0 && handleVerEvento(dayEventos[0])}
            sx={{
              width: '14.2%',
              height: 100,
              border: '1px solid',
              borderColor: 'divider',
              p: 1,
              backgroundColor: isToday 
                ? 'primary.light' 
                : (isSameMonthValue ? 'background.paper' : 'background.default'),
              color: isToday 
                ? 'white' 
                : (isSameMonthValue ? 'text.primary' : 'text.secondary'),
              opacity: isSameMonthValue ? 1 : 0.5,
              position: 'relative',
              '&:hover': {
                backgroundColor: isToday 
                  ? 'primary.main' 
                  : (isSameMonthValue ? 'rgba(93, 169, 233, 0.1)' : 'background.default'),
              },
              cursor: dayEventos.length > 0 ? 'pointer' : 'default',
              overflow: 'hidden',
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isToday ? 'bold' : 'normal',
                textAlign: 'right',
                mb: 0.5,
              }}
            >
              {format(day, 'd')}
            </Typography>
            
            {dayEventos.slice(0, 2).map((evento, index) => (
              <Chip
                key={evento._id}
                label={evento.titulo}
                size="small"
                sx={{
                  mb: 0.5,
                  fontSize: '0.65rem',
                  height: 20,
                  maxWidth: '100%',
                  backgroundColor: (() => {
                    switch (evento.tipo) {
                      case 'ACADEMICO': return '#e3f2fd';
                      case 'ADMINISTRATIVO': return '#e8f5e9';
                      case 'FESTIVO': return '#ffebee';
                      default: return '#ede7f6';
                    }
                  })(),
                  color: (() => {
                    switch (evento.tipo) {
                      case 'ACADEMICO': return '#1565c0';
                      case 'ADMINISTRATIVO': return '#2e7d32';
                      case 'FESTIVO': return '#c62828';
                      default: return '#5e35b1';
                    }
                  })(),
                  '& .MuiChip-label': {
                    px: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }
                }}
              />
            ))}
            
            {dayEventos.length > 2 && (
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 0.5, fontSize: '0.65rem' }}>
                +{dayEventos.length - 2} más
              </Typography>
            )}
          </Box>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <Box key={day.toString()} sx={{ display: 'flex', width: '100%' }}>
          {days}
        </Box>
      );
      days = [];
    }
    
    return (
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 1, overflow: 'hidden' }}>
        {/* Encabezados de días */}
        <Box sx={{ display: 'flex', bgcolor: 'primary.main', color: 'white' }}>
          {weekDays}
        </Box>
        
        {/* Días del calendario */}
        <Box>
          {rows}
        </Box>
      </Box>
    );
  };
  
  // Función para obtener color según tipo de evento
  const getTipoEventoColor = (tipo: string) => {
    switch (tipo) {
      case 'ACADEMICO': return 'primary';
      case 'ADMINISTRATIVO': return 'success';
      case 'FESTIVO': return 'error';
      default: return 'secondary';
    }
  };
  
  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Calendario Escolar
      </Typography>
      
      {/* Cabecera del calendario */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handlePrevMonth} sx={{ mr: 1 }}>
                <ChevronLeftIcon />
              </IconButton>
              
              <Typography variant="h3" sx={{ flexGrow: 1, textAlign: { xs: 'left', md: 'center' } }}>
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </Typography>
              
              <IconButton onClick={handleNextMonth} sx={{ ml: 1 }}>
                <ChevronRightIcon />
              </IconButton>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<TodayIcon />}
                onClick={handleCurrentMonth}
                size="small"
              >
                Hoy
              </Button>
              
              {puedeEditarEventos && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={handleNuevoEvento}
                  size="small"
                >
                  Nuevo Evento
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Leyenda de eventos */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Typography variant="h5" gutterBottom>Tipos de Eventos</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Chip 
            icon={<EventIcon />} 
            label="Académico" 
            color="primary" 
            size="small"
            variant="outlined"
          />
          <Chip 
            icon={<EventAvailableIcon />} 
            label="Administrativo" 
            color="success" 
            size="small"
            variant="outlined"
          />
          <Chip 
            icon={<EventBusyIcon />} 
            label="Festivo" 
            color="error" 
            size="small"
            variant="outlined"
          />
          <Chip 
            icon={<CalendarIcon />} 
            label="Otro" 
            color="secondary" 
            size="small"
            variant="outlined"
          />
        </Box>
      </Paper>
      
      {/* Calendario */}
      {loading && eventos.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : (
        <Box sx={{ mb: 3 }}>
          {renderCalendar()}
        </Box>
      )}
      
      {/* Lista de eventos del mes */}
      <Typography variant="h3" color="primary.main" gutterBottom>
        Eventos del Mes
      </Typography>
      
      <Grid container spacing={3}>
        {loading && eventos.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        ) : eventos.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
              <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
              <Typography variant="h3" color="text.secondary" gutterBottom>
                No hay eventos este mes
              </Typography>
              {puedeEditarEventos && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleNuevoEvento}
                  sx={{ mt: 2 }}
                >
                  Crear Nuevo Evento
                </Button>
              )}
            </Paper>
          </Grid>
        ) : (
          eventos.map(evento => (
            <Grid item xs={12} md={6} lg={4} key={evento._id}>
              <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Chip 
                      label={evento.tipo} 
                      color={getTipoEventoColor(evento.tipo) as any} 
                      size="small"
                      sx={{ borderRadius: 8 }}
                    />
                    
                    {puedeEditarEventos && (
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditarEvento(evento)}
                          sx={{ 
                            bgcolor: 'rgba(0, 63, 145, 0.1)',
                            mr: 1,
                            '&:hover': {
                              bgcolor: 'rgba(0, 63, 145, 0.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          onClick={() => handleConfirmarEliminar(evento)}
                          sx={{ 
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(244, 67, 54, 0.2)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  
                  <Typography variant="h5" gutterBottom>
                    {evento.titulo}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {new Date(evento.fecha).toLocaleDateString()}
                      {evento.horaInicio && ` - ${evento.horaInicio}`}
                      {evento.horaFin && ` a ${evento.horaFin}`}
                    </Typography>
                  </Box>
                  
                  {evento.descripcion && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {evento.descripcion.length > 100 
                        ? `${evento.descripcion.substring(0, 100)}...` 
                        : evento.descripcion}
                    </Typography>
                  )}
                  
                  <Button 
                    variant="text" 
                    onClick={() => handleVerEvento(evento)}
                    size="small"
                    sx={{ mt: 1 }}
                  >
                    Ver Detalles
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
      
      {/* Diálogo para crear/editar evento */}
      <Dialog 
        open={dialogEvento} 
        onClose={() => setDialogEvento(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          {eventoSeleccionado ? 'Editar Evento' : 'Nuevo Evento'}
        </DialogTitle>
        
        <Formik
          initialValues={eventoSeleccionado || {
            titulo: '',
            descripcion: '',
            fecha: format(new Date(), 'yyyy-MM-dd'),
            horaInicio: '',
            horaFin: '',
            tipo: 'ACADEMICO',
          }}
          validationSchema={eventoSchema}
          onSubmit={handleGuardarEvento}
        >
          {({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="titulo"
                      label="Título *"
                      value={values.titulo}
                      onChange={handleChange}
                      error={touched.titulo && Boolean(errors.titulo)}
                      helperText={touched.titulo && errors.titulo}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="descripcion"
                      label="Descripción"
                      value={values.descripcion}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      error={touched.descripcion && Boolean(errors.descripcion)}
                      helperText={touched.descripcion && errors.descripcion}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="fecha"
                      label="Fecha *"
                      type="date"
                      value={values.fecha}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                      error={touched.fecha && Boolean(errors.fecha)}
                      helperText={touched.fecha && errors.fecha}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="tipo"
                      label="Tipo de Evento *"
                      select
                      value={values.tipo}
                      onChange={handleChange}
                      error={touched.tipo && Boolean(errors.tipo)}
                      helperText={touched.tipo && errors.tipo}
                    >
                      <MenuItem value="ACADEMICO">Académico</MenuItem>
                      <MenuItem value="ADMINISTRATIVO">Administrativo</MenuItem>
                      <MenuItem value="FESTIVO">Festivo</MenuItem>
                      <MenuItem value="OTRO">Otro</MenuItem>
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="horaInicio"
                      label="Hora de Inicio"
                      type="time"
                      value={values.horaInicio}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="horaFin"
                      label="Hora de Fin"
                      type="time"
                      value={values.horaFin}
                      onChange={handleChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setDialogEvento(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={isSubmitting || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Guardar'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      
      {/* Diálogo para ver detalle de evento */}
      <Dialog 
        open={dialogDetalleEvento} 
        onClose={() => setDialogDetalleEvento(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {eventoSeleccionado && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3">{eventoSeleccionado.titulo}</Typography>
                <Chip 
                  label={eventoSeleccionado.tipo} 
                  color={getTipoEventoColor(eventoSeleccionado.tipo) as any} 
                  size="small"
                  sx={{ borderRadius: 8 }}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1">
                  {new Date(eventoSeleccionado.fecha).toLocaleDateString()}
                  {eventoSeleccionado.horaInicio && ` - ${eventoSeleccionado.horaInicio}`}
                  {eventoSeleccionado.horaFin && ` a ${eventoSeleccionado.horaFin}`}
                </Typography>
              </Box>
              
              {eventoSeleccionado.descripcion && (
                <Typography variant="body1" paragraph>
                  {eventoSeleccionado.descripcion}
                </Typography>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="caption" color="text.secondary" display="block">
                Creado: {new Date(eventoSeleccionado.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Última actualización: {new Date(eventoSeleccionado.updatedAt).toLocaleString()}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              {puedeEditarEventos && (
                <>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={() => {
                      setDialogDetalleEvento(false);
                      handleEditarEvento(eventoSeleccionado);
                    }}
                  >
                    Editar
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={() => {
                      setDialogDetalleEvento(false);
                      handleConfirmarEliminar(eventoSeleccionado);
                    }}
                  >
                    Eliminar
                  </Button>
                </>
              )}
              <Button 
                variant="contained" 
                onClick={() => setDialogDetalleEvento(false)}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={dialogConfirmacion}
        onClose={() => setDialogConfirmacion(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle id="alert-dialog-title">
          ¿Eliminar este evento?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" id="alert-dialog-description">
            {eventoSeleccionado && (
              <>
                Estás a punto de eliminar el evento <strong>{eventoSeleccionado.titulo}</strong>. 
                Esta acción no se puede deshacer.
              </>
            )}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogConfirmacion(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleEliminarEvento} color="error" variant="contained" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarioEscolar;