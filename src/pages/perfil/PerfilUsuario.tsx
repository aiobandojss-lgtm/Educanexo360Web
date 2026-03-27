// src/pages/perfil/PerfilUsuario.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Person,
  Email,
  School,
  Badge,
  Edit,
  Lock,
  AccessTime,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { RootState } from '../../redux/store';
import { useDetalleUsuarioPerfil } from '../../hooks/useAppQueries';

// Interfaces para manejar diferentes tipos de datos
interface EscuelaId {
  _id?: string;
  [key: string]: any;
}

interface UserData {
  _id: string;
  email: string;
  nombre: string;
  apellidos: string;
  tipo: string;
  escuelaId: string | EscuelaId;
  cursoId?: any;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

const PerfilUsuario = () => {
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: queryData, isLoading: loading, error: queryError } = useDetalleUsuarioPerfil(user?._id || '');
  const userDetails: UserData | null = (queryData?.userData as UserData) ?? null;
  const escuela = queryData?.escuela ?? null;
  const error = queryError ? 'Error al cargar datos del perfil' : null;
  
  const navigateToEdit = () => {
    navigate('/perfil/editar');
  };
  
  const navigateToChangePassword = () => {
    navigate('/perfil/cambiar-password');
  };
  
  // Función para mostrar el nombre del curso de forma segura
  const getCursoNombre = (cursoId: any): string => {
    if (!cursoId) return 'No asignado';
    
    if (typeof cursoId === 'string') {
      return cursoId;
    } else if (cursoId && typeof cursoId === 'object' && 'nombre' in cursoId) {
      return cursoId.nombre || 'No disponible';
    }
    
    return String(cursoId);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }
  
  if (!userDetails) {
    return (
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        No se encontró información del usuario
      </Alert>
    );
  }
  
  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Mi Perfil
      </Typography>
      
      <Grid container spacing={3}>
        {/* Información principal */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mr: 2 
                  }}
                >
                  {userDetails.nombre ? userDetails.nombre.charAt(0) : ''}
                  {userDetails.apellidos ? userDetails.apellidos.charAt(0) : ''}
                </Avatar>
                <Box>
                  <Typography variant="h3" color="primary.main">
                    {userDetails.nombre} {userDetails.apellidos}
                  </Typography>
                  <Chip 
                    label={userDetails.tipo} 
                    color="secondary"
                    size="small"
                    sx={{ borderRadius: 8, mt: 1 }}
                  />
                </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<Edit />}
                onClick={navigateToEdit}
                sx={{ borderRadius: 20 }}
              >
                Editar Perfil
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Email sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Correo Electrónico
                    </Typography>
                    <Typography variant="body1">
                      {userDetails.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <School sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Escuela
                    </Typography>
                    <Typography variant="body1">
                      {escuela ? escuela.nombre : 'No asignada'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Badge sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Rol
                    </Typography>
                    <Typography variant="body1">
                      {userDetails.tipo === 'ADMIN' ? 'Administrador' : 
                       userDetails.tipo === 'DOCENTE' ? 'Docente' :
                       userDetails.tipo === 'ESTUDIANTE' ? 'Estudiante' :
                       userDetails.tipo === 'ACUDIENTE' ? 'Acudiente' : 
                       userDetails.tipo === 'PADRE' ? 'Acudiente' : // Por compatibilidad con datos existentes
                       userDetails.tipo}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <AccessTime sx={{ mr: 2, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Miembro desde
                    </Typography>
                    <Typography variant="body1">
                      {userDetails.createdAt ? format(new Date(userDetails.createdAt), 'dd/MM/yyyy') : 'No disponible'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                startIcon={<Lock />}
                onClick={navigateToChangePassword}
                sx={{ borderRadius: 20 }}
              >
                Cambiar Contraseña
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Información adicional */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%'
            }}
          >
            <CardContent>
              <Typography variant="h3" gutterBottom>
                Información Adicional
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {userDetails.tipo === 'ESTUDIANTE' && (
                  <ListItem divider>
                    <ListItemText 
                      primary="Curso" 
                      secondary={getCursoNombre(userDetails.cursoId)} 
                    />
                  </ListItem>
                )}
                
                {userDetails.tipo === 'DOCENTE' && (
                  <ListItem divider>
                    <ListItemText 
                      primary="Asignaturas" 
                      secondary="Ver en sección de asignaturas" 
                    />
                  </ListItem>
                )}
                
                {(userDetails.tipo === 'PADRE' || userDetails.tipo === 'ACUDIENTE') && (
                  <ListItem divider>
                    <ListItemText 
                      primary="Estudiantes asociados" 
                      secondary="Ver en sección de estudiantes" 
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemText 
                    primary="Estado de la cuenta" 
                    secondary={
                      <Chip 
                        label={userDetails.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'} 
                        color={userDetails.estado === 'ACTIVO' ? 'success' : 'error'}
                        size="small"
                        sx={{ borderRadius: 8, mt: 0.5 }}
                      />
                    } 
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerfilUsuario;