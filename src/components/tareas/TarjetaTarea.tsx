// src/components/tareas/TarjetaTarea.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Class as ClassIcon,
  Book as BookIcon,
  AttachFile as AttachFileIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format, isPast, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Tarea, EntregaTarea } from "../../types/tarea.types";
import EstadoBadge from "./EstadoBadge";
import PrioridadBadge from "./PrioridadBadge";

interface TarjetaTareaProps {
  tarea: Tarea;
  miEntrega?: EntregaTarea;
  mostrarDocente?: boolean;
  onVerDetalle?: (id: string) => void;
}

const TarjetaTarea: React.FC<TarjetaTareaProps> = ({
  tarea,
  miEntrega,
  mostrarDocente = false,
  onVerDetalle,
}) => {
  const navigate = useNavigate();

  const handleVerDetalle = () => {
    if (onVerDetalle) {
      onVerDetalle(tarea._id);
    } else {
      navigate(`/tareas/${tarea._id}`);
    }
  };

  // Calcular si está vencida
  const fechaLimite = new Date(tarea.fechaLimite);
  const estaVencida = isPast(fechaLimite) && tarea.estado === "ACTIVA";
  const diasRestantes = differenceInDays(fechaLimite, new Date());

  // Obtener nombre del docente
  const nombreDocente =
    typeof tarea.docenteId === "object"
      ? `${tarea.docenteId.nombre} ${tarea.docenteId.apellidos}`
      : "Docente";

  // Obtener nombre de asignatura
  const nombreAsignatura =
    typeof tarea.asignaturaId === "object"
      ? tarea.asignaturaId.nombre
      : "Asignatura";

  // Obtener nombre de curso
  const nombreCurso =
    typeof tarea.cursoId === "object"
      ? `${tarea.cursoId.nivel} - ${tarea.cursoId.nombre}`
      : "Curso";

  // Color del borde según urgencia
  const getBorderColor = () => {
    if (estaVencida) return "#f44336"; // Rojo
    if (diasRestantes <= 1) return "#ff9800"; // Naranja
    if (diasRestantes <= 3) return "#ffc107"; // Amarillo
    return "#e0e0e0"; // Gris normal
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${getBorderColor()}`,
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        {/* Encabezado con título y badges */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: 600,
              flex: 1,
              mr: 2,
            }}
          >
            {tarea.titulo}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <PrioridadBadge prioridad={tarea.prioridad} />
            {miEntrega && <EstadoBadge estado={miEntrega.estado} />}
            {tarea.estado === "CERRADA" && (
              <Chip label="Cerrada" size="small" color="default" />
            )}
          </Box>
        </Box>

        {/* Descripción */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tarea.descripcion}
        </Typography>

        {/* Información adicional */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Fecha límite */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Fecha límite:{" "}
              <strong style={{ color: estaVencida ? "#f44336" : "inherit" }}>
                {format(fechaLimite, "PPP 'a las' p", { locale: es })}
              </strong>
              {!estaVencida && diasRestantes >= 0 && (
                <span style={{ marginLeft: 8, color: "#666" }}>
                  ({diasRestantes === 0 ? "Hoy" : `${diasRestantes} días`})
                </span>
              )}
              {estaVencida && (
                <span style={{ marginLeft: 8, color: "#f44336" }}>
                  (Vencida)
                </span>
              )}
            </Typography>
          </Box>

          {/* Asignatura */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <BookIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {nombreAsignatura}
            </Typography>
          </Box>

          {/* Curso */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ClassIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {nombreCurso}
            </Typography>
          </Box>

          {/* Docente (solo si mostrarDocente es true) */}
          {mostrarDocente && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {nombreDocente}
              </Typography>
            </Box>
          )}

          {/* Archivos adjuntos */}
          {tarea.archivosReferencia.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachFileIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {tarea.archivosReferencia.length} archivo(s) adjunto(s)
              </Typography>
            </Box>
          )}

          {/* Calificación (si ya está calificada) */}
          {miEntrega?.calificacion !== undefined && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={`Calificación: ${miEntrega.calificacion} / ${tarea.calificacionMaxima}`}
                color="success"
                size="small"
              />
            </Box>
          )}
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
        <Button size="small" variant="contained" onClick={handleVerDetalle}>
          Ver Detalle
        </Button>
      </CardActions>
    </Card>
  );
};

export default TarjetaTarea;