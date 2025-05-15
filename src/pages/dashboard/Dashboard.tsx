// src/pages/dashboard/Dashboard.tsx (modificado)
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { RootState } from "../../redux/store";

// Importamos los widgets personalizados
import {
  MensajesRecientesWidget,
  EventosRecientesWidget,
  AnunciosRecientesWidget,
  MensajesNoLeidosWidget,
  CalendarioMensualWidget,
} from "../../components/dashboard/DashboardWidgets";

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular tiempo de carga para dar tiempo a los widgets a obtener sus datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

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

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Dashboard
      </Typography>

      <Typography variant="h3" color="text.secondary" gutterBottom>
        Bienvenido, {user?.nombre} {user?.apellidos}
      </Typography>

      <Grid container spacing={3} mt={1}>
        {/* Primera fila: Tarjetas principales - Sin cambios */}
        <Grid item xs={12} md={4}>
          <MensajesNoLeidosWidget />
        </Grid>

        <Grid item xs={12} md={4}>
          <EventosRecientesWidget onlyCount={true} />
        </Grid>

        <Grid item xs={12} md={4}>
          <AnunciosRecientesWidget onlyCount={true} />
        </Grid>

        {/* Segunda fila: Mensajes Recientes y Próximos Eventos */}
        <Grid item xs={12} md={8}>
          <MensajesRecientesWidget />
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Reemplazamos AccionesRapidasWidget por EventosRecientesWidget */}
          <EventosRecientesWidget />
        </Grid>

        {/* Tercera fila: Solo Calendario a pantalla completa */}
        <Grid item xs={12}>
          <CalendarioMensualWidget />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
