import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  IconButton,
  Pagination,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import anuncioService from "../../services/anuncioService";
import { Anuncio, AnuncioFilters } from "../../types/anuncio.types";
import useAuth from "../../hooks/useAuth";

const ListaAnuncios: React.FC = () => {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [filtros, setFiltros] = useState<AnuncioFilters>({
    pagina: 1,
    limite: 10,
  });
  const [busqueda, setBusqueda] = useState<string>("");

  const navigate = useNavigate();
  const { user } = useAuth();

  // Determinar si el usuario puede crear/editar anuncios
  const puedeCrearAnuncios = user?.tipo === "ADMIN" || user?.tipo === "DOCENTE";

  useEffect(() => {
    cargarAnuncios();
  }, [filtros]);

  const cargarAnuncios = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir los parámetros base
      const params: any = {
        pagina: filtros.pagina || 1,
        limite: filtros.limite || 10,
        soloDestacados: filtros.soloDestacados,
        busqueda: filtros.busqueda,
      };

      // Para estudiantes y padres, solo mostrar anuncios publicados
      // Para admin y docentes, mostrar todos los anuncios
      if (!puedeCrearAnuncios) {
        params.soloPublicados = true;
      }

      console.log("Parámetros enviados:", params);

      const response = await anuncioService.listarAnuncios(params);
      setAnuncios(response.data);
      setTotalPaginas(response.meta.paginas);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar anuncios:", err);
      setError("No se pudieron cargar los anuncios. Intente nuevamente.");
      setLoading(false);
    }
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setFiltros((prev) => ({ ...prev, pagina: value }));
  };

  const handleBuscar = () => {
    setFiltros((prev) => ({ ...prev, busqueda, pagina: 1 }));
  };

  const handleLimpiarBusqueda = () => {
    setBusqueda("");
    setFiltros((prev) => ({ ...prev, busqueda: undefined, pagina: 1 }));
  };

  const handleSoloDestacados = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros((prev) => ({
      ...prev,
      soloDestacados: event.target.checked,
      pagina: 1,
    }));
  };

  // Función para formatear la fecha relativa
  const formatearFecha = (fecha: string) => {
    try {
      return formatDistanceToNow(new Date(fecha), {
        addSuffix: true,
        locale: es,
      });
    } catch (e) {
      return "fecha desconocida";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Tablero de Anuncios
        </Typography>
        {puedeCrearAnuncios && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/anuncios/nuevo"
          >
            Nuevo Anuncio
          </Button>
        )}
      </Box>

      {/* Filtros simplificados */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <TextField
              label="Buscar anuncios"
              variant="outlined"
              size="small"
              fullWidth
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleBuscar()}
              InputProps={{
                endAdornment: busqueda ? (
                  <IconButton size="small" onClick={handleLimpiarBusqueda}>
                    <ClearIcon />
                  </IconButton>
                ) : null,
              }}
            />
            <Button variant="outlined" onClick={handleBuscar} sx={{ ml: 1 }}>
              <SearchIcon />
            </Button>
          </Box>

          {/* Solo mantenemos el checkbox de destacados */}
          <FormControlLabel
            control={
              <Checkbox
                checked={filtros.soloDestacados || false}
                onChange={handleSoloDestacados}
              />
            }
            label="Solo destacados"
          />
        </Box>
      </Paper>

      {/* Mensaje informativo para admin/docentes */}
      {puedeCrearAnuncios && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Estás viendo todos los anuncios, incluyendo borradores y publicados.
        </Alert>
      )}

      {/* Mensajes de carga o error */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Lista de anuncios */}
      {!loading && anuncios.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay anuncios disponibles.
        </Alert>
      )}

      {!loading &&
        anuncios.map((anuncio) => (
          <Paper
            key={anuncio._id}
            sx={{
              mb: 2,
              p: 2,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: 3,
              },
              borderLeft: anuncio.destacado ? "4px solid #FFC107" : "none",
            }}
            onClick={() => navigate(`/anuncios/${anuncio._id}`)}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {anuncio.destacado && <StarIcon sx={{ color: "#FFC107" }} />}
                  <Typography variant="h6" component="h2">
                    {anuncio.titulo}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {formatearFecha(
                    anuncio.fechaPublicacion || anuncio.createdAt
                  )}
                  {" · "}
                  {typeof anuncio.creador === "object"
                    ? `Por: ${anuncio.creador.nombre} ${anuncio.creador.apellidos}`
                    : "Autor desconocido"}
                </Typography>
              </Box>
              <Box>
                {!anuncio.estaPublicado && (
                  <Chip label="Borrador" color="warning" size="small" />
                )}
              </Box>
            </Box>

            <Typography
              variant="body1"
              sx={{
                mb: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {anuncio.contenido}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {anuncio.paraEstudiantes && (
                <Chip label="Estudiantes" size="small" color="info" />
              )}
              {anuncio.paraDocentes && (
                <Chip label="Docentes" size="small" color="success" />
              )}
              {anuncio.paraPadres && (
                <Chip label="Padres" size="small" color="primary" />
              )}
              {anuncio.archivosAdjuntos.length > 0 && (
                <Chip
                  label={`${anuncio.archivosAdjuntos.length} adjunto${
                    anuncio.archivosAdjuntos.length !== 1 ? "s" : ""
                  }`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Paper>
        ))}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPaginas}
            page={filtros.pagina || 1}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ListaAnuncios;
