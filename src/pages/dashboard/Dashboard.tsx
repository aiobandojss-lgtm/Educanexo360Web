import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import {
  Email,
  Event,
  Campaign,
  People,
  School,
  ArrowForward,
} from "@mui/icons-material";
import { RootState } from "../../redux/store";
import axiosInstance from "../../api/axiosConfig";

interface DashboardData {
  escuela: {
    nombre: string;
    logo?: string;
  };
  usuario: {
    nombre: string;
    rol: string;
    ultimoAcceso: string;
  };
  resumen: {
    mensajesNoLeidos: number;
    eventosProximos: number;
    anunciosRecientes: number;
    estudiantesTotal?: number;
    docentesActivos?: number;
    padresRegistrados?: number;
  };
  recientes: {
    mensajes: any[];
    eventos: any[];
    anuncios: any[];
  };
}

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log("🔍 Fetching dashboard data...");

      // Usar tu axiosInstance configurado
      const response = await axiosInstance.get("/dashboard");

      console.log("📊 Dashboard response:", response.data);

      if (response.data.success) {
        setDashboardData(response.data.data);
        setError("");
      } else {
        setError("Error en la respuesta del servidor");
      }
    } catch (error: any) {
      console.error("❌ Error fetching dashboard:", error);
      setError(`Error al cargar dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={fetchDashboardData} sx={{ mt: 2 }}>
          Reintentar
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return <Typography>No se pudo cargar el dashboard</Typography>;
  }

  const { escuela, usuario, resumen, recientes } = dashboardData;

  return (
    <Box>
      {/* Header con info de escuela y usuario */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <School sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h4" color="primary.main">
            {escuela.nombre}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h6">{usuario.nombre}</Typography>
          <Chip label={usuario.rol} color="primary" variant="outlined" />
        </Box>
      </Box>

      <Typography variant="h1" color="primary.main" gutterBottom>
        Dashboard
      </Typography>

      {/* Tarjetas de resumen */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "primary.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Email sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3">{resumen.mensajesNoLeidos}</Typography>
              <Typography>Mensajes sin leer</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "secondary.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Event sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3">{resumen.eventosProximos}</Typography>
              <Typography>Eventos próximos</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "success.main", color: "white" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <Campaign sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h3">{resumen.anunciosRecientes}</Typography>
              <Typography>Anuncios recientes</Typography>
            </CardContent>
          </Card>
        </Grid>

        {resumen.estudiantesTotal !== undefined && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: "info.main", color: "white" }}>
              <CardContent sx={{ textAlign: "center" }}>
                <People sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h3">{resumen.estudiantesTotal}</Typography>
                <Typography>Estudiantes</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Contenido reciente */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📧 Mensajes Recientes
              </Typography>
              {recientes.mensajes.length > 0 ? (
                <List>
                  {recientes.mensajes.map((mensaje: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={mensaje.asunto}
                        secondary={`De: ${mensaje.remitente.nombre}`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No hay mensajes recientes
                </Typography>
              )}
              <Button endIcon={<ArrowForward />} sx={{ mt: 1 }}>
                Ver todos los mensajes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📢 Anuncios Recientes
              </Typography>
              {recientes.anuncios.length > 0 ? (
                <List>
                  {recientes.anuncios.map((anuncio: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={anuncio.titulo}
                        secondary={new Date(
                          anuncio.fechaPublicacion
                        ).toLocaleDateString()}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No hay anuncios recientes
                </Typography>
              )}
              <Button endIcon={<ArrowForward />} sx={{ mt: 1 }}>
                Ver todos los anuncios
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
