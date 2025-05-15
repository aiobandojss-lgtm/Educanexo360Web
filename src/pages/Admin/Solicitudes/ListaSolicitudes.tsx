// src/Pages/Admin/Solicitudes/ListaSolicitudes.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import registroService, {
  SolicitudRegistro,
} from "../../../services/registroService";
import cursoService from "../../../services/cursoService";

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

// Función para formatear fechas
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`solicitudes-tabpanel-${index}`}
      aria-labelledby={`solicitudes-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ListaSolicitudes: React.FC = () => {
  const navigate = useNavigate();

  // Estado para las tabs - Solo mostraremos la tab de pendientes
  const [tabValue, setTabValue] = useState(0);

  // Estados para las solicitudes
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<
    SolicitudRegistro[]
  >([]);
  const [historialSolicitudes, setHistorialSolicitudes] = useState<
    SolicitudRegistro[]
  >([]);
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(false); // Inicializar como false
  const [error, setError] = useState<string | null>(null);

  // Estado para información de cursos
  const [cursoInfo, setCursoInfo] = useState<{ [key: string]: string }>({});
  const [loadingCursos, setLoadingCursos] = useState(false);

  // Paginación y filtros
  const [paginaPendientes, setPaginaPendientes] = useState(1);
  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const [limite] = useState(10);
  const [totalPendientes, setTotalPendientes] = useState(0);
  const [totalHistorial, setTotalHistorial] = useState(0);
  const [filtroHistorial, setFiltroHistorial] = useState("");
  const [estadoFiltroHistorial, setEstadoFiltroHistorial] = useState("");

  // Cargar información de cursos
  const cargarInfoCursos = async (solicitudes: SolicitudRegistro[]) => {
    if (!solicitudes || solicitudes.length === 0) return;

    setLoadingCursos(true);

    try {
      // Extraer todos los IDs de cursos únicos de todos los estudiantes
      const cursoIdsSet = new Set<string>();

      solicitudes.forEach((sol) => {
        if (sol.estudiantes && sol.estudiantes.length > 0) {
          sol.estudiantes.forEach((est) => {
            if (est.cursoId) {
              cursoIdsSet.add(est.cursoId.toString());
            }
          });
        }
      });

      // Convertir Set a Array para iterar
      const cursoIdsArray = Array.from(cursoIdsSet);

      // Cargar información para cada curso
      const cursosData: { [key: string]: string } = {};

      // Usar forEach en lugar de for...of
      await Promise.all(
        cursoIdsArray.map(async (cursoId) => {
          try {
            const curso = await cursoService.obtenerCursoPorId(cursoId);
            if (curso) {
              // Construir nombre completo del curso con grado y sección
              cursosData[cursoId] = `${curso.nombre} - ${curso.grado}° ${
                curso.seccion || curso.grupo || ""
              }`;
            }
          } catch (err) {
            console.error(
              `Error al cargar información del curso ${cursoId}:`,
              err
            );
            cursosData[cursoId] = "Curso no disponible";
          }
        })
      );

      setCursoInfo(cursosData);
    } catch (err) {
      console.error("Error al cargar información de cursos:", err);
    } finally {
      setLoadingCursos(false);
    }
  };

  // Cargar solicitudes pendientes
  const cargarSolicitudesPendientes = async () => {
    setLoadingPendientes(true);
    setError(null);

    try {
      console.log("Solicitando solicitudes pendientes...");
      const resp = await registroService.obtenerSolicitudesPendientes(
        paginaPendientes,
        limite
      );
      console.log("Respuesta de solicitudes pendientes:", resp);

      // Asegurarse de que siempre tenemos un array, incluso si la respuesta es undefined
      const solicitudes = resp?.solicitudes || [];
      setSolicitudesPendientes(solicitudes);
      setTotalPendientes(resp?.total || 0);

      console.log(`Cargadas ${solicitudes.length} solicitudes pendientes`);

      // Cargar información de cursos para estas solicitudes
      if (solicitudes.length > 0) {
        await cargarInfoCursos(solicitudes);
      }
    } catch (err: any) {
      console.error("Error al cargar solicitudes pendientes:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(`Error: ${err.message}`);
      } else {
        setError("Error al cargar la lista de solicitudes pendientes.");
      }
      // Importante: inicializar como array vacío para evitar errores
      setSolicitudesPendientes([]);
    } finally {
      setLoadingPendientes(false);
    }
  };

  // Ya no cargamos el historial automáticamente
  const cargarHistorialSolicitudes = async () => {
    // Función deshabilitada temporalmente
    console.log("Carga de historial deshabilitada");
  };

  // Cargar datos cuando cambia la tab o la paginación
  useEffect(() => {
    console.log("useEffect ejecutándose, tabValue:", tabValue);
    if (tabValue === 0) {
      cargarSolicitudesPendientes();
    }
    // La carga del historial está temporalmente deshabilitada
    // else {
    //   cargarHistorialSolicitudes();
    // }
  }, [tabValue, paginaPendientes, paginaHistorial, estadoFiltroHistorial]);

  // Manejar cambio de pestaña
  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Manejar cambio de página en pendientes
  const handleChangePagePendientes = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPaginaPendientes(value);
  };

  // Manejar cambio de página en historial
  const handleChangePageHistorial = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPaginaHistorial(value);
  };

  // Filtrar solicitudes en historial - con verificación de array
  const solicitudesHistorialFiltradas = (historialSolicitudes || []).filter(
    (sol) => {
      // Protección contra undefined
      if (!sol) return false;

      const nombreCompleto = `${sol.nombre || ""} ${
        sol.apellidos || ""
      }`.toLowerCase();
      const email = (sol.email || "").toLowerCase();
      const terminoBusqueda = (filtroHistorial || "").toLowerCase();

      const matchesNombre = nombreCompleto.includes(terminoBusqueda);
      const matchesEmail = email.includes(terminoBusqueda);
      return matchesNombre || matchesEmail;
    }
  );

  // Función auxiliar para mostrar información de estudiantes con sus cursos
  const obtenerInfoEstudiantes = (solicitud: SolicitudRegistro) => {
    if (!solicitud.estudiantes || solicitud.estudiantes.length === 0) {
      return "-";
    }

    // Si solo hay un estudiante, mostrar su nombre y curso
    if (solicitud.estudiantes.length === 1) {
      const est = solicitud.estudiantes[0];
      const cursoNombre = cursoInfo[est.cursoId] || "Cargando...";
      return `${est.nombre} ${est.apellidos} (${cursoNombre})`;
    }

    // Si hay múltiples estudiantes, mostrar cantidad y primero
    const primerEst = solicitud.estudiantes[0];
    const cursoNombre = cursoInfo[primerEst.cursoId] || "Cargando...";
    return `${solicitud.estudiantes.length} estudiantes - ${primerEst.nombre} ${primerEst.apellidos} (${cursoNombre})...`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Solicitudes de Registro
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleChangeTab}
            aria-label="solicitudes tabs"
            sx={{ px: 2 }}
          >
            <Tab
              label={`Pendientes ${
                totalPendientes > 0 ? `(${totalPendientes})` : ""
              }`}
              id="solicitudes-tab-0"
              aria-controls="solicitudes-tabpanel-0"
            />
            {/* Historial temporalmente oculto */}
            {/* <Tab
              label="Historial"
              id="solicitudes-tab-1"
              aria-controls="solicitudes-tabpanel-1"
            /> */}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {/* Botón de refrescar para pendientes */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarSolicitudesPendientes}
              disabled={loadingPendientes}
            >
              {loadingPendientes ? <CircularProgress size={24} /> : "Refrescar"}
            </Button>
          </Box>

          {loadingPendientes ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 200,
              }}
            >
              <CircularProgress />
            </Box>
          ) : !solicitudesPendientes || solicitudesPendientes.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No hay solicitudes pendientes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Todas las solicitudes han sido procesadas
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Solicitante</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Estudiantes</TableCell>
                      <TableCell>Fecha de Solicitud</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {solicitudesPendientes.map((sol) => (
                      <TableRow key={sol._id}>
                        <TableCell>{`${sol.nombre} ${sol.apellidos}`}</TableCell>
                        <TableCell>{sol.email}</TableCell>
                        <TableCell>
                          {loadingCursos ? (
                            <CircularProgress size={16} sx={{ mr: 1 }} />
                          ) : (
                            obtenerInfoEstudiantes(sol)
                          )}
                        </TableCell>
                        <TableCell>{formatDate(sol.fechaSolicitud)}</TableCell>
                        <TableCell align="center">
                          <Box
                            sx={{ display: "flex", justifyContent: "center" }}
                          >
                            <Tooltip title="Ver detalles">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(`/admin/solicitudes/${sol._id}`)
                                }
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Aprobar">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  navigate(
                                    `/admin/solicitudes/${sol._id}?action=aprobar`
                                  )
                                }
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Rechazar">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  navigate(
                                    `/admin/solicitudes/${sol._id}?action=rechazar`
                                  )
                                }
                              >
                                <RejectIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPendientes > limite && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <Pagination
                    count={Math.ceil(totalPendientes / limite)}
                    page={paginaPendientes}
                    onChange={handleChangePagePendientes}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </TabPanel>

        {/* Panel de historial temporalmente oculto */}
        {/* <TabPanel value={tabValue} index={1}>
          ...contenido del panel historial...
        </TabPanel> */}
      </Paper>
    </Container>
  );
};

export default ListaSolicitudes;
