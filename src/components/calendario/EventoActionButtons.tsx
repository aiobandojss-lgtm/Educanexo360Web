// src/components/calendario/EventoActionButtons.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Tooltip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircleOutline as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import calendarioService, { IEvento } from "../../services/calendarioService";

interface EventoActionButtonsProps {
  evento: IEvento;
  showEditDelete?: boolean;
  showApprove?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStateChange?: () => void;
}

const EventoActionButtons: React.FC<EventoActionButtonsProps> = ({
  evento,
  showEditDelete = true,
  showApprove = true,
  onEdit,
  onDelete,
  onStateChange,
}) => {
  const [loading, setLoading] = useState(false);

  // Función para aprobar un evento
  const handleApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      await calendarioService.aprobarEvento(evento._id);
      if (onStateChange) onStateChange();
    } catch (error) {
      console.error("Error al aprobar evento:", error);
      alert("Error al aprobar evento. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Función para rechazar un evento
  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const userConfirmed = window.confirm(
      "¿Estás seguro de que deseas rechazar este evento?"
    );
    if (!userConfirmed) return;

    try {
      setLoading(true);
      await calendarioService.rechazarEvento(evento._id);
      if (onStateChange) onStateChange();
    } catch (error) {
      console.error("Error al rechazar evento:", error);
      alert("Error al rechazar evento. Inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Función para editar evento
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(evento._id);
  };

  // Función para eliminar evento
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(evento._id);
  };

  // No mostrar botones de aprobación para eventos ya activos o cancelados
  const showApproveButtons = showApprove && evento.estado === "PENDIENTE";

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {loading && <CircularProgress size={24} />}

      {showApproveButtons && (
        <>
          <Tooltip title="Aprobar evento">
            <IconButton
              color="success"
              onClick={handleApprove}
              disabled={loading}
              size="small"
            >
              <ApproveIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Rechazar evento">
            <IconButton
              color="error"
              onClick={handleReject}
              disabled={loading}
              size="small"
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
        </>
      )}

      {showEditDelete && (
        <>
          {onEdit && (
            <Tooltip title="Editar evento">
              <IconButton
                color="primary"
                onClick={handleEdit}
                disabled={loading}
                size="small"
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
          )}

          {onDelete && (
            <Tooltip title="Eliminar evento">
              <IconButton
                color="error"
                onClick={handleDelete}
                disabled={loading}
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </Box>
  );
};

export default EventoActionButtons;
