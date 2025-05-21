// src/pages/cursos/AgregarAsignaturaCurso.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack,
  Save,
  MenuBook,
  Add,
  Search,
  Delete,
  Class,
  Refresh,
} from "@mui/icons-material";
import cursoService from "../../services/cursoService";
import asignaturaService from "../../services/asignaturaService";
import axiosInstance from "../../api/axiosConfig";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import AgregarAsignaturaDirecta from "./AgregarAsignaturaDirecta";

// Interfaces
interface Asignatura {
  _id: string;
  nombre: string;
  codigo?: string;
  creditos?: number;
  descripcion?: string;
  intensidadHoraria?: number;
  intensidad_horaria?: number;
  periodos?: any[];
  cursoId?: any;
  docenteId?: string;
  docente?: any;
}

interface Docente {
  _id: string;
  nombre: string;
  apellidos: string;
  tipo: string;
}

interface AsignaturaSeleccionada {
  asignaturaId: string;
  docenteId: string;
  nombre: string;
  codigo?: string;
  creditos?: number;
  descripcion?: string;
  intensidadHoraria?: number;
  docenteNombre?: string;
}

interface CursoBasico {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
  año_academico: string;
}

const AgregarAsignaturaCurso = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [curso, setCurso] = useState<CursoBasico | null>(null);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState<
    AsignaturaSeleccionada[]
  >([]);
  const [asignaturaActual, setAsignaturaActual] = useState<Asignatura | null>(
    null
  );
  const [docenteActual, setDocenteActual] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showNewAsignaturaForm, setShowNewAsignaturaForm] =
    useState<boolean>(false);

  useEffect(() => {
    if (id) {
      console.log(`Cargando datos para el curso ${id}`);

      // Limpiar estados
      setAsignaturas([]);
      setAsignaturasSeleccionadas([]);
      setAsignaturaActual(null);
      setDocenteActual("");

      // Cargar datos
      cargarCurso();
      cargarAsignaturas();
      cargarAsignaturasDelCurso(); // Añadir esta línea
      cargarDocentes();
    }

    return () => {
      // Limpiar estados al desmontar
      setAsignaturas([]);
      setAsignaturasSeleccionadas([]);
    };
  }, [id]);

  const cargarCurso = async () => {
    if (!id) return;

    try {
      const response = await cursoService.obtenerCurso(id);

      if (response?.success) {
        setCurso(response.data);
      } else {
        throw new Error("Error al cargar curso");
      }
    } catch (err: any) {
      console.error("Error al cargar curso:", err);
      setError(
        err.response?.data?.message ||
          "No se pudo cargar la información del curso"
      );
    }
  };

  // Función para filtrar asignaturas duplicadas
  const filtrarAsignaturasDuplicadas = (
    asignaturas: Asignatura[]
  ): Asignatura[] => {
    // Eliminar duplicados usando un Map con _id como clave
    const uniqueAsignaturas = new Map<string, Asignatura>();

    asignaturas.forEach((asignatura) => {
      if (!uniqueAsignaturas.has(asignatura._id)) {
        uniqueAsignaturas.set(asignatura._id, asignatura);
      }
    });

    return Array.from(uniqueAsignaturas.values());
  };

  const cargarAsignaturas = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(
        `Iniciando carga de asignaturas disponibles para curso ID: ${id}`
      );

      // PASO 1: Obtener todas las asignaturas
      const response = await axiosInstance.get("/api/asignaturas");

      if (response.data?.success) {
        const todasAsignaturas = response.data.data || [];
        console.log(
          `Total de asignaturas en la escuela: ${todasAsignaturas.length}`
        );

        // PASO 2: Obtener asignaturas que ya están asignadas al curso
        const responseCurso = await axiosInstance.get(
          `/api/asignaturas/curso/${id}`
        );
        const asignaturasCurso = responseCurso.data?.success
          ? responseCurso.data.data || []
          : [];
        console.log(
          `Asignaturas ya asignadas al curso: ${asignaturasCurso.length}`
        );

        // PASO 3: Crear un conjunto con los IDs de asignaturas ya en el curso
        const idsAsignados = new Set();
        asignaturasCurso.forEach((asig: any) => idsAsignados.add(asig._id));

        // PASO 4: Filtrar para quedarnos solo con las asignaturas NO asignadas
        const asignaturasDisponibles = todasAsignaturas.filter(
          (asig: any) => !idsAsignados.has(asig._id)
        );
        console.log(
          `Asignaturas disponibles para asignar: ${asignaturasDisponibles.length}`
        );

        setAsignaturas(asignaturasDisponibles);
      } else {
        throw new Error("Error al obtener asignaturas");
      }
    } catch (err: any) {
      console.error("Error en cargarAsignaturas:", err);
      setError(
        err.response?.data?.message || "No se pudieron cargar las asignaturas"
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarAsignaturasDelCurso = async () => {
    try {
      if (!id) return;

      console.log(`Cargando asignaturas asignadas al curso ${id}`);

      const response = await axiosInstance.get(`/api/asignaturas/curso/${id}`);

      if (response.data?.success) {
        const asignaturasAsignadas = response.data.data || [];
        console.log(
          `Encontradas ${asignaturasAsignadas.length} asignaturas asignadas a este curso`
        );

        // Transformar los datos al formato necesario para asignaturasSeleccionadas
        const asignaturasFormateadas = await Promise.all(
          asignaturasAsignadas.map(async (asignatura: any) => {
            // Para cada asignatura, necesitamos el nombre del docente
            let docenteNombre = "No asignado";

            if (asignatura.docenteId) {
              try {
                // Intentar obtener información del docente si no está incluida
                if (
                  !asignatura.docente ||
                  typeof asignatura.docente === "string"
                ) {
                  const docenteResponse = await axiosInstance.get(
                    `/api/usuarios/${asignatura.docenteId}`
                  );
                  if (docenteResponse.data?.success) {
                    const docente = docenteResponse.data.data;
                    docenteNombre = `${docente.nombre} ${docente.apellidos}`;
                  }
                } else if (typeof asignatura.docente === "object") {
                  // Si ya tenemos la información del docente
                  docenteNombre = `${asignatura.docente.nombre} ${asignatura.docente.apellidos}`;
                }
              } catch (err) {
                console.error(
                  `Error al obtener información del docente ${asignatura.docenteId}:`,
                  err
                );
              }
            }

            return {
              asignaturaId: asignatura._id,
              docenteId: asignatura.docenteId || "",
              nombre: asignatura.nombre,
              codigo: asignatura.codigo || "",
              creditos: asignatura.creditos || 0,
              descripcion: asignatura.descripcion || "",
              intensidadHoraria:
                asignatura.intensidad_horaria ||
                asignatura.intensidadHoraria ||
                0,
              docenteNombre: docenteNombre,
            };
          })
        );

        console.log(
          "Asignaturas formateadas para el panel derecho:",
          asignaturasFormateadas
        );
        setAsignaturasSeleccionadas(asignaturasFormateadas);
      }
    } catch (err) {
      console.error("Error al cargar asignaturas del curso:", err);
    }
  };

  const cargarDocentes = async () => {
    try {
      const response = await axiosInstance.get("/api/usuarios", {
        params: { tipo: "DOCENTE" },
      });

      if (response.data?.success) {
        // Filtrar solo usuarios con tipo DOCENTE
        const docentesFiltrados = (response.data.data || []).filter(
          (usuario: Docente) => usuario.tipo === "DOCENTE"
        );
        setDocentes(docentesFiltrados);
      }
    } catch (err: any) {
      console.error("Error al cargar docentes:", err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddAsignatura = () => {
    if (asignaturaActual && docenteActual) {
      // Verificar si la asignatura ya está seleccionada
      if (
        !asignaturasSeleccionadas.some(
          (a: AsignaturaSeleccionada) => a.asignaturaId === asignaturaActual._id
        )
      ) {
        const docenteSeleccionado = docentes.find(
          (d) => d._id === docenteActual
        );

        setAsignaturasSeleccionadas([
          ...asignaturasSeleccionadas,
          {
            asignaturaId: asignaturaActual._id,
            docenteId: docenteActual,
            nombre: asignaturaActual.nombre,
            descripcion: asignaturaActual.descripcion,
            intensidadHoraria:
              asignaturaActual.intensidadHoraria ||
              asignaturaActual.intensidad_horaria,
            docenteNombre: docenteSeleccionado
              ? `${docenteSeleccionado.nombre} ${docenteSeleccionado.apellidos}`
              : undefined,
          },
        ]);
      }
      setAsignaturaActual(null);
      setDocenteActual("");
    }
  };

  const handleRemoveAsignatura = (asignaturaId: string) => {
    setAsignaturasSeleccionadas(
      asignaturasSeleccionadas.filter(
        (a: AsignaturaSeleccionada) => a.asignaturaId !== asignaturaId
      )
    );
  };

  const handleGuardar = async () => {
    if (!id || asignaturasSeleccionadas.length === 0) return;

    try {
      setSavingLoading(true);
      setError(null);
      setSuccess(null);

      // Contador de éxitos
      let exitosos = 0;
      let errores = 0;

      // Procesar una asignatura a la vez
      for (const asignatura of asignaturasSeleccionadas) {
        try {
          console.log(
            `Asignando asignatura ${asignatura.asignaturaId} al curso ${id}`
          );

          // Asegurarnos de que se envían todos los datos necesarios
          const payload = {
            cursoId: id,
            docenteId: asignatura.docenteId,
          };

          // Actualizar la asignatura directamente para asignarle el curso y el docente
          const response = await asignaturaService.actualizarAsignatura(
            asignatura.asignaturaId,
            payload
          );

          if (response.success) {
            exitosos++;
          } else {
            errores++;
            console.warn("Respuesta inesperada del servidor:", response);
          }
        } catch (asignaturaError) {
          errores++;
          console.error(
            `Error asignando asignatura ${asignatura.asignaturaId}:`,
            asignaturaError
          );
        }
      }

      // Determinar mensaje apropiado basado en resultados
      if (exitosos > 0) {
        setSuccess(
          `${exitosos} asignatura(s) añadida(s) exitosamente al curso${
            errores > 0 ? ` (${errores} con errores)` : ""
          }`
        );
        setAsignaturasSeleccionadas([]);

        // Recargar la lista de asignaturas disponibles
        await cargarAsignaturas();
      } else {
        setError(
          `No se pudo agregar ninguna asignatura al curso. Por favor, intente de nuevo.`
        );
      }
    } catch (err) {
      console.error("Error general al añadir asignaturas:", err);
      setError("Error al procesar la solicitud. Por favor, intente de nuevo.");
    } finally {
      setSavingLoading(false);
    }
  };

  // Filtrar asignaturas por término de búsqueda
  const asignaturasFiltradas = asignaturas.filter((asignatura) =>
    asignatura.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función para obtener información del curso
  const getInfoCurso = (asignatura: Asignatura): string => {
    if (asignatura.cursoId) {
      const cursoInfo = asignatura.cursoId;
      if (typeof cursoInfo === "object") {
        return `${cursoInfo.nombre || ""} - ${cursoInfo.grado || ""} ${
          cursoInfo.grupo || ""
        }`.trim();
      }
    }
    return "";
  };

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/cursos/${id}`)}
          sx={{
            mr: 2,
            borderRadius: 20,
            borderColor: "rgba(0, 0, 0, 0.12)",
            color: "text.secondary",
          }}
        >
          Volver
        </Button>
        <Typography variant="h1" color="primary.main">
          Agregar Asignaturas al Curso
        </Typography>
      </Box>

      {curso && (
        <Typography variant="h3" color="text.secondary" gutterBottom>
          {curso.nombre} ({curso.grado}° {curso.grupo} - {curso.año_academico})
        </Typography>
      )}

      {/* Alertas */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontWeight: 500,
            },
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2,
            "& .MuiAlert-message": {
              fontWeight: 500,
            },
          }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Panel de búsqueda/creación */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ bgcolor: "primary.main", color: "white", px: 3, py: 2 }}>
              <Typography variant="h3">
                {showNewAsignaturaForm
                  ? "Nueva Asignatura"
                  : "Buscar Asignaturas"}
              </Typography>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1 }}>
              {!showNewAsignaturaForm ? (
                // Búsqueda de asignaturas existentes
                <>
                  <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                    <Autocomplete
                      fullWidth
                      options={asignaturasFiltradas}
                      getOptionLabel={(option) => option.nombre}
                      value={asignaturaActual}
                      onChange={(_event, newValue) => {
                        setAsignaturaActual(newValue);
                      }}
                      getOptionKey={(option) => option._id}
                      renderOption={(props, option) => (
                        <li {...props} key={option._id}>
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                            }}
                          >
                            <Typography variant="body1" fontWeight={500}>
                              {option.nombre}
                            </Typography>
                            {getInfoCurso(option) && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {getInfoCurso(option)}
                              </Typography>
                            )}
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Buscar asignatura"
                          variant="outlined"
                          onChange={handleSearchChange}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <Search color="action" sx={{ mr: 1 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                            sx: { borderRadius: 2 },
                          }}
                        />
                      )}
                    />
                  </Box>

                  {/* Botón de recarga - NUEVO */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      mt: 2,
                      mb: 2,
                    }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={() => cargarAsignaturas()}
                      disabled={loading}
                    >
                      Recargar asignaturas
                    </Button>
                  </Box>

                  {asignaturaActual && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          p: 2,
                          mb: 2,
                          bgcolor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: 2,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={500}
                          gutterBottom
                        >
                          Detalles de la asignatura
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={12}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Nombre:
                            </Typography>
                            <Typography variant="body2">
                              {asignaturaActual.nombre}
                            </Typography>
                          </Grid>
                          {getInfoCurso(asignaturaActual) && (
                            <Grid item xs={12}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Curso actual:
                              </Typography>
                              <Typography variant="body2">
                                {getInfoCurso(asignaturaActual)}
                              </Typography>
                            </Grid>
                          )}
                          {(asignaturaActual.intensidadHoraria ||
                            asignaturaActual.intensidad_horaria) && (
                            <Grid item xs={12}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Intensidad horaria:
                              </Typography>
                              <Typography variant="body2">
                                {asignaturaActual.intensidadHoraria ||
                                  asignaturaActual.intensidad_horaria}{" "}
                                h/semana
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </Box>

                      <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel id="docente-label">
                          Asignar Docente
                        </InputLabel>
                        <Select
                          labelId="docente-label"
                          value={docenteActual}
                          onChange={(e) => setDocenteActual(e.target.value)}
                          label="Asignar Docente"
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="">
                            <em>Seleccione un docente</em>
                          </MenuItem>
                          {docentes.map((docente) => (
                            <MenuItem key={docente._id} value={docente._id}>
                              {docente.nombre} {docente.apellidos}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        startIcon={<Add />}
                        onClick={handleAddAsignatura}
                        disabled={!docenteActual}
                        sx={{
                          borderRadius: 20,
                          fontWeight: 500,
                          boxShadow: "none",
                          "&:hover": {
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                          },
                        }}
                      >
                        Agregar Asignatura
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      gutterBottom
                    >
                      ¿No encuentras la asignatura que buscas?
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => setShowNewAsignaturaForm(true)}
                      sx={{
                        borderRadius: 20,
                      }}
                    >
                      Crear Nueva Asignatura
                    </Button>
                  </Box>

                  {loading && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", my: 3 }}
                    >
                      <CircularProgress />
                    </Box>
                  )}
                </>
              ) : (
                // Formulario alternativo para crear nueva asignatura
                <AgregarAsignaturaDirecta
                  cursoId={id || ""}
                  escuelaId={user?.escuelaId || ""}
                  docentes={docentes}
                  onSuccess={(nuevaAsignatura) => {
                    // Buscar el docente seleccionado
                    const docenteSeleccionado = docentes.find(
                      (d) => d._id === nuevaAsignatura.docenteId
                    );

                    // Agregar la nueva asignatura a las seleccionadas
                    setAsignaturasSeleccionadas([
                      ...asignaturasSeleccionadas,
                      {
                        asignaturaId: nuevaAsignatura._id,
                        docenteId: nuevaAsignatura.docenteId,
                        nombre: nuevaAsignatura.nombre,
                        descripcion: nuevaAsignatura.descripcion,
                        intensidadHoraria: nuevaAsignatura.intensidadHoraria,
                        docenteNombre: docenteSeleccionado
                          ? `${docenteSeleccionado.nombre} ${docenteSeleccionado.apellidos}`
                          : "Docente seleccionado",
                      },
                    ]);

                    // Recargar asignaturas y cerrar el formulario
                    cargarAsignaturas();
                    setShowNewAsignaturaForm(false);
                    setSuccess("Asignatura creada y añadida exitosamente");
                  }}
                  onCancel={() => setShowNewAsignaturaForm(false)}
                />
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Panel de asignaturas seleccionadas */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{ bgcolor: "secondary.main", color: "white", px: 3, py: 2 }}
            >
              <Typography variant="h3">
                Asignaturas Seleccionadas ({asignaturasSeleccionadas.length})
              </Typography>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1 }}>
              {asignaturasSeleccionadas.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: "auto" }}>
                  <List>
                    {asignaturasSeleccionadas.map(
                      (asignatura: AsignaturaSeleccionada) => (
                        <ListItem
                          key={asignatura.asignaturaId}
                          sx={{
                            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
                            py: 2,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "secondary.main" }}>
                              <Class />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={asignatura.nombre}
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  Docente:{" "}
                                  {asignatura.docenteNombre || "Asignado"}
                                </Typography>
                              </>
                            }
                            primaryTypographyProps={{ fontWeight: 500 }}
                          />
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() =>
                              handleRemoveAsignatura(asignatura.asignaturaId)
                            }
                            sx={{
                              bgcolor: "rgba(244, 67, 54, 0.1)",
                              "&:hover": { bgcolor: "rgba(244, 67, 54, 0.2)" },
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </ListItem>
                      )
                    )}
                  </List>
                </Box>
              ) : (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2,
                    "& .MuiAlert-message": {
                      fontWeight: 500,
                    },
                  }}
                >
                  Seleccione asignaturas de la lista y asígneles un docente para
                  agregarlas al curso.
                </Alert>
              )}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleGuardar}
                  disabled={
                    asignaturasSeleccionadas.length === 0 || savingLoading
                  }
                  sx={{
                    borderRadius: 20,
                    fontWeight: 500,
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  {savingLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Guardar"
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgregarAsignaturaCurso;
