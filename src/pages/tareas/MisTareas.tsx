// src/pages/tareas/MisTareas.tsx
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
import tareaService from "../../services/tareaService";
import { Tarea, EntregaTarea } from "../../types/tarea.types";
import TarjetaTarea from "../../components/tareas/TarjetaTarea";
import axios from "../../api/axiosConfig";
import API_ROUTES from "../../constants/apiRoutes";

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
  const [tareasPendientes, setTareasPendientes] = useState<Tarea[]>([]);
  const [tareasEntregadas, setTareasEntregadas] = useState<Tarea[]>([]);
  const [tareasCalificadas, setTareasCalificadas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estudianteInfo, setEstudianteInfo] = useState<any>(null);

  // Determinar si es un acudiente viendo tareas de su hijo
  const esVistaAcudiente = Boolean(estudianteId && user?.tipo === "ACUDIENTE");

  useEffect(() => {
    cargarTareas();
  }, [estudianteId]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📚 CARGANDO TAREAS");
      console.log("👤 Usuario actual:", user?.tipo);
      console.log("🆔 EstudianteId:", estudianteId);
      console.log("👨‍👩‍👧 Es vista acudiente:", esVistaAcudiente);

      // Si es acudiente y hay estudianteId, cargar info del estudiante
      if (esVistaAcudiente && estudianteId) {
        try {
          const response = await axios.get(
            API_ROUTES.USUARIOS.GET_BY_ID(estudianteId)
          );

          const estudianteData =
            response.data.success && response.data.data
              ? response.data.data
              : response.data.data || response.data;

          setEstudianteInfo(estudianteData);
          console.log("✅ Info del estudiante cargada:", estudianteData.nombre);
        } catch (err) {
          console.error("❌ Error cargando info del estudiante:", err);
        }
      }

      // Cargar tareas según el contexto
      let tareasData: Tarea[];

      if (esVistaAcudiente && estudianteId) {
        // Acudiente viendo tareas de su hijo
        console.log("📖 Cargando tareas del estudiante:", estudianteId);
        const response = await tareaService.tareasEstudiante(estudianteId);
        tareasData = response.data || [];
      } else if (user?.tipo === "ESTUDIANTE") {
        // Estudiante viendo sus propias tareas
        console.log("📖 Cargando mis tareas (estudiante)");
        const response = await tareaService.misTareas();
        tareasData = response.data || [];
      } else {
        // Otro tipo de usuario (no debería llegar aquí)
        setError("Esta vista es solo para estudiantes y acudientes");
        setLoading(false);
        return;
      }

      console.log("📦 Total de tareas recibidas:", tareasData.length);

      // Filtrar tareas por estado
      const { pendientes, entregadas, calificadas } =
        filtrarTareasPorEstado(tareasData);

      setTareasPendientes(pendientes);
      setTareasEntregadas(entregadas);
      setTareasCalificadas(calificadas);

      console.log("✅ Tareas filtradas:");
      console.log("   - Pendientes:", pendientes.length);
      console.log("   - Entregadas:", entregadas.length);
      console.log("   - Calificadas:", calificadas.length);

      setLoading(false);
    } catch (err: any) {
      console.error("❌ Error al cargar tareas:", err);
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las tareas. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  /**
   * Filtrar tareas por estado de entrega
   */
  const filtrarTareasPorEstado = (tareas: Tarea[]) => {
    const pendientes: Tarea[] = [];
    const entregadas: Tarea[] = [];
    const calificadas: Tarea[] = [];

    console.log("\n🔄 FILTRANDO TAREAS POR ESTADO");
    console.log("📦 Total de tareas a filtrar:", tareas.length);

    tareas.forEach((tarea, index) => {
      console.log(`\n--- Tarea ${index + 1}: ${tarea.titulo} ---`);
      const entrega = getEntregaEstudiante(tarea);

      if (!entrega) {
        console.log("   → Sin entrega = PENDIENTE");
        pendientes.push(tarea);
      } else {
        const estado = (entrega as any).estado;
        const calificacion = (entrega as any).calificacion;

        console.log("   📊 Estado entrega:", estado);
        console.log("   ⭐ Calificación:", calificacion);

        // Verificar si está calificada
        if (estado === "CALIFICADA" || calificacion !== undefined) {
          console.log("   → CALIFICADA ✅");
          calificadas.push(tarea);
        } 
        // Verificar si está entregada pero sin calificar
        else if (estado === "ENTREGADA" || estado === "ATRASADA") {
          console.log("   → ENTREGADA (sin calificar) 📤");
          entregadas.push(tarea);
        } 
        // Pendiente o vista
        else {
          console.log("   → PENDIENTE ⏳");
          pendientes.push(tarea);
        }
      }
    });

    console.log("\n📊 RESULTADO DEL FILTRADO:");
    console.log("   ⏳ Pendientes:", pendientes.length);
    console.log("   📤 Entregadas:", entregadas.length);
    console.log("   ✅ Calificadas:", calificadas.length);
    console.log("══════════════════════════════════\n");

    return { pendientes, entregadas, calificadas };
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleVolver = () => {
    navigate("/tareas");
  };

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

    console.log("🔍 Buscando entrega en tarea:", tarea.titulo);
    console.log("   Tiene miEntrega:", !!tareaAny.miEntrega);
    console.log("   Tiene entregaEstudiante:", !!tareaAny.entregaEstudiante);
    console.log("   Tiene entregas:", !!tareaAny.entregas);

    // CASO 1: El backend envía "miEntrega" (singular) - Para estudiantes
    if (tareaAny.miEntrega) {
      console.log("   ✅ Usando miEntrega (formato estudiante)");
      console.log("   Estado:", tareaAny.miEntrega.estado);
      console.log("   Calificación:", tareaAny.miEntrega.calificacion);
      return tareaAny.miEntrega as EntregaTarea;
    }

    // CASO 2: El backend envía "entregaEstudiante" (singular) - Para acudientes
    if (tareaAny.entregaEstudiante) {
      console.log("   ✅ Usando entregaEstudiante (formato acudiente)");
      console.log("   Estado:", tareaAny.entregaEstudiante.estado);
      console.log("   Calificación:", tareaAny.entregaEstudiante.calificacion);
      return tareaAny.entregaEstudiante as EntregaTarea;
    }

    // CASO 3: El backend envía "entregas" (array) - Para docentes/admin
    if (
      !tarea.entregas ||
      !Array.isArray(tarea.entregas) ||
      tarea.entregas.length === 0
    ) {
      console.log("   ❌ No hay entregas disponibles");
      return undefined;
    }

    // ID del estudiante a buscar (convertir a string)
    const targetEstudianteId = String(estudianteId || user?._id);

    console.log("   🔎 Buscando en array de entregas...");
    console.log("   Target ID:", targetEstudianteId);
    console.log("   Total entregas:", tarea.entregas.length);

    const entrega = tarea.entregas.find((entrega: EntregaTarea) => {
      // Extraer el ID de la entrega
      let entregaEstudianteId: string;

      if (typeof entrega.estudianteId === "string") {
        entregaEstudianteId = entrega.estudianteId;
      } else if (entrega.estudianteId && typeof entrega.estudianteId === "object") {
        entregaEstudianteId = (entrega.estudianteId as any)._id || 
                              (entrega.estudianteId as any).$oid ||
                              String(entrega.estudianteId);
      } else {
        entregaEstudianteId = String(entrega.estudianteId);
      }

      const match = String(entregaEstudianteId) === String(targetEstudianteId);

      if (match) {
        console.log("   ✅ Match encontrado!");
        console.log("      Estado:", (entrega as any).estado);
        console.log("      Calificación:", (entrega as any).calificacion);
      }

      return match;
    });

    if (!entrega) {
      console.log("   ❌ No se encontró entrega para este estudiante");
    }

    return entrega;
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
          <CircularProgress sx={{ color: "#8B5CF6" }} />
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
                color: "#8B5CF6",
                "&:hover": { backgroundColor: "rgba(139, 92, 246, 0.1)" },
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
