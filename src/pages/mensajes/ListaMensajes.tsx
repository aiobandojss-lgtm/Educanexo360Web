// src/pages/mensajes/ListaMensajes.tsx (actualizado)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  List,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Paper,
  TextField,
  Button,
  Grid,
  ListItemButton,
  Card,
} from '@mui/material';
import {
  Delete,
  Archive,
  MarkEmailRead,
  AddCircle,
  Search,
  PriorityHigh,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../../api/axiosConfig';
import { IMensaje } from '../../types/mensaje.types';

const ListaMensajes = () => {
  const { bandeja = 'recibidos' } = useParams();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<IMensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [totalMensajes, setTotalMensajes] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [limite] = useState(20);

  useEffect(() => {
    fetchMensajes();
  }, [bandeja, pagina]);

  const fetchMensajes = async () => {
    try {
      setLoading(true);
      
      const res = await axiosInstance.get('/mensajes', {
        params: {
          bandeja,
          pagina,
          limite,
          busqueda: busqueda || undefined,
        },
      });
      
      setMensajes(res.data.data);
      setTotalMensajes(res.data.meta?.total || 0);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setPagina(1);
    fetchMensajes();
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda('');
    setPagina(1);
    fetchMensajes();
  };

  const handleArchivar = async (id: string) => {
    try {
      await axiosInstance.put(`/mensajes/${id}/archivar`);
      setMensajes(mensajes.filter(m => m._id !== id));
    } catch (error) {
      console.error('Error al archivar mensaje:', error);
    }
  };

  const handleNuevoMensaje = () => {
    navigate('/mensajes/nuevo');
  };

  const renderNombreRemitente = (mensaje: IMensaje) => {
    if (bandeja === 'enviados' || bandeja === 'borradores') {
      // Para mensajes enviados, mostrar destinatarios
      const destinatarios = mensaje.destinatarios;
      if (destinatarios.length === 0) return 'Sin destinatarios';
      if (destinatarios.length === 1) {
        return `Para: ${destinatarios[0].nombre} ${destinatarios[0].apellidos}`;
      }
      return `Para: ${destinatarios.length} destinatarios`;
    } else {
      // Para mensajes recibidos, mostrar remitente
      return `De: ${mensaje.remitente.nombre} ${mensaje.remitente.apellidos}`;
    }
  };

  const getInitials = (nombre: string, apellidos: string) => {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h1" color="primary.main">
            {bandeja === 'recibidos' && 'Mensajes Recibidos'}
            {bandeja === 'enviados' && 'Mensajes Enviados'}
            {bandeja === 'borradores' && 'Borradores'}
            {bandeja === 'archivados' && 'Mensajes Archivados'}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddCircle />}
            onClick={handleNuevoMensaje}
            sx={{ 
              borderRadius: '20px',
              px: 3 
            }}
          >
            Nuevo Mensaje
          </Button>
        </Grid>
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
          <Grid item xs>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar en mensajes..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              InputProps={{ 
                sx: { borderRadius: 20 } 
              }}
            />
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleBuscar}
              sx={{ borderRadius: 20 }}
            >
              Buscar
            </Button>
          </Grid>
          {busqueda && (
            <Grid item>
              <Button 
                variant="text" 
                onClick={handleLimpiarBusqueda}
                sx={{ borderRadius: 20 }}
              >
                Limpiar
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Card 
          elevation={0} 
          sx={{ 
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
            borderRadius: 3 
          }}
        >
          {mensajes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1">No hay mensajes para mostrar</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {mensajes.map((mensaje) => (
                <React.Fragment key={mensaje._id}>
                  <ListItemButton
                    alignItems="flex-start"
                    onClick={() => navigate(`/mensajes/${mensaje._id}`)}
                    sx={{
                      borderLeft: '4px solid',
                      borderColor: mensaje.prioridad === 'ALTA' 
                        ? 'error.main' 
                        : (
                          bandeja === 'recibidos' &&
                          !mensaje.lecturas?.some(
                            (l) => l.usuarioId === 'CURRENT_USER_ID'
                          )
                            ? 'primary.main'
                            : 'transparent'
                        ),
                      px: 3,
                      py: 2,
                      '&:hover': {
                        bgcolor: 'rgba(93, 169, 233, 0.08)'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        sx={{ 
                          bgcolor: bandeja === 'recibidos' ? 'primary.main' : 'secondary.main',
                          width: 45,
                          height: 45,
                          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {bandeja === 'recibidos'
                          ? getInitials(mensaje.remitente.nombre, mensaje.remitente.apellidos)
                          : getInitials(mensaje.destinatarios[0]?.nombre || 'U', mensaje.destinatarios[0]?.apellidos || 'S')}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography
                            variant="subtitle1"
                            component="span"
                            sx={{
                              fontWeight:
                                bandeja === 'recibidos' &&
                                !mensaje.lecturas?.some(
                                  (l) => l.usuarioId === 'CURRENT_USER_ID'
                                )
                                  ? 'bold'
                                  : 'normal',
                              color: 'primary.main'
                            }}
                          >
                            {mensaje.asunto}
                          </Typography>
                          {mensaje.prioridad === 'ALTA' && (
                            <Tooltip title="Alta prioridad">
                              <PriorityHigh color="error" fontSize="small" sx={{ ml: 1 }} />
                            </Tooltip>
                          )}
                          {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                            <Chip
                              label={`${mensaje.adjuntos.length} adjunto(s)`}
                              size="small"
                              variant="outlined"
                              sx={{ ml: 1, borderRadius: 16 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {renderNombreRemitente(mensaje)}
                          </Typography>
                          {' — '}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            {mensaje.contenido.substring(0, 70)}
                            {mensaje.contenido.length > 70 ? '...' : ''}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(mensaje.createdAt), 'dd/MM/yyyy HH:mm')}
                            </Typography>
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <Box sx={{ display: 'flex' }}>
                      {bandeja !== 'archivados' && (
                        <Tooltip title="Archivar">
                          <IconButton
                            edge="end"
                            aria-label="archivar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchivar(mensaje._id);
                            }}
                            sx={{ color: 'secondary.main' }}
                          >
                            <Archive />
                          </IconButton>
                        </Tooltip>
                      )}
                      {bandeja === 'recibidos' && (
                        <Tooltip title="Marcar como leído">
                          <IconButton
                            edge="end"
                            aria-label="marcar leído"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Implementar lógica de marcar como leído
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <MarkEmailRead />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ListItemButton>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>
      )}
    </Box>
  );
};

export default ListaMensajes;