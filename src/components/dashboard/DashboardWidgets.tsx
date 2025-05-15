// src/components/dashboard/DashboardWidgets.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  IconButton,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Badge,
  Avatar,
} from "@mui/material";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { RootState } from "../../redux/store";

// Importar iconos de Lucide en lugar de Material Icons
import {
  Calendar,
  Megaphone,
  CalendarDays,
  School,
  Trophy,
  PartyPopper,
  ChevronRight,
  Mail,
  PenSquare,
  Send,
  ArrowRight,
  RefreshCw,
  CheckSquare,
  BookOpen,
} from "lucide-react";

import mensajeService from "../../services/mensajeService";
import calendarioService from "../../services/calendarioService";
import anuncioService from "../../services/anuncioService";

// Estilo común para los iconos de Lucide
const iconProps = { size: 24, strokeWidth: 1.5 };
const largeIconProps = { size: 32, strokeWidth: 1.5 };

// Widget de Mensajes No Leídos
export const MensajesNoLeidosWidget = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerMensajesNoLeidos = async () => {
      try {
        setLoading(true);

        // Intentar obtener mensajes de la bandeja de entrada
        const response = await mensajeService.obtenerMensajes(
          "recibidos",
          1,
          100
        );

        // Si la respuesta es exitosa, calcular los no leídos
        if (response && response.data) {
          // Filtrar mensajes que no han sido leídos por el usuario
          const mensajesNoLeidos = response.data.filter(
            (mensaje: any) =>
              !mensaje.lecturas ||
              !mensaje.lecturas.some(
                (l: any) =>
                  l.usuarioId ===
                  (typeof l.usuarioId === "object"
                    ? l.usuarioId._id
                    : l.usuarioId)
              )
          );

          setCount(mensajesNoLeidos.length);
        } else {
          setCount(0);
        }
      } catch (err) {
        console.error("Error al obtener mensajes no leídos:", err);
        setCount(0);
        setError("No se pudo obtener el conteo de mensajes no leídos");
      } finally {
        setLoading(false);
      }
    };

    obtenerMensajesNoLeidos();
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        textAlign: "center",
        height: "100%",
        borderRadius: 3,
        boxShadow: "0px 4px 12px rgba(0, 99, 178, 0.15)",
        background: "linear-gradient(135deg, #0063B2 0%, #0078D4 100%)",
        color: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Badge
          color="error"
          badgeContent={count > 0 ? "Nuevo" : undefined}
          invisible={count === 0}
        >
          <Mail {...largeIconProps} />
        </Badge>

        <Typography variant="h3" fontWeight="500">
          Mensajes sin leer
        </Typography>

        {loading ? (
          <CircularProgress size={46} sx={{ color: "white", my: 1 }} />
        ) : (
          <Typography
            variant="h1"
            sx={{ fontSize: 46, fontWeight: "600", my: 1 }}
          >
            {count}
          </Typography>
        )}

        <Button
          variant="contained"
          size="small"
          onClick={() => navigate("/mensajes")}
          sx={{
            mt: 1,
            bgcolor: "rgba(255,255,255,0.2)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
          }}
        >
          Ver todos
        </Button>
      </Box>
    </Paper>
  );
};

// Widget de Mensajes Recientes
export const MensajesRecientesWidget = () => {
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const cargarMensajes = async () => {
      try {
        setLoading(true);

        // Obtener mensajes recibidos, limitado a 5
        const response = await mensajeService.obtenerMensajes(
          "recibidos",
          1,
          5
        );

        if (response && response.data) {
          setMensajes(response.data);
        } else {
          setMensajes([]);
        }
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
        setError("No se pudieron cargar los mensajes recientes");
      } finally {
        setLoading(false);
      }
    };

    cargarMensajes();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    // Si es hoy, mostrar solo la hora
    if (isToday(date)) {
      return format(date, "HH:mm");
    }

    // Si es de este año pero no es hoy, mostrar día y mes
    if (date.getFullYear() === new Date().getFullYear()) {
      return format(date, "d MMM", { locale: es });
    }

    // Si es de otro año, mostrar fecha completa
    return format(date, "d MMM yyyy", { locale: es });
  };

  return (
    <Card
      elevation={0}
      sx={{
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardHeader
        title="Mensajes Recientes"
        sx={{
          bgcolor: "#0063B2",
          color: "white",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
        action={
          <IconButton color="inherit" onClick={() => navigate("/mensajes")}>
            <ChevronRight size={22} />
          </IconButton>
        }
      />
      <List sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : mensajes.length === 0 ? (
          <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
            No hay mensajes recientes
          </Alert>
        ) : (
          mensajes.map((mensaje, index) => {
            // Determinar si el mensaje ha sido leído
            const esLeido =
              mensaje.lecturas &&
              mensaje.lecturas.some(
                (l: any) =>
                  l.usuarioId === user?._id ||
                  (typeof l.usuarioId === "object" &&
                    l.usuarioId._id === user?._id)
              );

            // Obtener el remitente
            const remitente =
              mensaje.remitente && typeof mensaje.remitente === "object"
                ? `${mensaje.remitente.nombre || ""} ${
                    mensaje.remitente.apellidos || ""
                  }`.trim()
                : "Remitente";

            return (
              <React.Fragment key={mensaje._id}>
                <ListItem
                  component="div"
                  onClick={() => navigate(`/mensajes/${mensaje._id}`)}
                  sx={{
                    borderLeft: esLeido ? undefined : "4px solid #0063B2",
                    bgcolor: esLeido ? "transparent" : "rgba(0, 99, 178, 0.05)",
                    py: 2,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "rgba(0, 0, 0, 0.04)",
                    },
                  }}
                >
                  <ListItemIcon>
                    <Badge color="error" variant="dot" invisible={esLeido}>
                      <Avatar
                        sx={{ bgcolor: esLeido ? "grey.300" : "#0063B2" }}
                      >
                        <Mail size={20} />
                      </Avatar>
                    </Badge>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: esLeido ? 400 : 600,
                          color: esLeido ? "text.primary" : "#0063B2",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {mensaje.asunto || "(Sin asunto)"}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {`${remitente} • ${formatDate(
                          mensaje.createdAt || ""
                        )}`}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => navigate(`/mensajes/${mensaje._id}`)}
                    >
                      <ChevronRight size={20} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < mensajes.length - 1 && <Divider />}
              </React.Fragment>
            );
          })
        )}
      </List>
      <Box sx={{ textAlign: "center", p: 2 }}>
        <Button
          endIcon={<ArrowRight size={18} />}
          onClick={() => navigate("/mensajes")}
        >
          Ver todos los mensajes
        </Button>
      </Box>
    </Card>
  );
};

// Widget de Acciones Rápidas (se mantiene aunque no se usa en el Dashboard actual)
export const AccionesRapidasWidget = () => {
  const navigate = useNavigate();

  const acciones = [
    {
      title: "Nuevo Mensaje",
      icon: <PenSquare size={20} />,
      onClick: () => navigate("/mensajes/nuevo"),
      color: "#0063B2",
      bgHover: "#E6F7FF",
    },
    {
      title: "Mensajes Recibidos",
      icon: <Mail size={20} />,
      onClick: () => navigate("/mensajes?bandeja=recibidos"),
      color: "#7B68EE",
      bgHover: "#F0E6FF",
    },
    {
      title: "Mensajes Enviados",
      icon: <Send size={20} />,
      onClick: () => navigate("/mensajes?bandeja=enviados"),
      color: "#4CAF50",
      bgHover: "#E8F5E9",
    },
    {
      title: "Ver Anuncios",
      icon: <Megaphone size={20} />,
      onClick: () => navigate("/anuncios"),
      color: "#FFC107",
      bgHover: "#FFF8E1",
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardHeader
        title="Acciones Rápidas"
        sx={{
          bgcolor: "#F5F5F5",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
      <CardContent>
        <Grid container spacing={2}>
          {acciones.map((accion, index) => (
            <Grid item xs={6} key={index}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={accion.icon}
                onClick={accion.onClick}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: accion.color,
                  color: accion.color,
                  "&:hover": {
                    bgcolor: accion.bgHover,
                    borderColor: accion.color,
                  },
                }}
              >
                {accion.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Widget de Calendario Mensual
export const CalendarioMensualWidget = () => {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(new Date());
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);

        // Obtener primer y último día del mes
        const inicio = startOfMonth(fecha);
        const fin = endOfMonth(fecha);

        // Cargar eventos de este mes
        const eventosResponse = await calendarioService.obtenerEventos({
          inicio: inicio.toISOString(),
          fin: fin.toISOString(),
        });

        setEventos(eventosResponse || []);
      } catch (error) {
        console.error("Error al cargar eventos del mes:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, [fecha]);

  // Renderizar calendario
  const renderCalendario = () => {
    // Obtener primer día del mes
    const inicio = startOfMonth(fecha);

    // Obtener último día del mes
    const fin = endOfMonth(fecha);

    // Crear array con todos los días del mes
    const diasDelMes = eachDayOfInterval({ start: inicio, end: fin });

    // Calcular día de la semana en que comienza (0 = domingo)
    const primerDiaSemana = getDay(inicio);

    // Días de la semana para cabecera
    const diasSemana = ["D", "L", "M", "X", "J", "V", "S"];

    // Verificar si un día tiene eventos
    const diaConEventos = (fecha: Date) => {
      return eventos.some((evento) => {
        const fechaEvento = new Date(evento.fechaInicio);
        return (
          fechaEvento.getDate() === fecha.getDate() &&
          fechaEvento.getMonth() === fecha.getMonth() &&
          fechaEvento.getFullYear() === fecha.getFullYear()
        );
      });
    };

    return (
      <Box>
        {/* Cabecera con nombre del mes y año */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h3">
            {format(fecha, "LLLL yyyy", { locale: es })}
          </Typography>
          <IconButton onClick={() => navigate("/calendario")}>
            <CalendarDays size={22} />
          </IconButton>
        </Box>

        {/* Días de la semana */}
        <Grid container spacing={1}>
          {diasSemana.map((dia, index) => (
            <Grid item xs={12 / 7} key={`dia-${index}`}>
              <Box
                sx={{
                  textAlign: "center",
                  fontWeight: "bold",
                  color: "text.secondary",
                  py: 0.5,
                }}
              >
                {dia}
              </Box>
            </Grid>
          ))}

          {/* Espacios vacíos antes del primer día */}
          {Array.from({ length: primerDiaSemana }).map((_, index) => (
            <Grid item xs={12 / 7} key={`empty-${index}`}>
              <Box sx={{ height: 36 }}></Box>
            </Grid>
          ))}

          {/* Días del mes */}
          {diasDelMes.map((dia, index) => (
            <Grid item xs={12 / 7} key={`dia-${index}`}>
              <Box
                sx={{
                  height: 36,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "50%",
                  bgcolor: isToday(dia)
                    ? "#0063B2"
                    : diaConEventos(dia)
                    ? "#E6F7FF"
                    : "transparent",
                  color: isToday(dia) ? "white" : "inherit",
                  fontWeight: diaConEventos(dia) ? "bold" : "normal",
                  cursor: diaConEventos(dia) ? "pointer" : "default",
                  "&:hover": {
                    bgcolor: diaConEventos(dia)
                      ? "#CCE5FF"
                      : isToday(dia)
                      ? "#0078D4"
                      : "transparent",
                  },
                }}
                onClick={() => {
                  if (diaConEventos(dia)) {
                    navigate("/calendario");
                  }
                }}
              >
                {dia.getDate()}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Card
      elevation={0}
      sx={{
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardHeader
        title="Calendario"
        sx={{
          bgcolor: "#F5F5F5",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          renderCalendario()
        )}
      </CardContent>
    </Card>
  );
};

// Widget de Eventos Recientes
export const EventosRecientesWidget: React.FC<{ onlyCount?: boolean }> = ({
  onlyCount = false,
}) => {
  const navigate = useNavigate();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setLoading(true);

        // Obtener eventos para los próximos 30 días
        const fechaInicio = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(fechaFin.getDate() + 30);

        const eventosProximos = await calendarioService.obtenerEventos({
          inicio: fechaInicio.toISOString(),
          fin: fechaFin.toISOString(),
        });

        // Ordenar por fecha más cercana y limitar a 5
        const eventosOrdenados = eventosProximos
          ? eventosProximos
              .sort(
                (a, b) =>
                  new Date(a.fechaInicio).getTime() -
                  new Date(b.fechaInicio).getTime()
              )
              .slice(0, 5)
          : [];

        setEventos(eventosOrdenados);
      } catch (err) {
        console.error("Error al cargar eventos:", err);
        setError("No se pudieron cargar los próximos eventos");
      } finally {
        setLoading(false);
      }
    };

    cargarEventos();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "ACADEMICO":
        return <School color="#1976d2" size={22} />;
      case "INSTITUCIONAL":
        return <Calendar color="#9c27b0" size={22} />;
      case "CULTURAL":
        return <PartyPopper color="#4caf50" size={22} />;
      case "DEPORTIVO":
        return <Trophy color="#ff9800" size={22} />;
      default:
        return <CalendarDays color="#757575" size={22} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE, d 'de' MMMM", { locale: es });
  };

  // Si solo queremos mostrar el contador
  if (onlyCount) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          height: "100%",
          borderRadius: 3,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          background: "linear-gradient(135deg, #7B68EE 0%, #9370DB 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Calendar {...largeIconProps} />

          <Typography variant="h3" fontWeight="500">
            Eventos Próximos
          </Typography>

          {loading ? (
            <CircularProgress size={46} sx={{ color: "white", my: 1 }} />
          ) : (
            <Typography
              variant="h1"
              sx={{ fontSize: 46, fontWeight: "600", my: 1 }}
            >
              {eventos.length}
            </Typography>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/calendario")}
            sx={{
              mt: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Ver calendario
          </Button>
        </Box>
      </Paper>
    );
  }

  // Widget completo
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "primary.main",
          color: "white",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3">Próximos Eventos</Typography>
        <IconButton
          color="inherit"
          onClick={() => navigate("/calendario")}
          size="small"
        >
          <ChevronRight size={20} />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : eventos.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No hay eventos próximos
          </Alert>
        ) : (
          <List disablePadding>
            {eventos.map((evento, index) => (
              <React.Fragment key={evento._id}>
                <ListItem
                  component="div"
                  disablePadding
                  sx={{ py: 1.5, cursor: "pointer" }}
                  onClick={() => navigate(`/calendario/evento/${evento._id}`)}
                >
                  <Box mr={1.5}>{getTypeIcon(evento.tipo)}</Box>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 500 }}>
                        {evento.titulo}
                      </Typography>
                    }
                    secondary={formatDate(evento.fechaInicio)}
                  />
                  <ChevronRight size={18} color="#757575" />
                </ListItem>
                {index < eventos.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                endIcon={<ChevronRight size={16} />}
                onClick={() => navigate("/calendario")}
                size="small"
              >
                Ver Calendario Completo
              </Button>
            </Box>
          </List>
        )}
      </Box>
    </Paper>
  );
};

// Widget de Anuncios Recientes
export const AnunciosRecientesWidget: React.FC<{ onlyCount?: boolean }> = ({
  onlyCount = false,
}) => {
  const navigate = useNavigate();
  const [anuncios, setAnuncios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarAnuncios = async () => {
      try {
        setLoading(true);

        // Obtener anuncios destacados o recientes
        const anunciosResponse = await anuncioService.listarAnuncios({
          soloPublicados: true,
          pagina: 1,
          limite: 5,
        });

        // Verificamos si tenemos data en la respuesta
        const anunciosData = anunciosResponse.data || [];

        // Priorizar los destacados
        const anunciosOrdenados = Array.isArray(anunciosData)
          ? anunciosData
              .sort((a, b) => {
                // Primero por destacado
                if (a.destacado && !b.destacado) return -1;
                if (!a.destacado && b.destacado) return 1;
                // Luego por fecha de publicación
                return (
                  new Date(b.fechaPublicacion).getTime() -
                  new Date(a.fechaPublicacion).getTime()
                );
              })
              .slice(0, 5)
          : [];

        setAnuncios(anunciosOrdenados);
      } catch (err) {
        console.error("Error al cargar anuncios:", err);
        setError("No se pudieron cargar los anuncios");
      } finally {
        setLoading(false);
      }
    };

    cargarAnuncios();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM", { locale: es });
  };

  // Si solo queremos mostrar el contador
  if (onlyCount) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          height: "100%",
          borderRadius: 3,
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
          background: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)",
          color: "white",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Megaphone {...largeIconProps} />

          <Typography variant="h3" fontWeight="500">
            Anuncios Recientes
          </Typography>

          {loading ? (
            <CircularProgress size={46} sx={{ color: "white", my: 1 }} />
          ) : (
            <Typography
              variant="h1"
              sx={{ fontSize: 46, fontWeight: "600", my: 1 }}
            >
              {anuncios.length}
            </Typography>
          )}

          <Button
            variant="contained"
            size="small"
            onClick={() => navigate("/anuncios")}
            sx={{
              mt: 1,
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
            }}
          >
            Ver anuncios
          </Button>
        </Box>
      </Paper>
    );
  }

  // Widget completo
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
        height: "100%",
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: "secondary.main",
          color: "white",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3">Anuncios Recientes</Typography>
        <IconButton
          color="inherit"
          onClick={() => navigate("/anuncios")}
          size="small"
        >
          <ChevronRight size={20} />
        </IconButton>
      </Box>

      <Box sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        ) : anuncios.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            No hay anuncios publicados
          </Alert>
        ) : (
          <List disablePadding>
            {anuncios.map((anuncio, index) => (
              <React.Fragment key={anuncio._id}>
                <ListItem
                  component="div"
                  disablePadding
                  sx={{ py: 1.5, cursor: "pointer" }}
                  onClick={() => navigate(`/anuncios/${anuncio._id}`)}
                >
                  <Box mr={1.5}>
                    <Megaphone
                      size={20}
                      color={anuncio.destacado ? "#f57c00" : "#757575"}
                    />
                  </Box>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          sx={{
                            fontWeight: anuncio.destacado ? 600 : 400,
                            color: anuncio.destacado
                              ? "warning.dark"
                              : "inherit",
                            mr: 1,
                          }}
                        >
                          {anuncio.titulo}
                        </Typography>
                        {anuncio.destacado && (
                          <Chip
                            label="Destacado"
                            size="small"
                            color="warning"
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={formatDate(anuncio.fechaPublicacion)}
                  />
                  <ChevronRight size={18} color="#757575" />
                </ListItem>
                {index < anuncios.length - 1 && <Divider />}
              </React.Fragment>
            ))}

            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                endIcon={<ChevronRight size={16} />}
                onClick={() => navigate("/anuncios")}
                size="small"
              >
                Ver todos los anuncios
              </Button>
            </Box>
          </List>
        )}
      </Box>
    </Paper>
  );
};
