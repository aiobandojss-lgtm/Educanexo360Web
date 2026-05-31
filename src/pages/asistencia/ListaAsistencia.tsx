// src/pages/asistencia/ListaAsistencia.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAsistenciaCursos, useResumenAsistencia } from "../../hooks/useAppQueries";
import axiosInstance from "../../api/axiosConfig";
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

// Parsea la fecha ISO como fecha local evitando la conversión UTC→local del navegador.
// "2026-05-01T00:00:00.000Z" en UTC-5 se mostraría como 30/04 sin este helper.
const parseFechaLocal = (fechaStr: string): Date => {
  const [year, month, day] = fechaStr.substring(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};
import { RootState } from "../../redux/store";
import { useNotificacion } from "../../components/common/Notificaciones";

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
  asignatura?: {
    _id: string;
    nombre: string;
  };
  totalEstudiantes: number;
  presentes: number;
  ausentes: number;
  tardes: number;
  justificados: number;
  permisos: number;
  porcentajeAsistencia: number;
  registradoPor: {
    _id: string;
    nombre: string;
    apellidos: string;
  };
  createdAt: string;
  finalizado: boolean;
}

const ListaAsistencia = () => {
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotificacion();
  const { user } = useSelector((state: RootState) => state.auth);

  // Estados de filtros (controlados por el usuario)
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estado para ACUDIENTE: lista de hijos cargados con nombres reales
  const [hijosUsuarios, setHijosUsuarios] = useState<{ _id: string; nombre: string; apellidos: string }[]>([]);
  const [estudianteIdSeleccionado, setEstudianteIdSeleccionado] = useState<string>("");

  const esEstudiante = user?.tipo === "ESTUDIANTE";
  const esAcudiente = user?.tipo === "ACUDIENTE";
  const esRolPersonal = esEstudiante || esAcudiente;

  // Hooks de caché
  const {
    data: cursosRaw,
    isLoading: loadingCursos,
    error: errorCursos,
  } = useAsistenciaCursos();
  const cursos: Curso[] = (cursosRaw as Curso[]) || [];

  const {
    data: asistenciasRaw,
    isLoading: loading,
    error: errorAsistencias,
  } = useResumenAsistencia(
    fechaInicio,
    fechaFin,
    cursoSeleccionado,
    user?.tipo || "",
    estudianteIdSeleccionado || undefined
  );
  const asistencias: AsistenciaResumen[] = (asistenciasRaw as AsistenciaResumen[]) || [];

  const error = (!esRolPersonal && errorCursos)
    ? "No se pudieron cargar los cursos: " + ((errorCursos as any)?.response?.data?.message || "Error del servidor")
    : errorAsistencias
    ? "No se pudieron cargar las asistencias: " + ((errorAsistencias as any)?.response?.data?.message || "Error del servidor")
    : null;

  // Auto-seleccionar el único curso si es docente
  useEffect(() => {
    if (cursos.length === 1 && user?.tipo === "DOCENTE" && !cursoSeleccionado) {
      setCursoSeleccionado(cursos[0]._id);
    }
  }, [cursos]);

  // Para ESTUDIANTE: auto-asignar su propio ID
  useEffect(() => {
    if (esEstudiante && user?._id) {
      setEstudianteIdSeleccionado(user._id);
    }
  }, [esEstudiante, user?._id]);

  // Para ACUDIENTE: cargar nombres reales de hijos asociados
  useEffect(() => {
    if (!esAcudiente) return;
    const hijosIds: string[] = user?.info_academica?.estudiantes_asociados ?? [];
    if (hijosIds.length === 0) return;

    setEstudianteIdSeleccionado(hijosIds[0]);

    Promise.all(
      hijosIds.map((id) =>
        axiosInstance.get(`/usuarios/${id}`).then((res) => {
          const data = res.data.data ?? res.data;
          return { _id: data._id, nombre: data.nombre, apellidos: data.apellidos };
        }).catch(() => ({ _id: id, nombre: "Estudiante", apellidos: "" }))
      )
    ).then(setHijosUsuarios);
  }, [esAcudiente, user?.info_academica?.estudiantes_asociados]);

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
  const calcularEstadisticas = (lista: AsistenciaResumen[]) => {
    if (lista.length === 0) return null;

    const totalRegistros = lista.length;
    const totalEstudiantes = lista.reduce((sum, a) => sum + a.totalEstudiantes, 0);
    const totalPresentes = lista.reduce((sum, a) => sum + a.presentes, 0);
    const totalAusentes = lista.reduce((sum, a) => sum + a.ausentes, 0);
    const totalTardes = lista.reduce((sum, a) => sum + a.tardes, 0);
    const totalJustificados = lista.reduce((sum, a) => sum + a.justificados, 0);
    const totalPermisos = lista.reduce((sum, a) => sum + (a.permisos ?? 0), 0);

    const promedioAsistencia =
      totalEstudiantes > 0
        ? Math.round(
            ((totalPresentes + totalTardes + totalJustificados + totalPermisos) /
              totalEstudiantes) *
              100
          )
        : 0;

    return {
      totalRegistros,
      totalEstudiantes,
      totalPresentes,
      totalAusentes,
      totalTardes,
      totalJustificados,
      totalPermisos,
      promedioAsistencia,
    };
  };

  // Filtro cliente como respaldo: elimina registros fuera del rango seleccionado
  const asistenciasFiltradas = React.useMemo(() => {
    return asistencias.filter((a) => {
      const fecha = a.fecha.substring(0, 10);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  }, [asistencias, fechaInicio, fechaFin]);

  const estadisticas = calcularEstadisticas(asistenciasFiltradas);
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
          {/* Selector de curso — solo para ADMIN, DOCENTE, RECTOR, COORDINADOR */}
          {!esRolPersonal && (
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
          )}

          {/* Selector de hijo — solo ACUDIENTE con múltiples hijos */}
          {esAcudiente && hijosUsuarios.length > 1 && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="hijo-label">Seleccionar hijo</InputLabel>
                <Select
                  labelId="hijo-label"
                  value={estudianteIdSeleccionado}
                  onChange={(e) => setEstudianteIdSeleccionado(e.target.value)}
                  label="Seleccionar hijo"
                >
                  {hijosUsuarios.map((hijo) => (
                    <MenuItem key={hijo._id} value={hijo._id}>
                      {hijo.nombre} {hijo.apellidos}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}

          {/* Label informativo para ESTUDIANTE */}
          {esEstudiante && (
            <Grid item xs={12} md={4}>
              <Alert severity="info" icon={false}>
                Viendo tu propia asistencia
              </Alert>
            </Grid>
          )}

          {/* Label informativo para ACUDIENTE con 1 hijo */}
          {esAcudiente && hijosUsuarios.length === 1 && (
            <Grid item xs={12} md={4}>
              <Alert severity="info" icon={false}>
                Viendo asistencia de {hijosUsuarios[0].nombre} {hijosUsuarios[0].apellidos}
              </Alert>
            </Grid>
          )}

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
          {/* Total Registros */}
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={0} sx={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.05)", height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" gutterBottom noWrap>Registros</Typography>
                <Typography variant="h1" color="primary.main">
                  {estadisticas.totalRegistros}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Presentes */}
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={0} sx={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.05)", height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" gutterBottom noWrap>Presentes</Typography>
                <Typography variant="h1" color="success.main">
                  {estadisticas.totalPresentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round((estadisticas.totalPresentes / estadisticas.totalEstudiantes) * 100)
                    : 0}% del total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tardanzas */}
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={0} sx={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.05)", height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" gutterBottom noWrap>Tardanzas</Typography>
                <Typography variant="h1" color="warning.main">
                  {estadisticas.totalTardes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round((estadisticas.totalTardes / estadisticas.totalEstudiantes) * 100)
                    : 0}% del total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Justificados */}
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={0} sx={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.05)", height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" gutterBottom noWrap>Justificados</Typography>
                <Typography variant="h1" color="info.main">
                  {estadisticas.totalJustificados}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round((estadisticas.totalJustificados / estadisticas.totalEstudiantes) * 100)
                    : 0}% del total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Permisos */}
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={0} sx={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.05)", height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" gutterBottom noWrap>Permisos</Typography>
                <Typography variant="h1" color="primary.main">
                  {estadisticas.totalPermisos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round((estadisticas.totalPermisos / estadisticas.totalEstudiantes) * 100)
                    : 0}% del total
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Ausentes */}
          <Grid item xs={6} sm={4} md={2}>
            <Card elevation={0} sx={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.05)", height: "100%" }}>
              <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h3" gutterBottom noWrap>Ausentes</Typography>
                <Typography variant="h1" color="error.main">
                  {estadisticas.totalAusentes}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {estadisticas.totalEstudiantes > 0
                    ? Math.round((estadisticas.totalAusentes / estadisticas.totalEstudiantes) * 100)
                    : 0}% del total
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
                <TableCell>Asignatura</TableCell>
                {!esRolPersonal && <TableCell align="center">Total Estudiantes</TableCell>}
                {!esRolPersonal && <TableCell align="center">Presentes</TableCell>}
                {!esRolPersonal && <TableCell align="center">Ausentes</TableCell>}
                <TableCell align="center">% Asistencia</TableCell>
                {!esRolPersonal && <TableCell>Registrado Por</TableCell>}
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={esRolPersonal ? 7 : 10} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} />
                  </TableCell>
                </TableRow>
              ) : asistenciasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={esRolPersonal ? 7 : 10} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No se encontraron registros de asistencia para los filtros
                      seleccionados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                asistenciasFiltradas
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
                        {format(parseFechaLocal(asistencia.fecha), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <strong>
                          {asistencia.curso.grado} {asistencia.curso.grupo}
                        </strong>
                      </TableCell>
                      <TableCell>
                        {asistencia.asignatura?.nombre
                          ? asistencia.asignatura.nombre
                          : <Typography variant="body2" color="text.secondary" fontStyle="italic">—</Typography>}
                      </TableCell>
                      {!esRolPersonal && (
                        <TableCell align="center">
                          {asistencia.totalEstudiantes}
                        </TableCell>
                      )}
                      {!esRolPersonal && (
                        <TableCell align="center">
                          {asistencia.presentes}
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({Math.round((asistencia.presentes / asistencia.totalEstudiantes) * 100)}%)
                          </Typography>
                        </TableCell>
                      )}
                      {!esRolPersonal && (
                        <TableCell align="center">
                          {asistencia.ausentes}
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({Math.round((asistencia.ausentes / asistencia.totalEstudiantes) * 100)}%)
                          </Typography>
                        </TableCell>
                      )}
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
                      {!esRolPersonal && (
                        <TableCell>
                          {asistencia.registradoPor?.nombre || "Usuario"}{" "}
                          {asistencia.registradoPor?.apellidos || ""}
                        </TableCell>
                      )}
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
          count={asistenciasFiltradas.length}
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
