// src/pages/tareas/SelectorHijo.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Container,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Person as PersonIcon } from "@mui/icons-material";
import axios from "../../api/axiosConfig";
import API_ROUTES from "../../constants/apiRoutes";

// Tipo para estudiante
interface Estudiante {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  info_academica?: {
    grado?: any;
  };
}

// Componente de tarjeta de estudiante
interface CardEstudianteProps {
  estudiante: Estudiante;
  onClick: () => void;
}

const CardEstudiante: React.FC<CardEstudianteProps> = ({
  estudiante,
  onClick,
}) => {
  const inicial = estudiante.nombre?.[0]?.toUpperCase() || "E";
  const nombreCompleto = `${estudiante.nombre} ${estudiante.apellidos}`.trim();

  const getGrado = (): string => {
    if (!estudiante.info_academica?.grado) {
      return "Sin grado asignado";
    }

    const grado = estudiante.info_academica.grado;

    if (typeof grado === "object" && grado !== null) {
      return (grado as any).nombre || "Sin grado";
    }

    return String(grado);
  };

  return (
    <Paper
      sx={{
        mb: 2,
        p: 2,
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            color: "#8B5CF6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          {inicial}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, color: "text.primary", mb: 0.5 }}
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

        <Box sx={{ color: "action.active", fontSize: "1.5rem" }}>→</Box>
      </Box>
    </Paper>
  );
};

const SelectorHijo: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📚 SELECTOR HIJO - Iniciando carga");
      console.log("👤 Usuario actual:", user?.nombre, user?.apellidos);
      console.log("🆔 Tipo:", user?.tipo);

      if (user?.tipo !== "ACUDIENTE") {
        setError("Esta vista es solo para acudientes");
        setLoading(false);
        return;
      }

      // Obtener IDs de estudiantes asociados del objeto user
      const userAny = user as any;
      const estudiantesIds =
        userAny?.info_academica?.estudiantes_asociados || [];

      console.log("📋 IDs de estudiantes asociados:", estudiantesIds);

      if (estudiantesIds.length === 0) {
        console.log("⚠️ No hay estudiantes asociados");
        setEstudiantes([]);
        setLoading(false);
        return;
      }

      // Cargar información de cada estudiante
      const estudiantesTemp: Estudiante[] = [];

      for (let i = 0; i < estudiantesIds.length; i++) {
        const estudianteId = estudiantesIds[i];
        console.log(
          `\n🔍 [${i + 1}/${estudiantesIds.length}] Cargando estudiante:`,
          estudianteId
        );

        try {
          const response = await axios.get(
            API_ROUTES.USUARIOS.GET_BY_ID(estudianteId)
          );

          console.log("📦 Respuesta recibida");

          let estudianteData: Estudiante | null = null;

          if (response.data.success && response.data.data) {
            estudianteData = response.data.data;
          } else if (response.data.data) {
            estudianteData = response.data.data;
          } else if (response.data._id) {
            estudianteData = response.data;
          }

          if (estudianteData) {
            console.log("✅ Estudiante cargado:", {
              nombre: estudianteData.nombre,
              apellidos: estudianteData.apellidos,
              grado: estudianteData.info_academica?.grado,
            });

            estudiantesTemp.push(estudianteData);
          }
        } catch (err: any) {
          console.error(
            `❌ Error cargando estudiante ${estudianteId}:`,
            err.message
          );
        }
      }

      console.log(
        `\n✅ CARGA COMPLETADA: ${estudiantesTemp.length}/${estudiantesIds.length} estudiantes`
      );

      setEstudiantes(estudiantesTemp);
      setLoading(false);
    } catch (err: any) {
      console.error("❌ ERROR GENERAL:", err);
      setError(
        err.response?.data?.message ||
          "Error al cargar los estudiantes. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  const handleSeleccionarEstudiante = (estudianteId: string) => {
    console.log("🔗 Navegando a tareas del estudiante:", estudianteId);
    navigate(`/tareas/hijo/${estudianteId}`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ color: "#8B5CF6", mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Cargando información...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: "#8B5CF6",
          color: "white",
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <PersonIcon sx={{ fontSize: "2rem" }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Tareas de mis hijos
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          {estudiantes.length === 0
            ? "No tienes estudiantes asociados"
            : `Tienes ${estudiantes.length} estudiante${
                estudiantes.length !== 1 ? "s" : ""
              } asociado${estudiantes.length !== 1 ? "s" : ""}`}
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!error && estudiantes.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: "background.default",
          }}
        >
          <PersonIcon
            sx={{ fontSize: "4rem", color: "text.disabled", mb: 2 }}
          />
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            No tienes estudiantes asociados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Contacta al administrador de tu escuela para asociar estudiantes a
            tu cuenta
          </Typography>
        </Paper>
      )}

      {estudiantes.length > 0 && (
        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontWeight: 600, mb: 2, color: "text.primary" }}
          >
            📚 Selecciona un estudiante
          </Typography>

          {estudiantes.map((estudiante) => (
            <CardEstudiante
              key={estudiante._id}
              estudiante={estudiante}
              onClick={() => handleSeleccionarEstudiante(estudiante._id)}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

export default SelectorHijo;
