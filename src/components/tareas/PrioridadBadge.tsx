// src/components/tareas/PrioridadBadge.tsx
import React from "react";
import { Chip } from "@mui/material";
import {
  PrioridadTarea,
  COLORES_PRIORIDAD,
  LABELS_PRIORIDAD,
} from "../../types/tarea.types";
import {
  KeyboardDoubleArrowUp as AltaIcon,
  Remove as MediaIcon,
  KeyboardDoubleArrowDown as BajaIcon,
} from "@mui/icons-material";

interface PrioridadBadgeProps {
  prioridad: PrioridadTarea;
  size?: "small" | "medium";
}

const PrioridadBadge: React.FC<PrioridadBadgeProps> = ({
  prioridad,
  size = "small",
}) => {
  const color = COLORES_PRIORIDAD[prioridad];
  const label = LABELS_PRIORIDAD[prioridad];

  const getIcon = () => {
    switch (prioridad) {
      case "ALTA":
        return <AltaIcon />;
      case "MEDIA":
        return <MediaIcon />;
      case "BAJA":
        return <BajaIcon />;
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
      variant="outlined"
      sx={{
        borderColor: color,
        color: color,
        fontWeight: 600,
        "& .MuiChip-icon": {
          color: color,
        },
      }}
    />
  );
};

export default PrioridadBadge;