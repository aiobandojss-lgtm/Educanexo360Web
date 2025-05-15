// src/Pages/Admin/Solicitudes/DetalleSolicitud.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Card,
  CardContent,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from "@mui/icons-material";
import registroService, {
  SolicitudRegistro,
} from "../../../services/registroService";
import cursoService from "../../../services/cursoService";

// Función para formatear fechas
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

// Función para obtener color de chip según estado
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "PENDIENTE":
      return "warning";
    case "APROBADA":
      return "success";
    case "RECHAZADA":
      return "error";
    default:
      return "default";
  }
};

const DetalleSolicitud: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const accionInicial = searchParams.get("action");

  const [solicitud, setSolicitud] = useState<SolicitudRegistro | null>(null);
  const [cursos, setCursos] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para diálogos
  const [openApprobarDialog, setOpenAprobarDialog] = useState(
    accionInicial === "aprobar"
  );
  const [openRechazarDialog, setOpenRechazarDialog] = useState(
    accionInicial === "rechazar"
  );
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [motivoError, setMotivoError] = useState(false);

  useEffect(() => {
    const cargarSolicitud = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const data = await registroService.obtenerSolicitudPorId(id);
        setSolicitud(data);

        // Cargar información de cursos - Usando array en lugar de Set para evitar problemas
        const cursoIdsSet = new Set<string>();
        data.estudiantes.forEach((est) => {
          if (est.cursoId) {
            cursoIdsSet.add(est.cursoId.toString());
          }
        });

        // Convertir a array
        const cursoIdsArray = Array.from(cursoIdsSet);

        const cursosInfo: { [key: string]: string } = {};

        // Usar Promise.all para cargar todos los cursos en paralelo
        await Promise.all(
          cursoIdsArray.map(async (cursoId) => {
            try {
              const curso = await cursoService.obtenerCursoPorId(cursoId);
              if (curso) {
                // Mostrar información completa del curso incluyendo grado y sección/grupo
                cursosInfo[cursoId] = `${curso.nombre} - ${curso.grado}° ${
                  curso.seccion || curso.grupo || ""
                }`;
              }
            } catch (err) {
              console.error("Error al cargar curso:", err);
              cursosInfo[cursoId] = "Información no disponible";
            }
          })
        );

        setCursos(cursosInfo);
      } catch (err: any) {
        console.error("Error al cargar solicitud:", err);
        if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("Error al cargar la información de la solicitud.");
        }
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitud();
  }, [id]);

  // Función para aprobar solicitud
  const aprobarSolicitud = async () => {
    if (!id) return;

    setProcesando(true);
    setError(null);

    try {
      await registroService.aprobarSolicitud(id);

      setSuccess(
        "Solicitud aprobada exitosamente. Se han creado las cuentas de usuarios y enviado las credenciales por correo electrónico."
      );
      setOpenAprobarDialog(false);

      // Recargar la solicitud para mostrar el nuevo estado
      const data = await registroService.obtenerSolicitudPorId(id);
      setSolicitud(data);
    } catch (err: any) {
      console.error("Error al aprobar solicitud:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al aprobar la solicitud.");
      }
    } finally {
      setProcesando(false);
    }
  };

  // Función para rechazar solicitud
  const rechazarSolicitud = async () => {
    if (!id) return;

    // Validar motivo
    if (!motivoRechazo.trim()) {
      setMotivoError(true);
      return;
    }

    setProcesando(true);
    setError(null);

    try {
      await registroService.rechazarSolicitud(id, motivoRechazo);

      setSuccess("Solicitud rechazada. Se ha notificado al solicitante.");
      setOpenRechazarDialog(false);

      // Recargar la solicitud para mostrar el nuevo estado
      const data = await registroService.obtenerSolicitudPorId(id);
      setSolicitud(data);
    } catch (err: any) {
      console.error("Error al rechazar solicitud:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al rechazar la solicitud.");
      }
    } finally {
      setProcesando(false);
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

  if (error && !solicitud) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/solicitudes")}
            sx={{ mt: 2 }}
          >
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }

  if (!solicitud) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">No se encontró la solicitud.</Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin/solicitudes")}
            sx={{ mt: 2 }}
          >
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2, display: "flex", alignItems: "center" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/solicitudes")}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4" component="h1">
          Detalle de Solicitud de Registro
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Datos de la solicitud */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Información de la Solicitud</Typography>
              <Chip
                label={solicitud.estado}
                color={getEstadoColor(solicitud.estado) as any}
              />
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Estado</Typography>
                <Typography variant="body1">{solicitud.estado}</Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Fecha de Solicitud</Typography>
                <Typography variant="body1">
                  {formatDate(solicitud.fechaSolicitud)}
                </Typography>
              </Grid>

              {solicitud.fechaRevision && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Fecha de Revisión</Typography>
                  <Typography variant="body1">
                    {formatDate(solicitud.fechaRevision)}
                  </Typography>
                </Grid>
              )}

              {solicitud.revisadoPor && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Revisado Por</Typography>
                  <Typography variant="body1">
                    {solicitud.revisadoPor}
                  </Typography>
                </Grid>
              )}

              {solicitud.comentarios && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Comentarios</Typography>
                  <Typography variant="body1">
                    {solicitud.comentarios}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {solicitud.estado === "PENDIENTE" && (
              <Box
                sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}
              >
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<ApproveIcon />}
                  onClick={() => setOpenAprobarDialog(true)}
                  disabled={procesando}
                >
                  Aprobar Solicitud
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<RejectIcon />}
                  onClick={() => setOpenRechazarDialog(true)}
                  disabled={procesando}
                >
                  Rechazar Solicitud
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Datos del acudiente */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">Datos del Acudiente</Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Nombre Completo</Typography>
                <Typography variant="body1">{`${solicitud.nombre} ${solicitud.apellidos}`}</Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Correo Electrónico</Typography>
                <Typography variant="body1">{solicitud.email}</Typography>
              </Grid>

              {solicitud.telefono && (
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Teléfono</Typography>
                  <Typography variant="body1">{solicitud.telefono}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Datos de los estudiantes */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <SchoolIcon sx={{ mr: 1, color: "primary.main" }} />
              <Typography variant="h6">
                Estudiantes ({solicitud.estudiantes.length})
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Apellidos</TableCell>
                    <TableCell>Curso</TableCell>
                    <TableCell>Email (opcional)</TableCell>
                    <TableCell>Fecha de Nacimiento</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {solicitud.estudiantes.map((estudiante, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{estudiante.nombre}</TableCell>
                      <TableCell>{estudiante.apellidos}</TableCell>
                      <TableCell>
                        {cursos[estudiante.cursoId] ||
                          "Cargando información del curso..."}
                      </TableCell>
                      <TableCell>{estudiante.email || "-"}</TableCell>
                      <TableCell>
                        {estudiante.fechaNacimiento
                          ? formatDate(
                              estudiante.fechaNacimiento.toString()
                            ).split(",")[0]
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo de confirmación para aprobar solicitud */}
      <Dialog
        open={openApprobarDialog}
        onClose={() => setOpenAprobarDialog(false)}
      >
        <DialogTitle>Confirmar Aprobación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea aprobar esta solicitud de registro?
            <br />
            <br />
            Al aprobar la solicitud, se realizarán las siguientes acciones:
            <ul>
              <li>
                Se creará una cuenta de acudiente para{" "}
                <strong>{`${solicitud.nombre} ${solicitud.apellidos}`}</strong>
              </li>
              <li>
                Se crearán {solicitud.estudiantes.length} cuentas de estudiantes
              </li>
              <li>
                Se enviará un correo electrónico a{" "}
                <strong>{solicitud.email}</strong> con las credenciales de
                acceso
              </li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenAprobarDialog(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            onClick={aprobarSolicitud}
            color="success"
            variant="contained"
            disabled={procesando}
          >
            {procesando ? <CircularProgress size={24} /> : "Aprobar Solicitud"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para rechazar solicitud */}
      <Dialog
        open={openRechazarDialog}
        onClose={() => setOpenRechazarDialog(false)}
      >
        <DialogTitle>Rechazar Solicitud</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Por favor, indique el motivo por el cual se rechaza esta solicitud
            de registro.
            <br />
            Este motivo será enviado al solicitante por correo electrónico.
          </DialogContentText>

          <TextField
            autoFocus
            label="Motivo del rechazo"
            fullWidth
            multiline
            rows={4}
            value={motivoRechazo}
            onChange={(e) => {
              setMotivoRechazo(e.target.value);
              if (e.target.value.trim()) {
                setMotivoError(false);
              }
            }}
            error={motivoError}
            helperText={motivoError ? "El motivo es obligatorio" : ""}
            disabled={procesando}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenRechazarDialog(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button
            onClick={rechazarSolicitud}
            color="error"
            variant="contained"
            disabled={procesando}
          >
            {procesando ? <CircularProgress size={24} /> : "Rechazar Solicitud"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DetalleSolicitud;
