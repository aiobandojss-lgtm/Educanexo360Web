// src/pages/logros/DetalleLogro.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  MenuBook,
  School,
  CalendarToday,
  Assignment,
  Timeline,
  CheckCircle,
  Person,
} from '@mui/icons-material';
import logroService, { Logro } from '../../services/logroService';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const DetalleLogro = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logro, setLogro] = useState<Logro | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      cargarLogro();
    }
  }, [id]);

  const cargarLogro = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await logroService.obtenerLogro(id);
      
      if (response.success) {
        setLogro(response.data);
      } else {
        throw new Error('Error al cargar el logro académico');
      }
    } catch (err: any) {
      console.error('Error al cargar logro:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del logro académico');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      await logroService.eliminarLogro(id);
      navigate('/logros', { state: { message: 'Logro eliminado exitosamente' } });
    } catch (err: any) {
      console.error('Error al eliminar logro:', err);
      setError(err.response?.data?.message || 'No se pudo eliminar el logro');
    } finally {
      setLoading(false);
      setDeleteDialog(false);
    }
  };

  // Obtener etiqueta para el estado del logro
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'Activo';
      case 'INACTIVO': return 'Inactivo';
      case 'COMPLETADO': return 'Completado';
      default: return estado;
    }
  };

  // Obtener color para el chip de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      case 'COMPLETADO': return 'info';
      default: return 'default';
    }
  };

  if (loading && !logro) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !logro) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/logros')}
          sx={{ mb: 3 }}
        >
          Volver a la lista
        </Button>
        
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
      </Box>
    );
  }

  if (!logro) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/logros')}
          sx={{ mb: 3 }}
        >
          Volver a la lista
        </Button>
        
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          No se encontró información del logro académico
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/logros')}
          sx={{ 
            borderRadius: 20,
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: 'text.secondary'
          }}
        >
          Volver a la lista
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Edit />}
            onClick={() => navigate(`/logros/editar/${logro._id}`)}
            sx={{ 
              borderRadius: 20,
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Editar
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={() => setDeleteDialog(true)}
            sx={{ 
              borderRadius: 20,
              borderColor: 'error.main',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.04)'
              }
            }}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      <Typography variant="h1" color="primary.main" gutterBottom>
        Detalle de Logro Académico
      </Typography>

      {error && (
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
      )}

      <Grid container spacing={3}>
        {/* Tarjeta principal con la descripción del logro */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Assignment color="primary" sx={{ mr: 1, fontSize: 32 }} />
              <Typography variant="h3" color="primary.main">
                Descripción del Logro
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {logro.descripcion}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Chip
                label={getEstadoLabel(logro.estado)}
                color={getEstadoColor(logro.estado) as any}
                sx={{ fontWeight: 'bold', borderRadius: 8 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Tarjeta con información del curso y asignatura */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 2 }}>
              <Typography variant="h3">Contexto Académico</Typography>
            </Box>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <School color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Curso"
                    secondary={
                      typeof logro.cursoId === 'object' && logro.cursoId
                        ? `${logro.cursoId.nombre || ''} (${logro.cursoId.grado || ''}° ${logro.cursoId.grupo || ''})`
                        : 'No especificado'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <MenuBook color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Asignatura"
                    secondary={
                      typeof logro.asignaturaId === 'object' && logro.asignaturaId
                        ? `${logro.asignaturaId.nombre || ''} (${logro.asignaturaId.codigo || ''})`
                        : 'No especificado'
                    }
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Periodo Académico"
                    secondary={`Periodo ${logro.periodo} - ${logro.año_academico}`}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Tarjeta con información adicional */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <Box sx={{ bgcolor: 'secondary.main', color: 'white', p: 2 }}>
              <Typography variant="h3">Evaluación</Typography>
            </Box>
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Timeline color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Peso Evaluativo"
                    secondary={`${logro.peso}% del total de la asignatura en el periodo`}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Estado"
                    secondary={getEstadoLabel(logro.estado)}
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                
                <Divider variant="inset" component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <Person color="secondary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Registrado por"
                    secondary="Administrador del Sistema"
                    primaryTypographyProps={{ variant: 'subtitle2', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Información de fechas */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Fecha de creación: {new Date(logro.createdAt || '').toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                <Typography variant="caption" color="text.secondary">
                  Última actualización: {new Date(logro.updatedAt || '').toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar logro */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este logro académico? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialog(false)} 
            color="inherit"
            sx={{ 
              borderRadius: 20,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleEliminar} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 20,
              px: 3,
              boxShadow: 'none'
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleLogro;