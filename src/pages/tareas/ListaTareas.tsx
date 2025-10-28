// src/screens/tareas/ListaTareas.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  Grid,
  Pagination,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import tareaService from "../../services/tareaService";
import { Tarea, TareaFilters } from "../../types/tarea.types";
import TarjetaTarea from "../../components/tareas/TarjetaTarea";
import useAuth from "../../hooks/useAuth";

const ListaTareas: React.FC = () => {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPaginas, setTotalPaginas] = useState<number>(1);
  const [filtros, setFiltros] = useState<TareaFilters>({
    pagina: 1,
    limite: 10,
  });
  const [busqueda, setBusqueda] = useState<string>("");

  const navigate = useNavigate();
  const { user } = useAuth();

  const puedeCrear =
    user?.tipo === "ADMIN" ||
    user?.tipo === "DOCENTE" ||
    user?.tipo === "RECTOR" ||
    user?.tipo === "COORDINADOR";

  useEffect(() => {
    cargarTareas();
  }, [filtros]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CORRECCIÓN: Solo agregar parámetros si tienen valor
      const params: any = {
        pagina: filtros.pagina || 1,
        limite: filtros.limite || 10,
      };

      // Solo agregar si tienen valor (no strings vacíos)
      if (filtros.estado) {
        params.estado = filtros.estado;
      }
      if (filtros.prioridad) {
        params.prioridad = filtros.prioridad;
      }
      if (filtros.busqueda) {
        params.busqueda = filtros.busqueda;
      }

      const response = await tareaService.listarTareas(params);
      setTareas(response.data || []);
      setTotalPaginas(response.meta?.paginas || 1);
      setLoading(false);
    } catch (err: any) {
      console.error("Error al cargar tareas:", err);
      setError(
        err.response?.data?.message ||
          "No se pudieron cargar las tareas. Intente nuevamente."
      );
      setLoading(false);
    }
  };

  const handleBuscar = () => {
    setFiltros({
      ...filtros,
      busqueda: busqueda.trim() || undefined,
      pagina: 1,
    });
  };

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setFiltros({
      pagina: 1,
      limite: 10,
    });
  };

  const handleCambiarPagina = (_event: React.ChangeEvent<unknown>, page: number) => {
    setFiltros({ ...filtros, pagina: page });
    window.scrollTo(0, 0);
  };

  if (loading && tareas.length === 0) {
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
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestión de Tareas
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra las tareas asignadas a tus cursos
          </Typography>
        </Box>
        {puedeCrear && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/tareas/nuevo"
          >
            Nueva Tarea
          </Button>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar por título o descripción..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleBuscar();
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Estado"
              value={filtros.estado || ""}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  estado: e.target.value as any,
                  pagina: 1,
                })
              }
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="ACTIVA">Activa</MenuItem>
              <MenuItem value="CERRADA">Cerrada</MenuItem>
              <MenuItem value="CANCELADA">Cancelada</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Prioridad"
              value={filtros.prioridad || ""}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  prioridad: e.target.value as any,
                  pagina: 1,
                })
              }
            >
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="ALTA">Alta</MenuItem>
              <MenuItem value="MEDIA">Media</MenuItem>
              <MenuItem value="BAJA">Baja</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<SearchIcon />}
                onClick={handleBuscar}
              >
                Buscar
              </Button>
            </Box>
          </Grid>
        </Grid>

        {(filtros.busqueda || filtros.estado || filtros.prioridad) && (
          <Button
            size="small"
            onClick={handleLimpiarFiltros}
            sx={{ mt: 1 }}
          >
            Limpiar filtros
          </Button>
        )}
      </Box>

      {/* Lista de tareas */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : tareas.length === 0 ? (
        <Alert severity="info">
          No se encontraron tareas. {puedeCrear && "¡Crea tu primera tarea!"}
        </Alert>
      ) : (
        <>
          {tareas.map((tarea) => (
            <TarjetaTarea key={tarea._id} tarea={tarea} mostrarDocente={false} />
          ))}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPaginas}
                page={filtros.pagina || 1}
                onChange={handleCambiarPagina}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ListaTareas;