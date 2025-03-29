// src/pages/system/SetupPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { initializeSystem } from '../../services/systemService';

// Esquema de validación para la escuela
const EscuelaSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre de la escuela es requerido'),
  codigo: Yup.string().required('El código de la escuela es requerido'), // Añadido nuevamente
  direccion: Yup.string().required('La dirección es requerida'),
  telefono: Yup.string().required('El teléfono es requerido'),
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  configuracion: Yup.object().shape({
    periodos_academicos: Yup.number().required('Los periodos académicos son requeridos'),
    escala_calificacion: Yup.object().shape({
      minima: Yup.number().required('La calificación mínima es requerida'),
      maxima: Yup.number().required('La calificación máxima es requerida'),
    }),
  }),
});

// Esquema de validación para el administrador
const AdminSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es requerido'),
  apellidos: Yup.string().required('Los apellidos son requeridos'),
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: Yup.string()
    .required('La confirmación de contraseña es requerida')
    .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir'),
});

// Esquema combinado
const SetupSchema = Yup.object().shape({
  escuela: EscuelaSchema,
  admin: AdminSchema,
});

const steps = ['Bienvenido', 'Configuración de Escuela', 'Creación de Administrador', 'Resumen'];

const SetupPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const initialValues = {
    escuela: {
      nombre: '',
      codigo: '', // Añadido nuevamente
      direccion: '',
      telefono: '',
      email: '',
      configuracion: {
        periodos_academicos: 4,
        escala_calificacion: {
          minima: 0,
          maxima: 5
        }
      }
    },
    admin: {
      nombre: '',
      apellidos: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (values: typeof initialValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const dataToSend = {
        escuela: {
          nombre: values.escuela.nombre,
          codigo: values.escuela.codigo, // Añadido nuevamente
          direccion: values.escuela.direccion,
          telefono: values.escuela.telefono,
          email: values.escuela.email,
          configuracion: {
            periodos_academicos: values.escuela.configuracion.periodos_academicos,
            escala_calificacion: {
              minima: values.escuela.configuracion.escala_calificacion.minima,
              maxima: values.escuela.configuracion.escala_calificacion.maxima
            }
          }
        },
        admin: {
          nombre: values.admin.nombre,
          apellidos: values.admin.apellidos,
          email: values.admin.email,
          password: values.admin.password
        }
      };
      
      console.log('Enviando datos:', dataToSend);
      await initializeSystem(dataToSend);
      handleNext(); // Avanzar al paso final
    } catch (err: any) {
      console.error('Error completo:', err);
      
      // Manejo mejorado de errores
      let errorMessage = 'Error al inicializar el sistema';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Si hay errores de validación específicos
        const errors = err.response.data.errors;
        const errorKeys = Object.keys(errors);
        if (errorKeys.length > 0) {
          errorMessage = errors[errorKeys[0]];
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number, formikProps: any) => {
    const { values, touched, errors, handleChange, isSubmitting } = formikProps;
    
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h4" gutterBottom>
              ¡Bienvenido a EducaNexo360!
            </Typography>
            <Typography variant="body1" paragraph>
              Este asistente lo guiará a través de la configuración inicial del sistema.
            </Typography>
            <Typography variant="body1" paragraph>
              Vamos a crear su primera escuela y cuenta de administrador.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              sx={{ mt: 2 }}
            >
              Comenzar
            </Button>
          </Box>
        );
        
      case 1:
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configuración de Escuela
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ingrese la información de su institución educativa
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="escuela.nombre"
                  label="Nombre de la Escuela"
                  value={values.escuela.nombre}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.nombre && 
                    touched.escuela?.nombre
                  )}
                  helperText={
                    touched.escuela?.nombre && errors.escuela?.nombre
                      ? errors.escuela.nombre
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="escuela.codigo"
                  label="Código de la Escuela"
                  value={values.escuela.codigo}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.codigo && 
                    touched.escuela?.codigo
                  )}
                  helperText={
                    touched.escuela?.codigo && errors.escuela?.codigo
                      ? errors.escuela.codigo
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="escuela.direccion"
                  label="Dirección"
                  value={values.escuela.direccion}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.direccion && 
                    touched.escuela?.direccion
                  )}
                  helperText={
                    touched.escuela?.direccion && errors.escuela?.direccion
                      ? errors.escuela.direccion
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="escuela.telefono"
                  label="Teléfono"
                  value={values.escuela.telefono}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.telefono && 
                    touched.escuela?.telefono
                  )}
                  helperText={
                    touched.escuela?.telefono && errors.escuela?.telefono
                      ? errors.escuela.telefono
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="escuela.email"
                  label="Email"
                  type="email"
                  value={values.escuela.email}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.email && 
                    touched.escuela?.email
                  )}
                  helperText={
                    touched.escuela?.email && errors.escuela?.email
                      ? errors.escuela.email
                      : ''
                  }
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>
                  Configuración Académica
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Field
                  as={TextField}
                  fullWidth
                  type="number"
                  name="escuela.configuracion.periodos_academicos"
                  label="Períodos Académicos"
                  value={values.escuela.configuracion.periodos_academicos}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.configuracion?.periodos_academicos && 
                    touched.escuela?.configuracion?.periodos_academicos
                  )}
                  helperText={
                    touched.escuela?.configuracion?.periodos_academicos && 
                    errors.escuela?.configuracion?.periodos_academicos
                      ? errors.escuela.configuracion.periodos_academicos
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Field
                  as={TextField}
                  fullWidth
                  type="number"
                  name="escuela.configuracion.escala_calificacion.minima"
                  label="Calificación Mínima"
                  value={values.escuela.configuracion.escala_calificacion.minima}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.configuracion?.escala_calificacion?.minima && 
                    touched.escuela?.configuracion?.escala_calificacion?.minima
                  )}
                  helperText={
                    touched.escuela?.configuracion?.escala_calificacion?.minima && 
                    errors.escuela?.configuracion?.escala_calificacion?.minima
                      ? errors.escuela.configuracion.escala_calificacion.minima
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Field
                  as={TextField}
                  fullWidth
                  type="number"
                  name="escuela.configuracion.escala_calificacion.maxima"
                  label="Calificación Máxima"
                  value={values.escuela.configuracion.escala_calificacion.maxima}
                  onChange={handleChange}
                  error={Boolean(
                    errors.escuela?.configuracion?.escala_calificacion?.maxima && 
                    touched.escuela?.configuracion?.escala_calificacion?.maxima
                  )}
                  helperText={
                    touched.escuela?.configuracion?.escala_calificacion?.maxima && 
                    errors.escuela?.configuracion?.escala_calificacion?.maxima
                      ? errors.escuela.configuracion.escala_calificacion.maxima
                      : ''
                  }
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Siguiente
              </Button>
            </Box>
          </Box>
        );
        
      case 2:
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              Creación de Administrador
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Ingrese la información del administrador principal del sistema
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="admin.nombre"
                  label="Nombre"
                  value={values.admin.nombre}
                  onChange={handleChange}
                  error={Boolean(
                    errors.admin?.nombre && 
                    touched.admin?.nombre
                  )}
                  helperText={
                    touched.admin?.nombre && errors.admin?.nombre
                      ? errors.admin.nombre
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="admin.apellidos"
                  label="Apellidos"
                  value={values.admin.apellidos}
                  onChange={handleChange}
                  error={Boolean(
                    errors.admin?.apellidos && 
                    touched.admin?.apellidos
                  )}
                  helperText={
                    touched.admin?.apellidos && errors.admin?.apellidos
                      ? errors.admin.apellidos
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Field
                  as={TextField}
                  fullWidth
                  name="admin.email"
                  label="Email"
                  type="email"
                  value={values.admin.email}
                  onChange={handleChange}
                  error={Boolean(
                    errors.admin?.email && 
                    touched.admin?.email
                  )}
                  helperText={
                    touched.admin?.email && errors.admin?.email
                      ? errors.admin.email
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="admin.password"
                  label="Contraseña"
                  type="password"
                  value={values.admin.password}
                  onChange={handleChange}
                  error={Boolean(
                    errors.admin?.password && 
                    touched.admin?.password
                  )}
                  helperText={
                    touched.admin?.password && errors.admin?.password
                      ? errors.admin.password
                      : ''
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field
                  as={TextField}
                  fullWidth
                  name="admin.confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  value={values.admin.confirmPassword}
                  onChange={handleChange}
                  error={Boolean(
                    errors.admin?.confirmPassword && 
                    touched.admin?.confirmPassword
                  )}
                  helperText={
                    touched.admin?.confirmPassword && errors.admin?.confirmPassword
                      ? errors.admin.confirmPassword
                      : ''
                  }
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Siguiente
              </Button>
            </Box>
          </Box>
        );
        
      case 3:
        return (
          <Box sx={{ my: 2 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Configuración
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Verifique la información ingresada y confirme para inicializar el sistema
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Información de la Escuela
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Nombre:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.escuela.nombre}</Typography>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Código:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.escuela.codigo}</Typography>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Dirección:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.escuela.direccion}</Typography>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Teléfono:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.escuela.telefono}</Typography>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.escuela.email}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Configuración Académica
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Períodos:</Typography>
                </Grid>
                <Grid item xs={6} sm={8}>
                  <Typography variant="body2">{values.escuela.configuracion.periodos_academicos}</Typography>
                </Grid>
                
                <Grid item xs={6} sm={4}>
                  <Typography variant="body2" color="textSecondary">Escala de Calificación:</Typography>
                </Grid>
                <Grid item xs={6} sm={8}>
                  <Typography variant="body2">
                    {values.escuela.configuracion.escala_calificacion.minima} - {values.escuela.configuracion.escala_calificacion.maxima}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Paper elevation={1} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Información del Administrador
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Nombre:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.admin.nombre} {values.admin.apellidos}</Typography>
                </Grid>
                
                <Grid item xs={4} sm={3}>
                  <Typography variant="body2" color="textSecondary">Email:</Typography>
                </Grid>
                <Grid item xs={8} sm={9}>
                  <Typography variant="body2">{values.admin.email}</Typography>
                </Grid>
              </Grid>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Atrás
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleSubmit(values)}
                disabled={isSubmitting || loading}
                sx={{ minWidth: 120 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Inicializar Sistema'}
              </Button>
            </Box>
          </Box>
        );
        
      case 4:
        return (
          <Box sx={{ textAlign: 'center', my: 4 }}>
            <Typography variant="h4" gutterBottom color="primary">
              ¡Configuración Completada!
            </Typography>
            <Typography variant="body1" paragraph>
              El sistema ha sido inicializado correctamente.
            </Typography>
            <Typography variant="body1" paragraph>
              Ya puede iniciar sesión con las credenciales de administrador que ha creado.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Ir a Login
            </Button>
          </Box>
        );
        
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Configuración Inicial de EducaNexo360
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Formik
          initialValues={initialValues}
          validationSchema={SetupSchema}
          onSubmit={handleSubmit}
        >
          {(formikProps) => (
            <Form>
              {renderStepContent(activeStep, formikProps)}
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default SetupPage;