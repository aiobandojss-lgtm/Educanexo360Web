// src/pages/dashboard/Dashboard.tsx - DASHBOARD MINIMALISTA
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import {
  Email,
  Event,
  Campaign,
  School,
  ArrowForward,
} from "@mui/icons-material";
import { RootState } from "../../redux/store";

// Importamos solo los widgets esenciales
import {
  MensajesNoLeidosWidget,
  EventosRecientesWidget,
  AnunciosRecientesWidget,
} from "../../components/dashboard/DashboardWidgets";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tiempo de carga reducido
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
        <CircularProgress />
      </Box>
    );
  }

  // Función para obtener rol en español
  const getRolDisplay = (tipo: string) => {
    const roles: Record<string, string> = {
      ADMIN: "Administrador",
      DOCENTE: "Docente",
      ESTUDIANTE: "Estudiante",
      PADRE: "Padre de Familia",
      ACUDIENTE: "Acudiente",
      RECTOR: "Rector",
      COORDINADOR: "Coordinador",
      ADMINISTRATIVO: "Administrativo",
    };
    return roles[tipo] || tipo;
  };

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header Institucional */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          pb: 2,
          borderBottom: "2px solid",
          borderColor: "primary.main",
        }}
      >
        {/* Lado Izquierdo - Escuela */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <School sx={{ mr: 2, fontSize: 40, color: "primary.main" }} />
          <Box>
            <Typography variant="h4" color="primary.main" fontWeight="bold">
              {user?.escuelaId
                ? `Escuela ID: ${user.escuelaId}`
                : "Mi Institución Educativa"}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sistema de Comunicación Escolar
            </Typography>
          </Box>
        </Box>

        {/* Lado Derecho - Usuario */}
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h5" color="text.primary" gutterBottom>
            Bienvenido, {user?.nombre} {user?.apellidos}
          </Typography>
          <Chip
            label={getRolDisplay(user?.tipo || "")}
            color="primary"
            variant="outlined"
            size="medium"
          />
        </Box>
      </Box>

      {/* Título Dashboard */}
      <Typography
        variant="h2"
        color="primary.main"
        gutterBottom
        textAlign="center"
        sx={{ mb: 4, fontWeight: "bold" }}
      >
        Dashboard
      </Typography>

      {/* Tarjetas Esenciales - Solo 3 */}
      <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
        {/* Mensajes sin leer */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "primary.main",
              color: "white",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Email sx={{ fontSize: 60, mb: 2 }} />
              <MensajesNoLeidosWidget />
              <Button
                variant="contained"
                color="secondary"
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
                onClick={() => (window.location.href = "/mensajes")}
              >
                Ver todos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Eventos próximos */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "secondary.main",
              color: "white",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Event sx={{ fontSize: 60, mb: 2 }} />
              <EventosRecientesWidget onlyCount={true} />
              <Button
                variant="contained"
                color="primary"
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
                onClick={() => (window.location.href = "/calendario")}
              >
                Ver eventos
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Anuncios recientes */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "200px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "success.main",
              color: "white",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Campaign sx={{ fontSize: 60, mb: 2 }} />
              <AnunciosRecientesWidget onlyCount={true} />
              <Button
                variant="contained"
                color="warning"
                endIcon={<ArrowForward />}
                sx={{ mt: 2 }}
                onClick={() => (window.location.href = "/anuncios")}
              >
                Ver anuncios
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección EducaNexo360 - Slogan */}
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: 4,
          bgcolor: "grey.50",
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <Typography
          variant="h3"
          color="primary.main"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontStyle: "italic",
            mb: 3,
          }}
        >
          "La plataforma que une a toda la comunidad educativa en un solo lugar"
        </Typography>

        <Typography
          variant="h2"
          color="secondary.main"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 2,
            textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          EducaNexo360
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            maxWidth: 600,
            mx: "auto",
            lineHeight: 1.6,
          }}
        >
          Transformamos la comunicación escolar con tecnología innovadora,
          conectando docentes, estudiantes y familias para construir una
          educación más colaborativa y eficiente.
        </Typography>

        {/* Botones de navegación rápida */}
        <Box
          sx={{
            mt: 4,
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => (window.location.href = "/mensajes")}
          >
            📧 Mensajes
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => (window.location.href = "/calendario")}
          >
            📅 Calendario
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => (window.location.href = "/anuncios")}
          >
            📢 Anuncios
          </Button>
          {(user?.tipo === "ADMIN" ||
            user?.tipo === "RECTOR" ||
            user?.tipo === "COORDINADOR") && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => (window.location.href = "/usuarios")}
            >
              👥 Usuarios
            </Button>
          )}
        </Box>
      </Box>

      {/* Footer con info del sistema */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: "1px solid",
          borderColor: "grey.300",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          EducaNexo360 v1.0 | Sistema de Comunicación Escolar | Desarrollado
          para transformar la educación
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;
