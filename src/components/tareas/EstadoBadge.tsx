// src/components/tareas/EstadoBadge.tsx
import React from "react";
import { Chip } from "@mui/material";
import {
  EstadoEntrega,
  COLORES_ESTADO,
  LABELS_ESTADO,
} from "../../types/tarea.types";
import {
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  HourglassEmpty as HourglassEmptyIcon,
  ErrorOutline as ErrorOutlineIcon,
  Stars as StarsIcon,
} from "@mui/icons-material";

interface EstadoBadgeProps {
  estado: EstadoEntrega;
  size?: "small" | "medium";
}

const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado, size = "small" }) => {
  // Obtener color y label
  const color = COLORES_ESTADO[estado];
  const label = LABELS_ESTADO[estado];

  // Obtener icono según estado
  const getIcon = () => {
    switch (estado) {
      case "PENDIENTE":
        return <HourglassEmptyIcon />;
      case "VISTA":
        return <VisibilityIcon />;
      case "ENTREGADA":
        return <CheckCircleIcon />;
      case "ATRASADA":
        return <ErrorOutlineIcon />;
      case "CALIFICADA":
        return <StarsIcon />;
      default:
        return undefined;
    }
  };

  const iconElement = getIcon();

  return (
    <Chip
      icon={iconElement}
      label={label}
      size={size}
      sx={{
        backgroundColor: color,
        color: "#fff",
        fontWeight: 600,
        "& .MuiChip-icon": {
          color: "#fff",
        },
      }}
    />
  );
};

export default EstadoBadge;