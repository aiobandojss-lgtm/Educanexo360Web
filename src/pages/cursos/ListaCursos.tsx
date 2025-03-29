// src/pages/cursos/ListaCursos.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';

// Función de utilidad para extraer el nombre del usuario de forma segura
const extractUserName = (user: any): string => {
  if (!user) return 'No asignado';
  if (typeof user === 'string') return user;
  if (typeof user !== 'object') return String(user);
  
  return user.nombre 
    ? (user.apellidos ? `${user.nombre} ${user.apellidos}` : user.nombre)
    : 'Usuario asignado';
};

// Función para extraer información de grado y sección del curso
const extractGradoSeccion = (curso: Curso): string => {
  // Si el curso tiene propiedades específicas para grado y grupo, usarlas
  if (curso.grado && curso.grupo) {
    // No añadir "°" para casos especiales como "Jardín"
    const esGradoNumerico = /^\d+$/.test(curso.grado.replace('°', ''));
    const gradoFormateado = esGradoNumerico && !curso.grado.includes('°') 
      ? `${curso.grado}°` 
      : curso.grado;
    
    return `${gradoFormateado} ${curso.grupo}`;
  }
  
  // Si no, intentar extraer del nombre del curso (Ej: "Primero A" -> "1° A")
  const nombreParts = curso.nombre.split(' ');
  if (nombreParts.length >= 2) {
    // Intentar convertir nombres textuales a números
    const gradoMap: {[key: string]: string} = {
      'primero': '1°',
      'segundo': '2°',
      'tercero': '3°',
      'cuarto': '4°',
      'quinto': '5°',
      'sexto': '6°',
      'séptimo': '7°',
      'octavo': '8°',
      'noveno': '9°',
      'décimo': '10°',
      'once': '11°',
      'doce': '12°',
      'jardin': 'Jardín',
      'jardín': 'Jardín',
      'prejardin': 'Pre-Jardín',
      'prejardín': 'Pre-Jardín',
      'transicion': 'Transición',
      'transición': 'Transición'
    };
    
    const gradoTextual = nombreParts[0].toLowerCase();
    const grado = gradoMap[gradoTextual] || nombreParts[0];
    const seccion = nombreParts[1];
    
    return `${grado} ${seccion}`;
  }
  
  // Para casos donde el nombre es solo una palabra (ej: "JARDIN")
  if (curso.nombre && curso.grupo) {
    return `${curso.nombre} ${curso.grupo}`;
  }
  
  return curso.nombre; // Si no se puede extraer, devolver el nombre completo
};

interface Curso {
  _id: string;
  nombre: string;
  nivel: string;
  grado?: string;   // Propiedad opcional para grado
  grupo?: string;   // Propiedad opcional para grupo/sección
  jornada?: string; // Propiedad opcional para jornada
  año_academico?: string;
  capacidad?: number;
  estudiantes?: any[];
  director_grupo?: any;
  estado: string;
}

const ListaCursos: React.FC = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [demoMode, setDemoMode] = useState<boolean>(false);

  useEffect(() => {
    cargarCursos();
  }, []);

  useEffect(() => {
    // Filtrar cursos cuando cambia la búsqueda
    if (busqueda.trim() === '') {
      setFilteredCursos(cursos);
    } else {
      const searchTermLower = busqueda.toLowerCase();
      const filtered = cursos.filter(
        (curso) =>
          curso.nombre.toLowerCase().includes(searchTermLower) ||
          curso.nivel.toLowerCase().includes(searchTermLower) ||
          (curso.año_academico && curso.año_academico.toLowerCase().includes(searchTermLower)) ||
          (curso.director_grupo && extractUserName(curso.director_grupo).toLowerCase().includes(searchTermLower))
      );
      setFilteredCursos(filtered);
    }
  }, [busqueda, cursos]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      setError(null);
      setNetworkError(false);
      
      try {
        const response = await axiosInstance.get('/cursos');
        console.log('Respuesta de API cursos:', response.data);
        setCursos(response.data.data || []);
        setFilteredCursos(response.data.data || []);
        setDemoMode(false);
      } catch (err: any) {
        console.error('Error al cargar cursos:', err);
        
        // Detectar error de conexión
        if (err.message && err.message.includes('Network Error')) {
          setNetworkError(true);
          setDemoMode(true);
          
          // Proporcionar datos de demostración
          const demoData: Curso[] = [
            {
              _id: '1',
              nombre: 'Primero A',
              nivel: 'PRIMARIA',
              año_academico: '2023-2024',
              capacidad: 30,
              estudiantes: [],
              director_grupo: { nombre: 'María', apellidos: 'López' },
              estado: 'ACTIVO',
            },
            {
              _id: '2',
              nombre: 'Segundo B',
              nivel: 'PRIMARIA',
              año_academico: '2023-2024',
              capacidad: 25,
              estudiantes: [],
              director_grupo: { nombre: 'Juan', apellidos: 'González' },
              estado: 'ACTIVO',
            },
            {
              _id: '3',
              nombre: 'Tercero C',
              nivel: 'PRIMARIA',
              año_academico: '2023-2024',
              capacidad: 28,
              estudiantes: [],
              director_grupo: { nombre: 'Carlos', apellidos: 'Rodríguez' },
              estado: 'ACTIVO',
            },
            {
              _id: '4',
              nombre: 'Noveno A',
              nivel: 'SECUNDARIA',
              año_academico: '2023-2024',
              capacidad: 35,
              estudiantes: [],
              director_grupo: { nombre: 'Ana', apellidos: 'Martínez' },
              estado: 'ACTIVO',
            },
            {
              _id: '5',
              nombre: 'Décimo B',
              nivel: 'MEDIA',
              año_academico: '2023-2024',
              capacidad: 32,
              estudiantes: [],
              director_grupo: { nombre: 'Pedro', apellidos: 'Sánchez' },
              estado: 'ACTIVO',
            },
          ];
          
          setCursos(demoData);
          setFilteredCursos(demoData);
        } else {
          setError('Error al cargar la lista de cursos. Intente nuevamente más tarde.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    console.log("Buscando cursos con término:", busqueda);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVerCurso = (id: string) => {
    navigate(`/cursos/${id}`);
  };

  const handleEditarCurso = (id: string) => {
    navigate(`/cursos/editar/${id}`);
  };

  const handleEliminarCurso = async (id: string) => {
    if (window.confirm('¿Está seguro de desactivar este curso?')) {
      try {
        if (demoMode) {
          setCursos(prev => 
            prev.map(curso => 
              curso._id === id ? { ...curso, estado: 'INACTIVO' } : curso
            )
          );
        } else {
          await axiosInstance.delete(`/cursos/${id}`);
          cargarCursos();
        }
      } catch (err) {
        console.error('Error al eliminar curso:', err);
        setError('Error al desactivar curso. Intente nuevamente más tarde.');
      }
    }
  };

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'PREESCOLAR': return 'Preescolar';
      case 'PRIMARIA': return 'Primaria';
      case 'SECUNDARIA': return 'Secundaria';
      case 'MEDIA': return 'Media';
      default: return nivel;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      default: return 'default';
    }
  };

  const handleCloseNetworkError = () => {
    setNetworkError(false);
  };

  // Función para contar estudiantes en un curso
  const contarEstudiantes = (curso: Curso): number => {
    return Array.isArray(curso.estudiantes) ? curso.estudiantes.length : 0;
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h1" color="primary.main">
            Administración de Cursos
          </Typography>
          {demoMode && (
            <Typography variant="subtitle1" color="text.secondary">
              Modo demostración - Sin conexión al servidor
            </Typography>
          )}
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/cursos/nuevo')}
            sx={{ borderRadius: '20px' }}
          >
            Nuevo Curso
          </Button>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <TextField
              fullWidth
              placeholder="Buscar cursos por nombre, nivel o docente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleSearch}
              sx={{ borderRadius: '20px' }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500,
            },
          }}
        >
          {error}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre del Curso</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Grado y Sección</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nivel</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Año Escolar</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estudiantes</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Docente Director</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredCursos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No se encontraron cursos
                </TableCell>
              </TableRow>
            ) : (
              filteredCursos.map((curso) => (
                <TableRow
                  key={curso._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(93, 169, 233, 0.05)',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {curso.nombre}
                  </TableCell>
                  <TableCell>
                    {extractGradoSeccion(curso)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getNivelLabel(curso.nivel)}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 500, borderRadius: 10 }}
                    />
                  </TableCell>
                  <TableCell>{curso.año_academico || 'N/A'}</TableCell>
                  <TableCell>{contarEstudiantes(curso)}</TableCell>
                  <TableCell>{extractUserName(curso.director_grupo)}</TableCell>
                  <TableCell>
                    <Chip
                      label={curso.estado}
                      color={getEstadoColor(curso.estado) as any}
                      size="small"
                      sx={{ fontWeight: 500, borderRadius: 10 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver información del curso" arrow placement="top">
                      <IconButton
                        color="primary"
                        onClick={() => handleVerCurso(curso._id)}
                        sx={{
                          mr: 1,
                          bgcolor: 'rgba(93, 169, 233, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(93, 169, 233, 0.2)',
                          },
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar información del curso" arrow placement="top">
                      <IconButton
                        color="secondary"
                        onClick={() => handleEditarCurso(curso._id)}
                        sx={{
                          mr: 1,
                          bgcolor: 'rgba(0, 63, 145, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(0, 63, 145, 0.2)',
                          },
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {curso.estado === 'ACTIVO' && (
                      <Tooltip title="Desactivar curso" arrow placement="top">
                        <IconButton
                          color="error"
                          onClick={() => handleEliminarCurso(curso._id)}
                          sx={{
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(244, 67, 54, 0.2)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={networkError}
        autoHideDuration={6000}
        onClose={handleCloseNetworkError}
        message="Error de conexión con el servidor. Funcionando en modo demo."
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseNetworkError}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default ListaCursos;