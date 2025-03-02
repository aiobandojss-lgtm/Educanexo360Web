// src/pages/cursos/FormularioCurso.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  Autocomplete,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
} from '@mui/icons-material';
import cursoService, { Curso, CursoInput } from '../../services/cursoService';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaz para opciones de selección
interface DocenteOption {
  _id: string;
  nombre: string;
  apellidos: string;
}

// Esquema de validación
const cursoSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es requerido'),
  año_academico: Yup.string().required('El año académico es requerido'),
  grado: Yup.string().required('El grado es requerido'),
  grupo: Yup.string().required('El grupo es requerido'),
  director_grupo: Yup.string().required('El director de grupo es requerido'),
  estado: Yup.string().required('El estado es requerido'),
  escuelaId: Yup.string().required('La escuela es requerida'),
});

const FormularioCurso = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [docentes, setDocentes] = useState<DocenteOption[]>([]);
  const [escuelas, setEscuelas] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(id);

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 1, 
    currentYear, 
    currentYear + 1
  ];

  // Valores iniciales para el formulario
  const initialValues: CursoInput = {
    nombre: '',
    año_academico: currentYear.toString(),
    grado: '',
    grupo: '',
    director_grupo: '',
    estado: 'ACTIVO',
    escuelaId: user?.escuelaId || '',
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar docentes
        const docentesResponse = await axiosInstance.get('/usuarios', {
          params: { tipo: 'DOCENTE' }
        });
        
        if (docentesResponse.data?.success) {
          setDocentes(docentesResponse.data.data || []);
        }

        // Cargar escuelas
        const escuelasResponse = await axiosInstance.get('/escuelas');
        
        if (escuelasResponse.data?.success) {
          setEscuelas(escuelasResponse.data.data || []);
        }

        // Si estamos en modo edición, cargar datos del curso
        if (isEditMode && id) {
          const cursoResponse = await cursoService.obtenerCurso(id);
          
          if (cursoResponse?.success) {
            setCurso(cursoResponse.data);
          }
        }
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(
          err.response?.data?.message || 'No se pudieron cargar los datos. Intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, isEditMode, user]);

  const handleSubmit = async (values: CursoInput, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      setError(null);

      if (isEditMode && id) {
        // Actualizar curso existente
        await cursoService.actualizarCurso(id, values);
        navigate(`/cursos/${id}`, { state: { message: 'Curso actualizado exitosamente' } });
      } else {
        // Crear nuevo curso
        const response = await cursoService.crearCurso(values);
        navigate(`/cursos/${response.data._id}`, { state: { message: 'Curso creado exitosamente' } });
      }
    } catch (err: any) {
      console.error('Error al guardar curso:', err);
      setError(
        err.response?.data?.message || 'Ocurrió un error al guardar los datos. Intente nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Preparar valores iniciales para el formulario cuando estamos en modo edición
  const formValues = isEditMode && curso
    ? {
        ...initialValues,
        ...curso,
        director_grupo: typeof curso.director_grupo === 'object' && curso.director_grupo !== null
          ? curso.director_grupo._id
          : curso.director_grupo,
        escuelaId: typeof curso.escuelaId === 'object' && curso.escuelaId !== null
          ? curso.escuelaId._id
          : curso.escuelaId,
      }
    : initialValues;

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => isEditMode ? navigate(`/cursos/${id}`) : navigate('/cursos')}
          sx={{ 
            mr: 2,
            borderRadius: 20,
            borderColor: 'rgba(0, 0, 0, 0.12)',
            color: 'text.secondary'
          }}
        >
          Volver
        </Button>
        <Typography variant="h1" color="primary.main">
          {isEditMode ? 'Editar Curso' : 'Crear Curso'}
        </Typography>
      </Box>

      {/* Mensaje de error global */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Formulario */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
          <Typography variant="h3">
            {isEditMode ? 'Información del Curso' : 'Nuevo Curso'}
          </Typography>
        </Box>

        <Formik
          initialValues={formValues}
          validationSchema={cursoSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Datos básicos */}
                  <Grid item xs={12}>
                    <Typography variant="h3" color="primary.main" gutterBottom>
                      Datos Básicos
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="nombre"
                      label="Nombre del Curso"
                      fullWidth
                      variant="outlined"
                      error={touched.nombre && Boolean(errors.nombre)}
                      helperText={touched.nombre && errors.nombre}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.año_academico && Boolean(errors.año_academico)}
                      variant="outlined"
                    >
                      <InputLabel id="año-academico-label">Año Académico</InputLabel>
                      <Select
                        labelId="año-academico-label"
                        id="año_academico"
                        name="año_academico"
                        value={values.año_academico}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Año Académico"
                        sx={{ borderRadius: 2 }}
                      >
                        {yearOptions.map(year => (
                          <MenuItem key={year} value={year.toString()}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.año_academico && errors.año_academico}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.grado && Boolean(errors.grado)}
                      variant="outlined"
                    >
                      <InputLabel id="grado-label">Grado</InputLabel>
                      <Select
                        labelId="grado-label"
                        id="grado"
                        name="grado"
                        value={values.grado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Grado"
                        sx={{ borderRadius: 2 }}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(grado => (
                          <MenuItem key={grado} value={grado.toString()}>
                            {grado}°
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.grado && errors.grado}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="grupo"
                      label="Grupo"
                      fullWidth
                      variant="outlined"
                      error={touched.grupo && Boolean(errors.grupo)}
                      helperText={touched.grupo && errors.grupo}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  {/* Información adicional */}
                  <Grid item xs={12}>
                    <Typography variant="h3" color="primary.main" gutterBottom>
                      Información Adicional
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.director_grupo && Boolean(errors.director_grupo)}
                      variant="outlined"
                    >
                      <InputLabel id="director-grupo-label">Director de Grupo</InputLabel>
                      <Select
                        labelId="director-grupo-label"
                        id="director_grupo"
                        name="director_grupo"
                        value={values.director_grupo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Director de Grupo"
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
                      <FormHelperText>{touched.director_grupo && errors.director_grupo}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.estado && Boolean(errors.estado)}
                      variant="outlined"
                    >
                      <InputLabel id="estado-label">Estado</InputLabel>
                      <Select
                        labelId="estado-label"
                        id="estado"
                        name="estado"
                        value={values.estado}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Estado"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="ACTIVO">Activo</MenuItem>
                        <MenuItem value="INACTIVO">Inactivo</MenuItem>
                        <MenuItem value="FINALIZADO">Finalizado</MenuItem>
                      </Select>
                      <FormHelperText>{touched.estado && errors.estado}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={touched.escuelaId && Boolean(errors.escuelaId)}
                      variant="outlined"
                    >
                      <InputLabel id="escuela-label">Escuela</InputLabel>
                      <Select
                        labelId="escuela-label"
                        id="escuelaId"
                        name="escuelaId"
                        value={values.escuelaId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Escuela"
                        sx={{ borderRadius: 2 }}
                        disabled={user?.tipo !== 'ADMIN'} // Solo los administradores pueden cambiar la escuela
                      >
                        {escuelas.map((escuela) => (
                          <MenuItem key={escuela._id} value={escuela._id}>
                            {escuela.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.escuelaId && errors.escuelaId}</FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* Botones de acción */}
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<Cancel />}
                        onClick={() => isEditMode ? navigate(`/cursos/${id}`) : navigate('/cursos')}
                        sx={{ 
                          borderRadius: 20,
                          px: 3
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        disabled={isSubmitting}
                        sx={{ 
                          borderRadius: 20,
                          px: 3,
                          fontWeight: 500,
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        {isSubmitting ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          'Guardar'
                        )}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default FormularioCurso;