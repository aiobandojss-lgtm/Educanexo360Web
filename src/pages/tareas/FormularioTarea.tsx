// src/screens/tareas/FormularioTarea.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import "dayjs/locale/es";
import tareaService from "../../services/tareaService";
import cursoService from "../../services/cursoService";
import asignaturaService from "../../services/asignaturaService";
import { Tarea, TareaInput, TipoTarea, PrioridadTarea, ArchivoTarea } from "../../types/tarea.types";
import FileUploader from "../../components/tareas/FileUploader";
import useAuth from "../../hooks/useAuth";

const FormularioTarea: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTarea, setLoadingTarea] = useState<boolean>(isEditing);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Estado del formulario
  interface FormState {
    titulo: string;
    descripcion: string;
    asignaturaId: string;
    cursoId: string;
    fechaLimite: Date;
    tipo: TipoTarea;
    prioridad: PrioridadTarea;
    permiteTardias: boolean;
    calificacionMaxima: number;
    pesoEvaluacion: number;
  }

  const [formData, setFormData] = useState<FormState>({
    titulo: "",
    descripcion: "",
    asignaturaId: "",
    cursoId: "",
    fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 días
    tipo: "INDIVIDUAL",
    prioridad: "MEDIA",
    permiteTardias: false,
    calificacionMaxima: 5,
    pesoEvaluacion: 10,
  });

  // ✅ MEJORA 1: Estado para archivos existentes (edición)
  const [archivosExistentes, setArchivosExistentes] = useState<ArchivoTarea[]>([]);
  
  // Archivos nuevos a subir
  const [archivos, setArchivos] = useState<File[]>([]);

  // Datos para selects
  const [cursos, setCursos] = useState<any[]>([]);
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  
  // ✅ MEJORA 2: Estado para asignaturas filtradas por curso
  const [asignaturasFiltradas, setAsignaturasFiltradas] = useState<any[]>([]);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  useEffect(() => {
    if (isEditing && id) {
      cargarTarea();
    }
  }, [id, isEditing]);

  // ✅ MEJORA 2: Efecto para filtrar asignaturas cuando cambia el curso
  useEffect(() => {
    if (formData.cursoId) {
      const filtradas = asignaturas.filter(
        (asig) => asig.cursoId === formData.cursoId || asig.cursoId?._id === formData.cursoId
      );
      setAsignaturasFiltradas(filtradas);
      
      // Si la asignatura actual no pertenece al nuevo curso, limpiarla
      if (formData.asignaturaId) {
        const asigActual = filtradas.find(a => a._id === formData.asignaturaId);
        if (!asigActual) {
          handleChange("asignaturaId", "");
        }
      }
    } else {
      setAsignaturasFiltradas(asignaturas);
    }
  }, [formData.cursoId, asignaturas]);

  const cargarDatosIniciales = async () => {
    try {
      setLoading(true);

      // Cargar cursos
      const cursosRes = await cursoService.listarCursos({ limite: 100 });
      setCursos(cursosRes.data || []);

      // Cargar asignaturas
      const asignaturasRes = await asignaturaService.listarAsignaturas({
        limite: 100,
      });
      setAsignaturas(asignaturasRes.data || []);

      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos necesarios");
      setLoading(false);
    }
  };

  const cargarTarea = async () => {
    if (!id) return;

    try {
      setLoadingTarea(true);
      const response = await tareaService.obtenerTarea(id);
      const tarea: Tarea = response.data;

      // Verificar permisos de edición
      const puedeEditar =
        user?.tipo === "ADMIN" ||
        (typeof tarea.docenteId === "string"
          ? tarea.docenteId === user?._id
          : tarea.docenteId._id === user?._id);

      if (!puedeEditar) {
        setError("No tienes permisos para editar esta tarea");
        setLoadingTarea(false);
        return;
      }

      // Cargar datos al formulario
      setFormData({
        titulo: tarea.titulo,
        descripcion: tarea.descripcion,
        asignaturaId:
          typeof tarea.asignaturaId === "string"
            ? tarea.asignaturaId
            : tarea.asignaturaId._id,
        cursoId:
          typeof tarea.cursoId === "string" ? tarea.cursoId : tarea.cursoId._id,
        fechaLimite: new Date(tarea.fechaLimite),
        tipo: tarea.tipo,
        prioridad: tarea.prioridad,
        permiteTardias: tarea.permiteTardias,
        calificacionMaxima: tarea.calificacionMaxima,
        pesoEvaluacion: tarea.pesoEvaluacion || 0,
      });

      // ✅ MEJORA 1: Cargar archivos existentes
      setArchivosExistentes(tarea.archivosReferencia || []);

      setLoadingTarea(false);
    } catch (err: any) {
      console.error("Error al cargar tarea:", err);
      setError("No se pudo cargar la tarea");
      setLoadingTarea(false);
    }
  };

  const handleChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ MEJORA 1: Función para eliminar archivo existente
  const handleEliminarArchivoExistente = async (archivoId: string) => {
    if (!id) return;
    
    if (!window.confirm("¿Estás seguro de eliminar este archivo?")) return;

    try {
      await tareaService.eliminarArchivoReferencia(id, archivoId);
      setArchivosExistentes(prev => prev.filter(a => a.fileId !== archivoId));
      alert("Archivo eliminado correctamente");
    } catch (err: any) {
      console.error("Error al eliminar archivo:", err);
      alert(err.response?.data?.message || "No se pudo eliminar el archivo");
    }
  };

  const validarFormulario = (): boolean => {
    if (!formData.titulo.trim()) {
      setError("El título es obligatorio");
      return false;
    }

    if (!formData.descripcion.trim()) {
      setError("La descripción es obligatoria");
      return false;
    }

    if (!formData.cursoId) {
      setError("Debes seleccionar un curso");
      return false;
    }

    if (!formData.asignaturaId) {
      setError("Debes seleccionar una asignatura");
      return false;
    }

    if (!formData.fechaLimite) {
      setError("La fecha límite es obligatoria");
      return false;
    }

    if (formData.fechaLimite < new Date()) {
      setError("La fecha límite debe ser futura");
      return false;
    }

    if (formData.calificacionMaxima <= 0) {
      setError("La calificación máxima debe ser mayor a 0");
      return false;
    }

    return true;
  };

  const handleGuardar = async () => {
    setError(null);

    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);

      let tareaId = id;

      // Preparar datos para enviar al backend
      const tareaData: TareaInput = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        asignaturaId: formData.asignaturaId,
        cursoId: formData.cursoId,
        fechaLimite: formData.fechaLimite,
        tipo: formData.tipo,
        prioridad: formData.prioridad,
        permiteTardias: formData.permiteTardias,
        calificacionMaxima: formData.calificacionMaxima,
        pesoEvaluacion: formData.pesoEvaluacion > 0 ? formData.pesoEvaluacion : undefined,
      };

      // Crear o actualizar tarea
      if (isEditing && id) {
        await tareaService.actualizarTarea(id, tareaData);
      } else {
        const response = await tareaService.crearTarea(tareaData);
        tareaId = response.data._id;
      }

      // Subir archivos nuevos si hay
      if (archivos.length > 0 && tareaId) {
        await tareaService.subirArchivosReferencia(tareaId, archivos);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/tareas/${tareaId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error al guardar tarea:", err);
      setError(
        err.response?.data?.message ||
          "No se pudo guardar la tarea. Intente nuevamente."
      );
      setGuardando(false);
    }
  };

  if (loadingTarea || loading) {
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate(-1)} disabled={guardando || success}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" component="h1">
            {isEditing ? "Editar Tarea" : "Nueva Tarea"}
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
          Tarea guardada exitosamente. Redirigiendo...
        </Alert>
      )}

      {/* Formulario */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Título */}
          <Grid item xs={12}>
            <TextField
              label="Título de la tarea"
              fullWidth
              required
              value={formData.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              disabled={guardando || success}
              inputProps={{ maxLength: 200 }}
              helperText={`${formData.titulo.length}/200 caracteres`}
            />
          </Grid>

          {/* Descripción */}
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              fullWidth
              required
              multiline
              rows={6}
              value={formData.descripcion}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              disabled={guardando || success}
              placeholder="Describe en detalle qué deben hacer los estudiantes..."
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* ✅ MEJORA 2: Primero seleccionar CURSO */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Curso"
              fullWidth
              required
              value={formData.cursoId}
              onChange={(e) => handleChange("cursoId", e.target.value)}
              disabled={guardando || success || loading}
              helperText="Selecciona primero el curso"
            >
              <MenuItem value="">Selecciona un curso</MenuItem>
              {cursos.map((curso) => (
                <MenuItem key={curso._id} value={curso._id}>
                  {curso.nivel} - {curso.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* ✅ MEJORA 2: Asignaturas filtradas por curso */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Asignatura"
              fullWidth
              required
              value={formData.asignaturaId}
              onChange={(e) => handleChange("asignaturaId", e.target.value)}
              disabled={guardando || success || loading || !formData.cursoId}
              helperText={
                !formData.cursoId 
                  ? "Primero selecciona un curso" 
                  : asignaturasFiltradas.length === 0
                  ? "No hay asignaturas para este curso"
                  : `${asignaturasFiltradas.length} asignatura(s) disponible(s)`
              }
            >
              <MenuItem value="">Selecciona una asignatura</MenuItem>
              {asignaturasFiltradas.map((asignatura) => (
                <MenuItem key={asignatura._id} value={asignatura._id}>
                  {asignatura.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Fecha límite */}
          <Grid item xs={12} md={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DateTimePicker
                label="Fecha y hora límite"
                value={dayjs(formData.fechaLimite)}
                onChange={(newValue) => handleChange("fechaLimite", newValue ? newValue.toDate() : new Date())}
                disabled={guardando || success}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Grid>

          {/* Tipo */}
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Tipo de tarea"
              fullWidth
              value={formData.tipo}
              onChange={(e) => handleChange("tipo", e.target.value)}
              disabled={guardando || success}
            >
              <MenuItem value="INDIVIDUAL">Individual</MenuItem>
              <MenuItem value="GRUPAL">Grupal</MenuItem>
            </TextField>
          </Grid>

          {/* Prioridad */}
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Prioridad"
              fullWidth
              value={formData.prioridad}
              onChange={(e) => handleChange("prioridad", e.target.value)}
              disabled={guardando || success}
            >
              <MenuItem value="ALTA">Alta</MenuItem>
              <MenuItem value="MEDIA">Media</MenuItem>
              <MenuItem value="BAJA">Baja</MenuItem>
            </TextField>
          </Grid>

          {/* Calificación máxima */}
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              label="Calificación máxima"
              fullWidth
              required
              value={formData.calificacionMaxima}
              onChange={(e) =>
                handleChange("calificacionMaxima", Number(e.target.value))
              }
              disabled={guardando || success}
              inputProps={{ min: 1, max: 10 }}
            />
          </Grid>

          {/* Peso evaluación */}
          <Grid item xs={12} md={4}>
            <TextField
              type="number"
              label="Peso en evaluación (%)"
              fullWidth
              value={formData.pesoEvaluacion || ""}
              onChange={(e) =>
                handleChange("pesoEvaluacion", e.target.value ? Number(e.target.value) : 0)
              }
              disabled={guardando || success}
              inputProps={{ min: 0, max: 100 }}
              helperText="Opcional"
            />
          </Grid>

          {/* Permite tardías */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.permiteTardias}
                  onChange={(e) => handleChange("permiteTardias", e.target.checked)}
                  disabled={guardando || success}
                />
              }
              label="Permitir entregas tardías"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* ✅ MEJORA 1: Mostrar archivos existentes (si está editando) */}
          {isEditing && archivosExistentes.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Archivos existentes ({archivosExistentes.length})
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <List>
                  {archivosExistentes.map((archivo) => (
                    <ListItem
                      key={archivo.fileId}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          onClick={() => handleEliminarArchivoExistente(archivo.fileId)}
                          disabled={guardando || success}
                          color="error"
                        >
                          <DeleteIcon />
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
                      <Chip label="Existente" size="small" color="primary" sx={{ mr: 1 }} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          )}

          {/* Material de referencia (archivos nuevos) */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              {isEditing ? "Agregar más archivos" : "Material de referencia (opcional)"}
            </Typography>
            <FileUploader
              files={archivos}
              onFilesChange={setArchivos}
              maxFiles={5}
              maxSizeMB={10}
              disabled={guardando || success}
            />
          </Grid>

          {/* Botones */}
          <Grid item xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 2,
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
                onClick={handleGuardar}
                disabled={guardando || success}
              >
                {guardando ? "Guardando..." : "Guardar Tarea"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default FormularioTarea;