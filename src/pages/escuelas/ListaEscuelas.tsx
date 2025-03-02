// src/pages/escuelas/ListaEscuelas.tsx
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
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Pagination,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useNotificacion } from '../../components/common/Notificaciones';

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

const ListaEscuelas = () => {
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotificacion();
  
  // Estados
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState<Escuela | null>(null);
  const [dialogEliminar, setDialogEliminar] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Función para cargar escuelas
  const cargarEscuelas = async (pagina = 1, terminoBusqueda = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir parámetros de consulta
      const params: any = {
        page: pagina,
        limit: 10,
      };
      
      if (terminoBusqueda) {
        params.q = terminoBusqueda;
      }
      
      const response = await axiosInstance.get('/escuelas', { params });
      
      setEscuelas(response.data.data || []);
      setTotalPages(Math.ceil((response.data.meta?.total || 10) / 10));
    } catch (err: any) {
      console.error('Error al cargar escuelas:', err);
      setError('No se pudieron cargar las escuelas. ' + (err.response?.data?.message || 'Error del servidor'));
      setEscuelas([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar escuelas al inicio
  useEffect(() => {
    cargarEscuelas(page, busqueda);
  }, [page]);
  
  // Manejar la búsqueda
  const handleBusqueda = () => {
    setPage(1); // Resetear página al buscar
    cargarEscuelas(1, busqueda);
  };
  
  // Resetear búsqueda
  const resetBusqueda = () => {
    setBusqueda('');
    setPage(1);
    cargarEscuelas(1, '');
  };
  
  // Manejar cambio de página
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };
  
  // Abrir diálogo de eliminar
  const confirmarEliminar = (escuela: Escuela) => {
    setEscuelaSeleccionada(escuela);
    setDialogEliminar(true);
  };
  
  // Cerrar diálogo de eliminar
  const cerrarDialogEliminar = () => {
    setDialogEliminar(false);
  };
  
  // Eliminar escuela
  const eliminarEscuela = async () => {
    if (!escuelaSeleccionada) return;
    
    try {
      await axiosInstance.delete(`/escuelas/${escuelaSeleccionada._id}`);
      
      // Actualizar lista
      setEscuelas(prev => prev.filter(e => e._id !== escuelaSeleccionada._id));
      
      // Notificar éxito
      mostrarNotificacion('Escuela desactivada exitosamente', 'success');
      
      // Cerrar diálogo
      cerrarDialogEliminar();
    } catch (err: any) {
      console.error('Error al eliminar escuela:', err);
      mostrarNotificacion(
        'Error al desactivar la escuela: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    }
  };
  
  // Ir a la página de detalle
  const verDetalle = (id: string) => {
    navigate(`/escuelas/${id}`);
  };
  
  // Ir a la página de edición
  const editarEscuela = (id: string) => {
    navigate(`/escuelas/editar/${id}`);
  };
  
  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Gestión de Escuelas
      </Typography>
      
      {/* Cabecera con estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" gutterBottom>Total Escuelas</Typography>
              {loading ? (
                <CircularProgress size={30} />
              ) : (
                <Typography variant="h1" color="primary.main">
                  {escuelas.length > 0 ? escuelas.length : '0'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <PersonIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3" gutterBottom>Escuelas Activas</Typography>
              {loading ? (
                <CircularProgress size={30} />
              ) : (
                <Typography variant="h1" color="secondary.main">
                  {escuelas.filter(e => e.estado === 'ACTIVO').length}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', height: '100%' }}>
            <CardContent>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={() => navigate('/escuelas/nuevo')}
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Nueva Escuela
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Barra de búsqueda */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar escuela..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleBusqueda();
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button 
                variant="outlined" 
                onClick={handleBusqueda}
                size="small"
              >
                Buscar
              </Button>
              {busqueda && (
                <Button 
                  variant="text" 
                  onClick={resetBusqueda}
                  size="small"
                >
                  Limpiar
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Lista de escuelas */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      ) : escuelas.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.3, mb: 2 }} />
          <Typography variant="h3" color="text.secondary" gutterBottom>
            No se encontraron escuelas
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            {busqueda ? 'No hay resultados para tu búsqueda. Intenta con otros términos.' : 'Aún no hay escuelas registradas.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/escuelas/nuevo')}
          >
            Crear Nueva Escuela
          </Button>
        </Paper>
      ) : (
        <Paper elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Ciudad</TableCell>
                  <TableCell>Director</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {escuelas.map((escuela) => (
                  <TableRow 
                    key={escuela._id}
                    sx={{ '&:hover': { bgcolor: 'rgba(93, 169, 233, 0.05)' } }}
                  >
                    <TableCell>
                      <Typography fontWeight={500} color="primary.main">
                        {escuela.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" color="action" />
                        {escuela.ciudad}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize="small" color="action" />
                        {escuela.director}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon fontSize="small" color="action" />
                          <Typography variant="body2">{escuela.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon fontSize="small" color="action" />
                          <Typography variant="body2">{escuela.telefono}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={escuela.estado} 
                        color={escuela.estado === 'ACTIVO' ? 'success' : 'default'}
                        size="small"
                        sx={{ borderRadius: 8 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="info" 
                          onClick={() => verDetalle(escuela._id)}
                          sx={{ 
                            bgcolor: 'rgba(93, 169, 233, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(93, 169, 233, 0.2)',
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => editarEscuela(escuela._id)}
                          sx={{ 
                            bgcolor: 'rgba(0, 63, 145, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(0, 63, 145, 0.2)',
                            }
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => confirmarEliminar(escuela)}
                          sx={{ 
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': {
                              bgcolor: 'rgba(244, 67, 54, 0.2)',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Paginación */}
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              shape="rounded"
            />
          </Box>
        </Paper>
      )}
      
      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={dialogEliminar}
        onClose={cerrarDialogEliminar}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle id="alert-dialog-title">
          ¿Desactivar esta escuela?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {escuelaSeleccionada && (
              <>
                Estás a punto de desactivar la escuela <strong>{escuelaSeleccionada.nombre}</strong>. 
                Esto inhabilitará el acceso a todos los usuarios asociados a esta escuela. 
                Esta acción no elimina los datos y puede revertirse más adelante.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={cerrarDialogEliminar} color="inherit">
            Cancelar
          </Button>
          <Button onClick={eliminarEscuela} color="error" variant="contained" autoFocus>
            Desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaEscuelas;