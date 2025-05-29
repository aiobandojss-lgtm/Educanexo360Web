// src/components/RegistroPublico/BuscarEstudianteExistente.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Alert,
  CircularProgress,
  Chip,
  Grid,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import registroService, {
  EstudianteExistentePublico,
  BusquedaEstudiantesParams,
} from "../../services/registroService";

interface BuscarEstudianteExistenteProps {
  open: boolean;
  onClose: () => void;
  onSeleccionar: (estudiante: EstudianteExistentePublico) => void;
  codigoInvitacion: string;
  estudiantesYaSeleccionados?: string[]; // IDs de estudiantes ya seleccionados
}

const BuscarEstudianteExistente: React.FC<BuscarEstudianteExistenteProps> = ({
  open,
  onClose,
  onSeleccionar,
  codigoInvitacion,
  estudiantesYaSeleccionados = [],
}) => {
  // Estados para búsqueda
  const [criteriosBusqueda, setCriteriosBusqueda] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    codigo_estudiante: "",
  });

  // Estados de resultados
  const [estudiantes, setEstudiantes] = useState<EstudianteExistentePublico[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  // Limpiar estados al abrir/cerrar el diálogo
  useEffect(() => {
    if (open) {
      setCriteriosBusqueda({
        nombre: "",
        apellidos: "",
        email: "",
        codigo_estudiante: "",
      });
      setEstudiantes([]);
      setBusquedaRealizada(false);
      setError(null);
    }
  }, [open]);

  // Función de búsqueda
  const realizarBusqueda = async () => {
    // Validar que al menos un criterio esté lleno
    const criteriosLlenos = Object.values(criteriosBusqueda).some(
      (valor) => valor.trim() !== ""
    );

    if (!criteriosLlenos) {
      setError("Ingrese al menos un criterio de búsqueda");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: BusquedaEstudiantesParams = {
        codigoInvitacion,
        ...criteriosBusqueda,
      };

      const resultados = await registroService.buscarEstudiantesExistentes(
        params
      );

      // Filtrar estudiantes ya seleccionados
      const estudiantesFiltrados = resultados.filter(
        (est) => !estudiantesYaSeleccionados.includes(est._id)
      );

      setEstudiantes(estudiantesFiltrados);
      setBusquedaRealizada(true);

      if (estudiantesFiltrados.length === 0) {
        setError(
          "No se encontraron estudiantes con los criterios especificados"
        );
      }
    } catch (err: any) {
      console.error("Error en búsqueda:", err);
      setError("Error al buscar estudiantes. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en criterios de búsqueda
  const handleCriterioChange = (campo: string, valor: string) => {
    setCriteriosBusqueda((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    // Limpiar error si el usuario empieza a escribir
    if (error && valor.trim()) {
      setError(null);
    }
  };

  // Manejar selección de estudiante
  const handleSeleccionar = (estudiante: EstudianteExistentePublico) => {
    onSeleccionar(estudiante);
    onClose();
  };

  // Función para presionar Enter en los campos de búsqueda
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      realizarBusqueda();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "60vh", maxHeight: "80vh" },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchIcon sx={{ mr: 1 }} />
          Buscar Estudiante Existente
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" paragraph>
          Busque estudiantes que ya estén registrados en el sistema para
          asociarlos como acudiente adicional.
        </Typography>

        {/* Formulario de búsqueda */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Criterios de Búsqueda
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nombre"
                fullWidth
                value={criteriosBusqueda.nombre}
                onChange={(e) => handleCriterioChange("nombre", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Ej: Juan"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Apellidos"
                fullWidth
                value={criteriosBusqueda.apellidos}
                onChange={(e) =>
                  handleCriterioChange("apellidos", e.target.value)
                }
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Ej: Pérez García"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Correo Electrónico"
                fullWidth
                type="email"
                value={criteriosBusqueda.email}
                onChange={(e) => handleCriterioChange("email", e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Ej: juan.perez@correo.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Código de Estudiante"
                fullWidth
                value={criteriosBusqueda.codigo_estudiante}
                onChange={(e) =>
                  handleCriterioChange("codigo_estudiante", e.target.value)
                }
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Ej: EST2024001"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={
                loading ? <CircularProgress size={20} /> : <SearchIcon />
              }
              onClick={realizarBusqueda}
              disabled={loading}
              size="large"
            >
              {loading ? "Buscando..." : "Buscar Estudiantes"}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Mensajes de error */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Resultados de búsqueda */}
        {busquedaRealizada && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Resultados de Búsqueda ({estudiantes.length})
            </Typography>

            {estudiantes.length === 0 ? (
              <Alert severity="info">
                No se encontraron estudiantes con los criterios especificados.
                Intente con criterios diferentes o{" "}
                <strong>cree un nuevo estudiante</strong> en el formulario.
              </Alert>
            ) : (
              <List sx={{ maxHeight: "300px", overflow: "auto" }}>
                {estudiantes.map((estudiante) => (
                  <ListItem key={estudiante._id} divider>
                    <ListItemButton
                      onClick={() => handleSeleccionar(estudiante)}
                      sx={{
                        borderRadius: 1,
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                            <Typography variant="subtitle1" fontWeight="medium">
                              {estudiante.nombre} {estudiante.apellidos}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {estudiante.codigo_estudiante && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                <strong>Código:</strong>{" "}
                                {estudiante.codigo_estudiante}
                              </Typography>
                            )}

                            {estudiante.curso && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 0.5,
                                }}
                              >
                                <SchoolIcon
                                  sx={{
                                    mr: 0.5,
                                    fontSize: 16,
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {estudiante.curso.nombre} -{" "}
                                  {estudiante.curso.grado}°{" "}
                                  {estudiante.curso.grupo}
                                </Typography>
                              </Box>
                            )}

                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mt: 1,
                              }}
                            >
                              <GroupIcon
                                sx={{
                                  mr: 0.5,
                                  fontSize: 16,
                                  color: "text.secondary",
                                }}
                              />
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mr: 1 }}
                              >
                                {estudiante.numeroAcudientes} acudiente(s)
                                actual(es)
                              </Typography>

                              {estudiante.tieneAcudientes && (
                                <Chip
                                  label="Tiene acudientes"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuscarEstudianteExistente;
