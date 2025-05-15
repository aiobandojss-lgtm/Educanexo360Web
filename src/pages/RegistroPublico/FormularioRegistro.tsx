// src/Pages/RegistroPublico/FormularioRegistro.tsx
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
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import dayjs, { Dayjs } from "dayjs";
import registroService from "../../services/registroService";
import type { EstudianteSolicitud } from "../../services/registroService";
import invitacionService from "../../services/invitacionService";
import cursoService from "../../services/cursoService";

// Interfaz para el estudiante en el formulario
interface EstudianteForm {
  nombre: string;
  apellidos: string;
  fechaNacimiento: Dayjs | null;
  cursoId: string;
  email?: string;
}

// Componente estilizado para el contenedor de cada estudiante
const EstudianteContainer = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: "relative",
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
    },
  ]);

  // Estado para cursos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [nombreCurso, setNombreCurso] = useState<string>("");

  // Cargar información del curso si viene en la invitación
  useEffect(() => {
    const cargarInfoCurso = async () => {
      if (invitacion?.cursoId) {
        try {
          console.log("Datos de invitación recibidos:", invitacion);

          // Verificar que cursoId sea un string y no un objeto
          const cursoId =
            typeof invitacion.cursoId === "string"
              ? invitacion.cursoId
              : invitacion.cursoId?._id || "";

          // Verificar que el código de invitación esté completo
          const codigoInvitacion = invitacion.codigo || "";

          console.log("Solicitando info del curso con:", {
            cursoId,
            codigoInvitacion,
          });

          // Solo hacer la solicitud si tenemos datos válidos
          if (cursoId && codigoInvitacion) {
            // Usar el endpoint público que creamos
            const response = await cursoService.obtenerInfoCursoPublico(
              cursoId,
              codigoInvitacion
            );

            if (response) {
              // Construir el nombre completo del curso
              const nombreCompleto = `${response.nombre || ""} - ${
                response.grado || ""
              }° ${response.grupo || response.seccion || ""}`;
              setNombreCurso(nombreCompleto);

              // Asegurarnos que estudiante.cursoId esté establecido correctamente
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

          // Establecer el cursoId aunque haya error
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
      },
    ]);
  };

  // Remover estudiante del formulario
  const eliminarEstudiante = (index: number) => {
    if (estudiantes.length <= 1) {
      // Al menos debe haber un estudiante
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

      // Preparar los datos de estudiantes asegurando que cursoId sea una cadena válida
      const estudiantesData = estudiantes.map((est) => {
        // Asegurarse de que cursoId sea una cadena válida
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
          cursoId: String(cursoId), // Convertir a string para asegurar
          email: est.email,
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

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {estudiantes.map((estudiante, index) => (
              <EstudianteContainer key={index}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    Estudiante {index + 1}
                  </Typography>

                  {estudiantes.length > 1 && (
                    <DeleteButton
                      color="error"
                      onClick={() => eliminarEstudiante(index)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </DeleteButton>
                  )}

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
                          handleEstudianteChange(index, "fechaNacimiento", date)
                        }
                        disabled={loading}
                        sx={{ width: "100%" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {/* Si la invitación ya tiene un curso específico, mostrar un campo de solo lectura */}
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
                      {/* Mantener un campo oculto para el ID del curso */}
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
                          handleEstudianteChange(index, "email", e.target.value)
                        }
                        disabled={loading}
                      />
                    </Grid>
                  </Grid>
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
    </Container>
  );
};

export default FormularioRegistro;
