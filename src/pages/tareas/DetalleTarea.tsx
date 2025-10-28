// src/screens/tareas/DetalleTarea.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
  Assignment as AssignmentIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import tareaService from "../../services/tareaService";
import { Tarea, EntregaTarea, ArchivoTarea } from "../../types/tarea.types";
import useAuth from "../../hooks/useAuth";
import EstadoBadge from "../../components/tareas/EstadoBadge";
import PrioridadBadge from "../../components/tareas/PrioridadBadge";

const DetalleTarea: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [miEntrega, setMiEntrega] = useState<EntregaTarea | null>(null);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const esDocente =
    user?.tipo === "ADMIN" ||
    user?.tipo === "DOCENTE" ||
    user?.tipo === "RECTOR" ||
    user?.tipo === "COORDINADOR";
  const esEstudiante = user?.tipo === "ESTUDIANTE";

  useEffect(() => {
    if (id) {
      cargarTarea();
    }
  }, [id]);

  const cargarTarea = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar tarea
      const tareaRes = await tareaService.obtenerTarea(id);
      setTarea(tareaRes.data);

      // Marcar como vista si es estudiante
      if (esEstudiante) {
        try {
          await tareaService.marcarVista(id);
        } catch (err) {
          console.log("Ya estaba marcada como vista");
        }

        // Cargar mi entrega
        try {
          const entregaRes = await tareaService.verMiEntrega(id);
          setMiEntrega(entregaRes.data);
        } catch (err) {
          console.log("No hay entrega aún");
        }
      }

      // Si es docente, cargar todas las entregas
      if (esDocente) {
        try {
          const entregasRes = await tareaService.verEntregas(id);
          setEntregas(entregasRes.data || []);
        } catch (err) {
          console.log("No se pudieron cargar entregas");
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error al cargar tarea:", err);
      setError(
        err.response?.data?.message ||
          "No se pudo cargar la tarea. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  const handleDescargarArchivo = async (archivoId: string, nombre: string) => {
    if (!id) return;

    try {
      const blob = await tareaService.descargarArchivo(id, archivoId, "referencia");
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar archivo:", err);
      alert("No se pudo descargar el archivo");
    }
  };

  const handleEliminar = async () => {
    if (!id || !window.confirm("¿Estás seguro de eliminar esta tarea?")) return;

    try {
      await tareaService.eliminarTarea(id);
      navigate("/tareas/docente");
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "No se pudo eliminar la tarea. Puede que tenga entregas."
      );
    }
  };

  const handleCerrar = async () => {
    if (!id || !window.confirm("¿Cerrar esta tarea? No se permitirán más entregas."))
      return;

    try {
      await tareaService.cerrarTarea(id);
      window.location.reload();
    } catch (err: any) {
      alert(
        err.response?.data?.message || "No se pudo cerrar la tarea"
      );
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

  if (error || !tarea) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Tarea no encontrada"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const nombreDocente =
    typeof tarea.docenteId === "object"
      ? `${tarea.docenteId.nombre} ${tarea.docenteId.apellidos}`
      : "Docente";

  const nombreAsignatura =
    typeof tarea.asignaturaId === "object" ? tarea.asignaturaId.nombre : "Asignatura";

  const nombreCurso =
    typeof tarea.cursoId === "object"
      ? `${tarea.cursoId.nivel} - ${tarea.cursoId.nombre}`
      : "Curso";

  const puedeEditar =
    esDocente &&
    (user?.tipo === "ADMIN" ||
      (typeof tarea.docenteId === "string"
        ? tarea.docenteId === user?._id
        : tarea.docenteId._id === user?._id));

  // ✅ CORRECCIÓN: Permitir entregar si NO ha entregado o si está PENDIENTE
  const puedeEntregar =
  esEstudiante && 
  tarea.estado === "ACTIVA" && 
  (!miEntrega || 
   miEntrega.estado === "PENDIENTE" || 
   miEntrega.estado === "VISTA" ||
   (miEntrega.archivos && miEntrega.archivos.length === 0));

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {tarea.titulo}
          </Typography>
        </Box>

        {/* Acciones para docente */}
        {puedeEditar && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              component={Link}
              to={`/tareas/editar/${tarea._id}`}
            >
              Editar
            </Button>
            {tarea.estado === "ACTIVA" && (
              <Button
                variant="outlined"
                startIcon={<LockIcon />}
                onClick={handleCerrar}
                color="warning"
              >
                Cerrar
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<DeleteIcon />}
              onClick={handleEliminar}
              color="error"
            >
              Eliminar
            </Button>
          </Box>
        )}

        {/* ✅ CORRECCIÓN: Botón para estudiante - Ahora aparece correctamente */}
        {puedeEntregar && (
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            component={Link}
            to={`/tareas/${tarea._id}/entregar`}
            size="large"
            sx={{ px: 3 }}
          >
            Entregar Tarea
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Información principal */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            {/* Badges */}
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <PrioridadBadge prioridad={tarea.prioridad} size="medium" />
              {miEntrega && <EstadoBadge estado={miEntrega.estado} size="medium" />}
              {tarea.estado === "CERRADA" && (
                <Chip label="Cerrada" color="default" />
              )}
              <Chip
                label={tarea.tipo === "INDIVIDUAL" ? "Individual" : "Grupal"}
                variant="outlined"
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Descripción */}
            <Typography variant="h6" gutterBottom>
              Descripción
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", mb: 3 }}>
              {tarea.descripcion}
            </Typography>

            {/* Material de referencia */}
            {tarea.archivosReferencia.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Material de referencia ({tarea.archivosReferencia.length})
                </Typography>
                <List>
                  {tarea.archivosReferencia.map((archivo) => (
                    <ListItem
                      key={archivo.fileId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() =>
                            handleDescargarArchivo(archivo.fileId, archivo.nombre)
                          }
                        >
                          <DownloadIcon />
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <AttachFileIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={archivo.nombre}
                        secondary={`${(archivo.tamaño / 1024 / 1024).toFixed(2)} MB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {/* Mi entrega (estudiante) */}
            {esEstudiante && miEntrega && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Mi Entrega
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Entregada el:
                      </Typography>
                      <Typography variant="body2">
                        {miEntrega.fechaEntrega
                          ? format(new Date(miEntrega.fechaEntrega), "PPp", {
                              locale: es,
                            })
                          : miEntrega.estado === "PENDIENTE"
                          ? "Pendiente"
                          : "No entregada"}
                      </Typography>
                    </Box>

                    {miEntrega.calificacion !== undefined && (
                      <>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Calificación:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {miEntrega.calificacion} / {tarea.calificacionMaxima}
                          </Typography>
                        </Box>

                        {miEntrega.comentarioDocente && (
                          <Box sx={{ mt: 2, p: 1, bgcolor: "background.default", borderRadius: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Retroalimentación del docente:
                            </Typography>
                            <Typography variant="body2">
                              {miEntrega.comentarioDocente}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}

                    {/* Mostrar botón de entregar si aún no ha entregado */}
                    {miEntrega.estado === "PENDIENTE" && puedeEntregar && (
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AssignmentIcon />}
                        component={Link}
                        to={`/tareas/${tarea._id}/entregar`}
                        sx={{ mt: 2 }}
                      >
                        Entregar Ahora
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Lista de entregas (docente) */}
            {esDocente && entregas.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Entregas ({entregas.length})
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to={`/tareas/${tarea._id}/entregas`}
                >
                  Ver y Calificar Entregas
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        {/* Panel lateral - Detalles */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Detalles
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Docente
              </Typography>
              <Typography variant="body2">{nombreDocente}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Asignatura
              </Typography>
              <Typography variant="body2">{nombreAsignatura}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Curso
              </Typography>
              <Typography variant="body2">{nombreCurso}</Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Fecha límite
              </Typography>
              <Typography 
                variant="body2" 
                color={new Date(tarea.fechaLimite) < new Date() ? "error" : "inherit"}
                fontWeight={new Date(tarea.fechaLimite) < new Date() ? "bold" : "normal"}
              >
                {format(new Date(tarea.fechaLimite), "PPp", { locale: es })}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Calificación máxima
              </Typography>
              <Typography variant="body2">{tarea.calificacionMaxima} puntos</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Peso en evaluación
              </Typography>
              <Typography variant="body2">
                {tarea.pesoEvaluacion ? `${tarea.pesoEvaluacion}%` : "No definido"}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Entregas tardías
              </Typography>
              <Typography variant="body2">
                {tarea.permiteTardias ? "Permitidas" : "No permitidas"}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DetalleTarea;