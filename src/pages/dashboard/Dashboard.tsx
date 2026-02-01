// src/pages/dashboard/Dashboard.tsx - DASHBOARD CORREGIDO SIN DUPLICACIONES
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
  Alert,
} from "@mui/material";
import {
  Email,
  Event,
  Campaign,
  School,
  ArrowForward,
} from "@mui/icons-material";
import { RootState } from "../../redux/store";
import dashboardService, {
  DashboardStats,
} from "../../services/dashboardService";
import { Escuela } from "../../services/escuelaService";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [escuela, setEscuela] = useState<Escuela | null>(null);
  const [estadisticas, setEstadisticas] = useState<DashboardStats>({
    mensajesSinLeer: 0,
    eventosProximos: 0,
    anunciosRecientes: 0,
  });

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);

        // Cargar información de la escuela
        if (user?.escuelaId) {
          const escuelaData = await dashboardService.obtenerEscuela(
            user.escuelaId
          );
          if (escuelaData) {
            setEscuela(escuelaData);
          }
        }

        // Cargar estadísticas del dashboard
        const stats = await dashboardService.obtenerEstadisticas();
        setEstadisticas(stats);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        // Mantener valores por defecto en caso de error
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      cargarDashboard();
    }
  }, [user]);

  
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
              {escuela?.nombre || "Cargando institución..."}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Sistema de Comunicación Escolar
            </Typography>
            {escuela?.codigo && (
              <Typography variant="caption" color="text.secondary">
                Código: {escuela.codigo}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Lado Derecho - Usuario (SIN ROL) */}
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h5" color="text.primary">
            Bienvenido, {user?.nombre} {user?.apellidos}
          </Typography>
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

      {/* Verificación de escuela */}
      {!escuela && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No se pudo cargar la información de la institución educativa.
        </Alert>
      )}

      {/* Tarjetas Esenciales - Exactamente como en la vista previa */}
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{
          mb: 6,
          maxWidth: "1000px",
          mx: "auto",
        }}
      >
        {/* Mensajes sin leer */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
                p: 3,
              }}
            >
              <Box>
                <Email sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  Mensajes sin leer
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: "bold", my: 2 }}>
                  {estadisticas.mensajesSinLeer}
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  mt: 2,
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.3)",
                  },
                }}
                onClick={() => (window.location.href = "/mensajes")}
                fullWidth
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
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
                p: 3,
              }}
            >
              <Box>
                <Event sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  Eventos Próximos
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: "bold", my: 2 }}>
                  {estadisticas.eventosProximos}
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  mt: 2,
                  bgcolor: "#1976d2",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#1565c0",
                  },
                }}
                onClick={() => (window.location.href = "/calendario")}
                fullWidth
              >
                Ver calendario
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Anuncios recientes */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              minHeight: "200px",
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)",
              color: "white",
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
                p: 3,
              }}
            >
              <Box>
                <Campaign sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h6" gutterBottom fontWeight={500}>
                  Anuncios Recientes
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: "bold", my: 2 }}>
                  {estadisticas.anunciosRecientes}
                </Typography>
              </Box>
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  mt: 2,
                  bgcolor: "#ff9800",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#f57c00",
                  },
                }}
                onClick={() => (window.location.href = "/anuncios")}
                fullWidth
              >
                Ver anuncios
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sección EducaNexo360 - Mejorada */}
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: 4,
          bgcolor: "#fafafa",
          borderRadius: 3,
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h4"
          color="primary.main"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontStyle: "italic",
            mb: 3,
            lineHeight: 1.4,
          }}
        >
          "La plataforma que une a toda la comunidad educativa en un solo lugar"
        </Typography>

        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "#9c27b0",
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
      </Box>

      {/* Footer con info del sistema */}
      <Box
        sx={{
          mt: 4,
          pt: 3,
          borderTop: "1px solid #e0e0e0",
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
