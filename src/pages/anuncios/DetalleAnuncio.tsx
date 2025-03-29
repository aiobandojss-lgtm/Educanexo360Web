// src/pages/anuncios/DetalleAnuncio.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  NotificationsActive as ImportantIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  GetApp as DownloadIcon,
} from '@mui/icons-material';
import anuncioService, { IAnuncio } from '../../services/anuncioService';
import { format } from 'date-fns';
import { RootState } from '../../redux/store';

// Definimos esta interfaz para compatibilidad con el componente actual
// Es similar a la IAnuncio del servicio pero adaptada a este componente
interface AnuncioDetalle {
  _id: string;
  titulo: string;
  contenido: string;
  tipo: string; // En lugar de destinatarios
  destacado: boolean; // En lugar de importante
  fechaExpiracion: string | null;
  fechaPublicacion: string;
  creadorId: any; // Puede ser string u objeto con detalles del creador
  escuelaId: string;
  estado: string;
  adjuntos?: Array<{
    _id: string;
    nombre: string;
    tipo: string;
    tamaño: number;
    url?: string;
  }>;
  imagenPortada?: {
    fileId: string;
    url: string;
  };
}

const DetalleAnuncio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [anuncio, setAnuncio] = useState<AnuncioDetalle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarAnuncio();
  }, [id]);

  const cargarAnuncio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await anuncioService.obtenerAnuncioPorId(id || '');
      
      // Si tenemos datos, los adaptamos a nuestro formato esperado
      if (data) {
        // Crear un objeto AnuncioDetalle a partir de IAnuncio
        const anuncioFormateado: AnuncioDetalle = {
          _id: data._id,
          titulo: data.titulo,
          contenido: data.contenido,
          tipo: data.tipo || 'GENERAL', // Usamos tipo en lugar de destinatarios
          destacado: data.destacado || false, // Usamos destacado en lugar de importante
          fechaExpiracion: data.fechaExpiracion || null,
          fechaPublicacion: data.fechaPublicacion || new Date().toISOString(),
          creadorId: data.creadorId || {
            nombre: 'Usuario',
            apellidos: 'Sistema'
          },
          escuelaId: data.escuelaId || '',
          estado: data.estado || 'ACTIVO',
          adjuntos: data.adjuntos?.map(adj => ({
            ...adj,
            url: adj._id ? anuncioService.getAdjuntoUrl(data._id, adj._id) : ''
          })) || []
        };
        
        setAnuncio(anuncioFormateado);
      } else {
        // Si no hay datos, mostramos un anuncio de ejemplo
        setAnuncio({
          _id: 'ejemplo-id',
          titulo: 'Anuncio de ejemplo',
          contenido: 'Este es un anuncio de ejemplo. La información real se mostrará cuando se conecte al servidor.',
          tipo: 'GENERAL',
          destacado: true, // Equivalente a "importante"
          fechaExpiracion: null,
          fechaPublicacion: new Date().toISOString(),
          creadorId: {
            nombre: 'Sistema',
            apellidos: 'EducaNexo360'
          },
          escuelaId: '',
          estado: 'ACTIVO',
          adjuntos: []
        });
      }
    } catch (err) {
      console.error('Error al cargar anuncio:', err);
      setError('No se pudo cargar el anuncio. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = () => {
    navigate(`/anuncios/editar/${id}`);
  };

  const handleEliminar = async () => {
    if (window.confirm('¿Está seguro de eliminar este anuncio?')) {
      try {
        await anuncioService.eliminarAnuncio(id || '');
        navigate('/anuncios');
      } catch (err) {
        console.error('Error al eliminar anuncio:', err);
        setError('Error al eliminar el anuncio. Intente nuevamente más tarde.');
      }
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Sin fecha';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'GENERAL': return 'General';
      case 'CURSO': return 'Curso';
      case 'DOCENTES': return 'Docentes';
      case 'PADRES': return 'Acudientes';
      case 'ESTUDIANTES': return 'Estudiantes';
      default: return tipo;
    }
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
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!anuncio) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        Anuncio no encontrado. La funcionalidad de anuncios está desactivada.
      </Alert>
    );
  }

  // Obtener los destinatarios a partir del tipo de anuncio
  const destinatarios = [anuncio.tipo];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/anuncios')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" color="primary.main">
          Detalle del Anuncio
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          ...(anuncio.destacado && {
            border: '1px solid',
            borderColor: 'warning.main',
            bgcolor: 'rgba(255, 193, 7, 0.05)'
          })
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {anuncio.destacado && (
              <ImportantIcon color="warning" sx={{ mr: 1, fontSize: 28 }} />
            )}
            <Typography 
              variant="h2" 
              color={anuncio.destacado ? 'warning.dark' : 'primary.main'}
            >
              {anuncio.titulo}
            </Typography>
          </Box>
          
          {user?.tipo === 'ADMIN' && (
            <Box>
              <IconButton 
                color="primary" 
                onClick={handleEditar}
                sx={{ 
                  bgcolor: 'rgba(93, 169, 233, 0.1)',
                  mr: 1,
                  '&:hover': {
                    bgcolor: 'rgba(93, 169, 233, 0.2)'
                  }
                }}
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                color="error" 
                onClick={handleEliminar}
                sx={{ 
                  bgcolor: 'rgba(244, 67, 54, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(244, 67, 54, 0.2)'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
              {anuncio.contenido}
            </Typography>
            
            {anuncio.adjuntos && anuncio.adjuntos.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h3" gutterBottom>
                  Adjuntos
                </Typography>
                <List>
                  {anuncio.adjuntos.map((adjunto) => (
                    <ListItem key={adjunto._id}>
                      <ListItemIcon>
                        <AttachFileIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={adjunto.nombre} 
                      />
                      {adjunto.url && (
                        <Button 
                          href={adjunto.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<DownloadIcon />}
                          variant="outlined"
                          size="small"
                          sx={{ borderRadius: '20px' }}
                        >
                          Descargar
                        </Button>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Typography variant="h3" gutterBottom>
                Información
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Autor"
                    secondary={
                      typeof anuncio.creadorId === 'object' && anuncio.creadorId !== null ? 
                        `${anuncio.creadorId.nombre || ''} ${anuncio.creadorId.apellidos || ''}` : 
                        'Usuario del sistema'
                    }
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Fecha de publicación"
                    secondary={formatDate(anuncio.fechaPublicacion)}
                  />
                </ListItem>
                
                {anuncio.fechaExpiracion && (
                  <>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Fecha de expiración"
                        secondary={formatDate(anuncio.fechaExpiracion)}
                      />
                    </ListItem>
                  </>
                )}
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Destinatario"
                    secondary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {destinatarios.map((tipo) => (
                          <Chip 
                            key={tipo} 
                            label={getTipoLabel(tipo)} 
                            size="small" 
                          />
                        ))}
                      </Box>
                    }
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/anuncios')}
                variant="outlined"
                sx={{ borderRadius: '20px' }}
              >
                Volver a Anuncios
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DetalleAnuncio;