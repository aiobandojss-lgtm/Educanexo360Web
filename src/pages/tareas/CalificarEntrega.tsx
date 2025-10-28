// src/screens/tareas/CalificarEntrega.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Slider,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import tareaService from "../../services/tareaService";
import { Tarea, EntregaTarea, ArchivoTarea } from "../../types/tarea.types";
import EstadoBadge from "../../components/tareas/EstadoBadge";

const CalificarEntrega: React.FC = () => {
  const { id: tareaId, entregaId } = useParams<{ id: string; entregaId: string }>();
  const navigate = useNavigate();

  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [entrega, setEntrega] = useState<EntregaTarea | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const [calificacion, setCalificacion] = useState<number>(0);
  const [comentarioDocente, setComentarioDocente] = useState<string>("");

  useEffect(() => {
    if (tareaId && entregaId) {
      cargarDatos();
    }
  }, [tareaId, entregaId]);

  const cargarDatos = async () => {
    if (!tareaId || !entregaId) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar tarea
      const tareaRes = await tareaService.obtenerTarea(tareaId);
      setTarea(tareaRes.data);

      // Cargar entregas para encontrar la específica
      const entregasRes = await tareaService.verEntregas(tareaId);
      const entregas: EntregaTarea[] = entregasRes.data || [];
      const entregaEncontrada = entregas.find((e) => e._id === entregaId);

      if (!entregaEncontrada) {
        setError("Entrega no encontrada");
        setLoading(false);
        return;
      }

      setEntrega(entregaEncontrada);

      // Si ya tiene calificación, cargarla
      if (entregaEncontrada.calificacion !== undefined) {
        setCalificacion(entregaEncontrada.calificacion);
      }
      if (entregaEncontrada.comentarioDocente) {
        setComentarioDocente(entregaEncontrada.comentarioDocente);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar los datos. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  const handleDescargarArchivo = async (archivoId: string, nombre: string) => {
    if (!tareaId) return;

    try {
      const blob = await tareaService.descargarArchivo(tareaId, archivoId, "entrega");

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

  const handleGuardarCalificacion = async () => {
    if (!tareaId || !entregaId || !tarea) return;

    // Validación
    if (calificacion < 0 || calificacion > tarea.calificacionMaxima) {
      setError(`La calificación debe estar entre 0 y ${tarea.calificacionMaxima}`);
      return;
    }

    try {
      setGuardando(true);
      setError(null);

      await tareaService.calificarEntrega(tareaId, entregaId, {
        calificacion,
        comentarioDocente: comentarioDocente.trim() || undefined,
      });

      setSuccess(true);

      // Redirigir después de 1.5 segundos
      setTimeout(() => {
        navigate(`/tareas/${tareaId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error al guardar calificación:", err);
      setError(
        err.response?.data?.message ||
          "Ocurrió un error al guardar la calificación. Intente nuevamente."
      );
      setGuardando(false);
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

  if (error && !tarea) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
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

  if (!tarea || !entrega) {
    return null;
  }

  // Obtener nombre del estudiante
  const nombreEstudiante =
    typeof entrega.estudianteId === "object"
      ? `${entrega.estudianteId.nombre} ${entrega.estudianteId.apellidos}`
      : "Estudiante";

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            Calificar Entrega
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tarea.titulo} - {nombreEstudiante}
          </Typography>
        </Box>
      </Box>

      {/* Mensajes */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Calificación guardada exitosamente. Redirigiendo...
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Información de la entrega */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información de la Entrega
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <EstadoBadge estado={entrega.estado} size="medium" />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Fecha de entrega */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Fecha de entrega
              </Typography>
              <Typography variant="body1">
                {entrega.fechaEntrega
                  ? format(new Date(entrega.fechaEntrega), "PPP 'a las' p", {
                      locale: es,
                    })
                  : "No entregada"}
              </Typography>
            </Box>

            {/* Comentario del estudiante */}
            {entrega.comentarioEstudiante && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Comentario del estudiante
                </Typography>
                <Card variant="outlined" sx={{ mt: 1 }}>
                  <CardContent>
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap" }}
                    >
                      {entrega.comentarioEstudiante}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Archivos adjuntos */}
            {entrega.archivos.length > 0 && (
              <>
                <Typography variant="caption" color="text.secondary">
                  Archivos adjuntos ({entrega.archivos.length})
                </Typography>
                <List>
                  {entrega.archivos.map((archivo: ArchivoTarea) => (
                    <ListItem
                      key={archivo.fileId}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                        mb: 1,
                      }}
                      secondaryAction={
                        <IconButton
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
                        secondary={`${(archivo.tamaño / 1024 / 1024).toFixed(
                          2
                        )} MB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>

          {/* Formulario de calificación */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Calificación
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Calificación (0 - {tarea.calificacionMaxima})
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={calificacion}
                  onChange={(_, value) => setCalificacion(value as number)}
                  min={0}
                  max={tarea.calificacionMaxima}
                  step={0.1}
                  marks
                  valueLabelDisplay="on"
                  disabled={guardando || success}
                />
              </Box>
              <TextField
                type="number"
                fullWidth
                value={calificacion}
                onChange={(e) => setCalificacion(Number(e.target.value))}
                inputProps={{
                  min: 0,
                  max: tarea.calificacionMaxima,
                  step: 0.1,
                }}
                disabled={guardando || success}
                sx={{ mt: 2 }}
              />
            </Box>

            <TextField
              label="Retroalimentación (opcional)"
              multiline
              rows={4}
              fullWidth
              value={comentarioDocente}
              onChange={(e) => setComentarioDocente(e.target.value)}
              placeholder="Escribe aquí tus comentarios sobre la entrega del estudiante..."
              disabled={guardando || success}
            />

            {/* Botones */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                disabled={guardando || success}
              >
                Cancelar
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleGuardarCalificacion}
                disabled={guardando || success}
              >
                {guardando ? "Guardando..." : "Guardar Calificación"}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Información lateral */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Información de la Tarea
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Título
                </Typography>
                <Typography variant="body2">{tarea.titulo}</Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Fecha límite
                </Typography>
                <Typography variant="body2">
                  {format(new Date(tarea.fechaLimite), "PPP 'a las' p", {
                    locale: es,
                  })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Calificación máxima
                </Typography>
                <Typography variant="body2">
                  {tarea.calificacionMaxima} puntos
                </Typography>
              </Box>

              {entrega.calificacion !== undefined && (
                <Box>
                  <Alert severity="info">
                    <Typography variant="caption">
                      Calificación anterior
                    </Typography>
                    <Typography variant="h6">
                      {entrega.calificacion} / {tarea.calificacionMaxima}
                    </Typography>
                  </Alert>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CalificarEntrega;