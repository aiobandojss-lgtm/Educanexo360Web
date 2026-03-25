// src/pages/calendario/CalendarioEscolar.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  Badge,
  Link,
  FormHelperText,
} from "@mui/material";
import {
  Today as TodayIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  CalendarMonth as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as CloudDownloadIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Image as ImageIcon,
  TableChart as TableChartIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import calendarioService, { IEvento } from "../../services/calendarioService";
import {
  getCalendarioEventosDirecto,
  logCurrentUser,
} from "../../utils/permissionTester";
import EventoActionButtons from "../../components/calendario/EventoActionButtons";
import { eventOccursOnDate, formatDate } from "../../utils/dateUtils";
import { useEventosMes, QUERY_KEYS } from "../../hooks/useAppQueries";
import { useQueryClient } from "@tanstack/react-query";

const isEventPassed = (evento: IEvento): boolean => {
  const now = new Date();
  const fechaFin = new Date(evento.fechaFin);
  return fechaFin < now;
};

const EventoDetalle = ({
  evento,
  onClose,
  onEdit,
  onDelete,
  onStateChange,
  canEdit = false,
}: {
  evento: IEvento;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onStateChange?: () => void;
  canEdit?: boolean;
}) => {
  const [descargando, setDescargando] = useState(false);
  const isPassed = isEventPassed(evento);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearHora = (fecha: string) => {
    return new Date(fecha).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDescargarArchivo = async () => {
    if (!evento.archivoAdjunto || !evento.archivoAdjunto.fileId) return;

    try {
      setDescargando(true);
      const url = calendarioService.getAdjuntoUrl(evento._id);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error al descargar el archivo:", error);
      alert(
        "No se pudo descargar el archivo. Por favor, inténtalo de nuevo más tarde."
      );
    } finally {
      setDescargando(false);
    }
  };

  const tieneArchivoAdjunto =
    evento.archivoAdjunto &&
    evento.archivoAdjunto.nombre &&
    evento.archivoAdjunto.fileId;

  return (
    <>
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {evento.tipo === "ACADEMICO" ? (
              <SchoolIcon color="primary" />
            ) : evento.tipo === "INSTITUCIONAL" ? (
              <EventIcon color="secondary" />
            ) : evento.tipo === "CULTURAL" ? (
              <TodayIcon sx={{ color: "success.main" }} />
            ) : evento.tipo === "DEPORTIVO" ? (
              <AssignmentIcon sx={{ color: "warning.main" }} />
            ) : (
              <CalendarIcon color="action" />
            )}
            <Typography variant="h3">
              {evento.titulo}
              {isPassed && (
                <Tooltip title="Este evento ya pasó">
                  <Chip
                    size="small"
                    icon={<HistoryIcon />}
                    label="Pasado"
                    sx={{
                      ml: 1,
                      fontSize: "0.7rem",
                      backgroundColor: "rgba(0, 0, 0, 0.1)",
                      color: "text.secondary",
                    }}
                  />
                </Tooltip>
              )}
            </Typography>
          </Box>

          {canEdit && (
            <EventoActionButtons
              evento={evento}
              showEditDelete={false}
              showApprove={true}
              onStateChange={onStateChange}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Fecha
            </Typography>
            <Typography variant="body1">
              {formatearFecha(evento.fechaInicio)}
              {evento.todoElDia ? " (Todo el día)" : ""}
            </Typography>
          </Grid>

          {!evento.todoElDia && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Horario
              </Typography>
              <Typography variant="body1">
                {formatearHora(evento.fechaInicio)} -{" "}
                {formatearHora(evento.fechaFin)}
              </Typography>
            </Grid>
          )}

          {evento.lugar && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Lugar
              </Typography>
              <Typography variant="body1">{evento.lugar}</Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Descripción
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {evento.descripcion}
            </Typography>
          </Grid>

          {tieneArchivoAdjunto && (
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: "rgba(0, 0, 0, 0.03)",
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Archivo adjunto
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box sx={{ mr: 2 }}>
                    {evento.archivoAdjunto?.tipo?.includes("pdf") ? (
                      <PictureAsPdfIcon color="error" fontSize="large" />
                    ) : evento.archivoAdjunto?.tipo?.includes("image") ? (
                      <ImageIcon color="primary" fontSize="large" />
                    ) : evento.archivoAdjunto?.tipo?.includes("word") ? (
                      <DescriptionIcon color="primary" fontSize="large" />
                    ) : evento.archivoAdjunto?.tipo?.includes("excel") ? (
                      <TableChartIcon color="success" fontSize="large" />
                    ) : (
                      <InsertDriveFileIcon color="action" fontSize="large" />
                    )}
                  </Box>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {evento.archivoAdjunto?.nombre}
                    </Typography>

                    {evento.archivoAdjunto?.tamaño && (
                      <Typography variant="body2" color="text.secondary">
                        {(evento.archivoAdjunto.tamaño / 1024).toFixed(0)} KB
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CloudDownloadIcon />}
                    onClick={handleDescargarArchivo}
                    disabled={descargando}
                    sx={{ ml: 2 }}
                  >
                    {descargando ? "Descargando..." : "Descargar"}
                  </Button>
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mr: 1 }}>
                Tipo:
              </Typography>
              <Chip
                label={
                  evento.tipo === "ACADEMICO"
                    ? "Académico"
                    : evento.tipo === "INSTITUCIONAL"
                    ? "Institucional"
                    : evento.tipo === "CULTURAL"
                    ? "Cultural"
                    : evento.tipo === "DEPORTIVO"
                    ? "Deportivo"
                    : "Otro"
                }
                color={
                  evento.tipo === "ACADEMICO"
                    ? "primary"
                    : evento.tipo === "INSTITUCIONAL"
                    ? "secondary"
                    : evento.tipo === "CULTURAL"
                    ? "success"
                    : evento.tipo === "DEPORTIVO"
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        {canEdit && onEdit && (
          <Button
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              onEdit(evento._id);
              onClose();
            }}
          >
            Editar
          </Button>
        )}

        {canEdit && onDelete && (
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              onDelete(evento._id);
              onClose();
            }}
          >
            Cancelar
          </Button>
        )}

        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </>
  );
};

const CalendarioEscolar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("ACTIVO");

  // Caché por mes/año/filtros — navegación entre meses es instantánea si ya se visitó
  const {
    data: events = [],
    isLoading: loading,
    isError,
    refetch: refetchEventos,
  } = useEventosMes(month, year, {
    tipo: filtroTipo || undefined,
    estado: filtroEstado || undefined,
  });

  const error = isError ? "No se pudieron cargar los eventos." : null;

  // Estado local solo para operaciones de escritura (cancelar, confirmar asistencia)
  const [actionLoading, setLoading] = useState<boolean>(false);
  const [actionError, setError] = useState<string | null>(null);

  const [eventosDelDia, setEventosDelDia] = useState<IEvento[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [dialogoEventoAbierto, setDialogoEventoAbierto] =
    useState<boolean>(false);
  const [detalleEventoAbierto, setDetalleEventoAbierto] =
    useState<boolean>(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<IEvento | null>(
    null
  );
  const [success, setSuccess] = useState<string | null>(null);

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // 🚨 DETERMINAR QUÉ USUARIOS PUEDEN EDITAR EVENTOS
  const canEditEvents =
    user?.tipo === "ADMIN" ||
    user?.tipo === "DOCENTE" ||
    user?.tipo === "ADMINISTRATIVO" ||
    user?.tipo === "COORDINADOR" ||
    user?.tipo === "RECTOR";

  // 🚨 DETERMINAR QUÉ USUARIOS PUEDEN VER FILTROS DE ESTADO
  const canFilterByState =
    user?.tipo === "ADMIN" ||
    user?.tipo === "DOCENTE" ||
    user?.tipo === "ADMINISTRATIVO" ||
    user?.tipo === "COORDINADOR" ||
    user?.tipo === "RECTOR";

  useEffect(() => {
    logCurrentUser();
  }, []);


  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ACADEMICO":
        return <SchoolIcon color="primary" />;
      case "INSTITUCIONAL":
        return <EventIcon color="secondary" />;
      case "CULTURAL":
        return <TodayIcon sx={{ color: "success.main" }} />;
      case "DEPORTIVO":
        return <AssignmentIcon sx={{ color: "warning.main" }} />;
      default:
        return <CalendarIcon color="action" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ACADEMICO":
        return "primary";
      case "INSTITUCIONAL":
        return "secondary";
      case "CULTURAL":
        return "success";
      case "DEPORTIVO":
        return "warning";
      default:
        return "default";
    }
  };

  const getTypeColorHex = (type: string) => {
    switch (type) {
      case "ACADEMICO":
        return "#1976d2";
      case "INSTITUCIONAL":
        return "#9c27b0";
      case "CULTURAL":
        return "#2e7d32";
      case "DEPORTIVO":
        return "#ed6c02";
      default:
        return "#757575";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ACADEMICO":
        return "Académico";
      case "INSTITUCIONAL":
        return "Institucional";
      case "CULTURAL":
        return "Cultural";
      case "DEPORTIVO":
        return "Deportivo";
      case "OTRO":
        return "Otro";
      default:
        return "Evento";
    }
  };

  const previousMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    setDiaSeleccionado(day);
    const eventosDelDia = getEventosDelDia(day);
    setEventosDelDia(eventosDelDia);
    setDialogoEventoAbierto(true);
  };

  const handleEditarEvento = (eventoId: string) => {
    navigate(`/calendario/editar/${eventoId}`);
  };

  const handleVerEvento = (evento: IEvento) => {
    setEventoSeleccionado(evento);
    setDetalleEventoAbierto(true);
  };

  // 🚨 FUNCIÓN DE ELIMINACIÓN CON DEBUG COMPLETO
  const handleEliminarEvento = async (eventoId: string) => {
    console.log("🚨 === DEBUG CANCELACIÓN COMPLETA ===");
    console.log("1. Evento ID:", eventoId);
    console.log("2. Usuario Redux:", user);
    console.log("3. Puede editar (canEditEvents):", canEditEvents);
    console.log("4. Estado de eventos actual:", events.length);

    const confirmacion = window.confirm(
      "¿Estás seguro de que deseas cancelar este evento?\n\nEl evento será marcado como cancelado."
    );

    if (!confirmacion) {
      console.log("6. ❌ Cancelación cancelada por el usuario");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("7. 🔄 Iniciando cancelación...");
      console.log("8. Llamando a calendarioService.eliminarEvento()");

      const resultado = await calendarioService.eliminarEvento(eventoId);

      console.log("9. ✅ Respuesta del servicio:", resultado);

      // Invalida el caché para que react-query refetchee el mes actual
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EVENTOS });

      // Actualizar eventos del día en estado local
      setEventosDelDia((prevEventos) =>
        prevEventos.filter((e) => e._id !== eventoId)
      );

      setSuccess("✅ Evento cancelado exitosamente");

      // Cerrar diálogos si no quedan eventos
      const eventosRestantes = eventosDelDia.filter((e) => e._id !== eventoId);
      if (eventosRestantes.length === 0) {
        console.log("16. Cerrando diálogo - no quedan eventos");
        setDialogoEventoAbierto(false);
      }

      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error("❌ === ERROR COMPLETO EN CANCELACIÓN ===");
      console.error("Error objeto completo:", err);

      if (err.response) {
        if (err.response.status === 401) {
          setError("❌ Error de autenticación - Inicia sesión nuevamente");
        } else if (err.response.status === 403) {
          setError("❌ Sin permisos para cancelar este evento");
        } else if (err.response.status === 404) {
          setError("❌ El evento no existe o ya fue cancelado");
        } else {
          setError(
            `❌ Error del servidor (${err.response.status}): ${
              err.response.data?.message || "Error desconocido"
            }`
          );
        }
      } else if (err.request) {
        setError("❌ Error de conexión - Verifica tu internet");
      } else {
        setError(`❌ Error inesperado: ${err.message}`);
      }
    } finally {
      setLoading(false);
      console.log("=== FIN DEBUG CANCELACIÓN ===");
    }
  };

  const handleStateChange = () => {
    setSuccess("Estado del evento actualizado correctamente");
    setTimeout(() => setSuccess(null), 3000);
    if (detalleEventoAbierto) setDetalleEventoAbierto(false);
    if (dialogoEventoAbierto) setDialogoEventoAbierto(false);
  };

  const handleCrearEvento = () => {
    if (diaSeleccionado) {
      const fechaSeleccionada = new Date(
        year,
        month,
        diaSeleccionado,
        12,
        0,
        0
      );
      sessionStorage.setItem(
        "nuevaFechaEvento",
        fechaSeleccionada.toISOString()
      );
    }
    navigate("/calendario/nuevo");
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = [];
  let day = 1;

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  for (let i = 0; i < 6; i++) {
    const row = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfMonth) {
        row.push(null);
      } else if (day > daysInMonth) {
        row.push(null);
      } else {
        row.push(day);
        day++;
      }
    }
    calendarDays.push(row);
    if (day > daysInMonth) break;
  }

  const getEventosDelDia = (day: number | null) => {
    if (!day) return [];
    const fechaDia = new Date(year, month, day);
    return events.filter((evento) => {
      try {
        return eventOccursOnDate(
          evento.fechaInicio,
          evento.fechaFin,
          fechaDia,
          Boolean(evento.todoElDia)
        );
      } catch (error) {
        console.error("Error al procesar evento:", error, evento);
        return false;
      }
    });
  };

  const getEventTypesForDay = (day: number | null) => {
    if (!day) return [];
    const eventosDelDia = getEventosDelDia(day);
    const tiposMap: { [key: string]: boolean } = {};
    eventosDelDia.forEach((evento) => {
      tiposMap[evento.tipo] = true;
    });
    return Object.keys(tiposMap) as Array<
      "ACADEMICO" | "INSTITUCIONAL" | "CULTURAL" | "DEPORTIVO" | "OTRO"
    >;
  };

  const proximosEventos = [...events]
    .sort(
      (a, b) =>
        new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    )
    .slice(0, 5);

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
        <Typography variant="h1" color="primary.main">
          Calendario Escolar
        </Typography>

        {canEditEvents && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCrearEvento}
            sx={{ borderRadius: "20px" }}
          >
            Nuevo Evento
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <IconButton onClick={previousMonth}>
                <ChevronLeftIcon />
              </IconButton>

              <Typography variant="h3">
                {months[month]} {year}
              </Typography>

              <IconButton onClick={nextMonth}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* 🚨 FILTROS ADAPTADOS AL TIPO DE USUARIO */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              {/* Filtro por tipo - disponible para todos */}
              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel id="filtro-tipo-label">Filtrar por tipo</InputLabel>
                <Select
                  labelId="filtro-tipo-label"
                  id="filtro-tipo"
                  value={filtroTipo}
                  label="Filtrar por tipo"
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="ACADEMICO">Académico</MenuItem>
                  <MenuItem value="INSTITUCIONAL">Institucional</MenuItem>
                  <MenuItem value="CULTURAL">Cultural</MenuItem>
                  <MenuItem value="DEPORTIVO">Deportivo</MenuItem>
                  <MenuItem value="OTRO">Otro</MenuItem>
                </Select>
              </FormControl>

              {/* 🚨 Filtro por estado - SOLO 3 OPCIONES QUE FUNCIONAN */}
              {canFilterByState && (
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel id="filtro-estado-label">Estado</InputLabel>
                  <Select
                    labelId="filtro-estado-label"
                    id="filtro-estado"
                    value={filtroEstado}
                    label="Estado"
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <MenuItem value="ACTIVO">Activos</MenuItem>
                    <MenuItem value="PENDIENTE">Pendientes</MenuItem>
                    <MenuItem value="CANCELADO">Cancelados</MenuItem>
                  </Select>
                </FormControl>
              )}

              {/* 🚨 Información para estudiantes/padres */}
              {!canFilterByState && (
                <Chip
                  label="Solo eventos activos"
                  color="success"
                  size="small"
                  sx={{ borderRadius: "16px" }}
                />
              )}
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: 1,
                }}
              >
                {weekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      textAlign: "center",
                      p: 1,
                      fontWeight: "bold",
                      color: "text.secondary",
                    }}
                  >
                    {day}
                  </Box>
                ))}

                {calendarDays.flat().map((day, index) => {
                  const tiposEventos = getEventTypesForDay(day);
                  const eventosDelDia = getEventosDelDia(day);
                  const cantidadEventos = eventosDelDia.length;
                  const hasPastEvents = eventosDelDia.some(isEventPassed);

                  return (
                    <Box
                      key={index}
                      onClick={() => handleDayClick(day)}
                      sx={{
                        textAlign: "center",
                        p: 1,
                        pb: 2,
                        minHeight: 60,
                        bgcolor: day ? "background.paper" : "transparent",
                        border: day ? "1px solid #e0e0e0" : "none",
                        borderRadius: 1,
                        position: "relative",
                        "&:hover": day
                          ? {
                              bgcolor: "rgba(93, 169, 233, 0.1)",
                              cursor: "pointer",
                            }
                          : {},
                        ...(day === new Date().getDate() &&
                        month === new Date().getMonth() &&
                        year === new Date().getFullYear()
                          ? {
                              border: "2px solid",
                              borderColor: "primary.main",
                              fontWeight: "bold",
                            }
                          : {}),
                      }}
                    >
                      {day && (
                        <Badge
                          badgeContent={
                            cantidadEventos > 0 ? cantidadEventos : 0
                          }
                          color="primary"
                          sx={{
                            "& .MuiBadge-badge": {
                              right: -3,
                              top: 3,
                              display: cantidadEventos > 0 ? "flex" : "none",
                            },
                          }}
                        >
                          <Typography>{day}</Typography>
                        </Badge>
                      )}

                      {day && hasPastEvents && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "grey.400",
                          }}
                        />
                      )}

                      {day && tiposEventos.length > 0 && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: "flex",
                            justifyContent: "center",
                            gap: 0.5,
                            mt: 0.5,
                            px: 1,
                          }}
                        >
                          {tiposEventos.map((tipo, i) => (
                            <Box
                              key={i}
                              sx={{
                                height: 4,
                                flex: 1,
                                borderRadius: 1,
                                bgcolor: getTypeColorHex(tipo),
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
            }}
          >
            <Typography variant="h3" gutterBottom>
              Próximos Eventos
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : proximosEventos.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No hay eventos próximos
              </Alert>
            ) : (
              <List>
                {proximosEventos.map((evento, index) => {
                  const isPassed = isEventPassed(evento);

                  return (
                    <React.Fragment key={evento._id}>
                      <ListItem
                        sx={{
                          py: 2,
                          "&:hover": {
                            bgcolor: "rgba(93, 169, 233, 0.05)",
                            cursor: "pointer",
                          },
                          ...(isPassed && {
                            opacity: 0.7,
                            color: "text.secondary",
                          }),
                        }}
                        onClick={() => {
                          setEventoSeleccionado(evento);
                          handleDayClick(
                            new Date(evento.fechaInicio).getDate()
                          );
                        }}
                      >
                        <Box mr={2}>{getTypeIcon(evento.tipo)}</Box>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Typography fontWeight="500">
                                {evento.titulo}
                              </Typography>
                              {isPassed && (
                                <Chip
                                  size="small"
                                  label="Pasado"
                                  sx={{
                                    ml: 1,
                                    fontSize: "0.6rem",
                                    height: 16,
                                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                                    color: "text.secondary",
                                  }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box display="flex" alignItems="center" mt={0.5}>
                              <Typography variant="body2" sx={{ mr: 1 }}>
                                {new Date(
                                  evento.fechaInicio
                                ).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "long",
                                })}
                              </Typography>
                              <Chip
                                label={getTypeLabel(evento.tipo)}
                                color={getTypeColor(evento.tipo) as any}
                                size="small"
                                sx={{
                                  borderRadius: "20px",
                                  height: "20px",
                                  fontSize: "11px",
                                  ...(isPassed && { opacity: 0.7 }),
                                }}
                              />
                            </Box>
                          }
                        />

                        {canEditEvents && (
                          <Box>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/calendario/editar/${evento._id}`);
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </ListItem>
                      {index < proximosEventos.length - 1 && <Divider />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
              mt: 3,
            }}
          >
            <Typography variant="h3" gutterBottom>
              Estadísticas de Eventos
            </Typography>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress size={30} />
              </Box>
            ) : (
              <>
                <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent>
                    <Typography fontWeight="500">Total de eventos</Typography>
                    <Typography variant="h2">{events.length}</Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                  <CardContent
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography fontWeight="500">Eventos pasados</Typography>
                      <Typography variant="h2">
                        {events.filter(isEventPassed).length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography fontWeight="500">Eventos futuros</Typography>
                      <Typography variant="h2">
                        {events.filter((e) => !isEventPassed(e)).length}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Typography
                  variant="subtitle1"
                  fontWeight="500"
                  sx={{ mt: 3, mb: 1 }}
                >
                  Eventos por tipo
                </Typography>

                {[
                  "ACADEMICO",
                  "INSTITUCIONAL",
                  "CULTURAL",
                  "DEPORTIVO",
                  "OTRO",
                ].map((tipo) => {
                  const cantidad = events.filter((e) => e.tipo === tipo).length;
                  if (cantidad === 0) return null;

                  return (
                    <Box
                      key={tipo}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${getTypeColorHex(tipo)}10`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {getTypeIcon(tipo)}
                        <Typography sx={{ ml: 1 }}>
                          {getTypeLabel(tipo)}
                        </Typography>
                      </Box>
                      <Typography fontWeight="bold">{cantidad}</Typography>
                    </Box>
                  );
                })}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={dialogoEventoAbierto}
        onClose={() => setDialogoEventoAbierto(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Eventos para el {diaSeleccionado} de {months[month]} de {year}
        </DialogTitle>
        <DialogContent>
          {eventosDelDia.length === 0 ? (
            <DialogContentText>
              No hay eventos programados para este día.
            </DialogContentText>
          ) : (
            <List>
              {eventosDelDia.map((evento) => {
                const isPassed = isEventPassed(evento);

                return (
                  <ListItem
                    key={evento._id}
                    component="div"
                    divider
                    sx={{
                      cursor: "pointer",
                      py: 2,
                      ...(eventoSeleccionado?._id === evento._id
                        ? { bgcolor: "rgba(93, 169, 233, 0.1)" }
                        : {}),
                      ...(isPassed && {
                        opacity: 0.7,
                        color: "text.secondary",
                      }),
                    }}
                    onClick={() => handleVerEvento(evento)}
                  >
                    <Box mr={2}>{getTypeIcon(evento.tipo)}</Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Typography fontWeight={isPassed ? 400 : 500}>
                            {evento.titulo}
                          </Typography>
                          {isPassed && (
                            <Chip
                              size="small"
                              label="Pasado"
                              sx={{
                                ml: 1,
                                fontSize: "0.6rem",
                                height: 16,
                                backgroundColor: "rgba(0, 0, 0, 0.1)",
                                color: "text.secondary",
                              }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {evento.todoElDia ? (
                              "Todo el día"
                            ) : (
                              <>
                                {new Date(
                                  evento.fechaInicio
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {" - "}
                                {new Date(evento.fechaFin).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </>
                            )}
                          </Typography>
                          <Box
                            mt={0.5}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Chip
                              label={getTypeLabel(evento.tipo)}
                              color={getTypeColor(evento.tipo) as any}
                              size="small"
                              sx={{
                                borderRadius: "20px",
                                height: "20px",
                                fontSize: "11px",
                                ...(isPassed && { opacity: 0.7 }),
                              }}
                            />
                            {evento.lugar && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {evento.lugar}
                              </Typography>
                            )}
                          </Box>

                          {evento.archivoAdjunto &&
                            evento.archivoAdjunto.nombre && (
                              <Box mt={1} display="flex" alignItems="center">
                                <CloudDownloadIcon
                                  fontSize="small"
                                  sx={{ mr: 0.5, color: "text.secondary" }}
                                />
                                <Typography variant="body2" color="primary">
                                  <Link
                                    href={calendarioService.getAdjuntoUrl(
                                      evento._id
                                    )}
                                    target="_blank"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {evento.archivoAdjunto.nombre}
                                  </Link>
                                </Typography>
                              </Box>
                            )}
                        </>
                      }
                    />

                    {canEditEvents && (
                      <Box sx={{ display: "flex" }}>
                        <Tooltip title="Editar evento">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarEvento(evento._id);
                            }}
                            color="primary"
                            disabled={loading}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar evento">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(
                                "🚨 Click cancelar evento desde lista:",
                                evento._id
                              );
                              handleEliminarEvento(evento._id);
                            }}
                            color="error"
                            disabled={loading}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          {canEditEvents && (
            <Button
              color="primary"
              onClick={() => {
                setDialogoEventoAbierto(false);
                handleCrearEvento();
              }}
              startIcon={<AddIcon />}
            >
              Nuevo Evento
            </Button>
          )}
          <Button
            onClick={() => setDialogoEventoAbierto(false)}
            color="primary"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detalleEventoAbierto}
        onClose={() => setDetalleEventoAbierto(false)}
        maxWidth="sm"
        fullWidth
      >
        {eventoSeleccionado && (
          <EventoDetalle
            evento={eventoSeleccionado}
            onClose={() => setDetalleEventoAbierto(false)}
            onEdit={canEditEvents ? handleEditarEvento : undefined}
            onDelete={canEditEvents ? handleEliminarEvento : undefined}
            onStateChange={handleStateChange}
            canEdit={canEditEvents}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default CalendarioEscolar;
