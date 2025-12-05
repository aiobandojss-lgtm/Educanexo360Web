// src/pages/tareas/TareasWrapper.tsx
import React from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import SelectorHijo from "./SelectorHijo";
import MisTareas from "./MisTareas";
import ListaTareas from "./ListaTareas";

/**
 * Componente Wrapper que decide qué pantalla de tareas mostrar según el rol del usuario
 * 
 * - ESTUDIANTE → MisTareas (sus propias tareas)
 * - ACUDIENTE → SelectorHijo (seleccionar hijo)
 * - DOCENTE/ADMIN/RECTOR/COORDINADOR → ListaTareas (gestión general)
 */
const TareasWrapper: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Sin usuario (no debería pasar si hay protección de rutas)
  if (!isAuthenticated || !user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress sx={{ color: "#8B5CF6" }} />
      </Box>
    );
  }

  console.log("🔀 TareasWrapper - Decidiendo pantalla");
  console.log("   Usuario:", user.nombre, user.apellidos);
  console.log("   Tipo:", user.tipo);

  // Decidir qué pantalla mostrar según el rol
  switch (user.tipo) {
    case "ESTUDIANTE":
      console.log("   → Mostrando: MisTareas (estudiante)");
      return <MisTareas />;

    case "ACUDIENTE":
      console.log("   → Mostrando: SelectorHijo (acudiente)");
      return <SelectorHijo />;

    case "DOCENTE":
    case "ADMIN":
    case "RECTOR":
    case "COORDINADOR":
      console.log("   → Mostrando: ListaTareas (docente/admin)");
      return <ListaTareas />;

    case "ADMINISTRATIVO":
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="info">
            Los usuarios administrativos no tienen acceso al módulo de tareas
          </Alert>
        </Box>
      );

    default:
      console.error("   ❌ Tipo de usuario desconocido:", user.tipo);
      return (
        <Box sx={{ p: 3 }}>
          <Alert severity="warning">
            No tienes permisos para acceder a esta sección
          </Alert>
        </Box>
      );
  }
};

export default TareasWrapper;
