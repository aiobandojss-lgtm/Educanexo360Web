// src/components/usuarios/AsociarEstudiantes.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import API_ROUTES from '../../constants/apiRoutes';

interface Estudiante {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
}

interface AsociarEstudiantesProps {
  acudienteId: string;
  estudiantes: string[];
  onEstudiantesChange: (estudiantes: string[]) => void;
}

const AsociarEstudiantes: React.FC<AsociarEstudiantesProps> = ({
  acudienteId,
  estudiantes,
  onEstudiantesChange
}) => {
  const [busqueda, setBusqueda] = useState<string>('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState<Estudiante[]>([]);
  const [estudiantesAsociados, setEstudiantesAsociados] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar estudiantes asociados al inicializar
  useEffect(() => {
    const cargarEstudiantesAsociados = async () => {
      try {
        setLoading(true);
        console.log('Cargando estudiantes asociados para acudiente ID:', acudienteId);
        
        const response = await axiosInstance.get(`/usuarios/${acudienteId}/estudiantes-asociados`);
        
        if (response.data && response.data.success) {
          console.log('Estudiantes asociados cargados:', response.data.data);
          setEstudiantesAsociados(response.data.data || []);
        }
      } catch (err: any) {
        console.error('Error al cargar estudiantes asociados:', err);
        setError(err.response?.data?.message || 'Error al cargar los estudiantes asociados');
      } finally {
        setLoading(false);
      }
    };

    if (acudienteId) {
      cargarEstudiantesAsociados();
    }
  }, [acudienteId]);

  // Buscar estudiantes
  const buscarEstudiantes = async () => {
    if (!busqueda.trim()) {
      setError('Ingrese un término de búsqueda');
      return;
    }

    try {
      setBuscando(true);
      setError(null);
      console.log('Buscando estudiantes con término:', busqueda);
      
      const response = await axiosInstance.get('/usuarios', {
        params: {
          tipo: 'ESTUDIANTE',
          q: busqueda,
          estado: 'ACTIVO'
        }
      });

      if (response.data && response.data.success) {
        // Filtrar estudiantes que ya están asociados
        const estudiantesIdsAsociados = estudiantesAsociados.map(e => e._id);
        const resultados = response.data.data.filter(
          (e: Estudiante) => !estudiantesIdsAsociados.includes(e._id)
        );
        
        console.log('Resultados de búsqueda filtrados:', resultados.length);
        setResultadosBusqueda(resultados);
        
        if (resultados.length === 0) {
          setError('No se encontraron estudiantes con ese criterio de búsqueda o todos ya están asociados');
        }
      }
    } catch (err: any) {
      console.error('Error al buscar estudiantes:', err);
      setError(err.response?.data?.message || 'Error al buscar estudiantes');
    } finally {
      setBuscando(false);
    }
  };

  // Asociar estudiante
  const asociarEstudiante = async (estudiante: Estudiante) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('Asociando estudiante:', estudiante._id, 'a acudiente:', acudienteId);
      
      // Usar la ruta correcta definida en tu backend
      const response = await axiosInstance.post(`/usuarios/${acudienteId}/estudiantes-asociados`, {
        estudianteId: estudiante._id
      });
      
      if (response.data && response.data.success) {
        // Actualizar la lista de estudiantes asociados
        setEstudiantesAsociados([...estudiantesAsociados, estudiante]);
        
        // Actualizar IDs de estudiantes en el componente padre
        const nuevosIds = [...estudiantes, estudiante._id];
        onEstudiantesChange(nuevosIds);
        
        // Eliminar de resultados de búsqueda
        setResultadosBusqueda(resultadosBusqueda.filter(e => e._id !== estudiante._id));
        
        setSuccess(`${estudiante.nombre} ${estudiante.apellidos} asociado correctamente`);
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error al asociar estudiante:', err);
      setError(err.response?.data?.message || 'Error al asociar al estudiante');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar asociación
  const eliminarAsociacion = async (estudianteId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('Eliminando asociación de estudiante:', estudianteId, 'de acudiente:', acudienteId);
      
      // Usar la ruta correcta definida en tu backend
      const response = await axiosInstance.delete(`/usuarios/${acudienteId}/estudiantes-asociados/${estudianteId}`);
      
      if (response.data && response.data.success) {
        // Encontrar el estudiante para mostrar mensaje
        const estudiante = estudiantesAsociados.find(e => e._id === estudianteId);
        
        // Actualizar la lista de estudiantes asociados
        setEstudiantesAsociados(estudiantesAsociados.filter(e => e._id !== estudianteId));
        
        // Actualizar IDs de estudiantes en el componente padre
        const nuevosIds = estudiantes.filter(id => id !== estudianteId);
        onEstudiantesChange(nuevosIds);
        
        if (estudiante) {
          setSuccess(`${estudiante.nombre} ${estudiante.apellidos} desasociado correctamente`);
        } else {
          setSuccess('Estudiante desasociado correctamente');
        }
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Error al eliminar asociación:', err);
      setError(err.response?.data?.message || 'Error al eliminar la asociación del estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 3,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        mb: 3
      }}
    >
      <Typography variant="h2" color="primary.main" gutterBottom>
        Estudiantes Asociados
      </Typography>
      <Typography variant="body1" paragraph>
        Gestione los estudiantes asociados a este acudiente. Esta asociación es necesaria para que el acudiente pueda ver la información académica y recibir comunicaciones sobre sus estudiantes.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Mensajes de estado */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      
      {/* Sección de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h3" color="primary" gutterBottom>
          Buscar estudiantes
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, apellido o email"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && buscarEstudiantes()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
            size="small"
          />
          
          <Button
            variant="contained"
            color="primary"
            onClick={buscarEstudiantes}
            disabled={buscando}
            startIcon={buscando ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
            sx={{ borderRadius: 2, minWidth: '120px' }}
          >
            Buscar
          </Button>
        </Box>
        
        {/* Resultados de búsqueda */}
        {resultadosBusqueda.length > 0 && (
          <Paper 
            variant="outlined" 
            sx={{ 
              maxHeight: '250px', 
              overflow: 'auto', 
              borderRadius: 2, 
              mb: 3 
            }}
          >
            <List dense>
              <ListItem sx={{ bgcolor: 'primary.light', color: 'white' }}>
                <ListItemText 
                  primary={`Resultados (${resultadosBusqueda.length})`} 
                  primaryTypographyProps={{ fontWeight: 'bold' }}
                />
              </ListItem>
              
              {resultadosBusqueda.map((estudiante) => (
                <ListItem key={estudiante._id} divider>
                  <ListItemText
                    primary={`${estudiante.nombre} ${estudiante.apellidos}`}
                    secondary={estudiante.email}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => asociarEstudiante(estudiante)}
                    disabled={loading}
                    size="small"
                    sx={{ borderRadius: 20 }}
                  >
                    Asociar
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
      
      {/* Lista de estudiantes asociados */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h3" color="primary">
            Estudiantes asociados actualmente
          </Typography>
          
          <Chip 
            label={`Total: ${estudiantesAsociados.length}`} 
            color="primary" 
            variant="outlined"
          />
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : estudiantesAsociados.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ borderRadius: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                startIcon={<RefreshIcon />}
                onClick={() => buscarEstudiantes()}
              >
                Buscar
              </Button>
            }
          >
            No hay estudiantes asociados a este acudiente. Utilice la búsqueda para encontrar y asociar estudiantes.
          </Alert>
        ) : (
          <Paper 
            variant="outlined" 
            sx={{ 
              maxHeight: '300px', 
              overflow: 'auto', 
              borderRadius: 2 
            }}
          >
            <List>
              {estudiantesAsociados.map((estudiante) => (
                <ListItem key={estudiante._id} divider>
                  <ListItemText
                    primary={`${estudiante.nombre} ${estudiante.apellidos}`}
                    secondary={estudiante.email}
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="eliminar asociación" 
                      onClick={() => eliminarAsociacion(estudiante._id)}
                      color="error"
                      disabled={loading}
                    >
                      <PersonRemoveIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Paper>
  );
};

export default AsociarEstudiantes;