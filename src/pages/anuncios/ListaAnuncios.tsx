// src/pages/anuncios/ListaAnuncios.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  NotificationsActive as ImportantIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import anuncioService, { IAnuncio } from '../../services/anuncioService';
import { RootState } from '../../redux/store';
import { format } from 'date-fns';

const ListaAnuncios: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anuncios, setAnuncios] = useState<IAnuncio[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('PUBLICADO');
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [paginaActual, setPaginaActual] = useState(1);
  const [limite] = useState(10);

  useEffect(() => {
    cargarAnuncios();
  }, [filtroTipo, filtroEstado, paginaActual]);

  interface ApiResponse {
    data: IAnuncio[];
    meta?: {
      totalPaginas: number;
    };
  }
  
  const cargarAnuncios = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filtros: any = {
          pagina: paginaActual,
          limite: limite
        };
        
        if (filtroTipo) filtros.tipo = filtroTipo;
        if (filtroEstado) filtros.estado = filtroEstado;
        if (busqueda) filtros.busqueda = busqueda;
        
        const response = await anuncioService.obtenerAnuncios(filtros) as IAnuncio[] | ApiResponse;
      
      // Manejar la respuesta
      if (Array.isArray(response)) {
        setAnuncios(response);
        setTotalPaginas(Math.ceil(response.length / limite)); // Temporal, en un API real vendría en la respuesta
      } else if (response && response.data) {
        setAnuncios(response.data);
        setTotalPaginas(response.meta?.totalPaginas || 1);
      } else {
        setAnuncios([]);
        setTotalPaginas(1);
      }
    } catch (err) {
      console.error('Error al cargar anuncios:', err);
      setError('No se pudieron cargar los anuncios. Intente nuevamente más tarde.');
      setAnuncios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPaginaActual(1); // Reiniciar a primera página al buscar
    cargarAnuncios();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  const handleVerAnuncio = (id: string) => {
    navigate(`/anuncios/${id}`);
  };

  const handleEditarAnuncio = (id: string) => {
    navigate(`/anuncios/editar/${id}`);
  };

  const handleEliminarAnuncio = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este anuncio?')) {
      try {
        setLoading(true);
        await anuncioService.eliminarAnuncio(id);
        // Recargar anuncios
        cargarAnuncios();
      } catch (err) {
        console.error('Error al eliminar anuncio:', err);
        setError('Error al eliminar el anuncio. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCambiarPagina = (event: React.ChangeEvent<unknown>, valor: number) => {
    setPaginaActual(valor);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getTipoLabel = (tipo: string): string => {
    switch (tipo) {
      case 'GENERAL': return 'General';
      case 'CURSO': return 'Curso';
      case 'DOCENTES': return 'Docentes';
      case 'PADRES': return 'Padres';
      case 'ESTUDIANTES': return 'Estudiantes';
      default: return tipo;
    }
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h1" color="primary.main">
            Tablero de Anuncios
          </Typography>
        </Grid>
        {user?.tipo === 'ADMIN' && (
          <Grid item>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/anuncios/nuevo')}
              sx={{ borderRadius: '20px' }}
            >
              Nuevo Anuncio
            </Button>
          </Grid>
        )}
      </Grid>
      
      <Paper
        elevation={0}
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' 
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <TextField
              fullWidth
              placeholder="Buscar anuncios..."
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
                  borderRadius: 2 
                } 
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="tipo-label">Tipo</InputLabel>
              <Select
                labelId="tipo-label"
                id="tipo-filtro"
                value={filtroTipo}
                label="Tipo"
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
                <MenuItem value="CURSO">Curso</MenuItem>
                <MenuItem value="DOCENTES">Docentes</MenuItem>
                <MenuItem value="PADRES">Padres</MenuItem>
                <MenuItem value="ESTUDIANTES">Estudiantes</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                id="estado-filtro"
                value={filtroEstado}
                label="Estado"
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="PUBLICADO">Publicado</MenuItem>
                <MenuItem value="BORRADOR">Borrador</MenuItem>
                <MenuItem value="ARCHIVADO">Archivado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item>
            <Button
              variant="outlined"
              onClick={handleBuscar}
              startIcon={<FilterListIcon />}
              sx={{ borderRadius: '20px' }}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      ) : anuncios.length === 0 ? (
        <Box sx={{ textAlign: 'center', p: 5 }}>
          <Typography variant="h3" color="text.secondary">
            No se encontraron anuncios
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            {busqueda || filtroTipo || filtroEstado !== 'PUBLICADO' ? 
              'No hay anuncios que coincidan con los criterios de búsqueda.' : 
              'No hay anuncios publicados actualmente.'}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {anuncios.map((anuncio) => (
              <Grid item xs={12} key={anuncio._id}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
                    borderRadius: 3,
                    ...(anuncio.destacado && {
                      border: '1px solid',
                      borderColor: 'warning.main',
                      bgcolor: 'rgba(255, 193, 7, 0.05)'
                    })
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {anuncio.destacado && (
                        <ImportantIcon color="warning" sx={{ mr: 1 }} />
                      )}
                      <Typography 
                        variant="h3" 
                        color={anuncio.destacado ? 'warning.dark' : 'primary.main'}
                      >
                        {anuncio.titulo}
                      </Typography>
                    </Box>
                    
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {anuncio.contenido}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Chip 
                          label={getTipoLabel(anuncio.tipo)} 
                          color="primary"
                          size="small" 
                          sx={{ mr: 1, mb: 1 }} 
                        />
                        
                        {anuncio.estado === 'BORRADOR' && (
                          <Chip 
                            label="Borrador" 
                            color="default"
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                        )}
                        
                        {anuncio.estado === 'ARCHIVADO' && (
                          <Chip 
                            label="Archivado" 
                            color="default"
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                        )}
                        
                        {anuncio.adjuntos && anuncio.adjuntos.length > 0 && (
                          <Chip 
                            label={`${anuncio.adjuntos.length} adjunto(s)`} 
                            color="info"
                            size="small" 
                            sx={{ mr: 1, mb: 1 }} 
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Publicado: {formatDate(anuncio.fechaPublicacion)}
                        {anuncio.fechaExpiracion && (
                          <> | Expira: {formatDate(anuncio.fechaExpiracion)}</>
                        )}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">
                        Por: {typeof anuncio.creadorId === 'object' ? 
                          `${anuncio.creadorId.nombre} ${anuncio.creadorId.apellidos}` : 
                          'Usuario del sistema'}
                      </Typography>
                      
                      <Box>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleVerAnuncio(anuncio._id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        
                        {user?.tipo === 'ADMIN' && (
                          <>
                            <IconButton 
                              color="info" 
                              onClick={() => handleEditarAnuncio(anuncio._id)}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleEliminarAnuncio(anuncio._id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Paginación */}
          {totalPaginas > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={totalPaginas} 
                page={paginaActual} 
                onChange={handleCambiarPagina} 
                color="primary" 
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ListaAnuncios;