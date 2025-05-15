import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  CircularProgress,
  Alert,
  FormGroup,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import {
  Save as SaveIcon,
  Publish as PublishIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import anuncioService from "../../services/anuncioService";
import {
  Anuncio,
  AnuncioInput,
  ArchivoAdjunto,
} from "../../types/anuncio.types";
import useAuth from "../../hooks/useAuth";

const FormularioAnuncio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados
  const [formData, setFormData] = useState<AnuncioInput>({
    titulo: "",
    contenido: "",
    paraEstudiantes: true,
    paraDocentes: false,
    paraPadres: true,
    destacado: false,
    estaPublicado: false,
  });
  const [archivos, setArchivos] = useState<File[]>([]);
  const [adjuntosExistentes, setAdjuntosExistentes] = useState<
    ArchivoAdjunto[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAnuncio, setLoadingAnuncio] = useState<boolean>(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [guardadoExitoso, setGuardadoExitoso] = useState<boolean>(false);

  // Cargar anuncio existente si estamos en modo edición
  useEffect(() => {
    if (isEditing && id) {
      const cargarAnuncio = async () => {
        try {
          setLoadingAnuncio(true);
          const response = await anuncioService.obtenerAnuncio(id);
          const anuncio = response.data;

          setFormData({
            titulo: anuncio.titulo,
            contenido: anuncio.contenido,
            paraEstudiantes: anuncio.paraEstudiantes,
            paraDocentes: anuncio.paraDocentes,
            paraPadres: anuncio.paraPadres,
            destacado: anuncio.destacado,
            estaPublicado: anuncio.estaPublicado,
          });

          setAdjuntosExistentes(anuncio.archivosAdjuntos);
          setLoadingAnuncio(false);
        } catch (err) {
          console.error("Error al cargar el anuncio:", err);
          setError(
            "No se pudo cargar el anuncio para editar. Intente nuevamente."
          );
          setLoadingAnuncio(false);
        }
      };

      cargarAnuncio();
    }
  }, [id, isEditing]);

  // Verificar si el usuario puede crear/editar anuncios
  useEffect(() => {
    if (user?.tipo !== "ADMIN" && user?.tipo !== "DOCENTE") {
      setError("No tienes permisos para crear o editar anuncios.");
    }
  }, [user]);

  // Manejar cambios en los campos del formulario
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambios en los checkboxes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Manejar selección de archivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setArchivos((prev) => [...prev, ...fileArray]);
    }
  };

  // Eliminar archivo seleccionado (aún no subido)
  const handleRemoveFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  // Eliminar archivo adjunto existente
  const handleRemoveExistingFile = async (archivoId: string) => {
    if (!id) return;

    try {
      await anuncioService.eliminarAdjunto(id, archivoId);
      setAdjuntosExistentes((prev) =>
        prev.filter((archivo) => archivo.fileId !== archivoId)
      );
    } catch (err) {
      console.error("Error al eliminar el archivo:", err);
      setError("No se pudo eliminar el archivo adjunto. Intente nuevamente.");
    }
  };

  // Guardar anuncio como borrador
  const handleGuardarBorrador = async () => {
    await guardarAnuncio(false);
  };

  // Publicar anuncio directamente
  const handlePublicar = async () => {
    await guardarAnuncio(true);
  };

  // Función principal para guardar/actualizar anuncio
  const guardarAnuncio = async (publicar: boolean) => {
    try {
      // Validación básica
      if (!formData.titulo.trim()) {
        setError("El título es obligatorio");
        return;
      }

      if (!formData.contenido.trim()) {
        setError("El contenido es obligatorio");
        return;
      }

      setLoading(true);
      setError(null);

      const anuncioData = {
        ...formData,
        estaPublicado: publicar,
      };

      let anuncioId = id;

      // Crear o actualizar anuncio
      if (isEditing && id) {
        await anuncioService.actualizarAnuncio(id, anuncioData);
      } else {
        const response = await anuncioService.crearAnuncio(anuncioData);
        anuncioId = response.data._id;
      }

      // Subir archivos adjuntos si hay nuevos
      if (archivos.length > 0 && anuncioId) {
        await anuncioService.subirAdjuntos(anuncioId, archivos);
      }

      setGuardadoExitoso(true);

      // Redirigir después de un breve momento
      setTimeout(() => {
        navigate(`/anuncios/${anuncioId}`);
      }, 1500);
    } catch (err) {
      console.error("Error al guardar el anuncio:", err);
      setError("Ocurrió un error al guardar el anuncio. Intente nuevamente.");
      setLoading(false);
    }
  };

  if (loadingAnuncio) {
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
      {/* Título y navegación */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          {isEditing ? "Editar Anuncio" : "Nuevo Anuncio"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          component={Link}
          to="/anuncios"
          disabled={loading}
        >
          Cancelar
        </Button>
      </Box>

      {/* Mensajes de error o éxito */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {guardadoExitoso && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Anuncio guardado exitosamente. Redirigiendo...
        </Alert>
      )}

      {/* Formulario */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Título */}
          <Grid item xs={12}>
            <TextField
              name="titulo"
              label="Título"
              variant="outlined"
              fullWidth
              required
              value={formData.titulo}
              onChange={handleChange}
              disabled={loading}
              error={!formData.titulo.trim() && error !== null}
              helperText={
                !formData.titulo.trim() && error !== null
                  ? "El título es obligatorio"
                  : ""
              }
            />
          </Grid>

          {/* Contenido */}
          <Grid item xs={12}>
            <TextField
              name="contenido"
              label="Contenido"
              variant="outlined"
              fullWidth
              required
              multiline
              rows={8}
              value={formData.contenido}
              onChange={handleChange}
              disabled={loading}
              error={!formData.contenido.trim() && error !== null}
              helperText={
                !formData.contenido.trim() && error !== null
                  ? "El contenido es obligatorio"
                  : "Puedes usar formato Markdown para dar estilo al texto"
              }
            />
          </Grid>

          {/* Opciones de destinatarios */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Destinado a:
            </Typography>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.paraEstudiantes}
                    onChange={handleCheckboxChange}
                    name="paraEstudiantes"
                    disabled={loading}
                  />
                }
                label="Estudiantes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.paraDocentes}
                    onChange={handleCheckboxChange}
                    name="paraDocentes"
                    disabled={loading}
                  />
                }
                label="Docentes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.paraPadres}
                    onChange={handleCheckboxChange}
                    name="paraPadres"
                    disabled={loading}
                  />
                }
                label="Padres"
              />
            </FormGroup>
          </Grid>

          {/* Opciones adicionales */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.destacado}
                  onChange={handleCheckboxChange}
                  name="destacado"
                  disabled={loading}
                />
              }
              label="Anuncio destacado"
            />
          </Grid>

          {/* Archivos adjuntos existentes */}
          {isEditing && adjuntosExistentes.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Archivos adjuntos existentes:
              </Typography>
              <List>
                {adjuntosExistentes.map((archivo) => (
                  <ListItem key={archivo.fileId} dense divider>
                    <ListItemText
                      primary={archivo.nombre}
                      secondary={`${(archivo.tamaño / 1024).toFixed(2)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveExistingFile(archivo.fileId)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Grid>
          )}

          {/* Subir nuevos archivos */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Adjuntar archivos:
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
                disabled={loading}
              >
                Seleccionar archivos
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
            </Box>

            {/* Lista de archivos seleccionados */}
            {archivos.length > 0 && (
              <List>
                {archivos.map((file, index) => (
                  <ListItem key={index} dense divider>
                    <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(2)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveFile(index)}
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Grid>
        </Grid>

        {/* Botones de acción */}
        <Box
          sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleGuardarBorrador}
            disabled={loading || guardadoExitoso}
          >
            Guardar como borrador
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PublishIcon />}
            onClick={handlePublicar}
            disabled={loading || guardadoExitoso}
          >
            {loading ? <CircularProgress size={24} /> : "Publicar ahora"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FormularioAnuncio;
