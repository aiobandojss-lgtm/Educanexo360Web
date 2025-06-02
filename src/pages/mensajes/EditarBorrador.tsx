// src/pages/mensajes/EditarBorrador.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Autocomplete,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import {
  Send as SendIcon,
  Cancel as CancelIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RootState } from "../../redux/store";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import mensajeService from "../../services/mensajeService";
import { IBorrador, ROLES_CON_BORRADORES } from "../../types/mensaje.types";

// Configuración de Quill
const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ color: [] }, { background: [] }],
    ["link"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "color",
  "background",
  "link",
];

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  asignatura?: string;
  curso?: string;
  infoContextual?: string;
}

interface Curso {
  _id: string;
  nombre: string;
  grado: string;
  seccion: string;
  grupo?: string;
  cantidadEstudiantes: number;
  infoAdicional?: string;
}

interface AdjuntoUI extends File {
  preExistente?: boolean;
  fileId?: string;
  nombre?: string;
  tipo?: string;
  tamaño?: number;
}

// Tipos de mensaje
const TIPOS_MENSAJE = {
  INDIVIDUAL: "INDIVIDUAL",
  GRUPAL: "GRUPAL",
  BORRADOR: "BORRADOR",
} as const;

type TipoMensaje = (typeof TIPOS_MENSAJE)[keyof typeof TIPOS_MENSAJE];

const EditarBorrador: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [destinatarios, setDestinatarios] = useState<Usuario[]>([]);
  const [destinatariosSeleccionados, setDestinatariosSeleccionados] = useState<
    Usuario[]
  >([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [adjuntos, setAdjuntos] = useState<AdjuntoUI[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingBorrador, setLoadingBorrador] = useState<boolean>(false);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<TipoMensaje>(
    TIPOS_MENSAJE.INDIVIDUAL
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [query, setQuery] = useState<string>("");
  const [confirmSendOpen, setConfirmSendOpen] = useState<boolean>(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState<boolean>(false);

  // Verificar permisos para borradores
  const puedeTenerBorradores = user && ROLES_CON_BORRADORES.includes(user.tipo);

  useEffect(() => {
    // Redirigir si no tiene permisos para borradores
    if (!puedeTenerBorradores) {
      navigate("/mensajes/recibidos");
      return;
    }

    // Si tenemos un ID, cargar el borrador
    if (id) {
      cargarBorrador();
    }

    // Cargar destinatarios disponibles
    buscarDestinatarios();

    // Cargar cursos disponibles
    cargarCursosDisponibles();
  }, [id, puedeTenerBorradores, navigate]);

  // Validación con Yup
  const validationSchema = Yup.object().shape({
    asunto: Yup.string().required("El asunto es requerido"),
    contenido: Yup.string().required("El contenido es requerido"),
    // Validación condicional según tipo de mensaje
    ...(tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL
      ? {
          destinatarios: Yup.array().min(
            1,
            "Debe seleccionar al menos un destinatario"
          ),
        }
      : {
          cursoId: Yup.string().required("Debe seleccionar un curso"),
        }),
    prioridad: Yup.string().required("Seleccione la prioridad del mensaje"),
  });

  const formik = useFormik({
    initialValues: {
      _id: "",
      destinatarios: [] as string[],
      asunto: "",
      contenido: "",
      cursoId: "",
      prioridad: "NORMAL" as "ALTA" | "NORMAL" | "BAJA",
    },
    validationSchema,
    onSubmit: async (values) => {
      // Esta función no se usará directamente, usaremos funciones separadas para guardar y enviar
    },
  });

  // Cargar un borrador existente
  const cargarBorrador = async () => {
    try {
      setLoadingBorrador(true);
      setError(null);

      const borrador = await mensajeService.obtenerBorrador(id!);

      // Actualizar tipo de mensaje
      if (borrador.cursoId) {
        setTipoMensaje(TIPOS_MENSAJE.GRUPAL);
      } else {
        setTipoMensaje(TIPOS_MENSAJE.INDIVIDUAL);
      }

      // Actualizar valores del formulario
      formik.setValues({
        _id: borrador._id,
        destinatarios: borrador.destinatarios.map((d: any) =>
          typeof d === "string" ? d : d._id
        ),
        asunto: borrador.asunto,
        contenido: borrador.contenido,
        cursoId: borrador.cursoId || "",
        prioridad: borrador.prioridad || "NORMAL",
      });

      // Cargar destinatarios seleccionados si existen
      if (borrador.destinatarios && Array.isArray(borrador.destinatarios)) {
        const destinatariosData = borrador.destinatarios.map((d: any) => {
          if (typeof d === "string") {
            // Si solo tenemos el ID, necesitamos cargar los datos completos
            return {
              _id: d,
              nombre: "Cargando...",
              apellidos: "",
              email: "",
              tipo: "",
            };
          } else {
            // Si ya tenemos los datos completos
            return d;
          }
        });

        setDestinatariosSeleccionados(destinatariosData);
      }

      // Cargar adjuntos si existen
      if (borrador.adjuntos && borrador.adjuntos.length > 0) {
        interface AdjuntoBackend {
          fileId: string;
          nombre: string;
          tipo: string;
          tamaño: number;
        }

        interface FileImplementation {
          lastModified: number;
          name: string;
          size: number;
          type: string;
          slice: () => Blob;
          stream: () => ReadableStream;
          text: () => Promise<string>;
          arrayBuffer: () => Promise<ArrayBuffer>;
          webkitRelativePath: string;
        }

        const adjuntosExistentes: AdjuntoUI[] = borrador.adjuntos.map(
          (adjunto: AdjuntoBackend) =>
            ({
              preExistente: true,
              fileId: adjunto.fileId,
              nombre: adjunto.nombre,
              tipo: adjunto.tipo,
              tamaño: adjunto.tamaño,
              // Estos campos son necesarios para satisfacer la interfaz File
              lastModified: 0,
              name: adjunto.nombre,
              size: adjunto.tamaño,
              type: adjunto.tipo,
              slice: () => new Blob(),
              stream: () => new ReadableStream(),
              text: () => Promise.resolve(""),
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
              webkitRelativePath: "",
            } as AdjuntoUI)
        );

        setAdjuntos(adjuntosExistentes);
      }
    } catch (err: any) {
      console.error("Error al cargar borrador:", err);
      setError(
        "No se pudo cargar el borrador. " +
          (err.message || "Intente nuevamente más tarde.")
      );
    } finally {
      setLoadingBorrador(false);
    }
  };

  // Función para buscar destinatarios
  const buscarDestinatarios = async (busqueda: string = "") => {
    try {
      setBuscando(true);
      setError(null);

      const data = await mensajeService.buscarDestinatarios(busqueda);

      if (Array.isArray(data) && data.length === 0 && busqueda.trim() !== "") {
        setError(
          `No se encontraron destinatarios para "${busqueda}". Intente con otro nombre.`
        );
      } else {
        setDestinatarios(data || []);
      }
    } catch (err: any) {
      console.error("Error al buscar destinatarios:", err);
      setError(
        "No se pudieron cargar los destinatarios. Por favor intente más tarde."
      );
      setDestinatarios([]);
    } finally {
      setBuscando(false);
    }
  };

  // Función para cargar cursos disponibles
  const cargarCursosDisponibles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mensajeService.obtenerCursosDisponibles();

      // Asegurar que siempre tenemos un array
      const cursosFormateados = Array.isArray(data) ? data : [];
      setCursos(cursosFormateados);
    } catch (err: any) {
      console.error("Error al cargar cursos:", err);
      setError(
        "No se pudieron cargar los cursos disponibles. Por favor, intente más tarde o use mensaje individual."
      );
      setCursos([]);
      // Si falla la carga de cursos, cambiar a modo individual
      setTipoMensaje(TIPOS_MENSAJE.INDIVIDUAL);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de búsqueda con debounce
  useEffect(() => {
    if (tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL && query.trim()) {
      const handler = setTimeout(() => {
        buscarDestinatarios(query);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [query, tipoMensaje]);

  // Guardar borrador
  const guardarBorrador = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validaciones mejoradas
      if (!formik.values.asunto || formik.values.asunto.trim() === "") {
        formik.setFieldError("asunto", "El asunto es requerido");
        setLoading(false);
        return;
      }

      if (!formik.values.contenido || formik.values.contenido.trim() === "") {
        formik.setFieldError("contenido", "El contenido es requerido");
        setLoading(false);
        return;
      }

      // Validar según tipo de mensaje
      if (tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL) {
        if (
          !formik.values.destinatarios ||
          formik.values.destinatarios.length === 0
        ) {
          formik.setFieldError(
            "destinatarios",
            "Debe seleccionar al menos un destinatario"
          );
          setLoading(false);
          return;
        }
      } else if (tipoMensaje === TIPOS_MENSAJE.GRUPAL) {
        if (!formik.values.cursoId) {
          formik.setFieldError("cursoId", "Debe seleccionar un curso");
          setLoading(false);
          return;
        }
      }

      // Preparar datos del borrador con validaciones
      const borrador: IBorrador = {
        _id: formik.values._id || undefined,
        destinatarios:
          tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL
            ? formik.values.destinatarios.filter((d) => d && d.trim() !== "")
            : [],
        asunto: formik.values.asunto.trim(),
        contenido: formik.values.contenido.trim(),
        prioridad: formik.values.prioridad || "NORMAL",
        tipo: "BORRADOR", // Siempre BORRADOR para esta función
      };

      // Agregar cursoId si es mensaje grupal
      if (tipoMensaje === TIPOS_MENSAJE.GRUPAL && formik.values.cursoId) {
        borrador.cursoId = formik.values.cursoId;
      }

      // Filtrar solo los adjuntos nuevos (no pre-existentes)
      const nuevosAdjuntos = adjuntos.filter((a) => !a.preExistente) as File[];

      // Guardar borrador
      const response = await mensajeService.guardarBorrador(
        borrador,
        nuevosAdjuntos
      );

      // Actualizar ID si es un nuevo borrador
      if (!formik.values._id && response.data?._id) {
        formik.setFieldValue("_id", response.data._id);
      }

      setSnackbar({
        open: true,
        message: "Borrador guardado correctamente",
        severity: "success",
      });
    } catch (err: any) {
      console.error("Error al guardar borrador:", err);
      const errorMessage =
        err.message ||
        "No se pudo guardar el borrador. Intente nuevamente más tarde.";
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: "Error al guardar borrador: " + errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Enviar borrador
  const enviarBorrador = async () => {
    try {
      setLoading(true);
      setError(null);

      // Si no tiene ID, guardarlo primero
      if (!formik.values._id) {
        await guardarBorrador();

        // Si sigue sin ID después de guardar, hay un error
        if (!formik.values._id) {
          throw new Error("No se pudo crear el borrador antes de enviarlo");
        }
      }

      // Enviar el borrador
      await mensajeService.enviarBorrador(formik.values._id);

      setSnackbar({
        open: true,
        message: "Mensaje enviado exitosamente",
        severity: "success",
      });

      // Cerrar el diálogo y redirigir después de un breve retraso
      setConfirmSendOpen(false);
      setTimeout(() => {
        navigate("/mensajes/enviados");
      }, 1500);
    } catch (err: any) {
      console.error("Error al enviar borrador:", err);
      setError(
        "No se pudo enviar el borrador. " +
          (err.message || "Intente nuevamente más tarde.")
      );
      setSnackbar({
        open: true,
        message: "Error al enviar el borrador",
        severity: "error",
      });
      setConfirmSendOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de archivos adjuntos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files) as AdjuntoUI[];
      setAdjuntos((prevAdjuntos) => [...prevAdjuntos, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAdjuntos((prevAdjuntos) => prevAdjuntos.filter((_, i) => i !== index));
  };

  // Manejo de selección de destinatarios
  const handleDestinatarioSeleccionado = (_: any, value: Usuario | null) => {
    if (value && !destinatariosSeleccionados.find((d) => d._id === value._id)) {
      setDestinatariosSeleccionados([...destinatariosSeleccionados, value]);
      formik.setFieldValue("destinatarios", [
        ...formik.values.destinatarios,
        value._id,
      ]);
    }
    setQuery("");
  };

  const handleRemoveDestinatario = (id: string) => {
    setDestinatariosSeleccionados(
      destinatariosSeleccionados.filter((d) => d._id !== id)
    );
    formik.setFieldValue(
      "destinatarios",
      formik.values.destinatarios.filter((d) => d !== id)
    );
  };

  // Cambio de tipo de mensaje
  const handleChangeTipoMensaje = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nuevoTipo = event.target.value as TipoMensaje;
    setTipoMensaje(nuevoTipo);

    // Limpiar mensajes de error previos
    setError(null);

    // Limpiar selecciones previas
    if (nuevoTipo === TIPOS_MENSAJE.INDIVIDUAL) {
      formik.setFieldValue("cursoId", "");
    } else {
      formik.setFieldValue("destinatarios", []);
      setDestinatariosSeleccionados([]);
      // Si no hay cursos cargados, intentar cargarlos
      if (cursos.length === 0) {
        cargarCursosDisponibles();
      }
    }
  };

  // Función para reintentar cargar datos
  const handleRetry = () => {
    setError(null);
    if (tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL) {
      buscarDestinatarios(query);
    } else {
      cargarCursosDisponibles();
    }
  };

  // Función que formatea el texto del destinatario
  const getDestinatarioLabel = (destinatario: Usuario) => {
    let label = `${destinatario.nombre} ${destinatario.apellidos} (${destinatario.tipo})`;

    if (destinatario.tipo === "DOCENTE") {
      if (destinatario.asignatura) {
        label += ` - ${destinatario.asignatura}`;
      }

      if (destinatario.curso) {
        label += ` en ${destinatario.curso}`;
      }
    }

    return label;
  };

  if (loadingBorrador) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" color="primary.main" gutterBottom>
        {formik.values._id ? "Editar Borrador" : "Nuevo Borrador"}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <form>
          <Grid container spacing={3}>
            {/* Tipo de mensaje */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tipo de mensaje
              </Typography>
              <RadioGroup
                row
                name="tipoMensaje"
                value={tipoMensaje}
                onChange={handleChangeTipoMensaje}
              >
                <FormControlLabel
                  value={TIPOS_MENSAJE.INDIVIDUAL}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <PersonIcon sx={{ mr: 1 }} /> Individual
                    </Box>
                  }
                />
                <FormControlLabel
                  value={TIPOS_MENSAJE.GRUPAL}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <GroupIcon sx={{ mr: 1 }} /> Masivo (Curso completo)
                    </Box>
                  }
                />
              </RadioGroup>
            </Grid>

            {/* Destinatarios o curso según tipo de mensaje */}
            {tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL ? (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Destinatarios
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Autocomplete
                    id="destinatarios-autocomplete"
                    options={destinatarios}
                    getOptionLabel={(option) => getDestinatarioLabel(option)}
                    loading={buscando}
                    onChange={handleDestinatarioSeleccionado}
                    onInputChange={(_, value) => setQuery(value)}
                    noOptionsText={
                      query.trim()
                        ? "No se encontraron destinatarios"
                        : "Escriba para buscar"
                    }
                    loadingText="Buscando destinatarios..."
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ py: 1 }}>
                          <Typography variant="body1">
                            {option.nombre} {option.apellidos}
                            <Typography
                              component="span"
                              color="primary.main"
                              variant="body2"
                            >
                              {" "}
                              ({option.tipo})
                            </Typography>
                          </Typography>

                          {/* Información detallada para docentes */}
                          {option.tipo === "DOCENTE" && (
                            <>
                              {option.asignatura && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Asignatura:</strong>{" "}
                                  {option.asignatura}
                                </Typography>
                              )}

                              {option.curso && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  <strong>Curso:</strong> {option.curso}
                                </Typography>
                              )}
                            </>
                          )}
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Buscar destinatario"
                        placeholder="Escriba para buscar destinatarios"
                        variant="outlined"
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {buscando ? (
                                <CircularProgress color="inherit" size={20} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />

                  {formik.touched.destinatarios &&
                    formik.errors.destinatarios && (
                      <FormHelperText error>
                        {formik.errors.destinatarios as string}
                      </FormHelperText>
                    )}
                </Box>

                {/* Lista de destinatarios seleccionados */}
                {destinatariosSeleccionados.length > 0 && (
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {destinatariosSeleccionados.map((d) => (
                      <Chip
                        key={d._id}
                        label={getDestinatarioLabel(d)}
                        onDelete={() => handleRemoveDestinatario(d._id)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.cursoId && Boolean(formik.errors.cursoId)
                  }
                >
                  <InputLabel id="curso-label">Curso</InputLabel>
                  <Select
                    labelId="curso-label"
                    id="cursoId"
                    name="cursoId"
                    value={formik.values.cursoId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Curso"
                    disabled={loading}
                    renderValue={(value) => {
                      const curso = cursos.find((c) => c._id === value);
                      return curso
                        ? `${curso.nombre} (${curso.cantidadEstudiantes} estudiantes)`
                        : "";
                    }}
                  >
                    {cursos.length > 0 ? (
                      cursos.map((curso) => (
                        <MenuItem key={curso._id} value={curso._id}>
                          <Box>
                            <Typography variant="body1">
                              {curso.nombre}
                              <Typography component="span" color="primary.main">
                                {` (${curso.cantidadEstudiantes} estudiantes)`}
                              </Typography>
                            </Typography>
                            {curso.infoAdicional && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {curso.infoAdicional}
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled value="">
                        No hay cursos disponibles
                      </MenuItem>
                    )}
                  </Select>
                  {formik.touched.cursoId && formik.errors.cursoId && (
                    <FormHelperText error>
                      {formik.errors.cursoId}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            {/* Prioridad del mensaje */}
            <Grid item xs={12}>
              <FormControl
                fullWidth
                error={
                  formik.touched.prioridad && Boolean(formik.errors.prioridad)
                }
              >
                <InputLabel id="prioridad-label">Prioridad</InputLabel>
                <Select
                  labelId="prioridad-label"
                  id="prioridad"
                  name="prioridad"
                  value={formik.values.prioridad}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Prioridad"
                  disabled={loading}
                >
                  <MenuItem value="ALTA">Alta</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="BAJA">Baja</MenuItem>
                </Select>
                {formik.touched.prioridad && formik.errors.prioridad && (
                  <FormHelperText error>
                    {formik.errors.prioridad}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Asunto */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="asunto"
                name="asunto"
                label="Asunto"
                value={formik.values.asunto}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.asunto && Boolean(formik.errors.asunto)}
                helperText={formik.touched.asunto && formik.errors.asunto}
                disabled={loading}
              />
            </Grid>

            {/* Contenido */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Contenido
              </Typography>
              <ReactQuill
                theme="snow"
                value={formik.values.contenido}
                onChange={(content) =>
                  formik.setFieldValue("contenido", content)
                }
                modules={quillModules}
                formats={quillFormats}
                style={{ height: "200px", marginBottom: "50px" }}
              />
              {formik.touched.contenido && formik.errors.contenido && (
                <Typography color="error" variant="caption">
                  {formik.errors.contenido}
                </Typography>
              )}
            </Grid>

            {/* Adjuntos */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Adjuntos
              </Typography>

              {/* Lista de adjuntos */}
              {adjuntos.length > 0 && (
                <List>
                  {adjuntos.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.nombre || file.name}
                        secondary={`${(
                          (file.tamaño || file.size) / 1024
                        ).toFixed(2)} KB`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          color="error"
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

              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                disabled={loading}
                sx={{ mt: 1, borderRadius: "20px" }}
              >
                Agregar Adjunto
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>

            {/* Botones de acción */}
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => setConfirmCancelOpen(true)}
                disabled={loading}
                sx={{ borderRadius: "20px" }}
              >
                Cancelar
              </Button>

              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={guardarBorrador}
                disabled={loading}
                sx={{ borderRadius: "20px" }}
              >
                Guardar borrador
              </Button>

              <Button
                variant="contained"
                startIcon={
                  loading ? <CircularProgress size={20} /> : <SendIcon />
                }
                onClick={() => setConfirmSendOpen(true)}
                disabled={loading}
                sx={{ borderRadius: "20px" }}
              >
                Enviar ahora
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Diálogo de confirmación para enviar borrador */}
      <Dialog
        open={confirmSendOpen}
        onClose={() => setConfirmSendOpen(false)}
        aria-labelledby="send-dialog-title"
        aria-describedby="send-dialog-description"
      >
        <DialogTitle id="send-dialog-title">
          {"¿Enviar borrador ahora?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="send-dialog-description">
            El borrador se enviará a todos los destinatarios seleccionados y ya
            no estará disponible para edición.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSendOpen(false)} color="primary">
            Cancelar
          </Button>
          <Button
            onClick={enviarBorrador}
            color="primary"
            variant="contained"
            autoFocus
          >
            Enviar ahora
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para cancelar */}
      <Dialog
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          {"¿Salir sin guardar?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Los cambios no guardados se perderán. ¿Está seguro de que desea
            salir?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOpen(false)} color="primary">
            Continuar editando
          </Button>
          <Button
            onClick={() => navigate("/mensajes/borradores")}
            color="error"
          >
            Salir sin guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default EditarBorrador;
