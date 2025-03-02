// src/pages/logros/FormularioLogro.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Slider,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  Assignment,
  School,
  CalendarToday,
  Timeline,
} from '@mui/icons-material';
import logroService, { Logro, LogroInput } from '../../services/logroService';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaces para opciones de selección
interface CursoOption {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
}

interface AsignaturaOption {
  _id: string;
  nombre: string;
  codigo: string;
}

// Esquema de validación
const logroSchema = Yup.object().shape({
  descripcion: Yup.string()
    .required('La descripción es requerida')
    .min(5, 'La descripción debe tener al menos 5 caracteres')
    .max(500, 'La descripción no debe exceder 500 caracteres'),
  asignaturaId: Yup.string().required('La asignatura es requerida'),
  cursoId: Yup.string().required('El curso es requerido'),
  periodo: Yup.number()
    .required('El periodo es requerido')
    .min(1, 'El periodo debe ser al menos 1')
    .max(4, 'El periodo no debe exceder 4'),
  año_academico: Yup.string().required('El año académico es requerido'),
  peso: Yup.number()
    .required('El peso es requerido')
    .min(1, 'El peso debe ser al menos 1%')
    .max(100, 'El peso no debe exceder 100%'),
  estado: Yup.string().required('El estado es requerido'),
});

const FormularioLogro = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logro, setLogro] = useState<Logro | null>(null);
  const [cursos, setCursos] = useState<CursoOption[]>([]);
  const [asignaturas, setAsignaturas] = useState<AsignaturaOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(id);

  // Obtener parámetros de la ubicación (si los hay)
  const locationState = location.state as {
    cursoId?: string;
    asignaturaId?: string;
    periodo?: number;
    año_academico?: string;
  } | null;

  // Valores iniciales para el formulario
  const initialValues: LogroInput = {
    descripcion: '',
    asignaturaId: locationState?.asignaturaId || '',
    cursoId: locationState?.cursoId || '',
    periodo: locationState?.periodo || 1,
    año_academico: locationState?.año_academico || new Date().getFullYear().toString(),
    peso: 10,
    estado: 'ACTIVO',
  };

  const añosAcademicos = Array.from(
    { length: 5 },
    (_, i) => (new Date().getFullYear() - 2 + i).toString()
  );

  const periodos = [1, 2, 3, 4];

  useEffect(() => {
    cargarCursos();
    cargarAsignaturas();
    
    if (isEditMode && id) {
      cargarLogro();
    } else {
      setLoading(false);
    }
  }, [id, isEditMode]);

  const cargarLogro = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await logroService.obtenerLogro(id);
      
      if (response.success) {
        setLogro(response.data);
      } else {
        throw new Error('Error al cargar el logro académico');
      }
    } catch (err: any) {
      console.error('Error al cargar logro:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del logro académico');
    } finally {
      setLoading(false);
    }
  };

  const cargarCursos = async () => {
    try {
      const response = await axiosInstance.get('/cursos');
      if (response.data?.success) {
        setCursos(response.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
    }
  };

  const cargarAsignaturas = async () => {
    try {
      const response = await axiosInstance.get('/asignaturas');
      if (response.data?.success) {
        setAsignaturas(response.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar asignaturas:', err);
    }
  };

  const handleSubmit = async (values: LogroInput, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      setError(null);

      if (isEditMode && id) {
        // Actualizar logro existente
        const response = await logroService.actualizarLogro(id, values);
        
        if (response.success) {
          navigate(`/logros/${id}`, { state: { message: 'Logro actualizado exitosamente' } });
        } else {
          throw new Error('Error al actualizar el logro académico');
        }
      } else {
        // Crear nuevo logro
        const response = await logroService.crearLogro(values);
        
        if (response.success) {
          navigate(`/logros/${response.data._id}`, { state: { message: 'Logro creado exitosamente' } });
        } else {
          throw new Error('Error al crear el logro académico');
        }
      }
    } catch (err: any) {
      console.error('Error al guardar logro:', err);
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
  const formValues = isEditMode && logro
    ? {
        ...initialValues,
        descripcion: logro.descripcion,
        asignaturaId: typeof logro.asignaturaId === 'object' ? logro.asignaturaId._id : logro.asignaturaId,
        cursoId: typeof logro.cursoId === 'object' ? logro.cursoId._id : logro.cursoId,
        periodo: logro.periodo,
        año_academico: logro.año_academico,
        peso: logro.peso,
        estado: logro.estado,
      }
    : initialValues;

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(isEditMode ? `/logros/${id}` : '/logros')}
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
          {isEditMode ? 'Editar Logro Académico' : 'Nuevo Logro Académico'}
        </Typography>
      </Box>

      {/* Mensaje de error */}
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
            {isEditMode ? 'Información del Logro' : 'Nuevo Logro'}
          </Typography>
        </Box>

        <Formik
          initialValues={formValues}
          validationSchema={logroSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur, setFieldValue }) => (
            <Form>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Título de sección */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Assignment color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h3" color="primary.main">
                        Descripción del Logro
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  {/* Descripción del logro */}
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="descripcion"
                      label="Descripción del Logro"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      error={touched.descripcion && Boolean(errors.descripcion)}
                      helperText={touched.descripcion && errors.descripcion}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  {/* Título de sección */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <School color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h3" color="primary.main">
                        Contexto Académico
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  {/* Curso y Asignatura */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.cursoId && Boolean(errors.cursoId)}
                      variant="outlined"
                    >
                      <InputLabel id="curso-label">Curso</InputLabel>
                      <Select
                        labelId="curso-label"
                        id="cursoId"
                        name="cursoId"
                        value={values.cursoId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Curso"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">
                          <em>Seleccione un curso</em>
                        </MenuItem>
                        {cursos.map((curso) => (
                          <MenuItem key={curso._id} value={curso._id}>
                            {curso.nombre} ({curso.grado}° {curso.grupo})
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.cursoId && errors.cursoId}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.asignaturaId && Boolean(errors.asignaturaId)}
                      variant="outlined"
                    >
                      <InputLabel id="asignatura-label">Asignatura</InputLabel>
                      <Select
                        labelId="asignatura-label"
                        id="asignaturaId"
                        name="asignaturaId"
                        value={values.asignaturaId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Asignatura"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">
                          <em>Seleccione una asignatura</em>
                        </MenuItem>
                        {asignaturas.map((asignatura) => (
                          <MenuItem key={asignatura._id} value={asignatura._id}>
                            {asignatura.nombre} ({asignatura.codigo})
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.asignaturaId && errors.asignaturaId}</FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* Periodo y Año */}
                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.periodo && Boolean(errors.periodo)}
                      variant="outlined"
                    >
                      <InputLabel id="periodo-label">Periodo</InputLabel>
                      <Select
                        labelId="periodo-label"
                        id="periodo"
                        name="periodo"
                        value={values.periodo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Periodo"
                        sx={{ borderRadius: 2 }}
                      >
                        {periodos.map((p) => (
                          <MenuItem key={p} value={p}>
                            Periodo {p}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.periodo && errors.periodo}</FormHelperText>
                    </FormControl>
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
                        {añosAcademicos.map((año) => (
                          <MenuItem key={año} value={año}>
                            {año}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.año_academico && errors.año_academico}</FormHelperText>
                    </FormControl>
                  </Grid>

                  {/* Título de sección */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Timeline color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h3" color="primary.main">
                        Evaluación
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  {/* Peso del logro */}
                  <Grid item xs={12}>
                    <Typography gutterBottom>Peso del Logro (%)</Typography>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Slider
                        name="peso"
                        value={values.peso}
                        onChange={(_, value) => {
                          setFieldValue('peso', value);
                        }}
                        valueLabelDisplay="auto"
                        step={5}
                        marks
                        min={5}
                        max={100}
                        color="secondary"
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">Menor importancia (5%)</Typography>
                        <Chip 
                          label={`${values.peso}%`} 
                          color="primary" 
                          size="small" 
                          sx={{ fontWeight: 'bold', borderRadius: 8 }} 
                        />
                        <Typography variant="caption" color="text.secondary">Mayor importancia (100%)</Typography>
                      </Box>
                      {touched.peso && errors.peso && (
                        <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                          {errors.peso}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Estado del logro */}
                  <Grid item xs={12}>
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
                        <MenuItem value="COMPLETADO">Completado</MenuItem>
                      </Select>
                      <FormHelperText>{touched.estado && errors.estado}</FormHelperText>
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
                        onClick={() => navigate(isEditMode ? `/logros/${id}` : '/logros')}
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
                          isEditMode ? 'Actualizar' : 'Guardar'
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

export default FormularioLogro;