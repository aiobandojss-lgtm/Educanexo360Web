// src/pages/cursos/ListaCursos.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Pagination,
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
  Edit,
  Delete,
  School,
  Group,
  MenuBook,
  Person,
  FilterList,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaz para el curso
interface Curso {
  _id: string;
  nombre: string;
  año_academico: string;
  grado: string;
  grupo: string;
  director_grupo: {
    _id: string;
    nombre: string;
    apellidos: string;
  };
  estado: string;
  escuelaId: string;
  estudiantes_count?: number;
  asignaturas_count?: number;
  createdAt?: string;
}

const ListaCursos = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; cursoId: string | null }>({
    open: false,
    cursoId: null,
  });

  const itemsPerPage = 9; // Mostrar 9 tarjetas por página (3x3 grid)

  useEffect(() => {
    cargarCursos();
  }, [page, refreshKey]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Configurar parámetros para la paginación
      const params = {
        page,
        limit: itemsPerPage,
        ...(searchTerm && { q: searchTerm }),
      };

      const response = await axiosInstance.get('/cursos', { params });
      
      if (response.data?.success) {
        setCursos(response.data.data);
        setTotalPages(Math.ceil(response.data.meta?.total / itemsPerPage) || 1);
      } else {
        throw new Error('Error al cargar cursos');
      }
    } catch (err: any) {
      console.error('Error al cargar cursos:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Resetear a la primera página al buscar
    cargarCursos();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleRefresh = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  const handleDeleteClick = (cursoId: string) => {
    setDeleteDialog({ open: true, cursoId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.cursoId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.delete(`/cursos/${deleteDialog.cursoId}`);
      
      if (response.data?.success) {
        // Actualizar la lista de cursos
        setCursos(cursos.filter(curso => curso._id !== deleteDialog.cursoId));
      }
    } catch (err: any) {
      console.error('Error al eliminar curso:', err);
      setError(err.response?.data?.message || 'No se pudo eliminar el curso');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, cursoId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, cursoId: null });
  };

  // Obtener color para el chip de estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      case 'FINALIZADO': return 'warning';
      default: return 'default';
    }
  };

  // Formatear nombre completo del curso
  const getNombreCursoCompleto = (curso: Curso) => {
    return `${curso.grado}° ${curso.grupo} - ${curso.año_academico}`;
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Gestión de Cursos
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
            placeholder="Buscar cursos..."
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
            onClick={() => navigate('/cursos/nuevo')}
            sx={{ 
              borderRadius: 20,
              fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
              }
            }}
          >
            Nuevo Curso
          </Button>
        </Box>
      </Paper>

      {/* Contenido principal - Grid de cursos */}
      {loading && cursos.length === 0 ? (
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
        <>
          {cursos.length > 0 ? (
            <Grid container spacing={3}>
              {cursos.map((curso) => (
                <Grid item xs={12} sm={6} md={4} key={curso._id}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                    onClick={() => navigate(`/cursos/${curso._id}`)}
                  >
                    <Box sx={{ 
                      bgcolor: 'primary.main', 
                      color: 'white', 
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="h3" fontWeight="bold">
                        {curso.nombre}
                      </Typography>
                      <School fontSize="large" />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Año académico
                        </Typography>
                        <Typography variant="h5" fontWeight="medium">
                          {curso.año_academico}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Grado - Grupo
                        </Typography>
                        <Typography variant="h5" fontWeight="medium">
                          {curso.grado}° - {curso.grupo}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Director de grupo
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {curso.director_grupo ? `${curso.director_grupo.nombre} ${curso.director_grupo.apellidos}` : 'No asignado'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          label={curso.estado}
                          color={getEstadoColor(curso.estado) as any}
                          size="small"
                          sx={{ fontWeight: 'bold', borderRadius: 8 }}
                        />
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              bgcolor: 'rgba(93, 169, 233, 0.1)',
                              p: 1.5,
                              borderRadius: 2,
                              textAlign: 'center'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                              <Group fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                              <Typography variant="body2" color="primary.main">
                                Estudiantes
                              </Typography>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" color="primary.main">
                              {curso.estudiantes_count || 0}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              bgcolor: 'rgba(0, 63, 145, 0.1)',
                              p: 1.5,
                              borderRadius: 2,
                              textAlign: 'center'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                              <MenuBook fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                              <Typography variant="body2" color="secondary.main">
                                Asignaturas
                              </Typography>
                            </Box>
                            <Typography variant="h5" fontWeight="bold" color="secondary.main">
                              {curso.asignaturas_count || 0}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </CardContent>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end',
                      p: 2,
                      pt: 0,
                      mt: 'auto'
                    }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar la navegación al hacer clic en el botón
                            navigate(`/cursos/editar/${curso._id}`);
                          }}
                          sx={{ 
                            bgcolor: 'rgba(0, 63, 145, 0.1)',
                            '&:hover': { bgcolor: 'rgba(0, 63, 145, 0.2)' }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar la navegación al hacer clic en el botón
                            handleDeleteClick(curso._id);
                          }}
                          sx={{ 
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
              No se encontraron cursos. Puedes crear uno nuevo con el botón "Nuevo Curso".
            </Alert>
          )}
          
          {/* Paginación */}
          {cursos.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
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
          )}
        </>
      )}

      {/* Diálogo de confirmación para eliminar curso */}
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
            ¿Está seguro que desea eliminar este curso? Esta acción no se puede deshacer.
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

export default ListaCursos;