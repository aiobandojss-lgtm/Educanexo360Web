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
  Info as InfoIcon,
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
import TimeZoneDebugger from "../../components/debug/TimeZoneDebugger";

// Función para verificar si un evento ya pasó
const isEventPassed = (evento: IEvento): boolean => {
  const now = new Date();
  const fechaFin = new Date(evento.fechaFin);
  return fechaFin < now;
};

// Componente para mostrar los detalles de un evento
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

      // La URL ya está proporcionada por el servicio
      const url = calendarioService.getAdjuntoUrl(evento._id);

      // Abrir en una nueva pestaña (esto manejará la descarga)
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

  // Verificar si tiene archivo adjunto
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

          {/* Añadir botones de acción para aprobar/cancelar (solo visible para admins/docentes) */}
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

          {/* Archivos adjuntos con mejor visualización */}
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
                  {/* Icono basado en el tipo de archivo */}
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
            Eliminar
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

  const [month, setMonth] = useState<number>(new Date().getMonth());
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [events, setEvents] = useState<IEvento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("");
  const [showDebugger, setShowDebugger] = useState<boolean>(false);

  // MODIFICADO: Inicialización del filtro de estado según rol del usuario (eliminando FINALIZADO)
  const [filtroEstado, setFiltroEstado] = useState<string>(
    user?.tipo === "ADMIN" ||
      user?.tipo === "DOCENTE" ||
      user?.tipo === "ADMINISTRATIVO" ||
      user?.tipo === "COORDINADOR" ||
      user?.tipo === "RECTOR"
      ? "" // Mostrar TODOS los eventos para roles administrativos
      : "ACTIVO" // Solo eventos ACTIVOS para estudiantes y acudientes
  );

  const [eventosDelDia, setEventosDelDia] = useState<IEvento[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<number | null>(null);
  const [dialogoEventoAbierto, setDialogoEventoAbierto] =
    useState<boolean>(false);
  const [detalleEventoAbierto, setDetalleEventoAbierto] =
    useState<boolean>(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<IEvento | null>(
    null
  );
  const [dialogoConfirmacionAbierto, setDialogoConfirmacionAbierto] =
    useState<boolean>(false);
  const [eventoAEliminar, setEventoAEliminar] = useState<string | null>(null);
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

  // MODIFICADO: Verificar si el usuario tiene permisos de administración
  const canEditEvents =
    user?.tipo === "ADMIN" ||
    user?.tipo === "DOCENTE" ||
    user?.tipo === "ADMINISTRATIVO" ||
    user?.tipo === "COORDINADOR" ||
    user?.tipo === "RECTOR";

  // Mostrar información del usuario actual para depuración
  useEffect(() => {
    logCurrentUser();
  }, []);

  // MODIFICADO: Cargar eventos del mes actual con manejo adecuado por tipo de usuario
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // Crear fechas de inicio y fin para el mes
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0); // Último día del mes

        // Determinar el filtro de estado según el rol
        const estadoFiltro =
          user?.tipo === "ESTUDIANTE" || user?.tipo === "PADRE"
            ? "ACTIVO" // Estudiantes y padres solo ven eventos ACTIVOS
            : filtroEstado; // Roles administrativos pueden usar el filtro seleccionado

        console.log("Consultando eventos con filtros:", {
          inicio: startDate.toISOString(),
          fin: endDate.toISOString(),
          tipo: filtroTipo || "TODOS",
          estado: estadoFiltro || "TODOS LOS ESTADOS",
        });

        // SOLUCIÓN ESPECÍFICA PARA ESTUDIANTES Y PADRES
        if (user?.tipo === "ESTUDIANTE" || user?.tipo === "PADRE") {
          try {
            console.log(
              "Usuario estudiante/padre detectado, filtrando eventos ACTIVOS..."
            );

            // Primero intentamos el método normal
            try {
              const eventos = await calendarioService.obtenerEventos({
                inicio: startDate.toISOString(),
                fin: endDate.toISOString(),
                ...(filtroTipo && { tipo: filtroTipo }),
                estado: "ACTIVO", // FORZAR filtro a ACTIVO para estudiantes/padres
              });

              setEvents(eventos);
              console.log(
                `Eventos cargados para estudiante/padre: ${eventos.length}`
              );
            } catch (normalError) {
              console.error(
                "Error normal para estudiantes/padres:",
                normalError
              );

              // Si falla, intentamos el método directo como solución temporal
              console.log("Intentando método alternativo...");
              const eventosDirectos = await getCalendarioEventosDirecto();

              // Filtramos manualmente SOLO eventos ACTIVOS
              const eventosFiltrados = eventosDirectos.filter((evento) => {
                const fechaEvento = new Date(evento.fechaInicio);
                const enRangoFecha =
                  fechaEvento >= startDate && fechaEvento <= endDate;
                const coincideTipo = !filtroTipo || evento.tipo === filtroTipo;
                const estadoActivo = evento.estado === "ACTIVO"; // FORZAR filtro a ACTIVO

                return enRangoFecha && coincideTipo && estadoActivo;
              });

              setEvents(eventosFiltrados);
              console.log(
                "Método alternativo: eventos cargados:",
                eventosFiltrados.length
              );
            }
          } catch (studentError) {
            console.error(
              "Error al obtener eventos para estudiante/padre:",
              studentError
            );
            setError(
              "No tienes acceso para ver eventos en este momento. Por favor, contacta al administrador del sistema."
            );
            setEvents([]);
          }
        } else {
          // Para roles administrativos, usar el método normal con el filtro seleccionado
          try {
            console.log(
              "Usuario administrativo detectado, usando filtros seleccionados"
            );
            const eventos = await calendarioService.obtenerEventos({
              inicio: startDate.toISOString(),
              fin: endDate.toISOString(),
              ...(filtroTipo && { tipo: filtroTipo }),
              estado: estadoFiltro, // Usar el filtro seleccionado para admin
            });

            console.log(`Eventos encontrados: ${eventos.length}`);

            // DEPURACIÓN DE EVENTOS
            if (eventos.length > 0) {
              console.log("=== DEPURACIÓN DE EVENTOS ===");
              eventos.slice(0, 3).forEach((evento) => {
                const fechaInicioLocal = new Date(evento.fechaInicio);
                const fechaFinLocal = new Date(evento.fechaFin);

                console.log(`Evento: ${evento.titulo}`);
                console.log(`ID: ${evento._id}`);
                console.log(`FechaInicio (UTC): ${evento.fechaInicio}`);
                console.log(
                  `FechaInicio (Local): ${fechaInicioLocal.toString()}`
                );
                console.log(
                  `Día del mes (getDate): ${fechaInicioLocal.getDate()}`
                );
                console.log(`Todo el día: ${evento.todoElDia}`);
                console.log(`Evento pasado: ${isEventPassed(evento)}`);
                console.log("------------------------");
              });
              console.log("=============================");
            }

            setEvents(eventos);
          } catch (err: any) {
            console.error("Error al obtener eventos:", err);

            if (err.response && err.response.status === 403) {
              setError(
                "No tienes permisos para acceder a los eventos del calendario. Por favor contacta al administrador."
              );
            } else {
              setError(
                "No se pudieron cargar los eventos. Por favor intenta más tarde."
              );
            }

            setEvents([]);
          }
        }
      } catch (err) {
        console.error("Error general al cargar eventos:", err);
        setError("Ocurrió un error inesperado. Por favor intenta más tarde.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [month, year, filtroTipo, filtroEstado, success, user?.tipo]);

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

    // Filtrar eventos para el día seleccionado con la nueva lógica
    const eventosDelDia = getEventosDelDia(day);
    console.log(`Eventos para día ${day}:`, eventosDelDia);

    setEventosDelDia(eventosDelDia);
    setDialogoEventoAbierto(true);
  };

  const handleEditarEvento = (eventoId: string) => {
    // Solo permitir editar a admins y docentes
    if (!canEditEvents) return;

    // Navegar a la página de edición del evento
    navigate(`/calendario/editar/${eventoId}`);
  };

  const handleVerEvento = (evento: IEvento) => {
    setEventoSeleccionado(evento);

    // Mostrar detalle del evento
    setDetalleEventoAbierto(true);
  };

  const handleEliminarEvento = (eventoId: string) => {
    // Solo permitir eliminar a admins y docentes
    if (!canEditEvents) return;

    setEventoAEliminar(eventoId);
    setDialogoConfirmacionAbierto(true);
  };

  const confirmarEliminarEvento = async () => {
    if (!eventoAEliminar) return;

    try {
      setLoading(true);
      await calendarioService.eliminarEvento(eventoAEliminar);

      // Actualizar la lista de eventos
      setEvents(events.filter((e) => e._id !== eventoAEliminar));

      // Actualizar la lista de eventos del día
      setEventosDelDia(eventosDelDia.filter((e) => e._id !== eventoAEliminar));

      setSuccess("Evento eliminado correctamente");

      // Cerrar diálogos
      setDialogoConfirmacionAbierto(false);

      // Si no quedan eventos para el día, cerrar ese diálogo también
      if (eventosDelDia.length <= 1) {
        setDialogoEventoAbierto(false);
      }

      // Limpiar mensaje de éxito después de unos segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error al eliminar evento:", err);
      setError("No se pudo eliminar el evento. Intente nuevamente más tarde.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de estado de un evento
  const handleStateChange = () => {
    // Recargar eventos
    setSuccess("Estado del evento actualizado correctamente");

    // El estado success en el efecto provocará una recarga de eventos
    setTimeout(() => {
      setSuccess(null);
    }, 3000);

    // Cerrar diálogos si están abiertos
    if (detalleEventoAbierto) {
      setDetalleEventoAbierto(false);
    }

    if (dialogoEventoAbierto) {
      setDialogoEventoAbierto(false);
    }
  };

  const handleCrearEvento = () => {
    // Solo permitir crear a admins y docentes
    if (!canEditEvents) return;

    // Si hay un día seleccionado, guardarlo en sessionStorage para usarlo en el formulario
    if (diaSeleccionado) {
      // Usar una hora fija del mediodía para evitar cualquier problema de zona horaria
      const fechaSeleccionada = new Date(
        year,
        month,
        diaSeleccionado,
        12,
        0,
        0
      );

      // Guardar en formato ISO para consistencia
      sessionStorage.setItem(
        "nuevaFechaEvento",
        fechaSeleccionada.toISOString()
      );
    }

    navigate("/calendario/nuevo");
  };

  // Crear calendario del mes actual
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const calendarDays = [];
  let day = 1;

  // Cabecera de días de la semana
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Generar filas del calendario
  for (let i = 0; i < 6; i++) {
    const row = [];
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDayOfMonth) {
        // Días anteriores al mes actual
        row.push(null);
      } else if (day > daysInMonth) {
        // Días posteriores al mes actual
        row.push(null);
      } else {
        // Días del mes actual
        row.push(day);
        day++;
      }
    }
    calendarDays.push(row);
    if (day > daysInMonth) break;
  }

  // Función mejorada para obtener eventos de un día específico
  const getEventosDelDia = (day: number | null) => {
    if (!day) return [];

    // Crear un objeto Date para representar el día seleccionado
    const fechaDia = new Date(year, month, day);

    return events.filter((evento) => {
      try {
        // Usar la utilidad para determinar si el evento ocurre en esta fecha
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

  // Función para verificar si un día tiene eventos
  const dayHasEvents = (day: number | null) => {
    if (!day) return false;
    return getEventosDelDia(day).length > 0;
  };

  // Función para obtener un resumen de tipos de eventos para un día
  const getEventTypesForDay = (day: number | null) => {
    if (!day) return [];

    const eventosDelDia = getEventosDelDia(day);

    // Usar un enfoque alternativo para obtener valores únicos sin spread + Set
    const tiposMap: { [key: string]: boolean } = {};
    eventosDelDia.forEach((evento) => {
      tiposMap[evento.tipo] = true;
    });

    // Convertir las claves del objeto a un array
    return Object.keys(tiposMap) as Array<
      "ACADEMICO" | "INSTITUCIONAL" | "CULTURAL" | "DEPORTIVO" | "OTRO"
    >;
  };

  // Obtener eventos próximos (ordenados por fecha)
  const proximosEventos = [...events]
    .sort(
      (a, b) =>
        new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
    )
    .slice(0, 5); // Mostrar solo los primeros 5

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

        {/* Solo mostrar botón de crear si el usuario tiene permisos */}
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

      {/* Depurador temporal - quitar en producción */}
      {showDebugger && (
        <TimeZoneDebugger
          eventos={events}
          onClose={() => setShowDebugger(false)}
        />
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

            {/* Filtros para eventos */}
            <Box
              sx={{
                mb: 2,
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
              }}
            >
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

              {/* MODIFICADO: Mostrar filtro de estado solo para usuarios administrativos */}
              {(user?.tipo === "ADMIN" ||
                user?.tipo === "DOCENTE" ||
                user?.tipo === "ADMINISTRATIVO" ||
                user?.tipo === "COORDINADOR" ||
                user?.tipo === "RECTOR") && (
                <FormControl size="small" sx={{ width: 200 }}>
                  <InputLabel id="filtro-estado-label">Estado</InputLabel>
                  <Select
                    labelId="filtro-estado-label"
                    id="filtro-estado"
                    value={filtroEstado}
                    label="Estado"
                    onChange={(e) => setFiltroEstado(e.target.value)}
                  >
                    <MenuItem value="">Todos los estados</MenuItem>
                    <MenuItem value="ACTIVO">Activos</MenuItem>
                    <MenuItem value="PENDIENTE">Pendientes</MenuItem>
                    {/* Eliminado FINALIZADO del selector */}
                    <MenuItem value="CANCELADO">Cancelados</MenuItem>
                  </Select>
                </FormControl>
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
                {/* Cabecera de días de la semana */}
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

                {/* Días del calendario */}
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
                        pb: 2, // Espacio para marcas de eventos
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
                        // Destacar el día actual
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

                      {day && cantidadEventos > 0 && (
                        <Box sx={{ position: "absolute", top: 0, right: 0 }}>
                          <Typography
                            variant="caption"
                            color="primary"
                            fontWeight="bold"
                          >
                            {cantidadEventos}
                          </Typography>
                        </Box>
                      )}

                      {/* Indicador de eventos pasados */}
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

                      {/* Indicadores de eventos más vistosos */}
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
                          // Estilo visual para eventos pasados
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

                        {/* Botones de acciones rápidas para admins y docentes */}
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

          {/* Sección de estadísticas de eventos */}
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

                {/* Agregar estadística de eventos pasados */}
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

                {/* Botón de depuración - Solo visible en desarrollo */}
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="text"
                    size="small"
                    color="inherit"
                    sx={{ fontSize: "0.75rem", opacity: 0.6 }}
                    onClick={() => setShowDebugger(!showDebugger)}
                  >
                    {showDebugger ? "Ocultar depurador" : "Mostrar depurador"}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Diálogo para mostrar eventos de un día específico */}
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
                        ? {
                            bgcolor: "rgba(93, 169, 233, 0.1)",
                          }
                        : {}),
                      // Estilo visual para eventos pasados
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
                                  { hour: "2-digit", minute: "2-digit" }
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

                          {/* Mostrar si hay archivo adjunto */}
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
                                    onClick={(e) => e.stopPropagation()} // Evitar que se cierre el diálogo
                                  >
                                    {evento.archivoAdjunto.nombre}
                                  </Link>
                                </Typography>
                              </Box>
                            )}
                        </>
                      }
                    />

                    {/* Botones de acción para admins y docentes */}
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
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar evento">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarEvento(evento._id);
                            }}
                            color="error"
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
          {/* Botón para crear evento en este día específico (solo para admins y docentes) */}
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

      {/* Diálogo de detalle de evento */}
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

      {/* Diálogo de confirmación para eliminar evento */}
      <Dialog
        open={dialogoConfirmacionAbierto}
        onClose={() => setDialogoConfirmacionAbierto(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro de que desea eliminar este evento? Esta acción no se
            puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDialogoConfirmacionAbierto(false)}
            color="primary"
          >
            Cancelar
          </Button>
          <Button
            onClick={confirmarEliminarEvento}
            color="error"
            autoFocus
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CalendarioEscolar;
