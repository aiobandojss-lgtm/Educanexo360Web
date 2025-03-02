// src/pages/mensajes/DetalleMensaje.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Reply,
  Delete,
  Archive,
  ArrowBack,
  AttachFile,
  Download,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axiosInstance from '../../api/axiosConfig';
import { IMensaje } from '../../types/mensaje.types';

const DetalleMensaje = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState<IMensaje | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMensaje();
  }, [id]);

  const fetchMensaje = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/mensajes/${id}`);
      setMensaje(res.data.data);
    } catch (error) {
      console.error('Error al obtener mensaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    navigate(-1);
  };

  const handleResponder = () => {
    navigate(`/mensajes/responder/${id}`);
  };

  const handleArchivar = async () => {
    try {
      await axiosInstance.put(`/mensajes/${id}/archivar`);
      navigate(-1);
    } catch (error) {
      console.error('Error al archivar mensaje:', error);
    }
  };

  const handleDescargarAdjunto = async (adjuntoId: string, nombre: string) => {
    try {
      const response = await axiosInstance.get(`/mensajes/${id}/adjuntos/${adjuntoId}`, {
        responseType: 'blob',
      });
      
      // Crear URL del blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nombre);
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar adjunto:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!mensaje) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Mensaje no encontrado</Typography>
        <Button variant="outlined" onClick={handleVolver} sx={{ mt: 2 }}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleVolver}
        >
          Volver
        </Button>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Reply />}
            onClick={handleResponder}
            sx={{ mr: 1 }}
          >
            Responder
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Archive />}
            onClick={handleArchivar}
          >
            Archivar
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {mensaje.asunto}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            {mensaje.remitente.nombre.charAt(0)}
            {mensaje.remitente.apellidos.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle1">
              {mensaje.remitente.nombre} {mensaje.remitente.apellidos}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {mensaje.remitente.email}
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Typography variant="caption" color="text.secondary">
              {format(new Date(mensaje.createdAt), 'dd/MM/yyyy HH:mm')}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Para:
            {mensaje.destinatarios.map((dest, idx) => (
              <Chip
                key={dest._id}
                label={`${dest.nombre} ${dest.apellidos}`}
                size="small"
                sx={{ ml: 1, mb: 1 }}
              />
            ))}
          </Typography>
          
          {mensaje.destinatariosCc && mensaje.destinatariosCc.length > 0 && (
            <Typography variant="subtitle2" color="text.secondary">
              CC:
              {mensaje.destinatariosCc.map((dest, idx) => (
                <Chip
                  key={dest._id}
                  label={`${dest.nombre} ${dest.apellidos}`}
                  size="small"
                  sx={{ ml: 1, mb: 1 }}
                />
              ))}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: mensaje.contenido.replace(/\n/g, '<br/>') }} />
        </Box>
        
        {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              <AttachFile fontSize="small" sx={{ verticalAlign: 'middle' }} />
              Adjuntos:
            </Typography>
            <List>
              {mensaje.adjuntos.map((adjunto) => (
                <ListItem key={adjunto.fileId.toString()}>
                  <ListItemIcon>
                    <AttachFile />
                  </ListItemIcon>
                  <ListItemText
                    primary={adjunto.nombre}
                    secondary={`${(adjunto.tamaño / 1024).toFixed(2)} KB`}
                  />
                  <Tooltip title="Descargar">
                    <IconButton
                      edge="end"
                      aria-label="descargar"
                      onClick={() => handleDescargarAdjunto(adjunto.fileId.toString(), adjunto.nombre)}
                    >
                      <Download />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        // src/pages/mensajes/DetalleMensaje.tsx (continuación)
        {mensaje.esRespuesta && mensaje.mensajeOriginalId && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Mensaje original
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {/* Aquí podría mostrarse información del mensaje original */}
              Este mensaje es una respuesta a una conversación anterior.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DetalleMensaje;