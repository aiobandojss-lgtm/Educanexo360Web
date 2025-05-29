// src/Pages/RegistroPublico/FormularioRegistro.tsx (ACTUALIZADO)
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  styled,
  Card,
  CardContent,
  FormControlLabel,
  Switch,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import registroService, {
  EstudianteSolicitud,
  EstudianteExistentePublico,
} from "../../services/registroService";
import invitacionService from "../../services/invitacionService";
import cursoService from "../../services/cursoService";
import BuscarEstudianteExistente from "../../pages/RegistroPublico/BuscarEstudianteExistente";

// Interfaz mejorada para el estudiante en el formulario
interface EstudianteForm {
  nombre: string;
  apellidos: string;
  fechaNacimiento: Dayjs | null;
  cursoId: string;
  email?: string;
  // NUEVOS CAMPOS
  esExistente: boolean;
  estudianteExistenteId?: string;
  codigo_estudiante?: string;
}

// Componente estilizado para el contenedor de cada estudiante
const EstudianteContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: "relative",
  border: "1px solid",
  borderColor: theme.palette.divider,
}));

const DeleteButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const FormularioRegistro: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invitacion = location.state?.invitacion;

  // Si no hay invitación en el estado, redirigir a la página de validación
  useEffect(() => {
    if (!invitacion) {
      navigate("/registro");
    }
  }, [invitacion, navigate]);

  // Estados para los campos del formulario
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [estudiantes, setEstudiantes] = useState<EstudianteForm[]>([
    {
      nombre: "",
      apellidos: "",
      fechaNacimiento: null,
      cursoId: invitacion?.cursoId || "",
      esExistente: false,
    },
  ]);

  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nombreCurso, setNombreCurso] = useState<string>("");

  // Estados para búsqueda de estudiantes existentes
  const [mostrarBusquedaEstudiante, setMostrarBusquedaEstudiante] =
    useState(false);
  const [estudianteIndexParaBusqueda, setEstudianteIndexParaBusqueda] =
    useState<number>(-1);

  // Cargar información del curso si viene en la invitación
  useEffect(() => {
    const cargarInfoCurso = async () => {
      if (invitacion?.cursoId) {
        try {
          console.log("Datos de invitación recibidos:", invitacion);

          const cursoId =
            typeof invitacion.cursoId === "string"
              ? invitacion.cursoId
              : invitacion.cursoId?._id || "";

          const codigoInvitacion = invitacion.codigo || "";

          console.log("Solicitando info del curso con:", {
            cursoId,
            codigoInvitacion,
          });

          if (cursoId && codigoInvitacion) {
            const response = await cursoService.obtenerInfoCursoPublico(
              cursoId,
              codigoInvitacion
            );

            if (response) {
              const nombreCompleto = `${response.nombre || ""} - ${
                response.grado || ""
              }° ${response.grupo || response.seccion || ""}`;
              setNombreCurso(nombreCompleto);

              setEstudiantes((prev) =>
                prev.map((est) => ({
                  ...est,
                  cursoId: cursoId,
                }))
              );
            } else {
              setNombreCurso("Curso especificado en la invitación");
            }
          } else {
            console.error("Datos de curso inválidos:", {
              cursoId,
              codigoInvitacion,
            });
            setNombreCurso("Datos de curso incompletos");
          }
        } catch (err) {
          console.error("Error al cargar información del curso:", err);
          setNombreCurso("Curso especificado en la invitación");

          if (invitacion.cursoId) {
            const cursoIdString =
              typeof invitacion.cursoId === "string"
                ? invitacion.cursoId
                : invitacion.cursoId?._id || "";

            if (cursoIdString) {
              setEstudiantes((prev) =>
                prev.map((est) => ({
                  ...est,
                  cursoId: cursoIdString,
                }))
              );
            }
          }
        }
      }
    };

    cargarInfoCurso();
  }, [invitacion]);

  // Añadir estudiante al formulario
  const agregarEstudiante = () => {
    setEstudiantes([
      ...estudiantes,
      {
        nombre: "",
        apellidos: "",
        fechaNacimiento: null,
        cursoId: invitacion?.cursoId || "",
        esExistente: false,
      },
    ]);
  };

  // Remover estudiante del formulario
  const eliminarEstudiante = (index: number) => {
    if (estudiantes.length <= 1) {
      return;
    }
    const nuevosEstudiantes = [...estudiantes];
    nuevosEstudiantes.splice(index, 1);
    setEstudiantes(nuevosEstudiantes);
  };

  // Manejar cambios en los campos de estudiante
  const handleEstudianteChange = (
    index: number,
    field: keyof EstudianteForm,
    value: any
  ) => {
    const nuevosEstudiantes = [...estudiantes];
    nuevosEstudiantes[index] = {
      ...nuevosEstudiantes[index],
      [field]: value,
    };
    setEstudiantes(nuevosEstudiantes);
  };

  // Abrir búsqueda de estudiante existente
  const abrirBusquedaEstudiante = (index: number) => {
    setEstudianteIndexParaBusqueda(index);
    setMostrarBusquedaEstudiante(true);
  };

  // Manejar selección de estudiante existente
  const handleSeleccionarEstudianteExistente = (
    estudiante: EstudianteExistentePublico
  ) => {
    if (estudianteIndexParaBusqueda >= 0) {
      const nuevosEstudiantes = [...estudiantes];
      nuevosEstudiantes[estudianteIndexParaBusqueda] = {
        ...nuevosEstudiantes[estudianteIndexParaBusqueda],
        nombre: estudiante.nombre,
        apellidos: estudiante.apellidos,
        cursoId: estudiante.curso?._id || invitacion?.cursoId || "",
        codigo_estudiante: estudiante.codigo_estudiante,
        esExistente: true,
        estudianteExistenteId: estudiante._id,
        // Limpiar campos que no aplican para estudiantes existentes
        email: "",
        fechaNacimiento: null,
      };
      setEstudiantes(nuevosEstudiantes);
    }
  };

  // Cambiar modo de estudiante (existente/nuevo)
  const cambiarModoEstudiante = (index: number, esExistente: boolean) => {
    const nuevosEstudiantes = [...estudiantes];

    if (esExistente) {
      // Cambiar a modo "existente" - limpiar campos
      nuevosEstudiantes[index] = {
        ...nuevosEstudiantes[index],
        esExistente: true,
        nombre: "",
        apellidos: "",
        email: "",
        fechaNacimiento: null,
        codigo_estudiante: "",
        estudianteExistenteId: "",
      };
    } else {
      // Cambiar a modo "nuevo" - limpiar campos de existente
      nuevosEstudiantes[index] = {
        ...nuevosEstudiantes[index],
        esExistente: false,
        estudianteExistenteId: "",
        codigo_estudiante: "",
      };
    }

    setEstudiantes(nuevosEstudiantes);
  };

  // Obtener estudiantes ya seleccionados (para evitar duplicados en búsqueda)
  const obtenerEstudiantesYaSeleccionados = (): string[] => {
    return estudiantes
      .filter((est) => est.esExistente && est.estudianteExistenteId)
      .map((est) => est.estudianteExistenteId!)
      .filter(Boolean);
  };

  // Enviar el formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!nombre.trim() || !apellidos.trim() || !email.trim()) {
      setError(
        "Por favor, complete todos los campos obligatorios del acudiente."
      );
      return;
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingrese un correo electrónico válido.");
      return;
    }

    // Validar datos de cada estudiante
    for (let i = 0; i < estudiantes.length; i++) {
      const est = estudiantes[i];

      if (est.esExistente) {
        // Validaciones para estudiante existente
        if (
          !est.estudianteExistenteId ||
          !est.nombre.trim() ||
          !est.apellidos.trim()
        ) {
          setError(
            `Por favor, seleccione un estudiante existente válido para el estudiante ${
              i + 1
            }.`
          );
          return;
        }
      } else {
        // Validaciones para estudiante nuevo
        if (!est.nombre.trim() || !est.apellidos.trim() || !est.cursoId) {
          setError(
            `Por favor, complete todos los campos obligatorios del estudiante ${
              i + 1
            }.`
          );
          return;
        }

        // Si se proporcionó email, validarlo
        if (est.email && !emailRegex.test(est.email)) {
          setError(
            `Por favor, ingrese un correo electrónico válido para el estudiante ${
              i + 1
            }.`
          );
          return;
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Extraer el ID de invitación correctamente
      const invitacionId =
        typeof invitacion.invitacionId === "string"
          ? invitacion.invitacionId
          : invitacion.invitacionId?._id || invitacion._id || "";

      if (!invitacionId) {
        setError(
          "No se pudo determinar el ID de la invitación. Por favor, intente nuevamente."
        );
        setLoading(false);
        return;
      }

      console.log("Preparando solicitud con invitacionId:", invitacionId);

      // Preparar los datos de estudiantes
      const estudiantesData: EstudianteSolicitud[] = estudiantes.map((est) => {
        let cursoId = est.cursoId;
        if (
          typeof cursoId === "object" &&
          cursoId !== null &&
          ("_id" in cursoId || "id" in cursoId)
        ) {
          cursoId =
            (cursoId as { _id?: string; id?: string })._id ||
            (cursoId as { _id?: string; id?: string }).id ||
            "";
        }

        return {
          nombre: est.nombre,
          apellidos: est.apellidos,
          fechaNacimiento: est.fechaNacimiento
            ? est.fechaNacimiento.format("YYYY-MM-DD")
            : undefined,
          cursoId: String(cursoId),
          email: est.email,
          codigo_estudiante: est.codigo_estudiante,
          // NUEVOS CAMPOS
          esExistente: est.esExistente,
          estudianteExistenteId: est.estudianteExistenteId,
        };
      });

      console.log("Datos de estudiantes preparados:", estudiantesData);

      // Crear objeto de solicitud
      const solicitudData = {
        invitacionId,
        nombre,
        apellidos,
        email,
        telefono: telefono || undefined,
        estudiantes: estudiantesData,
      };

      console.log("Enviando solicitud:", solicitudData);

      // Enviar la solicitud
      await registroService.crearSolicitud(solicitudData);
      setSuccess(true);

      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate("/registro/confirmacion");
      }, 3000);
    } catch (err: any) {
      console.error("Error completo:", err);

      if (err.response) {
        console.error("Detalles de respuesta:", {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers,
        });
      }

      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Error al procesar la solicitud. Inténtelo nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!invitacion) {
    return <CircularProgress />;
  }

  if (success) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 8, mb: 4, textAlign: "center" }}>
          <Alert severity="success" sx={{ mb: 3 }}>
            Solicitud enviada correctamente. Redirigiendo...
          </Alert>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Registro de Acudiente y Estudiantes
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sección de Acudiente */}
          <Typography variant="h6" gutterBottom>
            Datos del Acudiente
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre"
                required
                fullWidth
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Apellidos"
                required
                fullWidth
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Correo Electrónico"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono"
                fullWidth
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={loading}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Sección de Estudiantes */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Datos de los Estudiantes</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={agregarEstudiante}
              disabled={loading}
              variant="outlined"
            >
              Añadir otro estudiante
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>¿El estudiante ya está registrado en el sistema?</strong>
              <br />• Si es <strong>estudiante existente</strong>: Búsquelo y
              selecciónelo para asociarlo como acudiente adicional.
              <br />• Si es <strong>estudiante nuevo</strong>: Complete todos
              sus datos para crear una nueva cuenta.
            </Typography>
          </Alert>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {estudiantes.map((estudiante, index) => (
              <EstudianteContainer
                key={index}
                sx={{
                  borderColor: estudiante.esExistente
                    ? "primary.main"
                    : "divider",
                  bgcolor: estudiante.esExistente
                    ? "primary.50"
                    : "background.paper",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Estudiante {index + 1}
                      {estudiante.esExistente && (
                        <Chip
                          label="Existente"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Typography>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={estudiante.esExistente}
                          onChange={(e) =>
                            cambiarModoEstudiante(index, e.target.checked)
                          }
                          disabled={loading}
                        />
                      }
                      label="¿Es estudiante existente?"
                    />
                  </Box>

                  {estudiantes.length > 1 && (
                    <DeleteButton
                      color="error"
                      onClick={() => eliminarEstudiante(index)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </DeleteButton>
                  )}

                  {estudiante.esExistente ? (
                    // MODO ESTUDIANTE EXISTENTE
                    <Box>
                      {estudiante.estudianteExistenteId ? (
                        // Estudiante ya seleccionado
                        <Box>
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2">
                              <strong>Estudiante seleccionado:</strong>{" "}
                              {estudiante.nombre} {estudiante.apellidos}
                              {estudiante.codigo_estudiante && (
                                <span>
                                  {" "}
                                  (Código: {estudiante.codigo_estudiante})
                                </span>
                              )}
                            </Typography>
                          </Alert>
                          <Button
                            variant="outlined"
                            startIcon={<SearchIcon />}
                            onClick={() => abrirBusquedaEstudiante(index)}
                            disabled={loading}
                          >
                            Cambiar Estudiante
                          </Button>
                        </Box>
                      ) : (
                        // No hay estudiante seleccionado
                        <Box sx={{ textAlign: "center", py: 3 }}>
                          <PersonIcon
                            sx={{
                              fontSize: 48,
                              color: "text.secondary",
                              mb: 1,
                            }}
                          />
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            paragraph
                          >
                            Haga clic en el botón para buscar y seleccionar un
                            estudiante existente
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<SearchIcon />}
                            onClick={() => abrirBusquedaEstudiante(index)}
                            disabled={loading}
                            size="large"
                          >
                            Buscar Estudiante Existente
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    // MODO ESTUDIANTE NUEVO
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Nombre"
                          required
                          fullWidth
                          value={estudiante.nombre}
                          onChange={(e) =>
                            handleEstudianteChange(
                              index,
                              "nombre",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Apellidos"
                          required
                          fullWidth
                          value={estudiante.apellidos}
                          onChange={(e) =>
                            handleEstudianteChange(
                              index,
                              "apellidos",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <DatePicker
                          label="Fecha de Nacimiento"
                          value={estudiante.fechaNacimiento}
                          onChange={(date) =>
                            handleEstudianteChange(
                              index,
                              "fechaNacimiento",
                              date
                            )
                          }
                          disabled={loading}
                          sx={{ width: "100%" }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {invitacion?.cursoId ? (
                          <TextField
                            label="Curso"
                            fullWidth
                            value={nombreCurso}
                            disabled={true}
                            helperText="Curso especificado en la invitación"
                          />
                        ) : (
                          <TextField
                            label="Curso"
                            fullWidth
                            value="Error: no se pudo determinar el curso"
                            disabled={true}
                            error={true}
                            helperText="No se pudo cargar la información del curso. Por favor, contacte al administrador."
                          />
                        )}
                        <input type="hidden" value={estudiante.cursoId} />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Correo Electrónico (opcional)"
                          type="email"
                          fullWidth
                          helperText="Si no se proporciona, se generará automáticamente"
                          value={estudiante.email || ""}
                          onChange={(e) =>
                            handleEstudianteChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          disabled={loading}
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </EstudianteContainer>
            ))}
          </LocalizationProvider>

          <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/registro")}
              disabled={loading}
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {loading ? <CircularProgress size={24} /> : "Enviar Solicitud"}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* Diálogo de búsqueda de estudiantes existentes */}
      <BuscarEstudianteExistente
        open={mostrarBusquedaEstudiante}
        onClose={() => setMostrarBusquedaEstudiante(false)}
        onSeleccionar={handleSeleccionarEstudianteExistente}
        codigoInvitacion={invitacion.codigo}
        estudiantesYaSeleccionados={obtenerEstudiantesYaSeleccionados()}
      />
    </Container>
  );
};

export default FormularioRegistro;
