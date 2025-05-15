// src/pages/calendario/FormularioEvento.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  FormLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Attachment as AttachmentIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

import calendarioService from "../../services/calendarioService";
import { RootState } from "../../redux/store";
import { debugDate } from "../../utils/dateUtils"; // Importar utilidades de fecha

const FormularioEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  // COMENTADO: Funcionalidad de archivos
  /* 
  const [archivo, setArchivo] = useState<File | null>(null);
  const [archivoActual, setArchivoActual] = useState<string | null>(null);
  */
  const [success, setSuccess] = useState<string | null>(null);

  // Validación de permisos para incluir todos los roles administrativos
  const isAdmin =
    user?.tipo === "ADMIN" ||
    user?.tipo === "RECTOR" ||
    user?.tipo === "COORDINADOR";
  const isTeacher = user?.tipo === "DOCENTE";
  const isAdministrative = user?.tipo === "ADMINISTRATIVO";
  const canApproveEvents = isAdmin || isTeacher || isAdministrative;

  // Esquema de validación mejorado
  const validationSchema = Yup.object({
    titulo: Yup.string().required("El título es obligatorio").trim(),
    descripcion: Yup.string().required("La descripción es obligatoria").trim(),
    fechaInicio: Yup.date()
      .required("La fecha de inicio es obligatoria")
      .typeError("La fecha de inicio debe ser válida"),
    fechaFin: Yup.date()
      .required("La fecha de fin es obligatoria")
      .typeError("La fecha de fin debe ser válida")
      .min(
        Yup.ref("fechaInicio"),
        "La fecha de fin no puede ser anterior a la fecha de inicio"
      ),
    tipo: Yup.string().required("El tipo de evento es obligatorio"),
    // Validación condicional para el lugar
    lugar: Yup.string().when("todoElDia", {
      is: false,
      then: (schema) =>
        schema
          .required("El lugar es obligatorio para eventos con hora específica")
          .trim(),
      otherwise: (schema) => schema.trim(),
    }),
  });

  // Formik para gestionar el formulario
  const formik = useFormik({
    initialValues: {
      titulo: "",
      descripcion: "",
      fechaInicio: new Date(),
      horaInicio: new Date(),
      fechaFin: new Date(),
      horaFin: new Date(new Date().getTime() + 60 * 60 * 1000), // Una hora más tarde por defecto
      todoElDia: false,
      lugar: "",
      tipo: "ACADEMICO",
      color: "#3788d8",
      // Estado por defecto según el rol (ACTIVO para administradores)
      estado: canApproveEvents ? "ACTIVO" : "PENDIENTE",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

        // Validaciones manuales críticas
        if (!values.titulo || values.titulo.trim() === "") {
          setError("El título es obligatorio");
          setLoading(false);
          return;
        }

        if (!values.descripcion || values.descripcion.trim() === "") {
          setError("La descripción es obligatoria");
          setLoading(false);
          return;
        }

        // Preparar fechas con manejo correcto de zonas horarias
        let fechaInicio, fechaFin;

        try {
          // Para eventos de todo el día o con hora específica
          if (values.todoElDia) {
            // Para eventos de todo el día, establecer fechas al inicio y fin del día en la zona horaria local
            fechaInicio = new Date(values.fechaInicio);
            // Aseguramos que la fecha sea el inicio del día en la zona horaria local
            fechaInicio.setHours(0, 0, 0, 0);

            fechaFin = new Date(values.fechaFin);
            // Aseguramos que la fecha sea el fin del día en la zona horaria local
            fechaFin.setHours(23, 59, 59, 999);
          } else {
            // Para eventos con hora específica
            // Inicializamos la fecha base (parte fecha)
            fechaInicio = new Date(values.fechaInicio);

            // Obtenemos los componentes de hora
            const horaInicio = new Date(values.horaInicio);
            const horas = horaInicio.getHours();
            const minutos = horaInicio.getMinutes();

            // Aplicamos la hora manteniendo la fecha base
            fechaInicio.setHours(horas, minutos, 0, 0);

            // Hacemos lo mismo para la fecha de fin
            fechaFin = new Date(values.fechaFin);
            const horaFin = new Date(values.horaFin);
            fechaFin.setHours(horaFin.getHours(), horaFin.getMinutes(), 0, 0);
          }

          // Verificar que las fechas son válidas
          if (isNaN(fechaInicio.getTime())) {
            throw new Error("Fecha de inicio inválida");
          }

          if (isNaN(fechaFin.getTime())) {
            throw new Error("Fecha de fin inválida");
          }

          // Verificar que fechaFin es posterior a fechaInicio
          if (fechaFin <= fechaInicio) {
            setError("La fecha de fin debe ser posterior a la fecha de inicio");
            setLoading(false);
            return;
          }

          // CONSOLA DE DEPURACIÓN - QUITAR EN PRODUCCIÓN
          console.log("=== Información de fechas ===");
          console.log("Fecha inicio (local):", fechaInicio.toString());
          console.log("Fecha fin (local):", fechaFin.toString());
          console.log("Fecha inicio (ISO/UTC):", fechaInicio.toISOString());
          console.log("Fecha fin (ISO/UTC):", fechaFin.toISOString());
          console.log("Día de la fecha inicio:", fechaInicio.getDate());
          console.log("Mes de la fecha inicio:", fechaInicio.getMonth() + 1);
          console.log("============================");

          // Preparar datos del evento - mantener el formato ISO String
          const eventoData = {
            titulo: String(values.titulo || "").trim(),
            descripcion: String(values.descripcion || "").trim(),
            fechaInicio: fechaInicio.toISOString(),
            fechaFin: fechaFin.toISOString(),
            todoElDia: Boolean(values.todoElDia),
            lugar: String(values.lugar || "").trim(),
            tipo: values.tipo || "ACADEMICO",
            estado: canApproveEvents
              ? formik.values.estado || "PENDIENTE"
              : "PENDIENTE",
            color: values.color || "#3788d8",
          };

          console.log(
            "Datos del evento a enviar:",
            JSON.stringify(eventoData, null, 2)
          );

          if (isEditMode) {
            // Modo edición
            // COMENTADO: Pasar archivo
            await calendarioService.actualizarEvento(
              id!,
              eventoData,
              /* archivo || */ undefined
            );
            setSuccess("Evento actualizado correctamente");
          } else {
            // Modo creación
            // COMENTADO: Pasar archivo
            await calendarioService.crearEvento(
              eventoData,
              /* archivo || */ undefined
            );

            // Dar feedback específico según el estado
            if (eventoData.estado === "ACTIVO") {
              setSuccess(
                "Evento creado correctamente y ya es visible para todos los usuarios."
              );
            } else {
              setSuccess(
                "Evento creado correctamente. Permanecerá en estado pendiente hasta su aprobación."
              );
            }
          }

          // Esperar un momento para mostrar el mensaje de éxito antes de navegar
          setTimeout(() => {
            navigate("/calendario");
          }, 2000);
        } catch (err) {
          console.error("Error al construir fechas:", err);
          setError("Error al procesar las fechas del evento.");
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error("Error al guardar evento:", err);

        // Mostrar mensaje de error detallado si está disponible
        if (err.message) {
          setError(err.message);
        } else {
          setError(
            "Error al guardar el evento. Verifica que todos los campos sean válidos."
          );
        }
      } finally {
        setLoading(false);
      }
    },
  });

  // Intentar obtener fecha preseleccionada del sessionStorage
  useEffect(() => {
    if (!isEditMode) {
      const savedDate = sessionStorage.getItem("nuevaFechaEvento");
      if (savedDate) {
        try {
          const fecha = new Date(savedDate);
          if (!isNaN(fecha.getTime())) {
            // Crear una fecha con hora fija a mediodía para evitar problemas de zona horaria
            const fechaCorregida = new Date(
              fecha.getFullYear(),
              fecha.getMonth(),
              fecha.getDate(),
              12,
              0,
              0
            );
            formik.setFieldValue("fechaInicio", fechaCorregida);
            formik.setFieldValue("fechaFin", fechaCorregida);

            console.log(
              "Fecha cargada desde sessionStorage:",
              fechaCorregida.toLocaleDateString()
            );
          }
        } catch (err) {
          console.error("Error al parsear la fecha guardada:", err);
        }
        // Limpiar después de usar
        sessionStorage.removeItem("nuevaFechaEvento");
      }
    }
  }, []);

  // Cargar datos del evento si estamos en modo edición
  useEffect(() => {
    const cargarEvento = async () => {
      if (!isEditMode) {
        setInitialLoading(false);
        return;
      }

      try {
        setInitialLoading(true);
        setError(null);

        const evento = await calendarioService.obtenerEventoPorId(id!);

        if (evento) {
          // Extraer fechas y horas asegurando que sean válidas
          const fechaInicio = new Date(evento.fechaInicio);
          const fechaFin = new Date(evento.fechaFin);

          // Verificar que las fechas son válidas
          if (isNaN(fechaInicio.getTime())) {
            console.error("Fecha de inicio inválida:", evento.fechaInicio);
            setError("La fecha de inicio del evento no es válida");
            return;
          }

          if (isNaN(fechaFin.getTime())) {
            console.error("Fecha de fin inválida:", evento.fechaFin);
            setError("La fecha de fin del evento no es válida");
            return;
          }

          // Log de depuración para ver las fechas tal como vienen del backend
          debugDate("Fecha inicio (del backend)", fechaInicio);
          debugDate("Fecha fin (del backend)", fechaFin);

          // Establecer valores del formulario
          formik.setValues({
            titulo: evento.titulo || "",
            descripcion: evento.descripcion || "",
            fechaInicio: fechaInicio,
            horaInicio: fechaInicio,
            fechaFin: fechaFin,
            horaFin: fechaFin,
            todoElDia: Boolean(evento.todoElDia),
            lugar: evento.lugar || "",
            tipo: evento.tipo || "ACADEMICO",
            color: evento.color || "#3788d8",
            estado: evento.estado || "PENDIENTE",
          });

          // COMENTADO: Verificar si hay archivo adjunto
          /*
          if (evento.archivoAdjunto && evento.archivoAdjunto.nombre) {
            setArchivoActual(evento.archivoAdjunto.nombre);
          }
          */
        }
      } catch (err: any) {
        console.error("Error al cargar evento:", err);
        setError(
          err.message || "Error al cargar el evento. Intente nuevamente."
        );
      } finally {
        setInitialLoading(false);
      }
    };

    cargarEvento();
  }, [id, isEditMode]);

  // COMENTADO: Manejo de archivo adjunto
  /*
  const handleArchivoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setArchivo(event.target.files[0]);
    }
  };
  */

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Función para formatear fechas como string para input
  const formatDateToString = (date: Date) => {
    // Verificar que la fecha es válida
    if (!date || isNaN(date.getTime())) {
      console.warn("Fecha inválida proporcionada:", date);
      return "";
    }

    try {
      // Crear una nueva fecha con solo día, mes y año para evitar problemas de zona horaria
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (err) {
      console.error("Error al formatear fecha:", err);
      return "";
    }
  };

  // Función para formatear horas como string
  const formatTimeToString = (date: Date) => {
    // Verificar que la fecha es válida
    if (!date || isNaN(date.getTime())) {
      console.warn("Hora inválida proporcionada:", date);
      return "00:00";
    }

    try {
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (err) {
      console.error("Error al formatear hora:", err);
      return "00:00";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => navigate("/calendario")} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" color="primary.main">
          {isEditMode ? "Editar Evento" : "Nuevo Evento"}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
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
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="titulo"
                name="titulo"
                label="Título del evento"
                value={formik.values.titulo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.titulo && Boolean(formik.errors.titulo)}
                helperText={formik.touched.titulo && formik.errors.titulo}
                disabled={loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="descripcion"
                name="descripcion"
                label="Descripción"
                multiline
                rows={4}
                value={formik.values.descripcion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.descripcion &&
                  Boolean(formik.errors.descripcion)
                }
                helperText={
                  formik.touched.descripcion && formik.errors.descripcion
                }
                disabled={loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Duración del evento</FormLabel>
                <RadioGroup
                  row
                  name="todoElDia"
                  value={formik.values.todoElDia.toString()}
                  onChange={(e) => {
                    formik.setFieldValue(
                      "todoElDia",
                      e.target.value === "true"
                    );
                  }}
                >
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="Hora específica"
                  />
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Todo el día"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {formik.values.todoElDia ? (
              // CAMPOS PARA EVENTO DE TODO EL DÍA
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="fechaInicio"
                    name="fechaInicio"
                    label="Fecha de inicio"
                    type="date"
                    value={formatDateToString(formik.values.fechaInicio)}
                    onChange={(e) => {
                      // Crear una fecha con hora fija a las 12:00 para evitar problemas de zona horaria
                      const [year, month, day] = e.target.value
                        .split("-")
                        .map(Number);
                      const fechaAjustada = new Date(
                        year,
                        month - 1,
                        day,
                        12,
                        0,
                        0
                      );
                      formik.setFieldValue("fechaInicio", fechaAjustada);
                    }}
                    InputLabelProps={{ shrink: true }}
                    error={
                      formik.touched.fechaInicio &&
                      Boolean(formik.errors.fechaInicio)
                    }
                    helperText={
                      formik.touched.fechaInicio &&
                      String(formik.errors.fechaInicio)
                    }
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="fechaFin"
                    name="fechaFin"
                    label="Fecha de fin"
                    type="date"
                    value={formatDateToString(formik.values.fechaFin)}
                    onChange={(e) => {
                      // Crear una fecha con hora fija a las 12:00 para evitar problemas de zona horaria
                      const [year, month, day] = e.target.value
                        .split("-")
                        .map(Number);
                      const fechaAjustada = new Date(
                        year,
                        month - 1,
                        day,
                        12,
                        0,
                        0
                      );
                      formik.setFieldValue("fechaFin", fechaAjustada);
                    }}
                    InputLabelProps={{ shrink: true }}
                    error={
                      formik.touched.fechaFin && Boolean(formik.errors.fechaFin)
                    }
                    helperText={
                      formik.touched.fechaFin && String(formik.errors.fechaFin)
                    }
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    required
                  />
                </Grid>
              </>
            ) : (
              // CAMPOS PARA EVENTO CON HORA ESPECÍFICA
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    id="fechaInicio"
                    name="fechaInicio"
                    label="Fecha de inicio"
                    type="date"
                    value={formatDateToString(formik.values.fechaInicio)}
                    onChange={(e) => {
                      // Crear una fecha con hora fija a las 12:00 para evitar problemas de zona horaria
                      const [year, month, day] = e.target.value
                        .split("-")
                        .map(Number);
                      const fechaAjustada = new Date(
                        year,
                        month - 1,
                        day,
                        12,
                        0,
                        0
                      );
                      formik.setFieldValue("fechaInicio", fechaAjustada);
                    }}
                    InputLabelProps={{ shrink: true }}
                    error={
                      formik.touched.fechaInicio &&
                      Boolean(formik.errors.fechaInicio)
                    }
                    helperText={
                      formik.touched.fechaInicio &&
                      String(formik.errors.fechaInicio)
                    }
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    id="horaInicio"
                    name="horaInicio"
                    label="Hora de inicio"
                    type="time"
                    value={formatTimeToString(formik.values.horaInicio)}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      const newDate = new Date(formik.values.horaInicio);
                      newDate.setHours(
                        parseInt(hours, 10),
                        parseInt(minutes, 10)
                      );
                      formik.setFieldValue("horaInicio", newDate);
                    }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon />
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    id="fechaFin"
                    name="fechaFin"
                    label="Fecha de fin"
                    type="date"
                    value={formatDateToString(formik.values.fechaFin)}
                    onChange={(e) => {
                      // Crear una fecha con hora fija a las 12:00 para evitar problemas de zona horaria
                      const [year, month, day] = e.target.value
                        .split("-")
                        .map(Number);
                      const fechaAjustada = new Date(
                        year,
                        month - 1,
                        day,
                        12,
                        0,
                        0
                      );
                      formik.setFieldValue("fechaFin", fechaAjustada);
                    }}
                    InputLabelProps={{ shrink: true }}
                    error={
                      formik.touched.fechaFin && Boolean(formik.errors.fechaFin)
                    }
                    helperText={
                      formik.touched.fechaFin && String(formik.errors.fechaFin)
                    }
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    id="horaFin"
                    name="horaFin"
                    label="Hora de fin"
                    type="time"
                    value={formatTimeToString(formik.values.horaFin)}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(":");
                      const newDate = new Date(formik.values.horaFin);
                      newDate.setHours(
                        parseInt(hours, 10),
                        parseInt(minutes, 10)
                      );
                      formik.setFieldValue("horaFin", newDate);
                    }}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeIcon />
                        </InputAdornment>
                      ),
                    }}
                    disabled={loading}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    required
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="lugar"
                name="lugar"
                label="Lugar"
                value={formik.values.lugar}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.lugar && Boolean(formik.errors.lugar)}
                helperText={formik.touched.lugar && formik.errors.lugar}
                disabled={loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                required
              >
                <InputLabel id="tipo-label">Tipo de evento</InputLabel>
                <Select
                  labelId="tipo-label"
                  id="tipo"
                  name="tipo"
                  value={formik.values.tipo}
                  label="Tipo de evento"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={loading}
                >
                  <MenuItem value="ACADEMICO">Académico</MenuItem>
                  <MenuItem value="INSTITUCIONAL">Institucional</MenuItem>
                  <MenuItem value="CULTURAL">Cultural</MenuItem>
                  <MenuItem value="DEPORTIVO">Deportivo</MenuItem>
                  <MenuItem value="OTRO">Otro</MenuItem>
                </Select>
                {formik.touched.tipo && formik.errors.tipo && (
                  <FormHelperText>{formik.errors.tipo}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Mejorado el selector de estado para usuarios con permisos */}
            {canApproveEvents && (
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  <InputLabel id="estado-label">Estado del evento</InputLabel>
                  <Select
                    labelId="estado-label"
                    id="estado"
                    name="estado"
                    value={formik.values.estado || "PENDIENTE"}
                    label="Estado del evento"
                    onChange={(e) =>
                      formik.setFieldValue("estado", e.target.value)
                    }
                    disabled={loading}
                  >
                    <MenuItem value="ACTIVO">
                      Activo (visible para todos)
                    </MenuItem>
                    <MenuItem value="PENDIENTE">
                      Pendiente (requiere aprobación)
                    </MenuItem>
                    {isAdmin && (
                      <MenuItem value="CANCELADO">Cancelado</MenuItem>
                    )}
                    {/* Estado FINALIZADO no se muestra como opción */}
                  </Select>
                  <FormHelperText>
                    {formik.values.estado === "ACTIVO"
                      ? "El evento será visible inmediatamente para todos los usuarios."
                      : "El evento quedará pendiente de aprobación y solo será visible para administrativos."}
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}

            {/* COMENTADO: Sección de archivo adjunto */}
            {/*
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h3" gutterBottom>
                Archivo adjunto
              </Typography>

              {archivoActual && !archivo && (
                <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                  <AttachmentIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Archivo actual: {archivoActual}
                  </Typography>
                </Box>
              )}

              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachmentIcon />}
                disabled={loading}
                sx={{ mb: 2, borderRadius: 20 }}
              >
                {archivo
                  ? "Cambiar archivo"
                  : archivoActual
                  ? "Reemplazar archivo"
                  : "Seleccionar archivo"}
                <input type="file" hidden onChange={handleArchivoChange} />
              </Button>

              {archivo && (
                <Box
                  sx={{ ml: 2, display: "inline-flex", alignItems: "center" }}
                >
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    {archivo.name}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setArchivo(null)}
                    disabled={loading}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Grid>
            */}

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => navigate("/calendario")}
                  disabled={loading}
                  sx={{ borderRadius: 20 }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  disabled={loading}
                  sx={{ borderRadius: 20 }}
                >
                  {loading ? "Guardando..." : "Guardar"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FormularioEvento;
