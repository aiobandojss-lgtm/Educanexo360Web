// src/screens/tareas/EntregarTarea.tsx
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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import tareaService from "../../services/tareaService";
import { Tarea } from "../../types/tarea.types";
import FileUploader from "../../components/tareas/FileUploader";

const EntregarTarea: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [comentario, setComentario] = useState<string>("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      cargarTarea();
    }
  }, [id]);

  const cargarTarea = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await tareaService.obtenerTarea(id);
      setTarea(response.data);
      setLoading(false);
    } catch (err: any) {
      console.error("Error al cargar tarea:", err);
      setError("No se pudo cargar la tarea");
      setLoading(false);
    }
  };

  const handleEntregar = async () => {
    if (!id || !tarea) return;

    // Validación: debe tener al menos un archivo o comentario
    if (archivos.length === 0 && !comentario.trim()) {
      setError("Debes adjuntar al menos un archivo o escribir un comentario");
      return;
    }

    try {
      setEnviando(true);
      setError(null);

      await tareaService.entregarTarea(
        id,
        { comentarioEstudiante: comentario },
        archivos
      );

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate(`/tareas/${id}`);
      }, 2000);
    } catch (err: any) {
      console.error("Error al entregar tarea:", err);
      setError(
        err.response?.data?.message ||
          "No se pudo entregar la tarea. Intente nuevamente."
      );
      setEnviando(false);
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

  if (!tarea) {
    return null;
  }

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
            Entregar Tarea
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tarea.titulo}
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
          ¡Tarea entregada exitosamente! Redirigiendo...
        </Alert>
      )}

      {/* Formulario */}
      <Paper sx={{ p: 3 }}>
        {/* Información de la tarea */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Descripción de la tarea:
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
            {tarea.descripcion}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Comentario */}
        <TextField
          label="Comentario (opcional)"
          multiline
          rows={4}
          fullWidth
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe aquí cualquier comentario sobre tu entrega..."
          disabled={enviando || success}
          sx={{ mb: 3 }}
        />

        {/* Subir archivos */}
        <FileUploader
          files={archivos}
          onFilesChange={setArchivos}
          maxFiles={5}
          maxSizeMB={10}
          disabled={enviando || success}
        />

        {/* Advertencia */}
        {archivos.length === 0 && !comentario.trim() && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            Debes adjuntar al menos un archivo o escribir un comentario para poder
            entregar
          </Alert>
        )}

        {/* Botones */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            disabled={enviando || success}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleEntregar}
            disabled={
              enviando ||
              success ||
              (archivos.length === 0 && !comentario.trim())
            }
          >
            {enviando ? "Entregando..." : "Entregar Tarea"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EntregarTarea;