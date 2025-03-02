// src/pages/escuelas/DetalleEscuela.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Group as GroupIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';

// Interfaz para la escuela
interface Escuela {
  _id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  director: string;
  estado: 'ACTIVO' | 'INACTIVO';
  createdAt: string;
  updatedAt: string;
}

// Interfaz para las estadísticas
interface Estadisticas {
  totalUsuarios: number;
  estudiantes: number;
  docentes: number;
  administradores: number;
  cursos: number;
  asignaturas: number;
}

const DetalleEscuela = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [escuela, setEscuela] = useState<Escuela | null>(null);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    totalUsuarios: 0,
    estudiantes: 0,
    docentes: 0,
    administradores: 0,
    cursos: 0,
    asignaturas: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cargar datos de la escuela
  useEffect(() => {
    cargarEscuela();
  }, [id]);
  
  const cargarEscuela = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener datos de la escuela
      const response = await axiosInstance.get(`/escuelas/${id}`);
      setEscuela(response.data.data);
      
      // Obtener estadísticas (en una implementación real, probablemente se obtendrían en una llamada separada)
      // Aquí simulamos datos de ejemplo
      setEstadisticas({
        totalUsuarios: 150,
        estudiantes: 120,
        docentes: 25,
        administradores: 5,
        cursos: 8,
        asignaturas: 12,
      });
      
    } catch (err: any) {
      console.error('Error al cargar escuela:', err);
      setError('No se pudo cargar la información de la escuela. ' + (err.response?.data?.message || 'Error del servidor'));
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/escuelas')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h1" color="primary.main">
            Detalle de Escuela
          </Typography>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  
  if (!escuela) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/escuelas')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h1" color="primary.main">
            Detalle de Escuela
          </Typography>
        </Box>
        <Alert severity="info">No se encontró la escuela solicitada.</Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/escuelas')} 
          sx={{ mr: 2, bgcolor: 'rgba(0, 0, 0, 0.04)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" color="primary.main" sx={{ flexGrow: 1 }}>
          Detalle de Escuela
        </Typography>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/escuelas/editar/${id}`)}
          sx={{ ml: 2 }}
        >
          Editar
        </Button>
      </Box>
      
      {/* Información principal */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                <Typography variant="h3" color="primary.main">
                  {escuela.nombre}
                </Typography>
              </Box>
              <Chip 
                label={escuela.estado} 
                color={escuela.estado === 'ACTIVO' ? 'success' : 'default'}
                sx={{ borderRadius: 8 }}
              />
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Dirección
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <LocationIcon color="action" sx={{ mr: 1, mt: 0.5 }} />
              <Typography variant="body1">
                {escuela.direccion}, {escuela.ciudad}
              </Typography>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Contacto
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{escuela.email}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{escuela.telefono}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Director
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{escuela.director}</Typography>
            </Box>
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Información del Sistema
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">
                ID: {escuela._id}
              </Typography>
              <Typography variant="body2">
                Fecha de registro: {new Date(escuela.createdAt).toLocaleDateString()}
              </Typography>
              <Typography variant="body2">
                Última actualización: {new Date(escuela.updatedAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Estadísticas */}
      <Typography variant="h3" color="primary.main" gutterBottom>
        Estadísticas
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} sx={{ height: '100%', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <GroupIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" gutterBottom>Total Usuarios</Typography>
              <Typography variant="h1" color="primary.main">{estadisticas.totalUsuarios}</Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Estudiantes: {estadisticas.estudiantes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Docentes: {estadisticas.docentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Administradores: {estadisticas.administradores}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} sx={{ height: '100%', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SchoolIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" gutterBottom>Cursos</Typography>
              <Typography variant="h1" color="secondary.main">{estadisticas.cursos}</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/cursos', { state: { escuelaId: id } })}
              >
                Ver Cursos
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={0} sx={{ height: '100%', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MenuBookIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" gutterBottom>Asignaturas</Typography>
              <Typography variant="h1" color="success.main">{estadisticas.asignaturas}</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/asignaturas', { state: { escuelaId: id } })}
              >
                Ver Asignaturas
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetalleEscuela;