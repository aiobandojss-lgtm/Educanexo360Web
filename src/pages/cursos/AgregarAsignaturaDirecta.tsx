// src/pages/cursos/AgregarAsignaturaDirecta.tsx
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from "@mui/material";
import axiosInstance from "../../api/axiosConfig";

// Interfaces para tipar correctamente
interface Docente {
  _id: string;
  nombre: string;
  apellidos: string;
  tipo: string;
}

interface FormData {
  nombre: string;
  codigo: string;
  creditos: number;
  intensidad_horaria: number; // Cambiado para coincidir con backend
  descripcion: string;
  docenteId: string;
}

interface AsignaturaDirectaProps {
  cursoId: string;
  escuelaId: string;
  docentes: Docente[];
  onSuccess: (nuevaAsignatura: any) => void;
  onCancel: () => void;
}

// Este es un componente simplificado para crear asignaturas
const AgregarAsignaturaDirecta: React.FC<AsignaturaDirectaProps> = ({
  cursoId,
  escuelaId,
  docentes,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    codigo: "",
    creditos: 3,
    intensidad_horaria: 4, // Nombre ajustado para coincidir con el backend
    descripcion: "Descripción de la asignatura",
    docenteId: "",
  });

  // Obtener año académico actual para los periodos
  const [periodoActual, setPeriodoActual] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    // Opcionalmente obtener el año académico del curso
    const obtenerAñoAcademico = async () => {
      try {
        if (!cursoId) return;
        const response = await axiosInstance.get(`/cursos/${cursoId}`);
        if (response.data?.success && response.data.data?.año_academico) {
          // Si el año académico está en formato "2025-2026", tomar el primero
          const año = response.data.data.año_academico.split("-")[0];
          if (año && !isNaN(parseInt(año))) {
            setPeriodoActual(parseInt(año));
          }
        }
      } catch (err) {
        console.error("Error al obtener año académico:", err);
      }
    };

    obtenerAñoAcademico();
  }, [cursoId]);

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Crea un array de periodos con porcentajes iguales (25% cada uno)
  const crearPeriodos = () => {
    // Usar el año académico obtenido del curso
    const año = periodoActual;

    // Crear 4 periodos estándar con porcentajes iguales (25% cada uno)
    return [
      {
        numero: 1,
        nombre: "Primer Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 0, 1), // 1 de enero
        fecha_fin: new Date(año, 2, 31), // 31 de marzo
      },
      {
        numero: 2,
        nombre: "Segundo Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 3, 1), // 1 de abril
        fecha_fin: new Date(año, 5, 30), // 30 de junio
      },
      {
        numero: 3,
        nombre: "Tercer Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 6, 1), // 1 de julio
        fecha_fin: new Date(año, 8, 30), // 30 de septiembre
      },
      {
        numero: 4,
        nombre: "Cuarto Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 9, 1), // 1 de octubre
        fecha_fin: new Date(año, 11, 31), // 31 de diciembre
      },
    ];
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.nombre || !formData.codigo || !formData.docenteId) {
        setError("Por favor complete todos los campos requeridos");
        setLoading(false);
        return;
      }

      // Adaptamos los datos al formato que espera el backend
      const payload = {
        nombre: formData.nombre,
        codigo: formData.codigo,
        creditos: Number(formData.creditos),
        descripcion: formData.descripcion,
        docenteId: formData.docenteId,
        cursoId: cursoId,
        escuelaId: escuelaId,
        // IMPORTANTE: asegurar que usamos intensidad_horaria (no intensidadHoraria)
        intensidad_horaria: Number(formData.intensidad_horaria),
        // Creamos los periodos con porcentajes iguales (25% cada uno)
        periodos: crearPeriodos(),
      };

      console.log("Enviando datos al servidor:", payload);
      const response = await axiosInstance.post("/asignaturas", payload);

      if (response.data?.success) {
        console.log("Asignatura creada exitosamente:", response.data);

        // Buscar el docente seleccionado
        const docenteSeleccionado = docentes.find(
          (d) => d._id === formData.docenteId
        );

        // IMPORTANTE: Crear un objeto con los datos en formato consistente
        const nuevaAsignatura = {
          _id: response.data.data._id,
          nombre: response.data.data.nombre,
          codigo: response.data.data.codigo || formData.codigo,
          creditos: Number(formData.creditos),
          descripcion: response.data.data.descripcion || formData.descripcion,
          // Incluir ambos formatos para garantizar compatibilidad
          intensidadHoraria: Number(formData.intensidad_horaria),
          intensidad_horaria: Number(formData.intensidad_horaria),
          docenteId: formData.docenteId,
          // Añadir información del docente para visualización inmediata
          docente: docenteSeleccionado || {
            _id: formData.docenteId,
            nombre: "Docente",
            apellidos: "Asignado",
          },
        };

        onSuccess(nuevaAsignatura);
      } else {
        setError("La operación fue exitosa pero no se recibió confirmación");
      }
    } catch (err: any) {
      console.error("Error completo:", err);
      if (err.response?.data?.message) {
        setError(`Error del servidor: ${err.response.data.message}`);
      } else {
        setError("Error al crear la asignatura");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Nueva Asignatura
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre de la asignatura"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Código"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Créditos"
              name="creditos"
              type="number"
              value={formData.creditos}
              onChange={handleChange}
              required
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              multiline
              rows={2}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Intensidad Horaria"
              name="intensidad_horaria" // IMPORTANTE: Usar el mismo nombre que en el backend
              type="number"
              value={formData.intensidad_horaria}
              onChange={handleChange}
              required
              helperText="Número de horas semanales de clase"
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Docente</InputLabel>
              <Select
                name="docenteId"
                value={formData.docenteId}
                onChange={handleChange as any}
                label="Docente"
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
          </Grid>

          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 2 }}>
              La asignatura se creará con 4 periodos académicos (año{" "}
              {periodoActual}) con una distribución equitativa del 25% cada uno.
            </Alert>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={24} /> : "Guardar"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AgregarAsignaturaDirecta;
