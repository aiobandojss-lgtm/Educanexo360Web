// src/pages/usuarios/ListaUsuarios.tsx
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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  estado: string;
}

const ListaUsuarios: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    // Filtramos usuarios cuando cambie la búsqueda
    if (busqueda.trim() === '') {
      setFilteredUsuarios(usuarios);
    } else {
      const searchTermLower = busqueda.toLowerCase();
      const filtered = usuarios.filter(
        (usuario) =>
          usuario.nombre.toLowerCase().includes(searchTermLower) ||
          usuario.apellidos.toLowerCase().includes(searchTermLower) ||
          usuario.email.toLowerCase().includes(searchTermLower) ||
          usuario.tipo.toLowerCase().includes(searchTermLower)
      );
      setFilteredUsuarios(filtered);
    }
  }, [busqueda, usuarios]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/usuarios');
      const data = response.data.data || [];
      
      setUsuarios(data);
      setFilteredUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // La búsqueda ya se aplica automáticamente por el efecto
    // Este método se mantiene para el botón de búsqueda
    console.log("Buscando: ", busqueda);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVerUsuario = (id: string) => {
    navigate(`/usuarios/${id}`);
  };

  const handleEditarUsuario = (id: string) => {
    navigate(`/usuarios/${id}`);
  };

  const handleEliminarUsuario = async (id: string) => {
    if (window.confirm('¿Está seguro de desactivar este usuario?')) {
      try {
        await axiosInstance.delete(`/usuarios/${id}`);
        // Recargar la lista después de eliminar
        cargarUsuarios();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        setError('Error al desactivar usuario. Intente nuevamente más tarde.');
      }
    }
  };

  const getTipoUsuario = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'Administrador';
      case 'DOCENTE':
        return 'Docente';
      case 'ESTUDIANTE':
        return 'Estudiante';
      case 'ACUDIENTE':
        return 'Acudiente';
      case 'COORDINADOR':
        return 'Coordinador';
      case 'RECTOR':
        return 'Rector';
      case 'ADMINISTRATIVO':
        return 'Administrativo';
      default:
        return tipo;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO':
        return 'success';
      case 'INACTIVO':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h1" color="primary.main">
            Administración de Usuarios
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/usuarios/nuevo')}
            sx={{ borderRadius: '20px' }}
          >
            Nuevo Usuario
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
              placeholder="Buscar usuarios por nombre, email o tipo..."
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
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Tipo</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredUsuarios.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsuarios.map((usuario) => (
                <TableRow
                  key={usuario._id}
                  sx={{
                    '&:hover': {
                      bgcolor: 'rgba(93, 169, 233, 0.05)',
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>
                    {usuario.nombre} {usuario.apellidos}
                  </TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTipoUsuario(usuario.tipo)}
                      color="primary"
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: 500, borderRadius: 10 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={usuario.estado}
                      color={getEstadoColor(usuario.estado) as any}
                      size="small"
                      sx={{ fontWeight: 500, borderRadius: 10 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleVerUsuario(usuario._id)}
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
                    <IconButton
                      color="secondary"
                      onClick={() => handleEditarUsuario(usuario._id)}
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
                    {usuario.estado === 'ACTIVO' && (
                      <IconButton
                        color="error"
                        onClick={() => handleEliminarUsuario(usuario._id)}
                        sx={{
                          bgcolor: 'rgba(244, 67, 54, 0.1)',
                          '&:hover': {
                            bgcolor: 'rgba(244, 67, 54, 0.2)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListaUsuarios;