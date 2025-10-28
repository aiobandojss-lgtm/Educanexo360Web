// src/screens/tareas/MisTareas.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import tareaService from "../../services/tareaService";
import { Tarea, EntregaTarea } from "../../types/tarea.types";
import TarjetaTarea from "../../components/tareas/TarjetaTarea";
import useAuth from "../../hooks/useAuth";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} style={{ paddingTop: 24 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

const MisTareas: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tareasPendientes, setTareasPendientes] = useState<Tarea[]>([]);
  const [tareasEntregadas, setTareasEntregadas] = useState<Tarea[]>([]);
  const [tareasCalificadas, setTareasCalificadas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si es acudiente, necesitamos seleccionar un estudiante
      // Por ahora, solo cargamos si es estudiante
      if (user?.tipo !== "ESTUDIANTE") {
        setError("Esta vista es solo para estudiantes");
        setLoading(false);
        return;
      }

      // Cargar tareas pendientes
      const pendientesRes = await tareaService.misTareas("pendientes");
      setTareasPendientes(pendientesRes.data || []);

      // Cargar tareas entregadas
      const entregadasRes = await tareaService.misTareas("entregadas");
      setTareasEntregadas(entregadasRes.data || []);

      // Cargar tareas calificadas
      const calificadasRes = await tareaService.misTareas("calificadas");
      setTareasCalificadas(calificadasRes.data || []);

      setLoading(false);
    } catch (err: any) {
      console.error("Error al cargar tareas:", err);
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las tareas. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // ✅ CORRECCIÓN: Función para obtener la entrega del estudiante actual de una tarea
  const getEntregaEstudiante = (tarea: Tarea): EntregaTarea | undefined => {
    // Validar que entregas exista y sea un array
    if (!tarea.entregas || !Array.isArray(tarea.entregas) || tarea.entregas.length === 0) {
      return undefined;
    }
    
    return tarea.entregas.find(
      (entrega: EntregaTarea) =>
        (typeof entrega.estudianteId === "string"
          ? entrega.estudianteId
          : entrega.estudianteId._id) === user?._id
    );
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mis Tareas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consulta tus tareas asignadas, entregas y calificaciones
        </Typography>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>Pendientes</span>
                {tareasPendientes.length > 0 && (
                  <Chip
                    label={tareasPendientes.length}
                    size="small"
                    color="warning"
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<CheckCircleIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>Entregadas</span>
                {tareasEntregadas.length > 0 && (
                  <Chip
                    label={tareasEntregadas.length}
                    size="small"
                    color="primary"
                  />
                )}
              </Box>
            }
          />
          <Tab
            icon={<StarIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>Calificadas</span>
                {tareasCalificadas.length > 0 && (
                  <Chip
                    label={tareasCalificadas.length}
                    size="small"
                    color="success"
                  />
                )}
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Tab Pendientes */}
      <TabPanel value={tabValue} index={0}>
        {tareasPendientes.length === 0 ? (
          <Alert severity="info">No tienes tareas pendientes</Alert>
        ) : (
          tareasPendientes.map((tarea) => (
            <TarjetaTarea
              key={tarea._id}
              tarea={tarea}
              miEntrega={getEntregaEstudiante(tarea)}
              mostrarDocente={true}
            />
          ))
        )}
      </TabPanel>

      {/* Tab Entregadas */}
      <TabPanel value={tabValue} index={1}>
        {tareasEntregadas.length === 0 ? (
          <Alert severity="info">No tienes tareas entregadas</Alert>
        ) : (
          tareasEntregadas.map((tarea) => (
            <TarjetaTarea
              key={tarea._id}
              tarea={tarea}
              miEntrega={getEntregaEstudiante(tarea)}
              mostrarDocente={true}
            />
          ))
        )}
      </TabPanel>

      {/* Tab Calificadas */}
      <TabPanel value={tabValue} index={2}>
        {tareasCalificadas.length === 0 ? (
          <Alert severity="info">No tienes tareas calificadas aún</Alert>
        ) : (
          tareasCalificadas.map((tarea) => (
            <TarjetaTarea
              key={tarea._id}
              tarea={tarea}
              miEntrega={getEntregaEstudiante(tarea)}
              mostrarDocente={true}
            />
          ))
        )}
      </TabPanel>
    </Box>
  );
};

export default MisTareas;