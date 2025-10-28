// src/screens/tareas/ListaEntregas.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  RateReview as RateIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import tareaService from "../../services/tareaService";
import { Tarea, EntregaTarea } from "../../types/tarea.types";
import EstadoBadge from "../../components/tareas/EstadoBadge";
import useAuth from "../../hooks/useAuth";

const ListaEntregas: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tarea, setTarea] = useState<Tarea | null>(null);
  const [entregas, setEntregas] = useState<EntregaTarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const esDocente =
    user?.tipo === "ADMIN" ||
    user?.tipo === "DOCENTE" ||
    user?.tipo === "RECTOR" ||
    user?.tipo === "COORDINADOR";

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const cargarDatos = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Cargar tarea
      const tareaRes = await tareaService.obtenerTarea(id);
      setTarea(tareaRes.data);

      // Cargar entregas
      const entregasRes = await tareaService.verEntregas(id);
      setEntregas(entregasRes.data || []);

      setLoading(false);
    } catch (err: any) {
      console.error("Error al cargar datos:", err);
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las entregas. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  const getNombreEstudiante = (entrega: EntregaTarea): string => {
    if (typeof entrega.estudianteId === "object") {
      return `${entrega.estudianteId.nombre} ${entrega.estudianteId.apellidos}`;
    }
    return "Estudiante";
  };

  const handleDescargarArchivo = async (
    entregaId: string,
    archivoId: string,
    nombre: string
  ) => {
    if (!id) return;

    try {
      const blob = await tareaService.descargarArchivo(id, archivoId, "entrega");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al descargar archivo:", err);
      alert("No se pudo descargar el archivo");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tarea) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Tarea no encontrada"}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Volver
        </Button>
      </Box>
    );
  }

  const entregadas = entregas.filter(
    (e) => e.estado === "ENTREGADA" || e.estado === "CALIFICADA"
  ).length;
  const calificadas = entregas.filter((e) => e.estado === "CALIFICADA").length;
  const pendientes = entregas.filter((e) => e.estado === "PENDIENTE").length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate(`/tareas/${id}`)}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1">
              Entregas de la Tarea
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {tarea.titulo}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Estadísticas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 3, justifyContent: "space-around" }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="primary">
              {entregas.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total Estudiantes
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="success.main">
              {entregadas}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Entregadas
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="info.main">
              {calificadas}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Calificadas
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4" color="warning.main">
              {pendientes}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pendientes
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Tabla de entregas */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estudiante</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Fecha Entrega</TableCell>
              <TableCell align="center">Archivos</TableCell>
              <TableCell align="center">Calificación</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entregas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No hay entregas registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              entregas.map((entrega) => (
                <TableRow key={entrega._id}>
                  <TableCell>{getNombreEstudiante(entrega)}</TableCell>
                  <TableCell align="center">
                    <EstadoBadge estado={entrega.estado} />
                  </TableCell>
                  <TableCell align="center">
                    {entrega.fechaEntrega
                      ? format(new Date(entrega.fechaEntrega), "PP p", {
                          locale: es,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    {entrega.archivos.length > 0 ? (
                      <Box>
                        {entrega.archivos.map((archivo) => (
                          <IconButton
                            key={archivo.fileId}
                            size="small"
                            onClick={() =>
                              handleDescargarArchivo(
                                entrega._id || "",
                                archivo.fileId,
                                archivo.nombre
                              )
                            }
                            title={archivo.nombre}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        ))}
                        <Typography variant="caption" display="block">
                          {entrega.archivos.length} archivo(s)
                        </Typography>
                      </Box>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {entrega.calificacion !== undefined ? (
                      <Chip
                        label={`${entrega.calificacion} / ${tarea.calificacionMaxima}`}
                        color="success"
                        size="small"
                      />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {(entrega.estado === "ENTREGADA" ||
                      entrega.estado === "CALIFICADA") && (
                      <Button
                        variant={
                          entrega.estado === "CALIFICADA"
                            ? "outlined"
                            : "contained"
                        }
                        size="small"
                        startIcon={<RateIcon />}
                        component={Link}
                        to={`/tareas/${id}/entregas/${entrega._id}/calificar`}
                      >
                        {entrega.estado === "CALIFICADA"
                          ? "Ver/Editar"
                          : "Calificar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListaEntregas;