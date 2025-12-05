// src/components/estudiante/CardEstudiante.tsx
import React from "react";
import { Card, CardContent, Box, Typography, Avatar } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { User } from "../../types/user.types";

interface CardEstudianteProps {
  estudiante: User;
  onClick: () => void;
}

const CardEstudiante: React.FC<CardEstudianteProps> = ({
  estudiante,
  onClick,
}) => {
  // Obtener inicial del nombre
  const inicial = estudiante.nombre?.[0]?.toUpperCase() || "E";

  // Obtener nombre completo
  const nombreCompleto = `${estudiante.nombre} ${estudiante.apellidos}`.trim();

  // Obtener grado (puede venir como string o como objeto populated)
  const getGrado = (): string => {
    if (!estudiante.info_academica?.grado) {
      return "Sin grado asignado";
    }

    const grado = estudiante.info_academica.grado;

    // Si es un objeto (populated), extraer el nombre
    if (typeof grado === "object" && grado !== null) {
      return (grado as any).nombre || "Sin grado";
    }

    // Si es string directo
    return grado;
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 4,
          backgroundColor: "rgba(139, 92, 246, 0.02)",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Avatar con inicial */}
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              color: "#8B5CF6",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            {inicial}
          </Avatar>

          {/* Información del estudiante */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {nombreCompleto}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <span role="img" aria-label="graduation">
                  🎓
                </span>
                {getGrado()}
              </Typography>
            </Box>
          </Box>

          {/* Flecha indicadora */}
          <ArrowForwardIcon
            sx={{
              color: "action.active",
              fontSize: "1.5rem",
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardEstudiante;
