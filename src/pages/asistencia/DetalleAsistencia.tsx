// src/pages/asistencia/DetalleAsistencia.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Delete as DeleteIcon,
  CheckCircle as FinalizarIcon,
  CheckCircle as PresenteIcon,
  Cancel as AusenteIcon,
  Warning as TardanzaIcon,
  LowPriority as PermisoIcon,
  AssignmentLate as JustificadoIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNotificacion } from "../../components/common/Notificaciones";
import asistenciaService, {
  ESTADOS_ASISTENCIA,
} from "../../services/asistenciaService";

// Función auxiliar para icono según estado
const getIconoEstado = (estado: string) => {
  switch (estado) {
    case ESTADOS_ASISTENCIA.PRESENTE:
      return <PresenteIcon color="success" />;
    case ESTADOS_ASISTENCIA.AUSENTE:
      return <AusenteIcon color="error" />;
    case ESTADOS_ASISTENCIA.TARDANZA:
      return <TardanzaIcon color="warning" />;
    case ESTADOS_ASISTENCIA.JUSTIFICADO:
      return <JustificadoIcon color="info" />;
    case ESTADOS_ASISTENCIA.PERMISO:
      return <PermisoIcon color="primary" />;
    default:
      return <PresenteIcon />;
  }
};

// Función auxiliar para color de estado
const getColorEstado = (estado: string) => {
  switch (estado) {
    case ESTADOS_ASISTENCIA.PRESENTE:
      return "success";
    case ESTADOS_ASISTENCIA.AUSENTE:
      return "error";
    case ESTADOS_ASISTENCIA.TARDANZA:
      return "warning";
    case ESTADOS_ASISTENCIA.JUSTIFICADO:
      return "info";
    case ESTADOS_ASISTENCIA.PERMISO:
      return "primary";
    default:
      return "default";
  }
};

const DetalleAsistencia = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotificacion();
  const { user } = useSelector((state: RootState) => state.auth);

  // Estados
  const [asistencia, setAsistencia] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<boolean>(false);
  const [confirmFinalizar, setConfirmFinalizar] = useState<boolean>(false);
  const [procesando, setProcesando] = useState<boolean>(false);

  // Cargar registro
  useEffect(() => {
    if (!id) return;

    const cargarRegistro = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await asistenciaService.obtenerRegistroAsistencia(id);
        setAsistencia(data);
      } catch (err: any) {
        console.error("Error al cargar registro de asistencia:", err);
        setError("No se pudo cargar el registro de asistencia solicitado");
      } finally {
        setLoading(false);
      }
    };

    cargarRegistro();
  }, [id]);

  // Función para finalizar registro
  const handleFinalizar = async () => {
    if (!id) return;

    try {
      setProcesando(true);
      await asistenciaService.finalizarRegistroAsistencia(id);

      // Recargar datos
      const data = await asistenciaService.obtenerRegistroAsistencia(id);
      setAsistencia(data);

      mostrarNotificacion("Registro finalizado correctamente", "success");
      setConfirmFinalizar(false);
    } catch (err) {
      console.error("Error al finalizar registro:", err);
      mostrarNotificacion("Error al finalizar el registro", "error");
    } finally {
      setProcesando(false);
    }
  };

  // Función para eliminar registro
  const handleEliminar = async () => {
    if (!id) return;

    try {
      setProcesando(true);
      await asistenciaService.eliminarRegistroAsistencia(id);

      mostrarNotificacion("Registro eliminado correctamente", "success");
      navigate("/asistencia");
    } catch (err) {
      console.error("Error al eliminar registro:", err);
      mostrarNotificacion("Error al eliminar el registro", "error");
    } finally {
      setProcesando(false);
      setConfirmEliminar(false);
    }
  };

  // Función para descargar
  const handleDescargar = () => {
    mostrarNotificacion("Descargando reporte de asistencia...", "info");
    // Implementar la lógica de descarga cuando esté disponible
  };

  // Estadísticas del registro
  const calcularEstadisticas = () => {
    if (!asistencia || !asistencia.estudiantes) return null;

    const totalEstudiantes = asistencia.estudiantes.length;
    const presentes = asistencia.estudiantes.filter(
      (e: any) => e.estado === ESTADOS_ASISTENCIA.PRESENTE
    ).length;
    const ausentes = asistencia.estudiantes.filter(
      (e: any) => e.estado === ESTADOS_ASISTENCIA.AUSENTE
    ).length;
    const tardanzas = asistencia.estudiantes.filter(
      (e: any) => e.estado === ESTADOS_ASISTENCIA.TARDANZA
    ).length;
    const justificados = asistencia.estudiantes.filter(
      (e: any) => e.estado === ESTADOS_ASISTENCIA.JUSTIFICADO
    ).length;
    const permisos = asistencia.estudiantes.filter(
      (e: any) => e.estado === ESTADOS_ASISTENCIA.PERMISO
    ).length;

    const porcentajePresentes =
      totalEstudiantes > 0
        ? Math.round((presentes / totalEstudiantes) * 100)
        : 0;
    const porcentajeAsistencia =
      totalEstudiantes > 0
        ? Math.round(
            ((presentes + tardanzas + justificados + permisos) /
              totalEstudiantes) *
              100
          )
        : 0;

    return {
      totalEstudiantes,
      presentes,
      ausentes,
      tardanzas,
      justificados,
      permisos,
      porcentajePresentes,
      porcentajeAsistencia,
    };
  };

  const estadisticas = calcularEstadisticas();
  const puedeEditar =
    ["ADMIN", "DOCENTE"].includes(user?.tipo || "") &&
    asistencia &&
    !asistencia.finalizado;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !asistencia) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/asistencia")}
          sx={{ mb: 2 }}
        >
          Volver a la lista
        </Button>

        <Alert severity="error">
          {error || "No se encontró el registro de asistencia solicitado"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra superior con acciones */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          alignItems: "center",
          borderRadius: 3,
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/asistencia")}
          variant="text"
        >
          Volver
        </Button>

        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          {/*
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleDescargar}
            sx={{ borderRadius: '20px' }}
          >
            Descargar
          </Button>*/}

          {puedeEditar && (
            <>
              <Button
                startIcon={<EditIcon />}
                variant="outlined"
                color="primary"
                onClick={() => navigate(`/asistencia/editar/${id}`)}
                sx={{ borderRadius: "20px" }}
              >
                Editar
              </Button>

              <Button
                startIcon={<FinalizarIcon />}
                variant="contained"
                color="success"
                onClick={() => setConfirmFinalizar(true)}
                sx={{ borderRadius: "20px" }}
              >
                Finalizar
              </Button>

              <Button
                startIcon={<DeleteIcon />}
                variant="outlined"
                color="error"
                onClick={() => setConfirmEliminar(true)}
                sx={{ borderRadius: "20px" }}
              >
                Eliminar
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Información general */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h3" sx={{ flex: 1 }}>
            Detalles del Registro de Asistencia
          </Typography>

          {asistencia.finalizado ? (
            <Chip
              icon={<FinalizarIcon />}
              label="Registro Finalizado"
              color="success"
              sx={{ fontWeight: "bold" }}
            />
          ) : (
            <Chip
              label="En Proceso"
              color="warning"
              sx={{ fontWeight: "bold" }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <CalendarIcon sx={{ mt: 0.5, mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Fecha de registro
                </Typography>
                <Typography variant="h3">
                  {format(new Date(asistencia.fecha), "EEEE, d MMMM yyyy")}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <SchoolIcon sx={{ mt: 0.5, mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Curso
                </Typography>
                <Typography variant="h3">
                  {asistencia.grado} {asistencia.grupo}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <ScheduleIcon sx={{ mt: 0.5, mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Horario
                </Typography>
                <Typography variant="h3">
                  {asistencia.horaInicio} - {asistencia.horaFin}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <PersonIcon sx={{ mt: 0.5, mr: 1, color: "primary.main" }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de Sesión
                </Typography>
                <Typography variant="h3">{asistencia.tipoSesion}</Typography>
              </Box>
            </Box>
          </Grid>

          {asistencia.asignaturaNombre && (
            <Grid item xs={12} md={6}>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <SchoolIcon sx={{ mt: 0.5, mr: 1, color: "primary.main" }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Asignatura
                  </Typography>
                  <Typography variant="h3">
                    {asistencia.asignaturaNombre}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}

          {asistencia.observacionesGenerales && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Observaciones Generales
                </Typography>
                <Typography variant="body1">
                  {asistencia.observacionesGenerales}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Estadísticas */}
      {estadisticas && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                height: "100%",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" gutterBottom>
                  Total Estudiantes
                </Typography>
                <Typography variant="h1" color="primary.main">
                  {estadisticas.totalEstudiantes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                height: "100%",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" gutterBottom>
                  Presentes
                </Typography>
                <Typography variant="h1" color="success.main">
                  {estadisticas.presentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.porcentajePresentes}% del total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                height: "100%",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" gutterBottom>
                  Ausentes
                </Typography>
                <Typography variant="h1" color="error.main">
                  {estadisticas.ausentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round(
                        (estadisticas.ausentes /
                          estadisticas.totalEstudiantes) *
                          100
                      )
                    : 0}
                  % del total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
                height: "100%",
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h3" gutterBottom>
                  Asistencia
                </Typography>
                <Box sx={{ position: "relative", display: "inline-flex" }}>
                  <CircularProgress
                    variant="determinate"
                    value={estadisticas.porcentajeAsistencia}
                    size={70}
                    thickness={7}
                    sx={{
                      color:
                        estadisticas.porcentajeAsistencia >= 90
                          ? "success.main"
                          : estadisticas.porcentajeAsistencia >= 75
                          ? "warning.main"
                          : "error.main",
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="h3" component="div">
                      {estadisticas.porcentajeAsistencia}%
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Lista de estudiantes */}
      <Typography variant="h3" sx={{ mb: 2 }}>
        Detalle de Asistencia por Estudiante
      </Typography>

      <Paper
        elevation={0}
        sx={{
          boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="5%">#</TableCell>
                <TableCell>Estudiante</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell>Observaciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {asistencia.estudiantes.map((estudiante: any, index: number) => (
                <TableRow key={estudiante.estudianteId} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight={500}>
                      {estudiante.nombre} {estudiante.apellidos}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={getIconoEstado(estudiante.estado)}
                      label={estudiante.estado}
                      color={getColorEstado(estudiante.estado) as any}
                      size="small"
                      sx={{ borderRadius: 8 }}
                    />
                  </TableCell>
                  <TableCell>
                    {estudiante.observaciones ? (
                      <Typography variant="body2">
                        {estudiante.observaciones}
                      </Typography>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontStyle="italic"
                      >
                        Sin observaciones
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={confirmEliminar}
        onClose={() => !procesando && setConfirmEliminar(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de eliminar este registro de asistencia? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmEliminar(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleEliminar}
            color="error"
            autoFocus
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={24} /> : null}
          >
            {procesando ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para finalizar */}
      <Dialog
        open={confirmFinalizar}
        onClose={() => !procesando && setConfirmFinalizar(false)}
      >
        <DialogTitle>Finalizar registro de asistencia</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Al finalizar el registro, se confirmará que la información es
            correcta y ya no se podrán realizar cambios. ¿Desea finalizar el
            registro de asistencia?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmFinalizar(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFinalizar}
            color="success"
            autoFocus
            disabled={procesando}
            startIcon={
              procesando ? <CircularProgress size={24} /> : <FinalizarIcon />
            }
          >
            {procesando ? "Finalizando..." : "Finalizar Registro"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DetalleAsistencia;
