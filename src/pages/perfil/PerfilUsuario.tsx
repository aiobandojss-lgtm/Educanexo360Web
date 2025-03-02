// src/pages/perfil/PerfilUsuario.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  IconButton,
} from '@mui/material';
import {
  Person,
  Edit,
  Lock,
  Notifications,
  Email,
  School,
  PersonOutline,
  AccessTime,
  Settings,
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import { loginSuccess } from '../../redux/slices/authSlice';
import usuarioService from '../../services/usuarioService';
import axiosInstance from '../../api/axiosConfig';

// Interfaz para el estado de las pestañas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente para el panel de pestañas
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`perfil-tabpanel-${index}`}
      aria-labelledby={`perfil-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [escuela, setEscuela] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Estado para las preferencias de notificaciones
  const [notificaciones, setNotificaciones] = useState({
    emailCalificaciones: true,
    emailMensajes: true,
    emailAnuncios: true,
    pushCalificaciones: false,
    pushMensajes: true,
    pushAnuncios: false,
  });

  useEffect(() => {
    if (user) {
      cargarDatosUsuario();
    }
  }, [user]);

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar información detallada del usuario
      const response = await usuarioService.obtenerUsuario(user?._id || '');
      
      if (response.success) {
        setUserDetails(response.data);
        
        // Cargar información de la escuela
        if (response.data.escuelaId) {
          const escuelaResponse = await axiosInstance.get(`/escuelas/${response.data.escuelaId._id || response.data.escuelaId}`);
          if (escuelaResponse.data?.success) {
            setEscuela(escuelaResponse.data.data);
          }
        }
      } else {
        throw new Error('Error al cargar datos del usuario');
      }
    } catch (err: any) {
      console.error('Error al cargar datos del perfil:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditarPerfil = () => {
    navigate('/perfil/editar');
  };

  const handleCambiarPassword = () => {
    navigate('/perfil/cambiar-password');
  };

  const handleNotificacionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificaciones({
      ...notificaciones,
      [event.target.name]: event.target.checked,
    });
  };

  // Formatear fechas
  const formatDate = (dateString: string | undefined) => {
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          mt: 2,
          borderRadius: 2,
          '& .MuiAlert-message': {
            fontWeight: 500
          }
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!userDetails) {
    return (
      <Alert 
        severity="info" 
        sx={{ 
          mt: 2,
          borderRadius: 2,
          '& .MuiAlert-message': {
            fontWeight: 500
          }
        }}
      >
        No se pudo cargar la información del perfil. Intente nuevamente más tarde.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Mi Perfil
      </Typography>

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {success}
        </Alert>
      )}

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
              bgcolor: getAvatarBgColor(userDetails.tipo), 
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
                  color: getAvatarBgColor(userDetails.tipo),
                  fontSize: 36,
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                {getInitials(userDetails.nombre, userDetails.apellidos)}
              </Avatar>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {userDetails.nombre} {userDetails.apellidos}
              </Typography>
              <Typography variant="body1" gutterBottom>
                {getTipoLabel(userDetails.tipo)}
              </Typography>
            </Box>
            
            <CardContent sx={{ py: 3 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Edit />}
                onClick={handleEditarPerfil}
                sx={{ 
                  mb: 2,
                  borderRadius: 20,
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                Editar Perfil
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Lock />}
                onClick={handleCambiarPassword}
                sx={{ 
                  borderRadius: 20
                }}
              >
                Cambiar Contraseña
              </Button>
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
            <Box sx={{ px: 3, py: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h3">Información de Usuario</Typography>
            </Box>

            <Box sx={{ px: 3, py: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                }}
              >
                <Tab 
                  label="Datos Personales" 
                  icon={<Person />} 
                  iconPosition="start"
                  sx={{ textTransform: 'none', minHeight: 48 }}
                />
                <Tab 
                  label="Notificaciones" 
                  icon={<Notifications />} 
                  iconPosition="start"
                  sx={{ textTransform: 'none', minHeight: 48 }}
                />
              </Tabs>

              {/* Panel de Datos Personales */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Nombre Completo</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {userDetails.nombre} {userDetails.apellidos}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Correo Electrónico</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {userDetails.email}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Tipo de Usuario</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {getTipoLabel(userDetails.tipo)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Escuela</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {escuela?.nombre || (
                        typeof userDetails.escuelaId === 'object' 
                          ? userDetails.escuelaId?.nombre 
                          : 'No especificada'
                      )}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {userDetails.estado}
                    </Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Miembro desde</Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {formatDate(userDetails.createdAt)}
                    </Typography>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Panel de Notificaciones */}
              <TabPanel value={tabValue} index={1}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 0,
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Notificaciones por Email" 
                        primaryTypographyProps={{ color: 'primary.main', fontWeight: 'bold' }} 
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Nuevas calificaciones" 
                        secondary="Recibir notificaciones cuando se registre una nueva calificación" 
                      />
                      <Switch
                        name="emailCalificaciones"
                        checked={notificaciones.emailCalificaciones}
                        onChange={handleNotificacionChange}
                        color="primary"
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Mensajes nuevos" 
                        secondary="Recibir notificaciones cuando reciba un nuevo mensaje" 
                      />
                      <Switch
                        name="emailMensajes"
                        checked={notificaciones.emailMensajes}
                        onChange={handleNotificacionChange}
                        color="primary"
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Anuncios y comunicados" 
                        secondary="Recibir notificaciones sobre anuncios generales" 
                      />
                      <Switch
                        name="emailAnuncios"
                        checked={notificaciones.emailAnuncios}
                        onChange={handleNotificacionChange}
                        color="primary"
                      />
                    </ListItem>
                    
                    <Divider />
                    
                    <ListItem sx={{ mt: 2 }}>
                      <ListItemIcon>
                        <Notifications color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Notificaciones Push" 
                        primaryTypographyProps={{ color: 'primary.main', fontWeight: 'bold' }} 
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Nuevas calificaciones" 
                        secondary="Recibir notificaciones cuando se registre una nueva calificación" 
                      />
                      <Switch
                        name="pushCalificaciones"
                        checked={notificaciones.pushCalificaciones}
                        onChange={handleNotificacionChange}
                        color="primary"
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Mensajes nuevos" 
                        secondary="Recibir notificaciones cuando reciba un nuevo mensaje" 
                      />
                      <Switch
                        name="pushMensajes"
                        checked={notificaciones.pushMensajes}
                        onChange={handleNotificacionChange}
                        color="primary"
                      />
                    </ListItem>
                    
                    <Divider component="li" />
                    
                    <ListItem>
                      <ListItemText 
                        primary="Anuncios y comunicados" 
                        secondary="Recibir notificaciones sobre anuncios generales" 
                      />
                      <Switch
                        name="pushAnuncios"
                        checked={notificaciones.pushAnuncios}
                        onChange={handleNotificacionChange}
                        color="primary"
                      />
                    </ListItem>
                  </List>
                  
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setSuccess('Preferencias de notificaciones guardadas exitosamente')}
                      sx={{ 
                        borderRadius: 20,
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      Guardar Preferencias
                    </Button>
                  </Box>
                </Paper>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerfilUsuario;