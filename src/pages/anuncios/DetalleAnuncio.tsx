import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import anuncioService from "../../services/anuncioService";
import { Anuncio, ArchivoAdjunto } from "../../types/anuncio.types";
import useAuth from "../../hooks/useAuth";
import ReactMarkdown from "react-markdown";

const DetalleAnuncio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Obtener el anuncio
  useEffect(() => {
    if (!id) return;

    const cargarAnuncio = async () => {
      try {
        setLoading(true);
        const response = await anuncioService.obtenerAnuncio(id);
        setAnuncio(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar el anuncio:", err);
        setError("No se pudo cargar el anuncio. Intente nuevamente.");
        setLoading(false);
      }
    };

    cargarAnuncio();
  }, [id]);

  // Verificar si el usuario puede editar/eliminar este anuncio
  const puedeEditar =
    user?.tipo === "ADMIN" ||
    (user?.tipo === "DOCENTE" && anuncio?.creador === user._id);

  // Manejar la publicación de un anuncio
  const handlePublicar = async () => {
    if (!id) return;

    try {
      await anuncioService.publicarAnuncio(id);
      // Actualizar la información del anuncio
      const response = await anuncioService.obtenerAnuncio(id);
      setAnuncio(response.data);
    } catch (err) {
      console.error("Error al publicar el anuncio:", err);
      setError("No se pudo publicar el anuncio. Intente nuevamente.");
    }
  };

  // Manejar la eliminación de un anuncio
  const handleEliminar = async () => {
    if (!id) return;

    try {
      await anuncioService.eliminarAnuncio(id);
      navigate("/anuncios");
    } catch (err) {
      console.error("Error al eliminar el anuncio:", err);
      setError("No se pudo eliminar el anuncio. Intente nuevamente.");
      setConfirmEliminar(false);
    }
  };

  // Manejar la descarga de archivos adjuntos
  // Esta versión maneja correctamente archivos binarios
  // Implementación correcta basada en el módulo de mensajería
  const handleDownloadAdjunto = async (archivo: ArchivoAdjunto) => {
    if (!id) return;

    try {
      // Usar el método del servicio que maneja el tipo Blob correctamente
      const response = await anuncioService.descargarAdjunto(
        id,
        archivo.fileId
      );

      // Crear un objeto URL para el blob
      const url = window.URL.createObjectURL(new Blob([response]));

      // Crear un elemento <a> para la descarga
      const link = document.createElement("a");
      link.href = url;
      link.download = archivo.nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Liberar el objeto URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar adjunto:", error);
      // Si tienes un mecanismo de notificación, puedes usarlo aquí
      alert("No se pudo descargar el archivo adjunto");
    }
  };

  // Formatear la fecha
  const formatearFecha = (fecha: string | undefined) => {
    if (!fecha) return "Fecha no disponible";

    try {
      return format(new Date(fecha), "PPP", { locale: es });
    } catch (e) {
      return "Fecha no disponible";
    }
  };

  // Obtener el nombre del creador
  const getNombreCreador = () => {
    if (!anuncio) return "Desconocido";

    if (typeof anuncio.creador === "object" && anuncio.creador) {
      return `${anuncio.creador.nombre} ${anuncio.creador.apellidos}`;
    }

    return "Desconocido";
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
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/anuncios"
        >
          Volver a anuncios
        </Button>
      </Box>
    );
  }

  if (!anuncio) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró el anuncio solicitado.</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/anuncios"
          sx={{ mt: 2 }}
        >
          Volver a anuncios
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Barra de navegación y acciones */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/anuncios"
        >
          Volver a anuncios
        </Button>

        {puedeEditar && (
          <Box sx={{ display: "flex", gap: 1 }}>
            {!anuncio.estaPublicado && (
              <Button
                variant="contained"
                color="success"
                startIcon={<PublishIcon />}
                onClick={handlePublicar}
              >
                Publicar
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditIcon />}
              component={Link}
              to={`/anuncios/editar/${anuncio._id}`}
            >
              Editar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setConfirmEliminar(true)}
            >
              Eliminar
            </Button>
          </Box>
        )}
      </Box>

      {/* Contenido del anuncio */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          {anuncio.destacado && <StarIcon sx={{ color: "#FFC107" }} />}
          <Typography variant="h4" component="h1">
            {anuncio.titulo}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {!anuncio.estaPublicado && <Chip label="Borrador" color="warning" />}
          {anuncio.paraEstudiantes && <Chip label="Estudiantes" color="info" />}
          {anuncio.paraDocentes && <Chip label="Docentes" color="success" />}
          {anuncio.paraPadres && <Chip label="Padres" color="primary" />}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {anuncio.estaPublicado
            ? `Publicado el ${formatearFecha(anuncio.fechaPublicacion)}`
            : `Creado el ${formatearFecha(anuncio.createdAt)}`}
          {" por "}
          {getNombreCreador()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <ReactMarkdown>{anuncio.contenido}</ReactMarkdown>
        </Box>

        {/* Archivos adjuntos */}
        {anuncio.archivosAdjuntos.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
              Archivos adjuntos
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {anuncio.archivosAdjuntos.map((archivo) => (
                <Paper
                  variant="outlined"
                  key={archivo.fileId}
                  sx={{
                    p: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography>
                    {archivo.nombre}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({(archivo.tamaño / 1024).toFixed(2)} KB)
                    </Typography>
                  </Typography>
                  <IconButton
                    color="primary"
                    onClick={() => handleDownloadAdjunto(archivo)}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </>
        )}
      </Paper>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog open={confirmEliminar} onClose={() => setConfirmEliminar(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este anuncio? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEliminar(false)}>Cancelar</Button>
          <Button onClick={handleEliminar} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleAnuncio;
