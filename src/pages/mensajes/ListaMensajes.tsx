// src/pages/mensajes/ListaMensajes.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
  Paper,
  Button,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Delete as DeleteIcon,
  MarkEmailRead as ReadIcon,
  Email as UnreadIcon,
  Info as InfoIcon,
  Group as GroupIcon,
  Flag as FlagIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Edit as EditIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import mensajeService from '../../services/mensajeService';
import { ROLES_CON_BORRADORES } from '../../types/mensaje.types';

// Definición de interfaces para los tipos
interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
}

interface EstadoUsuario {
  usuarioId: string;
  estado: string;
  fechaAccion?: string | Date;
  _id?: string;
}

interface Mensaje {
  _id: string;
  asunto: string;
  contenido: string;
  remitente: Usuario;
  destinatarios: Usuario[]; 
  destinatariosCc?: Usuario[];
  tipo?: 'CIRCULAR' | 'INDIVIDUAL' | 'NOTIFICACION' | 'BORRADOR' | 'MASIVO' | 'GRUPAL';
  prioridad?: 'ALTA' | 'NORMAL' | 'BAJA';
  estado?: 'ENVIADO' | 'BORRADOR';
  estadoUsuarioActual?: 'ENVIADO' | 'LEIDO' | 'ARCHIVADO' | 'ELIMINADO';
  estadosUsuarios?: EstadoUsuario[]; // Añadimos esta propiedad
  cursoId?: string;
  cursoNombre?: string;
  lecturas?: Array<{usuarioId: string, fechaLectura: string}>;
  leido?: boolean;
  adjuntos?: Array<{
    fileId: string;
    nombre: string;
    tipo: string;
    tamaño: number;
  }>;
  createdAt: string;
  updatedAt: string;
  fechaEliminacion?: string;
}

const ListaMensajes: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Estados para diálogos de confirmación
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [mensajeToDelete, setMensajeToDelete] = useState<string | null>(null);
  const [confirmSendBorradorOpen, setConfirmSendBorradorOpen] = useState<boolean>(false);
  const [borradorToSend, setBorradorToSend] = useState<string | null>(null);
  
  // Determinar la bandeja basándose en la URL
  const getBandeja = () => {
    if (location.pathname.includes('/enviados')) return 'enviados';
    if (location.pathname.includes('/borradores')) return 'borradores';
    if (location.pathname.includes('/archivados')) return 'archivados';
    if (location.pathname.includes('/eliminados')) return 'eliminados';
    return 'recibidos'; // Valor por defecto
  };
  
  const bandeja = getBandeja();

  // Verificar si el usuario tiene acceso a borradores
  const puedeTenerBorradores = user && ROLES_CON_BORRADORES.includes(user.tipo);

  // Verificar si la bandeja es implementada (ahora todas lo son)
  const esImplementada = true;

  useEffect(() => {
    if (esImplementada) {
      cargarMensajes();
    } else {
      // Si la bandeja no está implementada, establecemos mensajes vacíos pero sin error
      setMensajes([]);
      setLoading(false);
    }
  }, [bandeja, esImplementada]);

  // En ListaMensajes.tsx
// En ListaMensajes.tsx, actualizar la función cargarMensajes
// En ListaMensajes.tsx, actualizar la función cargarMensajes

// En ListaMensajes.tsx, actualiza la función cargarMensajes
const cargarMensajes = async () => {
  try {
    setLoading(true);
    setError(null);
    
    let response;
    
    // Manejar borradores con un endpoint específico
    if (bandeja === 'borradores' && puedeTenerBorradores) {
      response = await mensajeService.obtenerBorradores();
    } else {
      // Pasar el ID del usuario para el filtrado adicional
      response = await mensajeService.obtenerMensajes(bandeja, 1, 20, user?._id);
    }
    
    setMensajes(response.data || []);
  } catch (err) {
    console.error(`Error al cargar mensajes de ${bandeja}:`, err);
    setError(`No se pudieron cargar los mensajes. Intente nuevamente más tarde.`);
    setMensajes([]);
  } finally {
    setLoading(false);
  }
};

  const handleVerMensaje = (id: string) => {
    // Si es un borrador, ir a la página de edición
    if (bandeja === 'borradores') {
      navigate(`/mensajes/borradores/editar/${id}`);
    } else {
      // Para otros mensajes, ir a la vista de detalle
      navigate(`/mensajes/${id}`);
    }
  };

  const marcarComoLeido = async (id: string, leido: boolean): Promise<void> => {
    try {
      await mensajeService.marcarComoLeido(id, leido);
      
      // Mensaje de éxito
      setSnackbar({
        open: true,
        message: leido ? 'Mensaje marcado como leído' : 'Mensaje marcado como no leído',
        severity: 'success'
      });
      
      // Actualizar la lista de mensajes
      cargarMensajes();
    } catch (err) {
      console.error('Error al marcar mensaje:', err);
      
      // Mensaje de error
      setSnackbar({
        open: true,
        message: 'Error al marcar el mensaje',
        severity: 'error'
      });
    }
  };

  const eliminarMensaje = async (id: string): Promise<void> => {
    try {
      if (bandeja === 'eliminados') {
        // Si está en la bandeja de eliminados, mostramos el diálogo de confirmación
        setMensajeToDelete(id);
        setConfirmDeleteOpen(true);
      } else if (bandeja === 'borradores') {
        // Si es un borrador, eliminarlo directamente
        await mensajeService.eliminarBorrador(id);
        setSnackbar({
          open: true,
          message: 'Borrador eliminado correctamente',
          severity: 'success'
        });
        // Actualizar la lista de mensajes
        cargarMensajes();
      } else {
        // Si no está en la bandeja de eliminados, simplemente lo movemos a eliminados
        await mensajeService.eliminarMensaje(id);
        setSnackbar({
          open: true,
          message: 'Mensaje movido a la papelera',
          severity: 'success'
        });
        // Actualizar la lista de mensajes
        cargarMensajes();
      }
    } catch (err) {
      console.error('Error al eliminar mensaje:', err);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el mensaje',
        severity: 'error'
      });
    }
  };

  const eliminarDefinitivamente = async (): Promise<void> => {
    if (!mensajeToDelete) return;
    
    try {
      await mensajeService.eliminarDefinitivamente(mensajeToDelete);
      setConfirmDeleteOpen(false);
      setMensajeToDelete(null);
      setSnackbar({
        open: true,
        message: 'Mensaje eliminado permanentemente',
        severity: 'success'
      });
      // Actualizar la lista de mensajes
      cargarMensajes();
    } catch (err) {
      console.error('Error al eliminar definitivamente:', err);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el mensaje permanentemente',
        severity: 'error'
      });
    }
  };

  const restaurarMensaje = async (id: string): Promise<void> => {
    try {
      await mensajeService.restaurarMensaje(id);
      setSnackbar({
        open: true,
        message: 'Mensaje restaurado correctamente',
        severity: 'success'
      });
      // Actualizar la lista de mensajes
      cargarMensajes();
    } catch (err) {
      console.error('Error al restaurar mensaje:', err);
      setSnackbar({
        open: true,
        message: 'Error al restaurar el mensaje',
        severity: 'error'
      });
    }
  };

  // Función para archivar un mensaje
  // En ListaMensajes.tsx
const archivarMensaje = async (id: string): Promise<void> => {
  try {
    // Pasar la bandeja actual al servicio
    await mensajeService.archivarMensaje(id, bandeja);
    setSnackbar({
      open: true,
      message: 'Mensaje archivado correctamente',
      severity: 'success'
    });
    // Actualizar la lista de mensajes
    cargarMensajes();
  } catch (err) {
    console.error('Error al archivar mensaje:', err);
    setSnackbar({
      open: true,
      message: 'Error al archivar el mensaje',
      severity: 'error'
    });
  }
};

  // Función para desarchivar un mensaje
  const desarchivarMensaje = async (id: string): Promise<void> => {
    try {
      await mensajeService.desarchivarMensaje(id);
      setSnackbar({
        open: true,
        message: 'Mensaje desarchivado correctamente',
        severity: 'success'
      });
      // Actualizar la lista de mensajes
      cargarMensajes();
    } catch (err) {
      console.error('Error al desarchivar mensaje:', err);
      setSnackbar({
        open: true,
        message: 'Error al desarchivar el mensaje',
        severity: 'error'
      });
    }
  };

  // Función para enviar un borrador
  const handleEnviarBorrador = (id: string): void => {
    setBorradorToSend(id);
    setConfirmSendBorradorOpen(true);
  };

  const enviarBorrador = async (): Promise<void> => {
    if (!borradorToSend) return;
    
    try {
      await mensajeService.enviarBorrador(borradorToSend);
      setConfirmSendBorradorOpen(false);
      setBorradorToSend(null);
      setSnackbar({
        open: true,
        message: 'Borrador enviado exitosamente',
        severity: 'success'
      });
      // Actualizar la lista de mensajes
      cargarMensajes();
    } catch (err) {
      console.error('Error al enviar borrador:', err);
      setSnackbar({
        open: true,
        message: 'Error al enviar el borrador',
        severity: 'error'
      });
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return 'Fecha inválida';
    }
  };

  const getBandejaTitle = (): string => {
    switch (bandeja) {
      case 'recibidos': return 'Mensajes Recibidos';
      case 'enviados': return 'Mensajes Enviados';
      case 'borradores': return 'Borradores';
      case 'archivados': return 'Mensajes Archivados';
      case 'eliminados': return 'Mensajes Eliminados';
      default: return 'Mensajes';
    }
  };

  const isLeido = (mensaje: Mensaje): boolean => {
    // Si ya existe la propiedad leido, usarla
    if (mensaje.leido !== undefined) return mensaje.leido;
    
    // Si no, verificar en el array de lecturas
    if (mensaje.lecturas && mensaje.lecturas.length > 0) {
      // Aquí podrías comparar con el ID del usuario actual si está disponible
      return true;
    }
    return false;
  };

  // Función para renderizar información de destinatarios
  const renderDestinatariosInfo = (mensaje: Mensaje): string => {
    if (bandeja === 'recibidos' || bandeja === 'eliminados' || bandeja === 'archivados') {
      return mensaje.remitente 
        ? `${mensaje.remitente.nombre || ''} ${mensaje.remitente.apellidos || ''} ${mensaje.remitente.tipo ? `(${mensaje.remitente.tipo})` : ''}` 
        : 'Remitente desconocido';
    } else {
      // Para bandeja enviados y borradores
      if (mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') {
        return `Mensaje a curso ${mensaje.cursoNombre || ''} - ${mensaje.destinatarios?.length || 0} destinatarios`;
      } else if (mensaje.destinatarios?.length > 1) {
        return `${mensaje.destinatarios[0].nombre || ''} ${mensaje.destinatarios[0].apellidos || ''} (+${mensaje.destinatarios.length - 1} más)`;
      } else if (mensaje.destinatarios?.length === 1) {
        return `${mensaje.destinatarios[0].nombre || ''} ${mensaje.destinatarios[0].apellidos || ''}`;
      } else {
        return 'Sin destinatarios';
      }
    }
  };

  // Función para renderizar el icono adecuado según el tipo de mensaje
  const renderMensajeIcon = (mensaje: Mensaje) => {
    if (mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') {
      return (
        <Tooltip title="Mensaje masivo">
          <Avatar sx={{ bgcolor: isLeido(mensaje) ? 'secondary.light' : 'secondary.main' }}>
            <GroupIcon />
          </Avatar>
        </Tooltip>
      );
    } else if (bandeja === 'borradores') {
      return (
        <Tooltip title="Borrador">
          <Avatar sx={{ bgcolor: 'warning.light' }}>
            <EditIcon />
          </Avatar>
        </Tooltip>
      );
    } else {
      return (
        <Avatar sx={{ bgcolor: isLeido(mensaje) ? 'grey.300' : 'primary.main' }}>
          <PersonIcon />
        </Avatar>
      );
    }
  };

  // Renderizar chip de prioridad si no es normal
  const renderPrioridadChip = (mensaje: Mensaje) => {
    if (!mensaje.prioridad || mensaje.prioridad === 'NORMAL') return null;
    
    return (
      <Chip 
        icon={<FlagIcon sx={{ fontSize: '0.8rem !important' }} />}
        label={mensaje.prioridad === 'ALTA' ? 'Prioridad alta' : 'Baja prioridad'} 
        size="small" 
        color={mensaje.prioridad === 'ALTA' ? 'error' : 'default'} 
        sx={{ 
          height: 20, 
          borderRadius: 10,
          ml: 1,
          '& .MuiChip-label': { px: 1 }
        }}
      />
    );
  };

  // Renderizar información de tiempo restante antes de eliminación permanente
  const renderTiempoEliminacion = (mensaje: Mensaje) => {
    if (bandeja !== 'eliminados' || !mensaje.fechaEliminacion) return null;
    
    const fechaEliminacion = new Date(mensaje.fechaEliminacion);
    const fechaEliminacionPermanente = new Date(fechaEliminacion);
    fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + 30); // 30 días para eliminación permanente
    
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaEliminacionPermanente.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
        Eliminación permanente en {diasRestantes} días
      </Typography>
    );
  };

  // Renderizar botones de acciones específicos según la bandeja
  const renderAcciones = (mensaje: Mensaje) => {
    if (bandeja === 'borradores') {
      return (
        <Box>
          <Tooltip title="Enviar borrador">
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                handleEnviarBorrador(mensaje._id);
              }}
              sx={{ mr: 1 }}
            >
              <SendIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar borrador">
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/mensajes/borradores/editar/${mensaje._id}`);
              }}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar borrador">
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                eliminarMensaje(mensaje._id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else if (bandeja === 'archivados') {
      return (
        <Box>
          <Tooltip title="Desarchivar mensaje">
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                desarchivarMensaje(mensaje._id);
              }}
              sx={{ mr: 1 }}
            >
              <UnarchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar mensaje">
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                eliminarMensaje(mensaje._id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else if (bandeja === 'eliminados') {
      return (
        <Box>
          <Tooltip title="Restaurar mensaje">
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                restaurarMensaje(mensaje._id);
              }}
              sx={{ mr: 1 }}
            >
              <RestoreIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar permanentemente">
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                eliminarMensaje(mensaje._id);
              }}
            >
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else if (bandeja === 'recibidos') {
      return (
        <Box>
          <Tooltip title={isLeido(mensaje) ? "Marcar como no leído" : "Marcar como leído"}>
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                marcarComoLeido(mensaje._id, !isLeido(mensaje));
              }}
              sx={{ mr: 1 }}
            >
              {isLeido(mensaje) ? <ReadIcon /> : <UnreadIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Archivar mensaje">
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                archivarMensaje(mensaje._id);
              }}
              sx={{ mr: 1 }}
            >
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar mensaje">
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                eliminarMensaje(mensaje._id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
    } else {
      // Para bandeja enviados y otras
      return (
        <Box>
          <Tooltip title="Archivar mensaje">
            <IconButton 
              color="primary" 
              onClick={(e) => {
                e.stopPropagation();
                archivarMensaje(mensaje._id);
              }}
              sx={{ mr: 1 }}
            >
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar mensaje">
            <IconButton 
              color="error" 
              onClick={(e) => {
                e.stopPropagation();
                eliminarMensaje(mensaje._id);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      );
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
      <Box>
        <Typography variant="h2" gutterBottom>
          {getBandejaTitle()}
        </Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        {getBandejaTitle()}
      </Typography>
      
      <Paper elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', borderRadius: 3, mt: 2 }}>
        {mensajes.length > 0 ? (
          <List>
            {mensajes.map((mensaje) => (
              <React.Fragment key={mensaje._id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{ 
                    py: 2,
                    cursor: 'pointer',
                    bgcolor: (!isLeido(mensaje) && bandeja === 'recibidos') ? 'rgba(93, 169, 233, 0.05)' : 
                             (bandeja === 'borradores') ? 'rgba(255, 152, 0, 0.05)' :
                             (mensaje.prioridad === 'ALTA') ? 'rgba(255, 0, 0, 0.03)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(93, 169, 233, 0.1)',
                    }
                  }}
                  onClick={() => handleVerMensaje(mensaje._id)}
                  secondaryAction={renderAcciones(mensaje)}
                >
                  <ListItemAvatar>
                    {renderMensajeIcon(mensaje)}
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography 
                          variant="subtitle1" 
                          component="span" 
                          sx={{ 
                            fontWeight: isLeido(mensaje) ? 400 : 500,
                            color: isLeido(mensaje) ? 'text.primary' : 'primary.main',
                            mr: 1
                          }}
                        >
                          {mensaje.asunto}
                        </Typography>
                        {!isLeido(mensaje) && bandeja === 'recibidos' && (
                          <Chip 
                            label="Nuevo" 
                            size="small" 
                            color="primary" 
                            sx={{ height: 20, borderRadius: 10 }}
                          />
                        )}
                        {(mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') && (
                          <Chip 
                            label="Masivo" 
                            size="small" 
                            color="secondary" 
                            sx={{ height: 20, borderRadius: 10, ml: 1 }}
                          />
                        )}
                        {bandeja === 'borradores' && (
                          <Chip 
                            label="Borrador" 
                            size="small" 
                            color="warning" 
                            sx={{ height: 20, borderRadius: 10, ml: 1 }}
                          />
                        )}
                        {renderPrioridadChip(mensaje)}
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography component="span" variant="body2" color="text.primary">
                          {renderDestinatariosInfo(mensaje)}
                        </Typography>
                        <Typography component="div" variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {mensaje.contenido.replace(/<[^>]*>/g, '').substring(0, 100)}
                          {mensaje.contenido.length > 100 ? '...' : ''}
                        </Typography>
                        {renderTiempoEliminacion(mensaje)}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption">
                            {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
                              <span>
                                <IconButton size="small" disabled sx={{ p: 0, mr: 0.5 }}>
                                  <InfoIcon fontSize="inherit" />
                                </IconButton>
                                {mensaje.adjuntos.length} adjunto(s)
                              </span>
                            )}
                          </Typography>
                          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                            {formatDate(mensaje.createdAt)}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                    primaryTypographyProps={{ 
                      component: 'div',
                    }}
                    secondaryTypographyProps={{
                      component: 'div',
                    }}
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No hay mensajes en esta bandeja
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Diálogo de confirmación para eliminación permanente */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar mensaje permanentemente?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción no se puede deshacer. El mensaje será eliminado permanentemente del sistema.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={eliminarDefinitivamente} color="error" autoFocus>
            Eliminar permanentemente
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para enviar borrador */}
      <Dialog
        open={confirmSendBorradorOpen}
        onClose={() => setConfirmSendBorradorOpen(false)}
        aria-labelledby="send-dialog-title"
        aria-describedby="send-dialog-description"
      >
        <DialogTitle id="send-dialog-title">
          {"¿Enviar borrador ahora?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="send-dialog-description">
            El borrador se enviará a todos los destinatarios seleccionados y ya no estará disponible para edición.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSendBorradorOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={enviarBorrador} color="primary" variant="contained" autoFocus>
            Enviar ahora
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mostrar mensajes de éxito o error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ListaMensajes;