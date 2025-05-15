// src/pages/asistencia/RegistroAsistencia.tsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  Save as SaveIcon,
  Close as CloseIcon,
  CheckCircle as PresenteIcon,
  Cancel as AusenteIcon,
  Warning as TardanzaIcon,
  LowPriority as PermisoIcon,
  AssignmentLate as JustificadoIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { format, parse } from "date-fns";
import { useFormik } from "formik";
import * as Yup from "yup";

import asistenciaService, {
  RegistroAsistencia as IRegistroAsistencia,
  EstudianteAsistencia,
  ESTADOS_ASISTENCIA,
  TIPOS_SESION,
} from "../../services/asistenciaService";

// Componente para la selección de estado de asistencia
const EstadoAsistenciaSelector: React.FC<{
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}> = ({ value, onChange, disabled = false }) => {
  // Asegurar que value siempre sea una cadena válida
  const estadoActual = Object.values(ESTADOS_ASISTENCIA).includes(value)
    ? value
    : ESTADOS_ASISTENCIA.PRESENTE;

  console.log(
    "EstadoSelector rendering with value:",
    value,
    "normalized to:",
    estadoActual
  );

  return (
    <RadioGroup
      row
      value={estadoActual}
      onChange={(e) => onChange(e.target.value)}
    >
      <FormControlLabel
        value={ESTADOS_ASISTENCIA.PRESENTE}
        control={
          <Radio
            disabled={disabled}
            icon={<PresenteIcon color="disabled" />}
            checkedIcon={<PresenteIcon color="success" />}
          />
        }
        label=""
        sx={{ mr: 0 }}
      />
      <FormControlLabel
        value={ESTADOS_ASISTENCIA.AUSENTE}
        control={
          <Radio
            disabled={disabled}
            icon={<AusenteIcon color="disabled" />}
            checkedIcon={<AusenteIcon color="error" />}
          />
        }
        label=""
        sx={{ mr: 0 }}
      />
      <FormControlLabel
        value={ESTADOS_ASISTENCIA.TARDANZA}
        control={
          <Radio
            disabled={disabled}
            icon={<TardanzaIcon color="disabled" />}
            checkedIcon={<TardanzaIcon color="warning" />}
          />
        }
        label=""
        sx={{ mr: 0 }}
      />
      <FormControlLabel
        value={ESTADOS_ASISTENCIA.JUSTIFICADO}
        control={
          <Radio
            disabled={disabled}
            icon={<JustificadoIcon color="disabled" />}
            checkedIcon={<JustificadoIcon color="info" />}
          />
        }
        label=""
        sx={{ mr: 0 }}
      />
      <FormControlLabel
        value={ESTADOS_ASISTENCIA.PERMISO}
        control={
          <Radio
            disabled={disabled}
            icon={<PermisoIcon color="disabled" />}
            checkedIcon={<PermisoIcon color="primary" />}
          />
        }
        label=""
      />
    </RadioGroup>
  );
};

// Leyenda para los estados de asistencia
const LeyendaEstados: React.FC = () => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <PresenteIcon color="success" sx={{ mr: 0.5 }} />
        <Typography variant="body2">Presente</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <AusenteIcon color="error" sx={{ mr: 0.5 }} />
        <Typography variant="body2">Ausente</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <TardanzaIcon color="warning" sx={{ mr: 0.5 }} />
        <Typography variant="body2">Tardanza</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <JustificadoIcon color="info" sx={{ mr: 0.5 }} />
        <Typography variant="body2">Justificado</Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <PermisoIcon color="primary" sx={{ mr: 0.5 }} />
        <Typography variant="body2">Permiso</Typography>
      </Box>
    </Box>
  );
};

const RegistroAsistencia: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const modoEdicion = Boolean(id);

  const [cursos, setCursos] = useState<any[]>([]);
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<boolean>(false);

  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    fecha: Yup.date().required("La fecha es requerida"),
    cursoId: Yup.string().required("El curso es requerido"),
    tipoSesion: Yup.string().required("El tipo de sesión es requerido"),
    horaInicio: Yup.string().required("La hora de inicio es requerida"),
    horaFin: Yup.string()
      .required("La hora de fin es requerida")
      .test(
        "is-greater",
        "La hora de fin debe ser mayor a la hora de inicio",
        function (value) {
          const { horaInicio } = this.parent;
          if (!horaInicio || !value) return true;
          return value > horaInicio;
        }
      ),
  });

  // Configuración del formulario
  const formik = useFormik<IRegistroAsistencia>({
    initialValues: {
      fecha: new Date(),
      cursoId: "",
      asignaturaId: "",
      tipoSesion: TIPOS_SESION.CLASE,
      horaInicio: "08:00",
      horaFin: "09:00",
      estudiantes: [],
      observacionesGenerales: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setGuardando(true);
        setError(null);

        // Clonar valores para no modificar el estado directamente
        const valuesToSubmit = { ...values };

        // Asegurar que la fecha se envía correctamente (sin problemas de zona horaria)
        if (valuesToSubmit.fecha instanceof Date) {
          // Convertir a YYYY-MM-DD sin ajuste de zona horaria
          valuesToSubmit.fecha = format(valuesToSubmit.fecha, "yyyy-MM-dd");
        }

        // AÑADIR ESTA LÍNEA: Eliminar asignaturaId si está vacío
        if (valuesToSubmit.asignaturaId === "") {
          delete valuesToSubmit.asignaturaId;
        }

        // Validar que todos los estudiantes tengan un estado
        const todosConEstado = valuesToSubmit.estudiantes.every(
          (e) => e.estado
        );
        if (!todosConEstado) {
          setError("Todos los estudiantes deben tener un estado de asistencia");
          setGuardando(false);
          return;
        }

        if (modoEdicion) {
          // Actualizar registro existente
          await asistenciaService.actualizarRegistroAsistencia(
            id!,
            valuesToSubmit
          );
        } else {
          // Crear nuevo registro
          await asistenciaService.crearRegistroAsistencia(valuesToSubmit);
        }

        setExito(true);

        // Limpiar y redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/asistencia");
        }, 2000);
      } catch (err: any) {
        console.error("Error al guardar asistencia:", err);
        setError(
          err.response?.data?.message ||
            "Error al guardar el registro de asistencia"
        );
      } finally {
        setGuardando(false);
      }
    },
  });

  // Cargar registro en modo edición
  // Modificar la sección de useEffect para cargar registro en RegistroAsistencia.tsx

  // Cargar registro en modo edición
  // Reemplazar el useEffect para cargar registro en edición

  // Cargar registro en modo edición
  useEffect(() => {
    if (modoEdicion && id) {
      const cargarRegistro = async () => {
        try {
          setLoadingData(true);
          setError(null);

          const data = await asistenciaService.obtenerRegistroAsistencia(id);
          console.log("Datos recibidos del servidor:", data);

          // Asegurarse de que cada estudiante tenga un estado válido
          const estudiantesFormateados = data.estudiantes.map((est: any) => {
            // Asegurarse de que estado sea uno de los valores válidos de ESTADOS_ASISTENCIA
            const estado = Object.values(ESTADOS_ASISTENCIA).includes(
              est.estado
            )
              ? est.estado
              : ESTADOS_ASISTENCIA.PRESENTE;

            return {
              estudianteId:
                typeof est.estudianteId === "object"
                  ? est.estudianteId._id
                  : est.estudianteId,
              nombre: est.nombre || "",
              apellidos: est.apellidos || "",
              estado: estado, // Importante: usar el estado normalizado
              observaciones: est.observaciones || "",
              justificacion: est.justificacion || "",
            };
          });

          console.log("Estudiantes formateados:", estudiantesFormateados);

          const valoresFormateados = {
            ...data,
            fecha: new Date(data.fecha),
            cursoId:
              typeof data.cursoId === "object" && data.cursoId?._id
                ? data.cursoId._id
                : data.cursoId,
            asignaturaId:
              typeof data.asignaturaId === "object" && data.asignaturaId?._id
                ? data.asignaturaId._id
                : data.asignaturaId,
            estudiantes: estudiantesFormateados,
          };

          // Actualizar el formulario con los datos formateados
          formik.setValues(valoresFormateados);
        } catch (err: any) {
          console.error("Error al cargar registro de asistencia:", err);
          setError("No se pudo cargar el registro de asistencia");
          navigate("/asistencia");
        } finally {
          setLoadingData(false);
        }
      };

      cargarRegistro();
    }
  }, [id, modoEdicion]);

  // Cargar cursos disponibles al montar el componente
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoading(true);
        const data = await asistenciaService.obtenerCursosDisponibles();
        setCursos(data);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
        setError("No se pudieron cargar los cursos disponibles");
      } finally {
        setLoading(false);
      }
    };

    cargarCursos();
  }, []);

  // Cargar asignaturas cuando se selecciona un curso
  useEffect(() => {
    if (!formik.values.cursoId) {
      setAsignaturas([]);
      return;
    }

    const cargarAsignaturas = async () => {
      try {
        setLoading(true);
        // Asegurarse de que estamos pasando un string del ID
        const cursoId =
          typeof formik.values.cursoId === "object"
            ? (formik.values.cursoId as any)?._id || ""
            : formik.values.cursoId;

        const data = await asistenciaService.obtenerAsignaturasPorCurso(
          cursoId
        );
        setAsignaturas(data);
      } catch (err) {
        console.error("Error al cargar asignaturas:", err);
        setError("No se pudieron cargar las asignaturas del curso");
      } finally {
        setLoading(false);
      }
    };

    cargarAsignaturas();
  }, [formik.values.cursoId]);

  // Cargar estudiantes cuando se selecciona un curso
  useEffect(() => {
    if (!formik.values.cursoId) {
      setEstudiantes([]);
      // No limpiamos los estudiantes en el formulario en modo edición
      if (!modoEdicion) {
        formik.setFieldValue("estudiantes", []);
      }
      return;
    }

    const cargarEstudiantes = async () => {
      try {
        setLoading(true);
        // Asegurarse de que estamos pasando un string del ID
        const cursoId =
          typeof formik.values.cursoId === "object"
            ? (formik.values.cursoId as any)?._id || ""
            : formik.values.cursoId;

        const data = await asistenciaService.obtenerEstudiantesPorCurso(
          cursoId
        );
        setEstudiantes(data);

        // En modo edición, no reemplazamos los estudiantes si ya los tenemos
        if (!modoEdicion || formik.values.estudiantes.length === 0) {
          // Inicializar los estudiantes con estado PRESENTE por defecto
          const estudiantesAsistencia: EstudianteAsistencia[] = data.map(
            (est: any) => ({
              estudianteId: est._id,
              nombre: est.nombre,
              apellidos: est.apellidos,
              estado: ESTADOS_ASISTENCIA.PRESENTE,
              observaciones: "",
            })
          );

          formik.setFieldValue("estudiantes", estudiantesAsistencia);
        }
      } catch (err) {
        console.error("Error al cargar estudiantes:", err);
        setError("No se pudieron cargar los estudiantes del curso");
      } finally {
        setLoading(false);
      }
    };

    cargarEstudiantes();
  }, [formik.values.cursoId, modoEdicion]);

  // Función para actualizar el estado de un estudiante
  const handleEstadoChange = (estudianteId: string, estado: string) => {
    const nuevosEstudiantes = formik.values.estudiantes.map((est) => {
      if (est.estudianteId === estudianteId) {
        return { ...est, estado };
      }
      return est;
    });

    formik.setFieldValue("estudiantes", nuevosEstudiantes);
  };

  // Función para actualizar las observaciones de un estudiante
  const handleObservacionesChange = (
    estudianteId: string,
    observaciones: string
  ) => {
    const nuevosEstudiantes = formik.values.estudiantes.map((est) => {
      if (est.estudianteId === estudianteId) {
        return { ...est, observaciones };
      }
      return est;
    });

    formik.setFieldValue("estudiantes", nuevosEstudiantes);
  };

  // Función para establecer todos los estudiantes con el mismo estado
  const handleEstadoMasivo = (estado: string) => {
    const nuevosEstudiantes = formik.values.estudiantes.map((est) => ({
      ...est,
      estado,
    }));

    formik.setFieldValue("estudiantes", nuevosEstudiantes);
  };

  return (
    <Box>
      <Typography variant="h2" color="primary.main" gutterBottom>
        {modoEdicion
          ? "Editar Registro de Asistencia"
          : "Nuevo Registro de Asistencia"}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {exito && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Registro de asistencia guardado exitosamente
        </Alert>
      )}

      {loadingData ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
            mb: 4,
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              {/* Fecha */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="fecha"
                  name="fecha"
                  label="Fecha"
                  type="date"
                  value={format(
                    formik.values.fecha instanceof Date
                      ? formik.values.fecha
                      : new Date(),
                    "yyyy-MM-dd"
                  )}
                  onChange={(e) => {
                    // Crear fecha con horario neutral para evitar problemas de zona horaria
                    const selectedDate = new Date(e.target.value + "T12:00:00"); // Añade mediodía para evitar problemas con zonas horarias
                    formik.setFieldValue("fecha", selectedDate);
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={formik.touched.fecha && Boolean(formik.errors.fecha)}
                  helperText={
                    formik.touched.fecha && (formik.errors.fecha as string)
                  }
                  sx={{
                    "& input::-webkit-calendar-picker-indicator": {
                      cursor: "pointer",
                      filter: "invert(0.5)",
                    },
                  }}
                />
              </Grid>

              {/* Curso */}
              <Grid item xs={12} md={6}>
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
                    disabled={
                      loading ||
                      guardando ||
                      (modoEdicion && formik.values.estudiantes.length > 0)
                    }
                  >
                    {cursos.map((curso) => (
                      <MenuItem key={curso._id} value={curso._id}>
                        {curso.grado} {curso.grupo}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.cursoId && formik.errors.cursoId && (
                    <Typography color="error" variant="caption">
                      {formik.errors.cursoId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Asignatura (opcional) */}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="asignatura-label">
                    Asignatura (opcional)
                  </InputLabel>
                  <Select
                    labelId="asignatura-label"
                    id="asignaturaId"
                    name="asignaturaId"
                    value={formik.values.asignaturaId || ""}
                    onChange={formik.handleChange}
                    label="Asignatura (opcional)"
                    disabled={loading || guardando || !formik.values.cursoId}
                  >
                    <MenuItem value="">
                      <em>No seleccionar</em>
                    </MenuItem>
                    {asignaturas.map((asignatura) => (
                      <MenuItem key={asignatura._id} value={asignatura._id}>
                        {asignatura.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tipo de sesión */}
              <Grid item xs={12} md={4}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.tipoSesion &&
                    Boolean(formik.errors.tipoSesion)
                  }
                >
                  <InputLabel id="tipo-sesion-label">Tipo de Sesión</InputLabel>
                  <Select
                    labelId="tipo-sesion-label"
                    id="tipoSesion"
                    name="tipoSesion"
                    value={formik.values.tipoSesion}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Tipo de Sesión"
                    disabled={guardando}
                  >
                    {Object.entries(TIPOS_SESION).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.tipoSesion && formik.errors.tipoSesion && (
                    <Typography color="error" variant="caption">
                      {formik.errors.tipoSesion}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Hora de inicio y fin */}
              <Grid item xs={12} md={4} container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="horaInicio"
                    name="horaInicio"
                    label="Hora Inicio"
                    type="time"
                    value={formik.values.horaInicio}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.horaInicio &&
                      Boolean(formik.errors.horaInicio)
                    }
                    helperText={
                      formik.touched.horaInicio && formik.errors.horaInicio
                    }
                    disabled={guardando}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    id="horaFin"
                    name="horaFin"
                    label="Hora Fin"
                    type="time"
                    value={formik.values.horaFin}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.horaFin && Boolean(formik.errors.horaFin)
                    }
                    helperText={formik.touched.horaFin && formik.errors.horaFin}
                    disabled={guardando}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              {/* Observaciones generales */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="observacionesGenerales"
                  name="observacionesGenerales"
                  label="Observaciones generales"
                  multiline
                  rows={2}
                  value={formik.values.observacionesGenerales}
                  onChange={formik.handleChange}
                  disabled={guardando}
                />
              </Grid>
            </Grid>

            {/* Tabla de estudiantes */}
            {formik.values.cursoId && formik.values.estudiantes.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h3" gutterBottom>
                  Registro de Asistencia de Estudiantes
                </Typography>

                <LeyendaEstados />

                {/* Acciones masivas */}
                <Box sx={{ mt: 2, mb: 2, display: "flex", gap: 1 }}>
                  <Tooltip title="Marcar a todos los estudiantes como presentes">
                    <Button
                      variant="outlined"
                      startIcon={<PresenteIcon color="success" />}
                      onClick={() =>
                        handleEstadoMasivo(ESTADOS_ASISTENCIA.PRESENTE)
                      }
                      disabled={guardando}
                      size="small"
                    >
                      Todos Presentes
                    </Button>
                  </Tooltip>
                  <Tooltip title="Marcar a todos los estudiantes como ausentes">
                    <Button
                      variant="outlined"
                      startIcon={<AusenteIcon color="error" />}
                      onClick={() =>
                        handleEstadoMasivo(ESTADOS_ASISTENCIA.AUSENTE)
                      }
                      disabled={guardando}
                      size="small"
                    >
                      Todos Ausentes
                    </Button>
                  </Tooltip>
                </Box>

                <TableContainer
                  component={Paper}
                  sx={{
                    mt: 2,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="5%">#</TableCell>
                        <TableCell width="25%">Estudiante</TableCell>
                        <TableCell width="30%" align="center">
                          Estado
                        </TableCell>
                        <TableCell width="40%">Observaciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {formik.values.estudiantes.map((estudiante, index) => {
                        // Debug: Verificar el estado del estudiante
                        console.log(
                          `Estudiante ${index}: ${estudiante.nombre} ${estudiante.apellidos}, Estado: "${estudiante.estado}"`
                        );

                        return (
                          <TableRow key={estudiante.estudianteId || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              {estudiante.nombre} {estudiante.apellidos}
                            </TableCell>
                            <TableCell align="center">
                              <EstadoAsistenciaSelector
                                value={
                                  estudiante.estado ||
                                  ESTADOS_ASISTENCIA.PRESENTE
                                }
                                onChange={(estado) =>
                                  handleEstadoChange(
                                    estudiante.estudianteId,
                                    estado
                                  )
                                }
                                disabled={guardando}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Observaciones (opcional)"
                                value={estudiante.observaciones || ""}
                                onChange={(e) =>
                                  handleObservacionesChange(
                                    estudiante.estudianteId,
                                    e.target.value
                                  )
                                }
                                disabled={guardando}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Botones de acción */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 4,
                gap: 2,
              }}
            >
              <Tooltip title="Cancelar y volver a la lista">
                <Button
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={() => setConfirmDialog(true)}
                  disabled={guardando}
                  sx={{ borderRadius: "20px" }}
                >
                  Cancelar
                </Button>
              </Tooltip>
              <Tooltip title="Guardar registro de asistencia">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    guardando ? <CircularProgress size={24} /> : <SaveIcon />
                  }
                  disabled={guardando}
                  sx={{ borderRadius: "20px" }}
                >
                  {guardando ? "Guardando..." : "Guardar Asistencia"}
                </Button>
              </Tooltip>
            </Box>
          </form>
        </Paper>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirmar cancelación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de cancelar? Se perderán todos los datos no guardados.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            No, continuar editando
          </Button>
          <Button
            onClick={() => navigate("/asistencia")}
            color="error"
            autoFocus
          >
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RegistroAsistencia;
