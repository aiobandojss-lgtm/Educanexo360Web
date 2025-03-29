// src/components/dashboard/DashboardWidgets.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Event as EventIcon,
  Announcement as AnnouncementIcon,
  Today as TodayIcon,
  School as SchoolIcon,
  SportsSoccer as SportsIcon,
  Celebration as CelebrationIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import calendarioService, { IEvento } from '../../services/calendarioService';
import anuncioService, { IAnuncio } from '../../services/anuncioService';

export const EventosRecientesWidget: React.FC = () => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<IEvento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);
        
        // Obtener eventos para los próximos 30 días
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30);
        
        const eventosProximos = await calendarioService.obtenerEventos({
          inicio: fechaInicio.toISOString(),
          fin: fechaFin.toISOString()
        });
        
        // Ordenar por fecha más cercana y limitar a 5
        const eventosOrdenados = eventosProximos
          .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
          .slice(0, 5);
        
        setEventos(eventosOrdenados);
      } catch (err) {
        console.error('Error al cargar eventos:', err);
        setError('No se pudieron cargar los próximos eventos');
      } finally {
        setLoading(false);
      }
    };
    
    cargarEventos();
  }, []);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'ACADEMICO': return <SchoolIcon color="primary" />;
      case 'INSTITUCIONAL': return <EventIcon color="secondary" />;
      case 'CULTURAL': return <CelebrationIcon sx={{ color: 'success.main' }} />;
      case 'DEPORTIVO': return <SportsIcon sx={{ color: 'warning.main' }} />;
      default: return <TodayIcon color="action" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <Typography variant="h3">Próximos Eventos</Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : eventos.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>No hay eventos próximos</Alert>
        ) : (
          <List disablePadding>
            {eventos.map((evento, index) => (
              <React.Fragment key={evento._id}>
                <ListItem disablePadding sx={{ py: 1.5 }}>
                  <Box mr={1.5}>{getTypeIcon(evento.tipo)}</Box>
                  <ListItemText
                    primary={evento.titulo}
                    secondary={formatDate(evento.fechaInicio)}
                  />
                </ListItem>
                {index < eventos.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/calendario')}
                size="small"
              >
                Ver Calendario
              </Button>
            </Box>
          </List>
        )}
      </Box>
    </Paper>
  );
};

export const AnunciosRecientesWidget: React.FC = () => {
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState<IAnuncio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarAnuncios = async () => {
      try {
        setLoading(true);
        
        // Obtener anuncios destacados o recientes
        const anunciosResponse = await anuncioService.obtenerAnuncios({
          estado: 'PUBLICADO',
          pagina: 1,
          limite: 5
        });
        
        // Priorizar los destacados
        const anunciosOrdenados = Array.isArray(anunciosResponse) ? 
          anunciosResponse.sort((a, b) => {
            // Primero por destacado
            if (a.destacado && !b.destacado) return -1;
            if (!a.destacado && b.destacado) return 1;
            // Luego por fecha de publicación
            return new Date(b.fechaPublicacion).getTime() - new Date(a.fechaPublicacion).getTime();
          }).slice(0, 5) : [];
        
        setAnuncios(anunciosOrdenados);
      } catch (err) {
        console.error('Error al cargar anuncios:', err);
        setError('No se pudieron cargar los anuncios');
      } finally {
        setLoading(false);
      }
    };
    
    cargarAnuncios();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  return (
    <Paper elevation={0} sx={{ borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', height: '100%' }}>
      <Box sx={{ p: 2, bgcolor: 'secondary.main', color: 'white', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
        <Typography variant="h3">Anuncios Recientes</Typography>
      </Box>
      
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : anuncios.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>No hay anuncios publicados</Alert>
        ) : (
          <List disablePadding>
            {anuncios.map((anuncio, index) => (
              <React.Fragment key={anuncio._id}>
                <ListItem disablePadding sx={{ py: 1.5 }}>
                  <Box mr={1.5}>
                    <AnnouncementIcon color={anuncio.destacado ? 'warning' : 'action'} />
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          sx={{ 
                            fontWeight: anuncio.destacado ? 600 : 400,
                            color: anuncio.destacado ? 'warning.dark' : 'inherit',
                            mr: 1
                          }}
                        >
                          {anuncio.titulo}
                        </Typography>
                        {anuncio.destacado && (
                          <Chip
                            label="Destacado"
                            size="small"
                            color="warning"
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={formatDate(anuncio.fechaPublicacion)}
                  />
                </ListItem>
                {index < anuncios.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/anuncios')}
                size="small"
              >
                Ver todos los anuncios
              </Button>
            </Box>
          </List>
        )}
      </Box>
    </Paper>
  );
};