// src/pages/cursos/AgregarEstudianteCurso.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemButton,
  Avatar,
  Divider,
  Chip,
  Grid,
  IconButton,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Person,
  PersonAdd,
  Search,
  Delete,
} from '@mui/icons-material';
import cursoService from '../../services/cursoService';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaz para estudiante
interface Estudiante {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
}

// Interfaz para curso
interface CursoBasico {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
  año_academico: string;
}

const AgregarEstudianteCurso = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [curso, setCurso] = useState<CursoBasico | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<Estudiante[]>([]);
  const [estudianteActual, setEstudianteActual] = useState<Estudiante | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (id) {
      cargarCurso();
      cargarEstudiantes();
    }
  }, [id]);

  const cargarCurso = async () => {
    if (!id) return;

    try {
      const response = await cursoService.obtenerCurso(id);
      
      if (response?.success) {
        setCurso(response.data);
      } else {
        throw new Error('Error al cargar curso');
      }
    } catch (err: any) {
      console.error('Error al cargar curso:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del curso');
    }
  };

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todos los estudiantes de la escuela que no están en el curso
      const response = await axiosInstance.get('/usuarios', {
        params: {
          tipo: 'ESTUDIANTE',
          not_in_curso: id
        }
      });
      
      if (response.data?.success) {
        setEstudiantes(response.data.data || []);
      } else {
        throw new Error('Error al cargar estudiantes');
      }
    } catch (err: any) {
      console.error('Error al cargar estudiantes:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEstudiante = () => {
    if (estudianteActual) {
      // Verificar si el estudiante ya está seleccionado
      if (!estudiantesSeleccionados.some(e => e._id === estudianteActual._id)) {
        setEstudiantesSeleccionados([...estudiantesSeleccionados, estudianteActual]);
      }
      setEstudianteActual(null);
    }
  };

  const handleRemoveEstudiante = (estudianteId: string) => {
    setEstudiantesSeleccionados(estudiantesSeleccionados.filter(e => e._id !== estudianteId));
  };

  const handleGuardar = async () => {
    if (!id || estudiantesSeleccionados.length === 0) return;

    try {
      setSavingLoading(true);
      setError(null);
      setSuccess(null);

      // Añadir cada estudiante al curso
      for (const estudiante of estudiantesSeleccionados) {
        await cursoService.añadirEstudianteCurso(id, estudiante._id);
      }

      setSuccess(`${estudiantesSeleccionados.length} estudiante(s) añadido(s) exitosamente al curso`);
      setEstudiantesSeleccionados([]);
      
      // Recargar la lista de estudiantes disponibles
      await cargarEstudiantes();
      
    } catch (err: any) {
      console.error('Error al añadir estudiantes:', err);
      setError(err.response?.data?.message || 'No se pudieron agregar los estudiantes al curso');
    } finally {
      setSavingLoading(false);
    }
  };

  // Obtener iniciales para el avatar
  const getInitials = (nombre: string, apellidos: string) => {
    if (!nombre || !apellidos) return '?';
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  // Filtrar estudiantes por término de búsqueda
  const estudiantesFiltrados = estudiantes.filter(
    estudiante => 
      estudiante.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estudiante.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/cursos/${id}`)}
          sx={{ 
            mr: 2,
            borderRadius: 20,
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: 'text.secondary'
          }}
        >
          Volver
        </Button>
        <Typography variant="h1" color="primary.main">
          Agregar Estudiantes al Curso
        </Typography>
      </Box>

      {curso && (
        <Typography variant="h3" color="text.secondary" gutterBottom>
          {curso.nombre} ({curso.grado}° {curso.grupo} - {curso.año_academico})
        </Typography>
      )}

      {/* Alertas */}
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
        {/* Panel de búsqueda */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
              <Typography variant="h3">
                Buscar Estudiantes
              </Typography>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1 }}>
              <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <Autocomplete
                  fullWidth
                  options={estudiantesFiltrados}
                  getOptionLabel={(option) => `${option.nombre} ${option.apellidos} (${option.email})`}
                  value={estudianteActual}
                  onChange={(_event, newValue) => {
                    setEstudianteActual(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Buscar por nombre o email"
                      variant="outlined"
                      onChange={handleSearchChange}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <Search color="action" sx={{ mr: 1 }} />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  )}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PersonAdd />}
                  onClick={handleAddEstudiante}
                  disabled={!estudianteActual}
                  sx={{ 
                    borderRadius: 20,
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  Agregar
                </Button>
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              ) : estudiantesFiltrados.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto', mt: 2 }}>
                  <List>
                    {estudiantesFiltrados.map((estudiante) => (
                      <ListItem 
                        key={estudiante._id}
                        disablePadding
                      >
                        <ListItemButton
                          onClick={() => setEstudianteActual(estudiante)}
                          selected={estudianteActual?._id === estudiante._id}
                          sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                            py: 1,
                            '&:hover': {
                              bgcolor: 'rgba(93, 169, 233, 0.08)'
                            },
                            '&.Mui-selected': {
                              bgcolor: 'rgba(93, 169, 233, 0.12)',
                              '&:hover': {
                                bgcolor: 'rgba(93, 169, 233, 0.18)'
                              }
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {getInitials(estudiante.nombre, estudiante.apellidos)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${estudiante.nombre} ${estudiante.apellidos}`}
                            secondary={estudiante.email}
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
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
                  No hay estudiantes disponibles para añadir a este curso.
                </Alert>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Panel de estudiantes seleccionados */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ bgcolor: 'secondary.main', color: 'white', px: 3, py: 2 }}>
              <Typography variant="h3">
                Estudiantes a Agregar ({estudiantesSeleccionados.length})
              </Typography>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1 }}>
              {estudiantesSeleccionados.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <List>
                    {estudiantesSeleccionados.map((estudiante) => (
                      <ListItem 
                        key={estudiante._id}
                        secondaryAction={
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveEstudiante(estudiante._id)}
                            sx={{ 
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        }
                        sx={{ 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          '&:hover': {
                            bgcolor: 'rgba(93, 169, 233, 0.08)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {getInitials(estudiante.nombre, estudiante.apellidos)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${estudiante.nombre} ${estudiante.apellidos}`}
                          secondary={estudiante.email}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                      </ListItem>
                    ))}
                  </List>
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
                  Seleccione estudiantes para agregar al curso.
                </Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleGuardar}
                  disabled={estudiantesSeleccionados.length === 0 || savingLoading}
                  sx={{ 
                    borderRadius: 20,
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  {savingLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgregarEstudianteCurso;