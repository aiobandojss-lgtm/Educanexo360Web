// src/pages/escuelas/FormularioEscuela.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useNotificacion } from '../../components/common/Notificaciones';

// Esquema de validación con Yup
const EscuelaSchema = Yup.object().shape({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  direccion: Yup.string()
    .required('La dirección es requerida')
    .max(200, 'La dirección no puede superar los 200 caracteres'),
  ciudad: Yup.string()
    .required('La ciudad es requerida')
    .max(100, 'La ciudad no puede superar los 100 caracteres'),
  telefono: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^[0-9+() -]{8,15}$/, 'Formato de teléfono inválido'),
  email: Yup.string()
    .required('El email es requerido')
    .email('Email inválido'),
  director: Yup.string()
    .required('El nombre del director es requerido')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  estado: Yup.string()
    .required('El estado es requerido')
    .oneOf(['ACTIVO', 'INACTIVO'], 'Estado inválido'),
});

// Valores iniciales
const initialValues = {
  nombre: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  email: '',
  director: '',
  estado: 'ACTIVO',
};

const FormularioEscuela = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mostrarNotificacion } = useNotificacion();
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [escuela, setEscuela] = useState(initialValues);
  const [error, setError] = useState<string | null>(null);
  
  const esEdicion = !!id;
  
  // Cargar datos de la escuela si estamos en modo edición
  useEffect(() => {
    if (esEdicion) {
      cargarEscuela();
    }
  }, [id]);
  
  const cargarEscuela = async () => {
    try {
      setLoadingData(true);
      setError(null);
      
      const response = await axiosInstance.get(`/escuelas/${id}`);
      const escuelaData = response.data.data;
      
      setEscuela({
        nombre: escuelaData.nombre || '',
        direccion: escuelaData.direccion || '',
        ciudad: escuelaData.ciudad || '',
        telefono: escuelaData.telefono || '',
        email: escuelaData.email || '',
        director: escuelaData.director || '',
        estado: escuelaData.estado || 'ACTIVO',
      });
      
    } catch (err: any) {
      console.error('Error al cargar escuela:', err);
      setError('No se pudo cargar la información de la escuela. ' + (err.response?.data?.message || 'Error del servidor'));
    } finally {
      setLoadingData(false);
    }
  };
  
  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      setLoading(true);
      setError(null);
      
      if (esEdicion) {
        // Actualizar escuela existente
        await axiosInstance.put(`/escuelas/${id}`, values);
        mostrarNotificacion('Escuela actualizada exitosamente', 'success');
      } else {
        // Crear nueva escuela
        await axiosInstance.post('/escuelas', values);
        mostrarNotificacion('Escuela creada exitosamente', 'success');
      }
      
      // Redirigir a la lista de escuelas
      navigate('/escuelas');
      
    } catch (err: any) {
      console.error('Error al guardar escuela:', err);
      setError('Error al guardar la escuela: ' + (err.response?.data?.message || 'Error del servidor'));
      mostrarNotificacion('Error al guardar la escuela', 'error');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  if (loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate('/escuelas')} 
          sx={{ mr: 2, bgcolor: 'rgba(0, 0, 0, 0.04)' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" color="primary.main">
          {esEdicion ? 'Editar Escuela' : 'Nueva Escuela'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={0} sx={{ p: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Formik
          initialValues={esEdicion ? escuela : initialValues}
          validationSchema={EscuelaSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, handleChange, setFieldValue }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h3" color="primary.main">
                      Información de la Escuela
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                {/* Nombre de la escuela */}
                <Grid item xs={12} md={8}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="nombre"
                    label="Nombre de la Escuela *"
                    variant="outlined"
                    error={touched.nombre && Boolean(errors.nombre)}
                    helperText={touched.nombre && errors.nombre}
                  />
                </Grid>
                
                {/* Estado */}
                <Grid item xs={12} md={4}>
                  <FormControl 
                    fullWidth 
                    error={touched.estado && Boolean(errors.estado)}
                    variant="outlined"
                  >
                    <InputLabel id="estado-label">Estado *</InputLabel>
                    <Select
                      labelId="estado-label"
                      id="estado"
                      name="estado"
                      value={values.estado}
                      onChange={handleChange}
                      label="Estado *"
                    >
                      <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                      <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                    </Select>
                    <FormHelperText>{touched.estado && errors.estado}</FormHelperText>
                  </FormControl>
                </Grid>
                
                {/* Dirección */}
                <Grid item xs={12} md={8}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="direccion"
                    label="Dirección *"
                    variant="outlined"
                    error={touched.direccion && Boolean(errors.direccion)}
                    helperText={touched.direccion && errors.direccion}
                  />
                </Grid>
                
                {/* Ciudad */}
                <Grid item xs={12} md={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="ciudad"
                    label="Ciudad *"
                    variant="outlined"
                    error={touched.ciudad && Boolean(errors.ciudad)}
                    helperText={touched.ciudad && errors.ciudad}
                  />
                </Grid>
                
                {/* Teléfono */}
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="telefono"
                    label="Teléfono *"
                    variant="outlined"
                    error={touched.telefono && Boolean(errors.telefono)}
                    helperText={touched.telefono && errors.telefono}
                  />
                </Grid>
                
                {/* Email */}
                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="email"
                    label="Email *"
                    variant="outlined"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                
                {/* Director */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="director"
                    label="Nombre del Director *"
                    variant="outlined"
                    error={touched.director && Boolean(errors.director)}
                    helperText={touched.director && errors.director}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => navigate('/escuelas')}
                      disabled={isSubmitting || loading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting || loading}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        esEdicion ? 'Actualizar Escuela' : 'Crear Escuela'
                      )}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default FormularioEscuela;