import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import invitacionService from "../../../services/invitacionService";
import cursoService, { CursoDto } from "../../../services/cursoService";

const CrearInvitacion: React.FC = () => {
  const navigate = useNavigate();
  // Obtener el usuario del estado global (redux)
  const { user } = useSelector((state: RootState) => state.auth);

  // Estados para los campos del formulario
  const [tipo, setTipo] = useState<
    "CURSO" | "ESTUDIANTE_ESPECIFICO" | "PERSONAL"
  >("CURSO");
  const [cursoId, setCursoId] = useState("");
  const [estudianteId, setEstudianteId] = useState("");
  const [cantidadUsos, setCantidadUsos] = useState(1);
  const [usarFechaExpiracion, setUsarFechaExpiracion] = useState(false);
  const [fechaExpiracion, setFechaExpiracion] = useState<Dayjs | null>(
    dayjs().add(30, "day").hour(23).minute(59)
  );

  // Estados para manejo de UI
  const [cursos, setCursos] = useState<CursoDto[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursosCargando, setCursosCargando] = useState(false);
  const [estudiantesCargando, setEstudiantesCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitacionCreada, setInvitacionCreada] = useState<any>(null);

  // Cargar cursos
  useEffect(() => {
    const cargarCursos = async () => {
      setCursosCargando(true);
      try {
        const cursosData = await cursoService.obtenerCursos();
        setCursos(cursosData);
      } catch (err) {
        console.error("Error al cargar cursos:", err);
        setError("Error al cargar la lista de cursos.");
      } finally {
        setCursosCargando(false);
      }
    };

    cargarCursos();
  }, []);

  // Cargar estudiantes cuando se selecciona un curso (para tipo ESTUDIANTE_ESPECIFICO)
  useEffect(() => {
    if (tipo === "ESTUDIANTE_ESPECIFICO" && cursoId) {
      const cargarEstudiantes = async () => {
        setEstudiantesCargando(true);
        setEstudianteId(""); // Resetear selección de estudiante

        try {
          const estudiantesData = await cursoService.obtenerEstudiantesPorCurso(
            cursoId
          );
          setEstudiantes(estudiantesData);
        } catch (err) {
          console.error("Error al cargar estudiantes:", err);
          setError("Error al cargar la lista de estudiantes.");
        } finally {
          setEstudiantesCargando(false);
        }
      };

      cargarEstudiantes();
    }
  }, [tipo, cursoId]);

  // Manejar cambio de tipo de invitación
  const handleTipoChange = (
    nuevoTipo: "CURSO" | "ESTUDIANTE_ESPECIFICO" | "PERSONAL"
  ) => {
    setTipo(nuevoTipo);

    // Resetear campos relacionados
    if (nuevoTipo !== "CURSO") {
      setCantidadUsos(1);
    }

    if (nuevoTipo !== "ESTUDIANTE_ESPECIFICO") {
      setEstudianteId("");
    }
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (tipo === "CURSO" && !cursoId) {
      setError("Por favor, seleccione un curso.");
      return;
    }

    if (tipo === "ESTUDIANTE_ESPECIFICO" && (!cursoId || !estudianteId)) {
      setError("Por favor, seleccione un curso y un estudiante.");
      return;
    }

    if (cantidadUsos < 1) {
      setError("La cantidad de usos debe ser al menos 1.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Verificar que tenemos escuelaId del usuario
      const escuelaId = user?.escuelaId;
      if (!escuelaId) {
        setError("No se pudo determinar la escuela del usuario actual.");
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const invitacionData: {
        tipo: "CURSO" | "ESTUDIANTE_ESPECIFICO" | "PERSONAL";
        escuelaId: string;
        cantidadUsos: number;
        cursoId?: string;
        estudianteId?: string;
        fechaExpiracion?: string;
      } = {
        tipo,
        escuelaId,
        cantidadUsos,
      };

      if (tipo === "CURSO" || tipo === "ESTUDIANTE_ESPECIFICO") {
        invitacionData.cursoId = cursoId;
      }

      if (tipo === "ESTUDIANTE_ESPECIFICO") {
        invitacionData.estudianteId = estudianteId;
      }

      if (usarFechaExpiracion && fechaExpiracion) {
        invitacionData.fechaExpiracion = fechaExpiracion.toISOString();
      }

      // Log para debugging
      console.log("Datos a enviar:", invitacionData);

      // Enviar la solicitud
      const resultado = await invitacionService.crearInvitacion(invitacionData);
      setInvitacionCreada(resultado);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error al crear invitación:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al crear la invitación. Inténtelo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Crear Nueva Invitación
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box>
            <Alert severity="success" sx={{ mb: 3 }}>
              Invitación creada exitosamente
            </Alert>

            <Box
              sx={{ bgcolor: "background.paper", p: 3, borderRadius: 1, mb: 3 }}
            >
              <Typography variant="h6" gutterBottom>
                Detalles de la Invitación
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Código:</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="body1" fontWeight="bold">
                    {invitacionCreada?.codigo}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle2">Tipo:</Typography>
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="body1">
                    {invitacionCreada?.tipo === "CURSO"
                      ? "Invitación por Curso"
                      : invitacionCreada?.tipo === "ESTUDIANTE_ESPECIFICO"
                      ? "Invitación para Estudiante Específico"
                      : "Invitación Personal"}
                  </Typography>
                </Grid>

                {invitacionCreada?.cantidadUsos > 1 && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2">
                        Número máximo de usos:
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body1">
                        {invitacionCreada?.cantidadUsos}
                      </Typography>
                    </Grid>
                  </>
                )}

                {invitacionCreada?.fechaExpiracion && (
                  <>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="subtitle2">
                        Fecha de expiración:
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <Typography variant="body1">
                        {new Date(
                          invitacionCreada?.fechaExpiracion
                        ).toLocaleString()}
                      </Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/admin/invitaciones")}
              >
                Ver Lista de Invitaciones
              </Button>

              <Button
                variant="outlined"
                onClick={() => {
                  setSuccess(false);
                  setInvitacionCreada(null);
                }}
              >
                Crear Otra Invitación
              </Button>
            </Box>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Tipo de Invitación */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Invitación</InputLabel>
                  <Select
                    value={tipo}
                    label="Tipo de Invitación"
                    onChange={(e) =>
                      handleTipoChange(
                        e.target.value as
                          | "CURSO"
                          | "ESTUDIANTE_ESPECIFICO"
                          | "PERSONAL"
                      )
                    }
                    disabled={loading}
                  >
                    <MenuItem value="CURSO">Invitación por Curso</MenuItem>
                    <MenuItem value="ESTUDIANTE_ESPECIFICO">
                      Invitación para Estudiante Específico
                    </MenuItem>
                    <MenuItem value="PERSONAL">Invitación Personal</MenuItem>
                  </Select>
                  <FormHelperText>
                    {tipo === "CURSO"
                      ? "Permite a múltiples acudientes registrar estudiantes para un curso específico"
                      : tipo === "ESTUDIANTE_ESPECIFICO"
                      ? "Para un acudiente de un estudiante específico"
                      : "Invitación general que no está vinculada a un curso o estudiante específico"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {/* Selección de Curso */}
              {(tipo === "CURSO" || tipo === "ESTUDIANTE_ESPECIFICO") && (
                <Grid
                  item
                  xs={12}
                  md={tipo === "ESTUDIANTE_ESPECIFICO" ? 6 : 12}
                >
                  <FormControl fullWidth>
                    <InputLabel>Curso</InputLabel>
                    <Select
                      value={cursoId}
                      label="Curso"
                      onChange={(e) => setCursoId(e.target.value)}
                      disabled={loading || cursosCargando}
                    >
                      {cursosCargando ? (
                        <MenuItem value="">Cargando cursos...</MenuItem>
                      ) : (
                        cursos.map((curso) => (
                          <MenuItem key={curso._id} value={curso._id}>
                            {curso.nombre} - {curso.grupo}° {curso.seccion}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Selección de Estudiante */}
              {tipo === "ESTUDIANTE_ESPECIFICO" && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estudiante</InputLabel>
                    <Select
                      value={estudianteId}
                      label="Estudiante"
                      onChange={(e) => setEstudianteId(e.target.value)}
                      disabled={loading || estudiantesCargando || !cursoId}
                    >
                      {!cursoId ? (
                        <MenuItem value="">
                          Seleccione un curso primero
                        </MenuItem>
                      ) : estudiantesCargando ? (
                        <MenuItem value="">Cargando estudiantes...</MenuItem>
                      ) : estudiantes.length === 0 ? (
                        <MenuItem value="">
                          No hay estudiantes en este curso
                        </MenuItem>
                      ) : (
                        estudiantes.map((est) => (
                          <MenuItem key={est._id} value={est._id}>
                            {est.nombre} {est.apellidos}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>
              )}

              {/* Cantidad de Usos (solo para invitaciones de tipo CURSO) */}
              {tipo === "CURSO" && (
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Número máximo de usos"
                    type="number"
                    fullWidth
                    value={cantidadUsos}
                    onChange={(e) => setCantidadUsos(parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 1, max: 100 } }}
                    disabled={loading}
                    helperText="Cuántos acudientes pueden usar este código (1-100)"
                  />
                </Grid>
              )}

              {/* Fecha de Expiración */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={usarFechaExpiracion}
                      onChange={(e) => setUsarFechaExpiracion(e.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Establecer fecha de expiración"
                />

                {usarFechaExpiracion && (
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ mt: 2 }}>
                      <DateTimePicker
                        label="Fecha y hora de expiración"
                        value={fechaExpiracion}
                        onChange={(newValue) => setFechaExpiracion(newValue)}
                        disabled={loading}
                        sx={{ width: "100%" }}
                      />
                      <FormHelperText>
                        Después de esta fecha, el código ya no será válido
                      </FormHelperText>
                    </Box>
                  </LocalizationProvider>
                )}
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/admin/invitaciones")}
                disabled={loading}
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} /> : "Crear Invitación"}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default CrearInvitacion;
