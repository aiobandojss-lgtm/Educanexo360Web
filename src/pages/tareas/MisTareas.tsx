// src/pages/tareas/MisTareas.tsx
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  IconButton,
  Container,
} from "@mui/material";
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { Tarea, EntregaTarea } from "../../types/tarea.types";
import TarjetaTarea from "../../components/tareas/TarjetaTarea";
import { useMisTareas } from "../../hooks/useAppQueries";

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
  const { estudianteId } = useParams<{ estudianteId?: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [tabValue, setTabValue] = useState(0);

  // Determinar si es un acudiente viendo tareas de su hijo
  const esVistaAcudiente = Boolean(estudianteId && user?.tipo === "ACUDIENTE");

  const {
    data: queryData,
    isLoading: loading,
    error: queryError,
  } = useMisTareas(estudianteId, user?._id, esVistaAcudiente, user?.tipo || "");

  const estudianteInfo = queryData?.estudianteInfo ?? null;
  const error = queryError
    ? (queryError as any)?.response?.data?.message || "No se pudieron cargar las tareas. Intente nuevamente."
    : (!esVistaAcudiente && user?.tipo !== "ESTUDIANTE" && !loading)
    ? "Esta vista es solo para estudiantes y acudientes"
    : null;

  /**
   * Función para obtener la entrega del estudiante actual de una tarea
   *
   * IMPORTANTE: El backend envía 3 formatos diferentes:
   * - Para "mis-tareas" (estudiante): tarea.miEntrega (objeto)
   * - Para "tareas/estudiante/:id" (acudiente): tarea.entregaEstudiante (objeto)
   * - Para docentes/admin: tarea.entregas (array)
   */
  const getEntregaEstudiante = (tarea: Tarea): EntregaTarea | undefined => {
    const tareaAny = tarea as any;

    // CASO 1: El backend envía "miEntrega" (singular) - Para estudiantes
    if (tareaAny.miEntrega) {
      return tareaAny.miEntrega as EntregaTarea;
    }

    // CASO 2: El backend envía "entregaEstudiante" (singular) - Para acudientes
    if (tareaAny.entregaEstudiante) {
      return tareaAny.entregaEstudiante as EntregaTarea;
    }

    // CASO 3: El backend envía "entregas" (array) - Para docentes/admin
    if (!tarea.entregas || !Array.isArray(tarea.entregas) || tarea.entregas.length === 0) {
      return undefined;
    }

    const targetEstudianteId = String(estudianteId || user?._id);

    return tarea.entregas.find((entrega: EntregaTarea) => {
      let entregaEstudianteId: string;

      if (typeof entrega.estudianteId === "string") {
        entregaEstudianteId = entrega.estudianteId;
      } else if (entrega.estudianteId && typeof entrega.estudianteId === "object") {
        entregaEstudianteId =
          (entrega.estudianteId as any)._id ||
          (entrega.estudianteId as any).$oid ||
          String(entrega.estudianteId);
      } else {
        entregaEstudianteId = String(entrega.estudianteId);
      }

      return String(entregaEstudianteId) === String(targetEstudianteId);
    });
  };

  /**
   * Filtrar tareas por estado de entrega
   */
  const filtrarTareasPorEstado = (tareas: Tarea[]) => {
    const pendientes: Tarea[] = [];
    const entregadas: Tarea[] = [];
    const calificadas: Tarea[] = [];

    tareas.forEach((tarea) => {
      const entrega = getEntregaEstudiante(tarea);

      if (!entrega) {
        pendientes.push(tarea);
      } else {
        const estado = (entrega as any).estado;
        const calificacion = (entrega as any).calificacion;

        // Verificar si está calificada
        if (estado === "CALIFICADA" || calificacion !== undefined) {
          calificadas.push(tarea);
        }
        // Verificar si está entregada pero sin calificar
        else if (estado === "ENTREGADA" || estado === "ATRASADA") {
          entregadas.push(tarea);
        }
        // Pendiente o vista
        else {
          pendientes.push(tarea);
        }
      }
    });

    return { pendientes, entregadas, calificadas };
  };

  const { pendientes: tareasPendientes, entregadas: tareasEntregadas, calificadas: tareasCalificadas } = useMemo(() => {
    const tareasData: Tarea[] = queryData?.tareasData || [];
    return filtrarTareasPorEstado(tareasData);
  }, [queryData?.tareasData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVolver = () => {
    navigate("/tareas");
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
          <CircularProgress sx={{ color: "#059669" }} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Cargando tareas...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        {esVistaAcudiente && (
          <Box sx={{ mb: 2 }}>
            <IconButton
              onClick={handleVolver}
              sx={{
                color: "#059669",
                "&:hover": { backgroundColor: "rgba(5, 150, 105, 0.1)" },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>
        )}

        <Typography variant="h4" component="h1" gutterBottom>
          {esVistaAcudiente && estudianteInfo
            ? `Tareas de ${estudianteInfo.nombre} ${estudianteInfo.apellidos}`
            : "Mis Tareas"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {esVistaAcudiente
            ? "Consulta las tareas asignadas, entregas y calificaciones"
            : "Consulta tus tareas asignadas, entregas y calificaciones"}
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
          <Alert severity="info">
            {esVistaAcudiente
              ? "El estudiante no tiene tareas pendientes"
              : "No tienes tareas pendientes"}
          </Alert>
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
          <Alert severity="info">
            {esVistaAcudiente
              ? "El estudiante no tiene tareas entregadas"
              : "No tienes tareas entregadas"}
          </Alert>
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
          <Alert severity="info">
            {esVistaAcudiente
              ? "El estudiante no tiene tareas calificadas aún"
              : "No tienes tareas calificadas aún"}
          </Alert>
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
    </Container>
  );
};

export default MisTareas;
