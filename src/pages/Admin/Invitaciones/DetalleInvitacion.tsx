// src/Pages/Admin/Invitaciones/DetalleInvitacion.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import invitacionService, {
  Invitacion,
} from "../../../services/invitacionService";
import cursoService from "../../../services/cursoService";

// Función para obtener color de chip según estado
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "ACTIVO":
      return "success";
    case "UTILIZADO":
      return "primary";
    case "REVOCADO":
      return "error";
    case "EXPIRADO":
      return "warning";
    default:
      return "default";
  }
};

// Función para formatear fechas
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

const DetalleInvitacion: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invitacion, setInvitacion] = useState<Invitacion | null>(null);
  const [nombreCurso, setNombreCurso] = useState<string>("");
  const [nombreEstudiante, setNombreEstudiante] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [openRevocDialog, setOpenRevocDialog] = useState(false);

  // Función para obtener descripción completa de la invitación
  const obtenerDescripcionCompleta = (invitacion: Invitacion) => {
    switch (invitacion.tipo) {
      case "CURSO":
        return {
          titulo: "📚 Invitación por Curso",
          descripcion:
            "Permite registrar múltiples acudientes para un curso específico",
          icono: "📚",
        };
      case "ESTUDIANTE_ESPECIFICO":
        return {
          titulo: "🎓 Invitación para Estudiante Específico",
          descripcion:
            "Para registrar el acudiente de un estudiante en particular",
          icono: "🎓",
        };
      case "PERSONAL":
        return {
          titulo: "👤 Invitación Personal",
          descripcion: "Invitación general sin curso específico",
          icono: "👤",
        };
      default:
        return {
          titulo: invitacion.tipo,
          descripcion: "Tipo de invitación",
          icono: "📋",
        };
    }
  };

  useEffect(() => {
    const cargarInvitacion = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await invitacionService.obtenerInvitacionPorId(id);
        setInvitacion(data);

        // Cargar información adicional si es necesario
        if (data.cursoId) {
          try {
            const curso = await cursoService.obtenerCursoPorId(
              data.cursoId as string
            );
            setNombreCurso(
              `${curso.nombre} - ${curso.grado}° ${
                curso.seccion || curso.grupo
              }`
            );
          } catch (err) {
            console.error("Error al cargar datos del curso:", err);
            setNombreCurso("Curso no encontrado");
          }
        }

        if (data.estudianteId) {
          // Aquí podrías llamar a un servicio para obtener el nombre del estudiante
          // Por ahora, usamos un valor genérico
          setNombreEstudiante("Estudiante");
        }
      } catch (err: any) {
        console.error("Error al cargar invitación:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Error al cargar la información de la invitación.");
        }
      } finally {
        setLoading(false);
      }
    };

    cargarInvitacion();
  }, [id]);

  // Función para copiar código al portapapeles
  const copiarCodigo = () => {
    if (!invitacion) return;

    navigator.clipboard
      .writeText(invitacion.codigo)
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
      });
  };

  // Confirmar revocación
  const confirmarRevocar = async () => {
    if (!invitacion) return;

    try {
      await invitacionService.revocarInvitacion(invitacion._id);
      setOpenRevocDialog(false);

      // Actualizar los datos
      const data = await invitacionService.obtenerInvitacionPorId(id as string);
      setInvitacion(data);
    } catch (err: any) {
      console.error("Error al revocar invitación:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al revocar la invitación.");
      }
    }
  };

  if (loading) {
    return (
      <Container>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/invitaciones")}
            sx={{ mt: 2 }}
          >
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }

  if (!invitacion) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">No se encontró la invitación.</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/invitaciones")}
            sx={{ mt: 2 }}
          >
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 2, display: "flex", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/invitaciones")}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalle de Invitación
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Código: {invitacion.codigo}</Typography>
          <Box>
            <Tooltip title={copiado ? "¡Copiado!" : "Copiar código"}>
              <IconButton onClick={copiarCodigo}>
                <CopyIcon color={copiado ? "primary" : "action"} />
              </IconButton>
            </Tooltip>
            {invitacion.estado === "ACTIVO" && (
              <Tooltip title="Revocar invitación">
                <IconButton
                  color="error"
                  onClick={() => setOpenRevocDialog(true)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Tipo de Invitación - MEJORADO */}
          <Grid item xs={12}>
            <Paper
              variant="outlined"
              sx={{ p: 2, backgroundColor: "primary.50" }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Typography
                  variant="h6"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  {obtenerDescripcionCompleta(invitacion).icono}
                  <Box component="span" sx={{ ml: 1 }}>
                    {obtenerDescripcionCompleta(invitacion).titulo}
                  </Box>
                </Typography>
                <Box sx={{ ml: 2 }}>
                  <Chip
                    label={invitacion.estado}
                    color={getEstadoColor(invitacion.estado) as any}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {obtenerDescripcionCompleta(invitacion).descripcion}
              </Typography>
            </Paper>
          </Grid>

          {/* Información del Curso - MEJORADO */}
          {nombreCurso && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  🏫 Información del Curso
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {nombreCurso}
                </Typography>
                {invitacion.tipo === "CURSO" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Los acudientes podrán registrar estudiantes para este curso
                    específico
                  </Typography>
                )}
                {invitacion.tipo === "ESTUDIANTE_ESPECIFICO" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Esta invitación está destinada para el acudiente de un
                    estudiante específico en este curso
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* Información del Estudiante - MEJORADO */}
          {invitacion.tipo === "ESTUDIANTE_ESPECIFICO" && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "warning.main",
                  borderRadius: 1,
                  bgcolor: "warning.50",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  🎓 Estudiante Específico
                </Typography>
                <Typography variant="body1">
                  Esta invitación está destinada únicamente para registrar al
                  acudiente de un estudiante específico
                </Typography>
                {nombreEstudiante && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Estudiante: {nombreEstudiante}
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* Invitación Personal - MEJORADO */}
          {invitacion.tipo === "PERSONAL" && (
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "info.main",
                  borderRadius: 1,
                  bgcolor: "info.50",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  👤 Invitación Personal
                </Typography>
                <Typography variant="body1">
                  Esta es una invitación general que no está vinculada a un
                  curso específico
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  El acudiente podrá seleccionar el curso durante el proceso de
                  registro
                </Typography>
              </Box>
            </Grid>
          )}

          {/* Estadísticas de Uso - MEJORADO */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                textAlign: "center",
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {invitacion.usosActuales}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                de {invitacion.cantidadUsos} usos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({invitacion.cantidadUsos - invitacion.usosActuales}{" "}
                disponibles)
              </Typography>
            </Box>
          </Grid>

          {/* Fechas */}
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Fecha de Creación</Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(invitacion.fechaCreacion)}
            </Typography>

            {invitacion.fechaExpiracion && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Fecha de Expiración
                </Typography>
                <Typography
                  variant="body1"
                  color="warning.main"
                  fontWeight="medium"
                >
                  {formatDate(invitacion.fechaExpiracion)}
                </Typography>
              </>
            )}

            {invitacion.fechaUtilizacion && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Última Utilización
                </Typography>
                <Typography variant="body1">
                  {formatDate(invitacion.fechaUtilizacion)}
                </Typography>
              </>
            )}
          </Grid>
        </Grid>

        {invitacion.registros && invitacion.registros.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Historial de Uso
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Tipo de Cuenta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invitacion.registros.map((registro, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {formatDate(registro.fechaRegistro as string)}
                      </TableCell>
                      <TableCell>{registro.usuarioId}</TableCell>
                      <TableCell>
                        {registro.tipoCuenta === "ACUDIENTE"
                          ? "Acudiente"
                          : "Estudiante"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      {/* Diálogo de confirmación para revocar invitación */}
      <Dialog open={openRevocDialog} onClose={() => setOpenRevocDialog(false)}>
        <DialogTitle>Confirmar Revocación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea revocar la invitación con código{" "}
            <strong>{invitacion.codigo}</strong>?
            <br />
            <br />
            Una vez revocada, esta invitación ya no podrá ser utilizada para
            registrar nuevos acudientes o estudiantes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRevocDialog(false)}>Cancelar</Button>
          <Button onClick={confirmarRevocar} color="error" variant="contained">
            Revocar Invitación
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DetalleInvitacion;
