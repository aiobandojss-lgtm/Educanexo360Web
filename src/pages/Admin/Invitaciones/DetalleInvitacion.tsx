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
              `${curso.nombre} - ${curso.grado}° ${curso.seccion}`
            );
          } catch (err) {
            console.error("Error al cargar datos del curso:", err);
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

  // Traducir tipo de invitación
  const traducirTipo = (tipo: string) => {
    switch (tipo) {
      case "CURSO":
        return "Invitación por Curso";
      case "ESTUDIANTE_ESPECIFICO":
        return "Invitación para Estudiante";
      case "PERSONAL":
        return "Invitación Personal";
      default:
        return tipo;
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
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Tipo</Typography>
            <Typography variant="body1">
              {traducirTipo(invitacion.tipo)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Estado</Typography>
            <Chip
              label={invitacion.estado}
              color={getEstadoColor(invitacion.estado) as any}
              size="small"
            />
          </Grid>

          {nombreCurso && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Curso</Typography>
              <Typography variant="body1">{nombreCurso}</Typography>
            </Grid>
          )}

          {nombreEstudiante && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Estudiante</Typography>
              <Typography variant="body1">{nombreEstudiante}</Typography>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Usos</Typography>
            <Typography variant="body1">
              {invitacion.usosActuales} de {invitacion.cantidadUsos} (
              {invitacion.cantidadUsos - invitacion.usosActuales} disponibles)
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Fecha de Creación</Typography>
            <Typography variant="body1">
              {formatDate(invitacion.fechaCreacion)}
            </Typography>
          </Grid>

          {invitacion.fechaExpiracion && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Fecha de Expiración</Typography>
              <Typography variant="body1">
                {formatDate(invitacion.fechaExpiracion)}
              </Typography>
            </Grid>
          )}

          {invitacion.fechaUtilizacion && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Última Utilización</Typography>
              <Typography variant="body1">
                {formatDate(invitacion.fechaUtilizacion)}
              </Typography>
            </Grid>
          )}
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
