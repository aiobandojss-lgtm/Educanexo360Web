// src/pages/usuarios/ListaUsuarios.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  LinearProgress,
  Alert,
  Pagination,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaz para el usuario
interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  estado: string;
  createdAt: string;
}

const ListaUsuarios = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; userId: string | null }>({
    open: false,
    userId: null,
  });
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const itemsPerPage = 10;

  useEffect(() => {
    cargarUsuarios();
  }, [page, refreshKey]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);

      // Configurar parámetros para la paginación
      const params = {
        page,
        limit: itemsPerPage,
        ...(searchTerm && { q: searchTerm }),
      };

      const response = await axiosInstance.get('/usuarios', { params });
      
      if (response.data?.success) {
        setUsuarios(response.data.data);
        setTotalPages(Math.ceil(response.data.meta?.total / itemsPerPage) || 1);
      } else {
        throw new Error('Error al cargar usuarios');
      }
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Resetear a la primera página al buscar
    cargarUsuarios();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteDialog({ open: true, userId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/usuarios/${deleteDialog.userId}`);
      
      if (response.data?.success) {
        // Actualizar la lista de usuarios
        setUsuarios(usuarios.filter(user => user._id !== deleteDialog.userId));
      }
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      setError(err.response?.data?.message || 'No se pudo eliminar el usuario');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, userId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, userId: null });
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
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Administración de Usuarios
      </Typography>

      {/* Barra de acciones */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 500 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mr: 1, flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2 }
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ 
              borderRadius: 20,
              px: 3,
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Buscar
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ 
              borderRadius: 20,
              borderColor: 'rgba(0, 0, 0, 0.12)',
              color: 'text.secondary'
            }}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Add />}
            onClick={() => navigate('/usuarios/nuevo')}
            sx={{ 
              borderRadius: 20,
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Paper>

      {/* Tabla de usuarios */}
      {loading && usuarios.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
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
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nombre</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Estado</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fecha Registro</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario) => (
                    <TableRow
                      key={usuario._id}
                      sx={{
                        '&:hover': { bgcolor: 'rgba(93, 169, 233, 0.08)' },
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {usuario.nombre} {usuario.apellidos}
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getTipoLabel(usuario.tipo)}
                          color={getTipoColor(usuario.tipo) as any}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            borderRadius: 8 
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={usuario.estado}
                          color={getEstadoColor(usuario.estado) as any}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold', 
                            borderRadius: 8 
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {usuario.createdAt ? formatDate(usuario.createdAt) : 'N/A'}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => navigate(`/usuarios/${usuario._id}`)}
                            sx={{ 
                              bgcolor: 'rgba(93, 169, 233, 0.1)',
                              '&:hover': { bgcolor: 'rgba(93, 169, 233, 0.2)' }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => navigate(`/usuarios/editar/${usuario._id}`)}
                            sx={{ 
                              bgcolor: 'rgba(0, 63, 145, 0.1)',
                              '&:hover': { bgcolor: 'rgba(0, 63, 145, 0.2)' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          {user?._id !== usuario._id && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(usuario._id)}
                              sx={{ 
                                bgcolor: 'rgba(244, 67, 54, 0.1)',
                                '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <Typography variant="body1" color="text.secondary">
                        No se encontraron usuarios
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {loading && usuarios.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, borderBottom: 'none' }}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación */}
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 8,
                }
              }}
            />
          </Box>
        </Paper>
      )}

      {/* Diálogo de confirmación para eliminar usuario */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
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
            ¿Está seguro que desea desactivar este usuario? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleDeleteCancel} 
            color="inherit"
            sx={{ 
              borderRadius: 20,
              px: 3
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
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

export default ListaUsuarios;