// src/pages/asistencia/ListaAsistencia.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  SelectChangeEvent,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  School as SchoolIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { RootState } from "../../redux/store";
import { useNotificacion } from "../../components/common/Notificaciones";
import asistenciaService from "../../services/asistenciaService";

// Interfaces
interface Curso {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
}

interface AsistenciaResumen {
  _id: string;
  fecha: string;
  cursoId: string;
  curso: {
    nombre: string;
    grado: string;
    grupo: string;
  };
  totalEstudiantes: number;
  presentes: number;
  ausentes: number;
  tardes: number;
  justificados: number;
  porcentajeAsistencia: number;
  registradoPor: {
    _id: string;
    nombre: string;
    apellidos: string;
  };
  createdAt: string;
  finalizado: boolean; // Añadido el campo finalizado
}

const ListaAsistencia = () => {
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotificacion();
  const { user } = useSelector((state: RootState) => state.auth);

  // Estados
  const [asistencias, setAsistencias] = useState<AsistenciaResumen[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
  const [fechaInicio, setFechaInicio] = useState<string>(
    format(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      "yyyy-MM-dd"
    )
  );
  const [fechaFin, setFechaFin] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [loading, setLoading] = useState(false);
  const [loadingCursos, setLoadingCursos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar cursos
  useEffect(() => {
    const cargarCursos = async () => {
      try {
        setLoadingCursos(true);
        setError(null);

        const data = await asistenciaService.obtenerCursosDisponibles();
        setCursos(data);

        // Si solo hay un curso y es docente, seleccionarlo automáticamente
        if (data.length === 1 && user?.tipo === "DOCENTE") {
          setCursoSeleccionado(data[0]._id);
        }
      } catch (err: any) {
        console.error("Error al cargar cursos:", err);
        setError(
          "No se pudieron cargar los cursos: " +
            (err.response?.data?.message || "Error del servidor")
        );
      } finally {
        setLoadingCursos(false);
      }
    };

    if (user) {
      cargarCursos();
    }
  }, [user]);

  // Cargar asistencias
  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      setError(null);

      // Agregar logs para depuración
      console.log("Iniciando carga de asistencias con:", {
        fechaInicio,
        fechaFin,
        cursoSeleccionado,
        userType: user?.tipo,
      });

      const data = await asistenciaService.obtenerResumenAsistencia(
        fechaInicio,
        fechaFin,
        cursoSeleccionado
      );

      console.log("Datos recibidos:", data);
      setAsistencias(data);
    } catch (err: any) {
      console.error("Error al cargar asistencias:", err);

      // Mostrar mensaje de error más detallado para depuración
      const errorMessage = err.response?.data?.message
        ? `${err.response.data.message} (Status: ${err.response.status})`
        : "Error del servidor";

      setError("No se pudieron cargar las asistencias: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para cargar asistencias cuando cambian los filtros
  useEffect(() => {
    // Permitir cargar datos para ADMIN y DOCENTE sin necesidad de seleccionar curso
    if (cursoSeleccionado || ["ADMIN", "DOCENTE"].includes(user?.tipo || "")) {
      cargarAsistencias();
    }
  }, [cursoSeleccionado, fechaInicio, fechaFin]);

  // Filtro por curso
  const handleCursoChange = (event: SelectChangeEvent) => {
    setCursoSeleccionado(event.target.value);
  };

  // Filtro por fecha
  const handleFechaInicioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFechaInicio(event.target.value);
  };

  const handleFechaFinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFechaFin(event.target.value);
  };

  // Paginación
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Navegar a la página de detalle
  const verDetalle = (id: string) => {
    navigate(`/asistencia/${id}`);
  };

  // Navegar a la página de edición
  const editarAsistencia = (id: string) => {
    navigate(`/asistencia/editar/${id}`);
  };

  // Estadísticas
  const calcularEstadisticas = () => {
    if (asistencias.length === 0) return null;

    const totalRegistros = asistencias.length;
    const totalEstudiantes = asistencias.reduce(
      (sum, a) => sum + a.totalEstudiantes,
      0
    );
    const totalPresentes = asistencias.reduce((sum, a) => sum + a.presentes, 0);
    const totalAusentes = asistencias.reduce((sum, a) => sum + a.ausentes, 0);
    const totalTardes = asistencias.reduce((sum, a) => sum + a.tardes, 0);
    const totalJustificados = asistencias.reduce(
      (sum, a) => sum + a.justificados,
      0
    );

    const promedioAsistencia =
      totalEstudiantes > 0
        ? Math.round(
            ((totalPresentes + totalJustificados) / totalEstudiantes) * 100
          )
        : 0;

    return {
      totalRegistros,
      totalEstudiantes,
      totalPresentes,
      totalAusentes,
      totalTardes,
      totalJustificados,
      promedioAsistencia,
    };
  };

  const estadisticas = calcularEstadisticas();
  const puedeEditar = ["ADMIN", "DOCENTE"].includes(user?.tipo || "");

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h2" color="primary.main">
          Registro de Asistencia
        </Typography>

        {puedeEditar && (
          <Tooltip title="Crear un nuevo registro de asistencia">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate("/asistencia/registro")}
            >
              Nuevo Registro
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Filtros */}
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <Grid container spacing={3} alignItems="center">
          {/* Selector de curso */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="curso-label">Curso</InputLabel>
              <Select
                labelId="curso-label"
                value={cursoSeleccionado}
                onChange={handleCursoChange}
                label="Curso"
                disabled={loadingCursos || loading}
              >
                {user?.tipo === "ADMIN" && (
                  <MenuItem value="">Todos los cursos</MenuItem>
                )}
                {cursos.map((curso) => (
                  <MenuItem key={curso._id} value={curso._id}>
                    {curso.nombre} - {curso.grado} {curso.grupo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Selector de fecha inicio */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Fecha Inicio"
              type="date"
              value={fechaInicio}
              onChange={handleFechaInicioChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  cursor: "pointer",
                  filter: "invert(0.5)",
                },
              }}
            />
          </Grid>

          {/* Selector de fecha fin */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Fecha Fin"
              type="date"
              value={fechaFin}
              onChange={handleFechaFinChange}
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                "& input::-webkit-calendar-picker-indicator": {
                  cursor: "pointer",
                  filter: "invert(0.5)",
                },
              }}
            />
          </Grid>
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
                  Total Registros
                </Typography>
                <Typography variant="h1" color="primary.main">
                  {estadisticas.totalRegistros}
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
                  {estadisticas.totalPresentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round(
                        (estadisticas.totalPresentes /
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
                  Ausentes
                </Typography>
                <Typography variant="h1" color="error.main">
                  {estadisticas.totalAusentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round(
                        (estadisticas.totalAusentes /
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
                  Promedio Asistencia
                </Typography>
                <Typography
                  variant="h1"
                  color={
                    estadisticas.promedioAsistencia >= 90
                      ? "success.main"
                      : estadisticas.promedioAsistencia >= 75
                      ? "warning.main"
                      : "error.main"
                  }
                >
                  {estadisticas.promedioAsistencia}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* No hay curso seleccionado - Solo para administradores */}
      {!cursoSeleccionado && user?.tipo === "ADMIN" && !loadingCursos && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Mostrando datos de todos los cursos. Seleccione un curso específico
          para filtrar los resultados.
        </Alert>
      )}

      {/* Tabla de asistencias */}
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
                <TableCell>Fecha</TableCell>
                <TableCell>Curso</TableCell>
                <TableCell align="center">Total Estudiantes</TableCell>
                <TableCell align="center">Presentes</TableCell>
                <TableCell align="center">Ausentes</TableCell>
                <TableCell align="center">% Asistencia</TableCell>
                <TableCell>Registrado Por</TableCell>
                <TableCell align="center">Estado</TableCell>{" "}
                {/* Columna añadida para estado */}
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    {" "}
                    {/* Actualizado colSpan a 9 */}
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : asistencias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    {" "}
                    {/* Actualizado colSpan a 9 */}
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron registros de asistencia para los filtros
                      seleccionados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                asistencias
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((asistencia) => (
                    <TableRow
                      key={asistencia._id}
                      hover
                      sx={
                        asistencia.finalizado
                          ? {}
                          : { bgcolor: "rgba(255, 243, 224, 0.2)" }
                      } // Destacar registros no finalizados
                    >
                      <TableCell>
                        {format(new Date(asistencia.fecha), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <strong>
                          {asistencia.curso.grado} {asistencia.curso.grupo}
                        </strong>
                      </TableCell>
                      <TableCell align="center">
                        {asistencia.totalEstudiantes}
                      </TableCell>
                      <TableCell align="center">
                        {asistencia.presentes}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (
                          {Math.round(
                            (asistencia.presentes /
                              asistencia.totalEstudiantes) *
                              100
                          )}
                          %)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {asistencia.ausentes}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (
                          {Math.round(
                            (asistencia.ausentes /
                              asistencia.totalEstudiantes) *
                              100
                          )}
                          %)
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${asistencia.porcentajeAsistencia}%`}
                          color={
                            asistencia.porcentajeAsistencia >= 90
                              ? "success"
                              : asistencia.porcentajeAsistencia >= 75
                              ? "warning"
                              : "error"
                          }
                          size="small"
                          sx={{ borderRadius: 8 }}
                        />
                      </TableCell>
                      <TableCell>
                        {asistencia.registradoPor?.nombre || "Usuario"}{" "}
                        {asistencia.registradoPor?.apellidos || ""}
                      </TableCell>
                      {/* Nueva celda para el estado */}
                      <TableCell align="center">
                        <Chip
                          label={
                            asistencia.finalizado ? "Finalizado" : "En proceso"
                          }
                          color={asistencia.finalizado ? "success" : "warning"}
                          size="small"
                          sx={{ borderRadius: 8 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          <Tooltip title="Ver detalles del registro">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => verDetalle(asistencia._id)}
                              sx={{
                                bgcolor: "rgba(93, 169, 233, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(93, 169, 233, 0.2)",
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {puedeEditar &&
                            !asistencia.finalizado && ( // Solo mostrar editar si no está finalizado
                              <Tooltip title="Editar registro de asistencia">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() =>
                                    editarAsistencia(asistencia._id)
                                  }
                                  sx={{
                                    bgcolor: "rgba(0, 63, 145, 0.1)",
                                    "&:hover": {
                                      bgcolor: "rgba(0, 63, 145, 0.2)",
                                    },
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          {/*
                          <Tooltip title="Descargar reporte de asistencia">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => {
                                try {
                                  // Llamar a la función de descarga y mostrar notificación de éxito
                                  asistenciaService
                                    .descargarReporteAsistencia(asistencia._id)
                                    .then(() => {
                                      mostrarNotificacion(
                                        "Reporte descargado exitosamente",
                                        "success"
                                      );
                                    })
                                    .catch((error: Error) => {
                                      // Añadimos tipado explícito
                                      console.error(
                                        "Error al descargar:",
                                        error
                                      );
                                      mostrarNotificacion(
                                        "Error al descargar el reporte",
                                        "error"
                                      );
                                    });
                                } catch (error: unknown) {
                                  // Añadimos tipado explícito
                                  console.error(
                                    "Error al iniciar descarga:",
                                    error
                                  );
                                  mostrarNotificacion(
                                    "No se pudo iniciar la descarga",
                                    "error"
                                  );
                                }
                              }}
                              sx={{
                                bgcolor: "rgba(156, 39, 176, 0.1)",
                                "&:hover": {
                                  bgcolor: "rgba(156, 39, 176, 0.2)",
                                },
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip> */}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={asistencias.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
        />
      </Paper>
    </Box>
  );
};

export default ListaAsistencia;
