// src/components/calendario/EventoActionButtons.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import calendarioService, { IEvento } from '../../services/calendarioService';

interface EventoActionButtonsProps {
  evento: IEvento;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStateChange?: () => void;
  showEditDelete?: boolean;
  showApprove?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const EventoActionButtons: React.FC<EventoActionButtonsProps> = ({
  evento,
  onEdit,
  onDelete,
  onStateChange,
  showEditDelete = true,
  showApprove = true,
  size = 'small'
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<'approve' | 'cancel' | 'delete' | null>(null);

  // Determinar si el evento es aprobable/cancelable
  const canBeApproved = evento.estado === 'PENDIENTE';
  const canBeCancelled = evento.estado === 'ACTIVO';

  const handleOpenDialog = (type: 'approve' | 'cancel' | 'delete') => {
    setActionType(type);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setActionType(null);
  };

  const handleAction = async () => {
    if (!actionType) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (actionType === 'approve') {
        await calendarioService.cambiarEstadoEvento(evento._id, 'ACTIVO');
        setSuccess('Evento aprobado correctamente');
      } else if (actionType === 'cancel') {
        await calendarioService.cambiarEstadoEvento(evento._id, 'CANCELADO');
        setSuccess('Evento cancelado correctamente');
      } else if (actionType === 'delete' && onDelete) {
        onDelete(evento._id);
        setDialogOpen(false);
        return; // No cerramos el diálogo aquí porque onDelete se encargará
      }

      // Notificar cambio de estado
      if (onStateChange) {
        onStateChange();
      }

      // Cerrar diálogo después de un breve momento
      setTimeout(() => {
        setDialogOpen(false);
        setSuccess(null);
      }, 1500);
      
    } catch (err: any) {
      console.error(`Error al ${actionType === 'approve' ? 'aprobar' : actionType === 'cancel' ? 'cancelar' : 'eliminar'} evento:`, err);
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar chip de estado
  const renderEstadoChip = () => {
    let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
    let label = 'Desconocido';

    switch (evento.estado) {
      case 'PENDIENTE':
        color = 'warning';
        label = 'Pendiente';
        break;
      case 'ACTIVO':
        color = 'success';
        label = 'Activo';
        break;
      case 'FINALIZADO':
        color = 'info';
        label = 'Finalizado';
        break;
      case 'CANCELADO':
        color = 'error';
        label = 'Cancelado';
        break;
    }

    return (
      <Chip 
        size="small"
        color={color}
        label={label}
        icon={<EventIcon />}
        sx={{ mr: 1 }}
      />
    );
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {renderEstadoChip()}
        
        {showEditDelete && (
          <>
            {onEdit && (
              <Tooltip title="Editar evento">
                <IconButton 
                  size={size} 
                  onClick={() => onEdit(evento._id)} 
                  color="primary"
                >
                  <EditIcon fontSize={size} />
                </IconButton>
              </Tooltip>
            )}
            
            {onDelete && (
              <Tooltip title="Eliminar evento">
                <IconButton 
                  size={size} 
                  onClick={() => handleOpenDialog('delete')} 
                  color="error"
                >
                  <DeleteIcon fontSize={size} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
        
        {showApprove && (
          <>
            {canBeApproved && (
              <Tooltip title="Aprobar evento">
                <IconButton 
                  size={size} 
                  onClick={() => handleOpenDialog('approve')} 
                  color="success"
                >
                  <CheckCircleIcon fontSize={size} />
                </IconButton>
              </Tooltip>
            )}
            
            {canBeCancelled && (
              <Tooltip title="Cancelar evento">
                <IconButton 
                  size={size} 
                  onClick={() => handleOpenDialog('cancel')} 
                  color="error"
                >
                  <CancelIcon fontSize={size} />
                </IconButton>
              </Tooltip>
            )}
          </>
        )}
      </Box>

      {/* Diálogo de confirmación */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {actionType === 'approve' ? '¿Aprobar evento?' :
           actionType === 'cancel' ? '¿Cancelar evento?' :
           '¿Eliminar evento?'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <DialogContentText id="alert-dialog-description">
            {actionType === 'approve' ? 
              'Al aprobar este evento, será visible para todos los usuarios en el calendario. ¿Desea continuar?' :
             actionType === 'cancel' ? 
              'Al cancelar este evento, dejará de ser visible en el calendario. ¿Desea continuar?' :
              'Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar permanentemente este evento?'}
          </DialogContentText>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cerrar
          </Button>
          <Button 
            onClick={handleAction} 
            color={actionType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            autoFocus
          >
            {loading ? 'Procesando...' : 
             actionType === 'approve' ? 'Aprobar' : 
             actionType === 'cancel' ? 'Cancelar' : 
             'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventoActionButtons;