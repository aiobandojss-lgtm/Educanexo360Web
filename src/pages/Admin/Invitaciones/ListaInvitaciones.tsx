// src/Pages/Admin/Invitaciones/ListaInvitaciones.tsx
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
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

// Componente visual para mostrar los usos de una invitación
const UsosDisplay = ({
  usosActuales,
  cantidadUsos,
}: {
  usosActuales: number;
  cantidadUsos: number;
}) => {
  // Determinar color basado en cantidad de usos
  let color = "text.primary";
  if (usosActuales >= cantidadUsos) {
    color = "error.main";
  } else if (usosActuales > 0) {
    color = "primary.main";
  }

  return (
    <Typography variant="body2" fontWeight="medium" color={color}>
      {usosActuales} / {cantidadUsos}
    </Typography>
  );
};

const ListaInvitaciones: React.FC = () => {
  const navigate = useNavigate();
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvitacion, setSelectedInvitacion] =
    useState<Invitacion | null>(null);
  const [openRevocDialog, setOpenRevocDialog] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [mensajeAlerta, setMensajeAlerta] = useState<{
    texto: string;
    tipo: "success" | "error" | "warning" | "info";
  } | null>(null);

  // Estados para información adicional
  const [cursosInfo, setCursosInfo] = useState<{ [key: string]: any }>({});
  const [estudiantesInfo, setEstudiantesInfo] = useState<{
    [key: string]: any;
  }>({});

  // Paginación y filtros
  const [pagina, setPagina] = useState(1);
  const [limite, setLimite] = useState(10);
  const [total, setTotal] = useState(0);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  // Cargar invitaciones cuando cambia la página o el límite
  useEffect(() => {
    console.log("useEffect ejecutándose - Cargando invitaciones");
    cargarInvitaciones();
  }, [pagina, limite]);

  // Función para cargar información adicional de cursos y estudiantes
  const cargarInformacionAdicional = async (invitaciones: Invitacion[]) => {
    const cursosMap: { [key: string]: any } = {};
    const estudiantesMap: { [key: string]: any } = {};

    // Obtener IDs únicos de cursos y estudiantes
    const cursosIds = Array.from(
      new Set(
        invitaciones
          .filter((inv) => inv.cursoId)
          .map((inv) => inv.cursoId as string)
      )
    );

    const estudiantesIds = Array.from(
      new Set(
        invitaciones
          .filter((inv) => inv.estudianteId)
          .map((inv) => inv.estudianteId as string)
      )
    );

    try {
      // Cargar información de cursos
      for (const cursoId of cursosIds) {
        try {
          const curso = await cursoService.obtenerCursoPorId(cursoId);
          cursosMap[cursoId] = curso;
        } catch (err) {
          console.error(`Error al cargar curso ${cursoId}:`, err);
          cursosMap[cursoId] = {
            nombre: "Curso no encontrado",
            grado: "",
            seccion: "",
            grupo: "",
          };
        }
      }

      setCursosInfo(cursosMap);
      setEstudiantesInfo(estudiantesMap);
    } catch (error) {
      console.error("Error al cargar información adicional:", error);
    }
  };

  // Función para mostrar destino de la invitación
  const mostrarDestinoInvitacion = (invitacion: Invitacion) => {
    switch (invitacion.tipo) {
      case "CURSO":
        if (invitacion.cursoId && cursosInfo[invitacion.cursoId as string]) {
          const curso = cursosInfo[invitacion.cursoId as string];
          return (
            <Box>
              <Typography variant="body2" fontWeight="medium">
                📚 {curso.nombre}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {curso.grado}° {curso.seccion || curso.grupo}
              </Typography>
            </Box>
          );
        }
        return (
          <Box>
            <Typography variant="body2" color="text.secondary">
              📚 Curso (cargando...)
            </Typography>
          </Box>
        );

      case "ESTUDIANTE_ESPECIFICO":
        const cursoInfo =
          invitacion.cursoId && cursosInfo[invitacion.cursoId as string];
        return (
          <Box>
            <Typography variant="body2" fontWeight="medium">
              🎓 Estudiante Específico
            </Typography>
            {cursoInfo && (
              <Typography variant="caption" color="text.secondary">
                En: {cursoInfo.nombre} - {cursoInfo.grado}°{" "}
                {cursoInfo.seccion || cursoInfo.grupo}
              </Typography>
            )}
          </Box>
        );

      case "PERSONAL":
        return (
          <Box>
            <Typography
              variant="body2"
              fontWeight="medium"
              color="primary.main"
            >
              👤 Invitación Personal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sin curso específico
            </Typography>
          </Box>
        );

      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Tipo desconocido
          </Typography>
        );
    }
  };

  const cargarInvitaciones = async () => {
    console.log("Iniciando carga de invitaciones");
    setLoading(true);
    setError(null);

    try {
      const resp = await invitacionService.obtenerInvitaciones(
        pagina,
        limite,
        estadoFiltro || undefined
      );
      console.log("Respuesta recibida:", resp);

      // Asegurarse de que invitaciones es siempre un array, incluso si es undefined
      const invitacionesArray = resp?.invitaciones || [];
      setInvitaciones(invitacionesArray);
      setTotal(resp?.total || 0);

      // Cargar información adicional de cursos y estudiantes
      await cargarInformacionAdicional(invitacionesArray);

      // Log para ver los resultados
      console.log(`Cargadas ${invitacionesArray.length} invitaciones`);
    } catch (err: any) {
      console.error("Error al cargar invitaciones:", err);
      setError(
        "Error al cargar la lista de invitaciones: " +
          (err.message || "Error desconocido")
      );
      setInvitaciones([]); // ¡Importante! Siempre inicializar como array vacío
    } finally {
      setLoading(false);
    }
  };

  // Función para copiar código al portapapeles
  const copiarCodigo = (codigo: string, estado: string) => {
    // No permitir copiar códigos de invitaciones revocadas o expiradas
    if (estado === "REVOCADO") {
      setMensajeAlerta({
        texto:
          "No se puede copiar este código porque la invitación está revocada",
        tipo: "warning",
      });
      setTimeout(() => setMensajeAlerta(null), 4000);
      return;
    }

    if (estado === "EXPIRADO") {
      setMensajeAlerta({
        texto:
          "No se puede copiar este código porque la invitación está expirada",
        tipo: "warning",
      });
      setTimeout(() => setMensajeAlerta(null), 4000);
      return;
    }

    navigator.clipboard
      .writeText(codigo)
      .then(() => {
        setCopiado(codigo);
        setMensajeAlerta({
          texto: "Código copiado al portapapeles",
          tipo: "success",
        });
        setTimeout(() => {
          setCopiado(null);
          setMensajeAlerta(null);
        }, 2000);
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
        setMensajeAlerta({
          texto: "Error al copiar al portapapeles",
          tipo: "error",
        });
        setTimeout(() => setMensajeAlerta(null), 4000);
      });
  };

  // Abrir diálogo de revocación
  const abrirDialogoRevocar = (invitacion: Invitacion) => {
    setSelectedInvitacion(invitacion);
    setOpenRevocDialog(true);
  };

  // Cerrar diálogo de revocación
  const cerrarDialogoRevocar = () => {
    setOpenRevocDialog(false);
  };

  // Confirmar revocación
  const confirmarRevocar = async () => {
    if (!selectedInvitacion) return;

    try {
      await invitacionService.revocarInvitacion(selectedInvitacion._id);
      setOpenRevocDialog(false);

      setMensajeAlerta({
        texto: "Invitación revocada exitosamente",
        tipo: "success",
      });
      setTimeout(() => setMensajeAlerta(null), 4000);

      // Actualizar la lista
      cargarInvitaciones();
    } catch (err: any) {
      console.error("Error al revocar invitación:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al revocar la invitación.");
      }
    }
  };

  // Manejar cambio de página
  const handleChangePage = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPagina(value);
  };

  // Manejar cambio de filtro de estado
  const handleEstadoChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setEstadoFiltro(e.target.value as string);
    setPagina(1); // Resetear a primera página

    // Aplicar filtro después de un breve retraso
    setTimeout(() => {
      cargarInvitaciones();
    }, 100);
  };

  // Filtrar invitaciones con protección contra undefined
  const invitacionesFiltradas = (invitaciones || []).filter((inv) => {
    const matchesCodigo =
      inv?.codigo?.toLowerCase().includes((filtro || "").toLowerCase()) ||
      false;
    const matchesEstado = !estadoFiltro || inv?.estado === estadoFiltro;
    return matchesCodigo && matchesEstado;
  });

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Invitaciones
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {mensajeAlerta && (
        <Alert severity={mensajeAlerta.tipo} sx={{ mb: 3 }}>
          {mensajeAlerta.texto}
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Buscar por código"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Estado</InputLabel>
              <Select
                value={estadoFiltro}
                label="Estado"
                onChange={handleEstadoChange as any}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="ACTIVO">Activo</MenuItem>
                <MenuItem value="UTILIZADO">Utilizado</MenuItem>
                <MenuItem value="REVOCADO">Revocado</MenuItem>
                <MenuItem value="EXPIRADO">Expirado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
          >
            {/* Botón para refrescar manualmente */}
            <Button
              variant="outlined"
              onClick={cargarInvitaciones}
              disabled={loading}
              startIcon={<RefreshIcon />}
            >
              {loading ? <CircularProgress size={24} /> : "Refrescar"}
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/admin/invitaciones/crear")}
            >
              Nueva Invitación
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={3}>
        {loading ? (
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
        ) : !invitaciones || invitaciones.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              No se encontraron invitaciones
            </Typography>
            {filtro || estadoFiltro ? (
              <Button
                sx={{ mt: 2 }}
                onClick={() => {
                  setFiltro("");
                  setEstadoFiltro("");
                  setTimeout(cargarInvitaciones, 100);
                }}
              >
                Limpiar filtros
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={() => navigate("/admin/invitaciones/crear")}
              >
                Crear Primera Invitación
              </Button>
            )}
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Curso/Destino</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Usos</TableCell>
                <TableCell>Fecha de Creación</TableCell>
                <TableCell>Expiración</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invitacionesFiltradas.map((inv) => (
                <TableRow
                  key={inv._id}
                  sx={{
                    backgroundColor:
                      inv.estado === "REVOCADO"
                        ? "rgba(244, 67, 54, 0.08)"
                        : inv.estado === "EXPIRADO"
                        ? "rgba(255, 152, 0, 0.08)"
                        : "inherit",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "medium",
                          textDecoration:
                            inv.estado === "REVOCADO" ||
                            inv.estado === "EXPIRADO"
                              ? "line-through"
                              : "none",
                        }}
                      >
                        {inv.codigo}
                      </Typography>
                      <Tooltip
                        title={
                          inv.estado === "REVOCADO"
                            ? "No se puede copiar (invitación revocada)"
                            : inv.estado === "EXPIRADO"
                            ? "No se puede copiar (invitación expirada)"
                            : copiado === inv.codigo
                            ? "¡Copiado!"
                            : "Copiar código"
                        }
                      >
                        <span>
                          {" "}
                          {/* Wrapper para que Tooltip funcione con botón deshabilitado */}
                          <IconButton
                            size="small"
                            onClick={() => copiarCodigo(inv.codigo, inv.estado)}
                            disabled={
                              inv.estado === "REVOCADO" ||
                              inv.estado === "EXPIRADO"
                            }
                          >
                            <CopyIcon
                              fontSize="small"
                              color={
                                copiado === inv.codigo
                                  ? "primary"
                                  : inv.estado === "REVOCADO" ||
                                    inv.estado === "EXPIRADO"
                                  ? "disabled"
                                  : "action"
                              }
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{mostrarDestinoInvitacion(inv)}</TableCell>
                  <TableCell>
                    <Chip
                      label={inv.estado}
                      color={getEstadoColor(inv.estado) as any}
                      size="small"
                      sx={{ fontWeight: "medium" }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <UsosDisplay
                      usosActuales={inv.usosActuales}
                      cantidadUsos={inv.cantidadUsos}
                    />
                  </TableCell>
                  <TableCell>{formatDate(inv.fechaCreacion)}</TableCell>
                  <TableCell>
                    {inv.fechaExpiracion
                      ? formatDate(inv.fechaExpiracion)
                      : "Sin expiración"}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver detalles">
                      <IconButton
                        size="small"
                        onClick={() =>
                          navigate(`/admin/invitaciones/${inv._id}`)
                        }
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {inv.estado === "ACTIVO" && (
                      <Tooltip title="Revocar invitación">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => abrirDialogoRevocar(inv)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {total > limite && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={Math.ceil(total / limite)}
              page={pagina}
              onChange={handleChangePage}
              color="primary"
            />
          </Box>
        )}
      </TableContainer>

      {/* Diálogo de confirmación para revocar invitación */}
      <Dialog open={openRevocDialog} onClose={cerrarDialogoRevocar}>
        <DialogTitle>Confirmar Revocación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea revocar la invitación con código{" "}
            <strong>{selectedInvitacion?.codigo}</strong>?
            <br />
            <br />
            Una vez revocada, esta invitación ya no podrá ser utilizada para
            registrar nuevos acudientes o estudiantes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarDialogoRevocar}>Cancelar</Button>
          <Button onClick={confirmarRevocar} color="error" variant="contained">
            Revocar Invitación
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ListaInvitaciones;
