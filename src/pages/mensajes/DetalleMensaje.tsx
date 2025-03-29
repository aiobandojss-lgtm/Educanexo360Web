// src/pages/mensajes/DetalleMensaje.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  MoreVert as MoreVertIcon,
  AttachFile as AttachFileIcon,
  Description as FileIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  Download as DownloadIcon,
  Flag as FlagIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Restore as RestoreIcon,
  DeleteForever as DeleteForeverIcon,
  MarkEmailRead as MarkReadIcon,
  Email as MarkUnreadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import mensajeService from '../../services/mensajeService';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';


interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  tipo?: string;
}

interface Mensaje {
  _id: string;
  asunto: string;
  contenido: string;
  remitente: Usuario | null;
  destinatarios: Usuario[];
  destinatariosCc?: Usuario[];
  tipo?: 'CIRCULAR' | 'INDIVIDUAL' | 'NOTIFICACION' | 'BORRADOR' | 'MASIVO' | 'GRUPAL';
  prioridad?: 'ALTA' | 'NORMAL' | 'BAJA';
  cursoId?: string;
  cursoNombre?: string;
  createdAt: string;
  lecturas?: Array<{usuarioId: string, fechaLectura: string}>;
  estado?: 'ENVIADO' | 'BORRADOR';
  estadoUsuarioActual?: 'ENVIADO' | 'LEIDO' | 'ARCHIVADO' | 'ELIMINADO';
  leido?: boolean;
  adjuntos?: Array<{
    fileId: string;
    nombre: string;
    tipo: string;
    tamaño: number;
  }>;
  fechaEliminacion?: string;
}

const DetalleMensaje = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation(); 
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDestinatarios, setShowDestinatarios] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const menuOpen = Boolean(anchorEl);
  const isEliminado = mensaje?.estadoUsuarioActual === 'ELIMINADO';
  const isArchivado = mensaje?.estadoUsuarioActual === 'ARCHIVADO';
  
  useEffect(() => {
    cargarMensaje();
  }, [id]);
  
  const cargarMensaje = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Asegurarse de que id sea un ID válido antes de hacer la solicitud
      if (!id || id === 'eliminados' || id === 'recibidos' || id === 'enviados' || id === 'borradores' || id === 'archivados') {
        // Si no es un ID válido, redirigir a la bandeja correspondiente
        navigate(`/mensajes/${id || 'recibidos'}`);
        return;
      }
      
      const data = await mensajeService.obtenerMensajePorId(id);
      setMensaje(data);
    } catch (error) {
      console.error('Error al cargar mensaje:', error);
      setError('No se pudo cargar el mensaje. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleResponder = () => {
    navigate(`/mensajes/responder/${id}`);
  };
  
  const handleMarcarComoLeido = async (leido: boolean) => {
    try {
      await mensajeService.marcarComoLeido(id!, leido);
      setSnackbar({
        open: true,
        message: leido ? 'Mensaje marcado como leído' : 'Mensaje marcado como no leído',
        severity: 'success'
      });
      // Actualizar el estado local
      if (mensaje) {
        setMensaje({
          ...mensaje,
          leido: leido
        });
      }
    } catch (error) {
      console.error('Error al marcar mensaje:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo cambiar el estado de lectura del mensaje',
        severity: 'error'
      });
    }
  };
  
  const handleEliminar = async () => {
    try {
      // Si ya está eliminado, mostramos confirmación para eliminación permanente
      if (isEliminado) {
        setConfirmDeleteOpen(true);
      } else {
        // Si no está eliminado, lo movemos a la papelera
        await mensajeService.eliminarMensaje(id!);
        setSnackbar({
          open: true,
          message: 'Mensaje movido a la papelera',
          severity: 'success'
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo eliminar el mensaje',
        severity: 'error'
      });
    }
  };

  const handleEliminarDefinitivamente = async () => {
    try {
      await mensajeService.eliminarDefinitivamente(id!);
      setConfirmDeleteOpen(false);
      setSnackbar({
        open: true,
        message: 'Mensaje eliminado permanentemente',
        severity: 'success'
      });
      navigate('/mensajes/eliminados');
    } catch (error) {
      console.error('Error al eliminar definitivamente:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo eliminar el mensaje definitivamente',
        severity: 'error'
      });
    }
  };
  
  // En DetalleMensaje.tsx
  const handleArchivar = async () => {
    try {
      // Determinar desde qué bandeja estamos archivando basado en la URL actual
      const esEnviado = location.pathname.includes('/enviados') || 
                        (location.state && location.state.fromEnviados);
      
      // Pasar la bandeja como parámetro
      await mensajeService.archivarMensaje(id!, esEnviado ? 'enviados' : 'recibidos');
      setSnackbar({
        open: true,
        message: 'Mensaje archivado correctamente',
        severity: 'success'
      });
      navigate(-1);
    } catch (error) {
      console.error('Error al archivar mensaje:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo archivar el mensaje',
        severity: 'error'
      });
    }
  };

  const handleDesarchivar = async () => {
    try {
      await mensajeService.desarchivarMensaje(id!);
      setSnackbar({
        open: true,
        message: 'Mensaje desarchivado correctamente',
        severity: 'success'
      });
      navigate(-1);
    } catch (error) {
      console.error('Error al desarchivar mensaje:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo desarchivar el mensaje',
        severity: 'error'
      });
    }
  };

  const handleRestaurar = async () => {
    try {
      await mensajeService.restaurarMensaje(id!);
      setSnackbar({
        open: true,
        message: 'Mensaje restaurado correctamente',
        severity: 'success'
      });
      navigate(-1);
    } catch (error) {
      console.error('Error al restaurar mensaje:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo restaurar el mensaje',
        severity: 'error'
      });
    }
  };
  
  const getIconByFileType = (tipo: string) => {
    if (tipo.includes('pdf')) return <PdfIcon color="error" />;
    if (tipo.includes('image')) return <ImageIcon color="primary" />;
    return <FileIcon color="action" />;
  };
  
  const descargarAdjunto = async (fileId: string, nombre: string) => {
    try {
      // Usar responseType: 'blob' para manejar datos binarios
      const response = await mensajeService.descargarAdjunto(id!, fileId);
      
      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(new Blob([response]));
      
      // Crear un elemento <a> para la descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar el objeto URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar adjunto:', error);
      setSnackbar({
        open: true,
        message: 'No se pudo descargar el archivo adjunto',
        severity: 'error'
      });
    }
  };

  // Renderizar chip de prioridad
  const renderPrioridadChip = () => {
    if (!mensaje?.prioridad || mensaje.prioridad === 'NORMAL') return null;
    
    return (
      <Chip
        icon={<FlagIcon />}
        label={mensaje.prioridad === 'ALTA' ? 'Prioridad Alta' : 'Prioridad Baja'}
        color={mensaje.prioridad === 'ALTA' ? 'error' : 'default'}
        size="small"
        sx={{ ml: 1 }}
      />
    );
  };

  // Renderizar información de tipo de mensaje
  const renderTipoMensaje = () => {
    if (mensaje?.tipo === 'MASIVO' || mensaje?.tipo === 'GRUPAL') {
      return (
        <Chip
          icon={<GroupIcon />}
          label="Mensaje Masivo"
          color="secondary"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    }
    return null;
  };

  // Renderizar información de estado de mensaje
  const renderEstadoMensaje = () => {
    if (isEliminado && mensaje?.fechaEliminacion) {
      const fechaEliminacion = new Date(mensaje.fechaEliminacion);
      const fechaEliminacionPermanente = new Date(fechaEliminacion);
      fechaEliminacionPermanente.setDate(fechaEliminacionPermanente.getDate() + 30); // 30 días para eliminación permanente
      
      const hoy = new Date();
      const diasRestantes = Math.ceil((fechaEliminacionPermanente.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      
      return (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">
            Este mensaje está en la papelera. Se eliminará permanentemente en {diasRestantes} días.
          </Typography>
        </Alert>
      );
    } else if (isArchivado) {
      return (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="body2">
            Este mensaje está archivado. Puede desarchivarlo para moverlo de nuevo a su bandeja original.
          </Typography>
        </Alert>
      );
    }
    return null;
  };

  // Renderizar acciones adicionales según el estado del mensaje
  const renderAcciones = () => {
    // Verificar si el usuario es estudiante
    const isEstudiante = user?.tipo === 'ESTUDIANTE';
    
    if (isEliminado) {
      return (
        <>
          <Button
            startIcon={<RestoreIcon />}
            onClick={handleRestaurar}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '20px' }}
          >
            Restaurar
          </Button>
          <Button
            startIcon={<DeleteForeverIcon />}
            onClick={handleEliminar}
            variant="outlined"
            color="error"
            sx={{ borderRadius: '20px' }}
          >
            Eliminar permanentemente
          </Button>
        </>
      );
    } else if (isArchivado) {
      return (
        <>
          <Button
            startIcon={<UnarchiveIcon />}
            onClick={handleDesarchivar}
            variant="contained"
            color="primary"
            sx={{ borderRadius: '20px' }}
          >
            Desarchivar
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleEliminar}
            variant="outlined"
            color="error"
            sx={{ borderRadius: '20px' }}
          >
            Eliminar
          </Button>
        </>
      );
    } else {
      return (
        <>
          {/* Mostrar botón Responder solo si NO es estudiante */}
          {!isEstudiante && (
            <Button
              startIcon={<ReplyIcon />}
              onClick={handleResponder}
              variant="contained"
              color="primary"
              sx={{ borderRadius: '20px' }}
            >
              Responder
            </Button>
          )}
          
          {/* El botón Archivar se muestra para todos los roles */}
          <Button
            startIcon={<ArchiveIcon />}
            onClick={handleArchivar}
            variant="outlined"
            sx={{ borderRadius: '20px' }}
          >
            Archivar
          </Button>
          
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleEliminar}
            variant="outlined"
            color="error"
            sx={{ borderRadius: '20px' }}
          >
            Eliminar
          </Button>
        </>
      );
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !mensaje) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>
        
        <Alert severity="error">
          {error || 'No se encontró el mensaje solicitado.'}
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Barra superior con acciones */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center',
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="text"
        >
          Volver
        </Button>
        
        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {renderAcciones()}
          
          <IconButton
            onClick={handleMenuClick}
            aria-controls={menuOpen ? 'mensaje-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            id="mensaje-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'boton-mas-opciones',
            }}
          >
            <MenuItem onClick={() => {
              handleMarcarComoLeido(!mensaje.leido);
              handleMenuClose();
            }}>
              {mensaje.leido ? (
                <>
                  <MarkUnreadIcon fontSize="small" sx={{ mr: 1 }} /> 
                  Marcar como no leído
                </>
              ) : (
                <>
                  <MarkReadIcon fontSize="small" sx={{ mr: 1 }} /> 
                  Marcar como leído
                </>
              )}
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>Imprimir</MenuItem>
            <MenuItem onClick={handleMenuClose}>Reportar</MenuItem>
          </Menu>
        </Box>
      </Paper>
      
      {renderEstadoMensaje()}
      
      {/* Contenido del mensaje */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Encabezado del mensaje */}
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h2">
              {mensaje.asunto}
            </Typography>
            {renderPrioridadChip()}
            {renderTipoMensaje()}
          </Box>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar 
                sx={{ 
                  bgcolor: (mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') ? 'secondary.main' : 'primary.main',
                  width: 50,
                  height: 50,
                }}
              >
                {(mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') ? <GroupIcon /> : 
                (mensaje.remitente?.nombre ? mensaje.remitente.nombre.charAt(0) : '?')}
              </Avatar>
            </Grid>
            
            <Grid item xs>
              <Typography variant="h4">
                {mensaje.remitente 
                  ? `${mensaje.remitente.nombre || ''} ${mensaje.remitente.apellidos || ''}` 
                  : 'Remitente desconocido'}
                {mensaje.remitente?.tipo && ` (${mensaje.remitente.tipo})`}
              </Typography>
              
              <Box display="flex" alignItems="center" mt={0.5}>
                {(mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') ? (
                  <Typography variant="body2" color="text.secondary">
                    Para: Curso completo - {mensaje.destinatarios?.length || 0} destinatarios
                    <Button 
                      size="small" 
                      sx={{ ml: 1, minWidth: 0, p: 0 }}
                      onClick={() => setShowDestinatarios(!showDestinatarios)}
                    >
                      {showDestinatarios ? 'Ocultar' : 'Ver todos'}
                    </Button>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Para: {mensaje.destinatarios && mensaje.destinatarios.length > 0 
                      ? `${mensaje.destinatarios[0].nombre || ''} ${mensaje.destinatarios[0].apellidos || ''}` 
                      : 'Destinatario desconocido'}
                    {mensaje.destinatarios && mensaje.destinatarios.length > 1 && (
                      <Button 
                        size="small" 
                        sx={{ ml: 1, minWidth: 0, p: 0 }}
                        onClick={() => setShowDestinatarios(!showDestinatarios)}
                      >
                        {showDestinatarios ? 'Ocultar' : `Ver todos (${mensaje.destinatarios.length})`}
                      </Button>
                    )}
                  </Typography>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {format(new Date(mensaje.createdAt), 'dd/MM/yyyy HH:mm')}
                </Typography>
              </Box>
              
              {/* Mostrar curso si es mensaje masivo */}
              {(mensaje.tipo === 'MASIVO' || mensaje.tipo === 'GRUPAL') && mensaje.cursoNombre && (
                <Box display="flex" alignItems="center" mt={0.5}>
                  <SchoolIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Curso: {mensaje.cursoNombre}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Lista de destinatarios desplegable */}
          <Collapse in={showDestinatarios}>
            <Paper 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                p: 2, 
                maxHeight: '200px', 
                overflow: 'auto',
                borderColor: 'divider'
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Lista de destinatarios:
              </Typography>
              <List dense>
                {mensaje.destinatarios?.map((dest) => (
                  <ListItem key={dest._id}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`${dest.nombre || ''} ${dest.apellidos || ''}`} 
                      secondary={dest.tipo} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Collapse>
        </Box>
        
        <Divider />
        
        {/* Cuerpo del mensaje */}
        <Box sx={{ p: 3 }}>
          <div 
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(mensaje.contenido) 
            }} 
          />
        </Box>
        
        {/* Adjuntos si hay */}
        {mensaje.adjuntos && mensaje.adjuntos.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                <AttachFileIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Archivos adjuntos ({mensaje.adjuntos.length})
              </Typography>
              
              <List>
                {mensaje.adjuntos.map((adjunto) => (
                  <ListItem 
                    key={adjunto.fileId}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="download"
                        onClick={() => descargarAdjunto(adjunto.fileId, adjunto.nombre)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      {getIconByFileType(adjunto.tipo)}
                    </ListItemIcon>
                    <ListItemText 
                      primary={adjunto.nombre} 
                      secondary={`${(adjunto.tamaño / 1024).toFixed(2)} KB`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </>
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
          <Button onClick={handleEliminarDefinitivamente} color="error" autoFocus>
            Eliminar permanentemente
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

export default DetalleMensaje;