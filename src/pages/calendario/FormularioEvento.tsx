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
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

import calendarioService from "../../services/calendarioService";
import { RootState } from "../../redux/store";
import {
  debugDate,
  createLocalDate,
  formatDateForInput,
  formatTimeForInput,
  createEventDate,
} from "../../utils/dateUtils";

const FormularioEvento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(isEditMode);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAdmin =
    user?.tipo === "ADMIN" ||
    user?.tipo === "RECTOR" ||
    user?.tipo === "COORDINADOR";
  const isTeacher = user?.tipo === "DOCENTE";
  const isAdministrative = user?.tipo === "ADMINISTRATIVO";
  const canApproveEvents = isAdmin || isTeacher || isAdministrative;

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
    lugar: Yup.string().when("todoElDia", {
      is: false,
      then: (schema) =>
        schema
          .required("El lugar es obligatorio para eventos con hora específica")
          .trim(),
      otherwise: (schema) => schema.trim(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      titulo: "",
      descripcion: "",
      fechaInicio: new Date(),
      horaInicio: new Date(),
      fechaFin: new Date(),
      horaFin: new Date(new Date().getTime() + 60 * 60 * 1000),
      todoElDia: false,
      lugar: "",
      tipo: "ACADEMICO",
      color: "#3788d8",
      estado: canApproveEvents ? "ACTIVO" : "PENDIENTE",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);

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

        let fechaInicio: Date, fechaFin: Date;

        try {
          if (values.todoElDia) {
            const fechaInicioInput = new Date(values.fechaInicio);
            const fechaFinInput = new Date(values.fechaFin);

            fechaInicio = createLocalDate(
              fechaInicioInput.getFullYear(),
              fechaInicioInput.getMonth(),
              fechaInicioInput.getDate(),
              0,
              0
            );

            fechaFin = createLocalDate(
              fechaFinInput.getFullYear(),
              fechaFinInput.getMonth(),
              fechaFinInput.getDate(),
              23,
              59
            );
          } else {
            const fechaStr = formatDateForInput(new Date(values.fechaInicio));
            const horaInicioStr = formatTimeForInput(
              new Date(values.horaInicio)
            );
            const fechaFinStr = formatDateForInput(new Date(values.fechaFin));
            const horaFinStr = formatTimeForInput(new Date(values.horaFin));

            fechaInicio = createEventDate(fechaStr, horaInicioStr, false);
            fechaFin = createEventDate(fechaFinStr, horaFinStr, false);
          }

          if (isNaN(fechaInicio.getTime())) {
            throw new Error("Fecha de inicio inválida");
          }

          if (isNaN(fechaFin.getTime())) {
            throw new Error("Fecha de fin inválida");
          }

          if (fechaFin <= fechaInicio) {
            setError("La fecha de fin debe ser posterior a la fecha de inicio");
            setLoading(false);
            return;
          }

          console.log("=== INFORMACIÓN DE FECHAS COLOMBIA ===");
          console.log(
            "Zona horaria del navegador:",
            Intl.DateTimeFormat().resolvedOptions().timeZone
          );
          console.log(
            "Offset zona horaria (minutos):",
            fechaInicio.getTimezoneOffset()
          );
          console.log("Fecha inicio (local Colombia):", fechaInicio.toString());
          console.log("Fecha fin (local Colombia):", fechaFin.toString());
          console.log("Fecha inicio (ISO/UTC):", fechaInicio.toISOString());
          console.log("Fecha fin (ISO/UTC):", fechaFin.toISOString());
          console.log("Día de la fecha inicio:", fechaInicio.getDate());
          console.log("Mes de la fecha inicio:", fechaInicio.getMonth() + 1);
          console.log("Año de la fecha inicio:", fechaInicio.getFullYear());
          console.log("====================================");

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
            await calendarioService.actualizarEvento(id!, eventoData);
            setSuccess("Evento actualizado correctamente");
          } else {
            await calendarioService.crearEvento(eventoData);

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

  const handleFechaChange = (
    campo: "fechaInicio" | "fechaFin",
    valor: string
  ) => {
    const [year, month, day] = valor.split("-").map(Number);
    const nuevaFecha = createLocalDate(year, month - 1, day, 12, 0);

    console.log(`Cambio ${campo}:`, {
      input: valor,
      fecha: nuevaFecha.toString(),
      dia: nuevaFecha.getDate(),
      mes: nuevaFecha.getMonth() + 1,
      año: nuevaFecha.getFullYear(),
    });

    formik.setFieldValue(campo, nuevaFecha);
  };

  const handleHoraChange = (campo: "horaInicio" | "horaFin", valor: string) => {
    const [hours, minutes] = valor.split(":").map(Number);
    const nuevaHora = new Date(formik.values[campo]);
    nuevaHora.setHours(hours, minutes, 0, 0);

    console.log(`Cambio ${campo}:`, {
      input: valor,
      hora: nuevaHora.toString(),
      horas: nuevaHora.getHours(),
      minutos: nuevaHora.getMinutes(),
    });

    formik.setFieldValue(campo, nuevaHora);
  };

  useEffect(() => {
    if (!isEditMode) {
      const savedDate = sessionStorage.getItem("nuevaFechaEvento");
      if (savedDate) {
        try {
          const fecha = new Date(savedDate);
          if (!isNaN(fecha.getTime())) {
            const fechaCorregida = createLocalDate(
              fecha.getFullYear(),
              fecha.getMonth(),
              fecha.getDate(),
              12,
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
        sessionStorage.removeItem("nuevaFechaEvento");
      }
    }
  }, []);

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
          const fechaInicio = new Date(evento.fechaInicio);
          const fechaFin = new Date(evento.fechaFin);

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

          debugDate("Fecha inicio (del backend)", fechaInicio);
          debugDate("Fecha fin (del backend)", fechaFin);

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

  if (initialLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

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
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="fechaInicio"
                    name="fechaInicio"
                    label="Fecha de inicio"
                    type="date"
                    value={formatDateForInput(formik.values.fechaInicio)}
                    onChange={(e) =>
                      handleFechaChange("fechaInicio", e.target.value)
                    }
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
                    value={formatDateForInput(formik.values.fechaFin)}
                    onChange={(e) =>
                      handleFechaChange("fechaFin", e.target.value)
                    }
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
              <>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    id="fechaInicio"
                    name="fechaInicio"
                    label="Fecha de inicio"
                    type="date"
                    value={formatDateForInput(formik.values.fechaInicio)}
                    onChange={(e) =>
                      handleFechaChange("fechaInicio", e.target.value)
                    }
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
                    value={formatTimeForInput(formik.values.horaInicio)}
                    onChange={(e) =>
                      handleHoraChange("horaInicio", e.target.value)
                    }
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
                    value={formatDateForInput(formik.values.fechaFin)}
                    onChange={(e) =>
                      handleFechaChange("fechaFin", e.target.value)
                    }
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
                    value={formatTimeForInput(formik.values.horaFin)}
                    onChange={(e) =>
                      handleHoraChange("horaFin", e.target.value)
                    }
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
                  </Select>
                  <FormHelperText>
                    {formik.values.estado === "ACTIVO"
                      ? "El evento será visible inmediatamente para todos los usuarios."
                      : "El evento quedará pendiente de aprobación y solo será visible para administrativos."}
                  </FormHelperText>
                </FormControl>
              </Grid>
            )}

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
