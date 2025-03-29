// src/pages/cursos/AgregarAsignaturaDirecta.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
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
  SelectChangeEvent
} from '@mui/material';
import axiosInstance from '../../api/axiosConfig';

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
  intensidadHoraria: number;
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
const AgregarAsignaturaDirecta: React.FC<AsignaturaDirectaProps> = ({ cursoId, escuelaId, docentes, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    codigo: '',
    creditos: 3,
    intensidadHoraria: 4,
    descripcion: 'Descripción de la asignatura',
    docenteId: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Crea un array de periodos con porcentajes iguales (25% cada uno)
  const crearPeriodos = () => {
    // Fechas aproximadas para los periodos
    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    
    // Crear 4 periodos estándar con porcentajes iguales (25% cada uno)
    return [
      {
        numero: 1,
        nombre: "Primer Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 0, 1), // 1 de enero
        fecha_fin: new Date(año, 2, 31)    // 31 de marzo
      },
      {
        numero: 2,
        nombre: "Segundo Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 3, 1),  // 1 de abril
        fecha_fin: new Date(año, 5, 30)     // 30 de junio
      },
      {
        numero: 3,
        nombre: "Tercer Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 6, 1),  // 1 de julio
        fecha_fin: new Date(año, 8, 30)     // 30 de septiembre
      },
      {
        numero: 4,
        nombre: "Cuarto Periodo",
        porcentaje: 25,
        fecha_inicio: new Date(año, 9, 1),  // 1 de octubre
        fecha_fin: new Date(año, 11, 31)    // 31 de diciembre
      }
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
        // Importante: el campo en el backend usa guion bajo
        intensidad_horaria: Number(formData.intensidadHoraria),
        // Creamos los periodos con porcentajes iguales (25% cada uno)
        periodos: crearPeriodos()
      };

      console.log('Enviando datos al servidor:', payload);
      const response = await axiosInstance.post('/asignaturas', payload);
      
      if (response.data?.success) {
        console.log('Asignatura creada exitosamente, respuesta completa:', response.data);
        
        // IMPORTANTE: Crear un objeto con los datos que necesitamos en formato correcto
        // En lugar de depender de la estructura exacta de la respuesta
        const nuevaAsignatura = {
          _id: response.data.data._id,
          nombre: response.data.data.nombre,
          codigo: response.data.data.codigo,
          // Usamos el valor original del formulario para asegurar exactitud
          creditos: Number(formData.creditos),
          descripcion: response.data.data.descripcion || formData.descripcion,
          intensidadHoraria: Number(formData.intensidadHoraria),
          docenteId: formData.docenteId
        };
        
        console.log('Datos de asignatura formateados para el frontend:', nuevaAsignatura);
        onSuccess(nuevaAsignatura);
      } else {
        setError('La operación fue exitosa pero no se recibió confirmación');
      }
    } catch (err: any) {
      console.error('Error completo:', err);
      if (err.response?.data?.message) {
        setError(`Error del servidor: ${err.response.data.message}`);
      } else {
        setError('Error al crear la asignatura');
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
              name="intensidadHoraria"
              type="number"
              value={formData.intensidadHoraria}
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
                onChange={handleChange}
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
              La asignatura se creará con 4 periodos académicos con una distribución equitativa del 25% cada uno.
            </Alert>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                {loading ? <CircularProgress size={24} /> : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AgregarAsignaturaDirecta;