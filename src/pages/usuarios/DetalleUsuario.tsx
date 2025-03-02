// src/pages/usuarios/DetalleUsuario.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Person,
  Email,
  School,
  VerifiedUser,
  CalendarToday,
  AccessTime,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface UsuarioDetalle {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  estado: string;
  escuelaId: {
    _id: string;
    nombre: string;
  };
  createdAt: string;
  updatedAt: string;
  // Más campos que pueda tener el usuario
}

const DetalleUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  useEffect(() => {
    cargarUsuario();
  }, [id]);

  const cargarUsuario = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(`/usuarios/${id}`);
      
      if (response.data?.success) {
        setUsuario(response.data.data);
      } else {
        throw new Error('Error al cargar usuario');
      }
    } catch (err: any) {
      console.error('Error al cargar usuario:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del usuario');
    } finally {
      setLoading(false);
    }
  };

  // Obtener etiqueta para el tipo de usuario
  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN': return 'Administrador';
      case 'DOCENTE': return 'Docente';
      case 'PADRE': return 'Padre de Familia';
      case 'ESTUDIANTE': return 'Estudiante';
      default: return tipo;
    }
  };

  // Obtener color para el chip de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      default: return 'default';
    }
  };

  // Obtener color para el chip de tipo de usuario
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN': return 'secondary';
      case 'DOCENTE': return 'primary';
      case 'PADRE': return 'info';
      case 'ESTUDIANTE': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Obtener iniciales para el avatar
  const getInitials = (nombre: string, apellidos: string) => {
    if (!nombre || !apellidos) return '?';
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  // Obtener color de fondo para el avatar según el tipo
  const getAvatarBgColor = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN': return '#003F91'; // Color principal
      case 'DOCENTE': return '#5DA9E9'; // Color secundario
      case 'PADRE': return '#4CAF50'; // Verde
      case 'ESTUDIANTE': return '#FFC107'; // Amarillo
      default: return '#f8f9fa'; // Gris claro
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/usuarios')}
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

  if (!usuario) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/usuarios')}
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
          No se encontró información del usuario
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
          onClick={() => navigate('/usuarios')}
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
            onClick={() => navigate(`/usuarios/editar/${usuario._id}`)}
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
            color="primary"
            onClick={() => navigate(`/usuarios/${usuario._id}/cambiar-password`)}
            sx={{ 
              borderRadius: 20,
              '&:hover': {
                backgroundColor: 'rgba(0, 63, 145, 0.04)'
              }
            }}
          >
            Cambiar Contraseña
          </Button>
          
          {user?._id !== usuario._id && (
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
          )}
        </Box>
      </Box>

      {/* Información del usuario */}
      <Grid container spacing={3}>
        {/* Tarjeta de perfil */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box sx={{ 
              bgcolor: getAvatarBgColor(usuario.tipo), 
              color: 'white', 
              py: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <Avatar 
                sx={{ 
                  width: 100, 
                  height: 100, 
                  bgcolor: 'white', 
                  color: getAvatarBgColor(usuario.tipo),
                  fontSize: 36,
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {getInitials(usuario.nombre, usuario.apellidos)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {usuario.nombre} {usuario.apellidos}
              </Typography>
              <Chip
                label={getTipoLabel(usuario.tipo)}
                color={getTipoColor(usuario.tipo) as any}
                sx={{ 
                  fontWeight: 'bold', 
                  borderRadius: 8,
                  bgcolor: 'white',
                  color: getAvatarBgColor(usuario.tipo)
                }}
              />
            </Box>
            <CardContent>
              <List>
                <ListItem>
                  <Email color="primary" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Correo electrónico"
                    secondary={usuario.email}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <School color="primary" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Escuela"
                    secondary={usuario.escuelaId?.nombre || 'No especificado'}
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                    secondaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <VerifiedUser color="primary" sx={{ mr: 2 }} />
                  <ListItemText
                    primary="Estado"
                    secondary={
                      <Chip
                        label={usuario.estado}
                        color={getEstadoColor(usuario.estado) as any}
                        size="small"
                        sx={{ fontWeight: 'bold', borderRadius: 8 }}
                      />
                    }
                    primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Información detallada */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%'
            }}
          >
            <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
              <Typography variant="h3">Información detallada</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h3" color="primary.main" gutterBottom>Datos del Usuario</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Nombre Completo</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {usuario.nombre} {usuario.apellidos}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Correo Electrónico</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {usuario.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Tipo de Usuario</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {getTipoLabel(usuario.tipo)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {usuario.estado}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Escuela</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {usuario.escuelaId?.nombre || 'No especificado'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">ID de Usuario</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {usuario._id}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h3" color="primary.main" gutterBottom>Información del Sistema</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de Registro</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {formatDate(usuario.createdAt)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Última Actualización</Typography>
                  <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                    {formatDate(usuario.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para eliminar usuario */}
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
            ¿Está seguro que desea desactivar el usuario {usuario.nombre} {usuario.apellidos}? Esta acción no se puede deshacer.
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
            onClick={async () => {
              try {
                await axiosInstance.delete(`/usuarios/${usuario._id}`);
                navigate('/usuarios', { state: { message: 'Usuario eliminado exitosamente' } });
              } catch (err) {
                console.error('Error al eliminar usuario:', err);
                setError('No se pudo eliminar el usuario');
                setDeleteDialog(false);
              }
            }} 
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

export default DetalleUsuario;