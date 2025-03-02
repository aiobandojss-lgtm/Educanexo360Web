// src/pages/configuracion/ConfiguracionSistema.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Card,
  CardContent,
  IconButton,
  FormHelperText,
} from '@mui/material';
import {
  Save as SaveIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  ContactMail as ContactMailIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../api/axiosConfig';
import { useNotificacion } from '../../components/common/Notificaciones';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Configuración general
const configuracionGeneralSchema = Yup.object().shape({
  nombreSistema: Yup.string().required('El nombre del sistema es requerido'),
  logoPrincipal: Yup.string(),
  colorPrincipal: Yup.string(),
  colorSecundario: Yup.string(),
  periodoActual: Yup.number().required('El periodo actual es requerido'),
  anioAcademico: Yup.number().required('El año académico es requerido'),
});

// Configuración de correo
const configuracionCorreoSchema = Yup.object().shape({
  servidorSMTP: Yup.string().required('El servidor SMTP es requerido'),
  puertoSMTP: Yup.number().required('El puerto SMTP es requerido'),
  usuarioSMTP: Yup.string().required('El usuario SMTP es requerido'),
  passwordSMTP: Yup.string().required('La contraseña SMTP es requerida'),
  remitente: Yup.string().email('Email inválido').required('El remitente es requerido'),
  pieCorreo: Yup.string(),
});

// Configuración de notificaciones
const configuracionNotificacionesSchema = Yup.object().shape({
  notificacionesActivas: Yup.boolean(),
  notificarNuevosMensajes: Yup.boolean(),
  notificarCalificaciones: Yup.boolean(),
  notificarEventos: Yup.boolean(),
  frecuenciaResumen: Yup.string(),
});

// Configuración de seguridad
const configuracionSeguridadSchema = Yup.object().shape({
  politicaPassword: Yup.string(),
  diasExpiracionPassword: Yup.number(),
  intentosMaximos: Yup.number(),
  tiempoBloqueo: Yup.number(),
  longitudMinima: Yup.number(),
  requiereCaracteresEspeciales: Yup.boolean(),
  requiereMayusculas: Yup.boolean(),
  requiereNumeros: Yup.boolean(),
});

const ConfiguracionSistema = () => {
  const { mostrarNotificacion } = useNotificacion();
  const [tabActual, setTabActual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Valores iniciales de configuración (en una implementación real, se obtendrían del backend)
  const [configuracionGeneral, setConfiguracionGeneral] = useState({
    nombreSistema: 'EducaNexo360',
    logoPrincipal: '',
    colorPrincipal: '#003F91',
    colorSecundario: '#5DA9E9',
    periodoActual: 2,
    anioAcademico: new Date().getFullYear(),
  });
  
  const [configuracionCorreo, setConfiguracionCorreo] = useState({
    servidorSMTP: 'smtp.example.com',
    puertoSMTP: 587,
    usuarioSMTP: 'notificaciones@educanexo360.com',
    passwordSMTP: '',
    remitente: 'notificaciones@educanexo360.com',
    pieCorreo: 'EducaNexo360 - Sistema de Comunicación Escolar',
  });
  
  const [configuracionNotificaciones, setConfiguracionNotificaciones] = useState({
    notificacionesActivas: true,
    notificarNuevosMensajes: true,
    notificarCalificaciones: true,
    notificarEventos: true,
    frecuenciaResumen: 'diario',
  });
  
  const [configuracionSeguridad, setConfiguracionSeguridad] = useState({
    politicaPassword: 'media',
    diasExpiracionPassword: 90,
    intentosMaximos: 5,
    tiempoBloqueo: 15,
    longitudMinima: 8,
    requiereCaracteresEspeciales: true,
    requiereMayusculas: true,
    requiereNumeros: true,
  });
  
  // Simular carga de configuración
  useEffect(() => {
    const cargarConfiguracion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // En una implementación real, aquí se haría la llamada a la API
        // De momento, simulamos una demora y usamos los valores por defecto
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // setConfiguracionGeneral(response.data.configuracionGeneral);
        // setConfiguracionCorreo(response.data.configuracionCorreo);
        // setConfiguracionNotificaciones(response.data.configuracionNotificaciones);
        // setConfiguracionSeguridad(response.data.configuracionSeguridad);
        
      } catch (err: any) {
        console.error('Error al cargar configuración:', err);
        setError('No se pudo cargar la configuración. ' + (err.response?.data?.message || 'Error del servidor'));
      } finally {
        setLoading(false);
      }
    };
    
    cargarConfiguracion();
  }, []);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabActual(newValue);
  };
  
  const handleGuardarConfiguracionGeneral = async (values: typeof configuracionGeneral) => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría la llamada a la API
      // await axiosInstance.put('/configuracion/general', values);
      console.log('Guardando configuración general:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfiguracionGeneral(values);
      mostrarNotificacion('Configuración general guardada exitosamente', 'success');
    } catch (err: any) {
      console.error('Error al guardar configuración general:', err);
      mostrarNotificacion(
        'Error al guardar la configuración general: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleGuardarConfiguracionCorreo = async (values: typeof configuracionCorreo) => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría la llamada a la API
      // await axiosInstance.put('/configuracion/correo', values);
      console.log('Guardando configuración de correo:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfiguracionCorreo(values);
      mostrarNotificacion('Configuración de correo guardada exitosamente', 'success');
    } catch (err: any) {
      console.error('Error al guardar configuración de correo:', err);
      mostrarNotificacion(
        'Error al guardar la configuración de correo: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleGuardarConfiguracionNotificaciones = async (values: typeof configuracionNotificaciones) => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría la llamada a la API
      // await axiosInstance.put('/configuracion/notificaciones', values);
      console.log('Guardando configuración de notificaciones:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfiguracionNotificaciones(values);
      mostrarNotificacion('Configuración de notificaciones guardada exitosamente', 'success');
    } catch (err: any) {
      console.error('Error al guardar configuración de notificaciones:', err);
      mostrarNotificacion(
        'Error al guardar la configuración de notificaciones: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleGuardarConfiguracionSeguridad = async (values: typeof configuracionSeguridad) => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría la llamada a la API
      // await axiosInstance.put('/configuracion/seguridad', values);
      console.log('Guardando configuración de seguridad:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConfiguracionSeguridad(values);
      mostrarNotificacion('Configuración de seguridad guardada exitosamente', 'success');
    } catch (err: any) {
      console.error('Error al guardar configuración de seguridad:', err);
      mostrarNotificacion(
        'Error al guardar la configuración de seguridad: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Función para enviar correo de prueba
  const enviarCorreoPrueba = async () => {
    try {
      setLoading(true);
      
      // En una implementación real, aquí se haría la llamada a la API
      // await axiosInstance.post('/configuracion/correo/test', { destinatario: 'test@example.com' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      mostrarNotificacion('Correo de prueba enviado exitosamente', 'success');
    } catch (err: any) {
      console.error('Error al enviar correo de prueba:', err);
      mostrarNotificacion(
        'Error al enviar correo de prueba: ' + (err.response?.data?.message || 'Error del servidor'), 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && error === null && tabActual === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Configuración del Sistema
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Tabs
          value={tabActual}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '& .MuiTab-root': {
              py: 2,
              minHeight: 64,
            },
            '& .Mui-selected': {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab 
            icon={<SettingsIcon />} 
            label="General" 
            iconPosition="start"
          />
          <Tab 
            icon={<EmailIcon />} 
            label="Correo" 
            iconPosition="start"
          />
          <Tab 
            icon={<NotificationsIcon />} 
            label="Notificaciones" 
            iconPosition="start"
          />
          <Tab 
            icon={<SecurityIcon />} 
            label="Seguridad" 
            iconPosition="start"
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {/* Tab de Configuración General */}
          <TabPanel value={tabActual} index={0}>
            <Formik
              initialValues={configuracionGeneral}
              validationSchema={configuracionGeneralSchema}
              onSubmit={handleGuardarConfiguracionGeneral}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange, isSubmitting }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h3" color="primary.main">
                          Información General
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="nombreSistema"
                        label="Nombre del Sistema"
                        variant="outlined"
                        value={values.nombreSistema}
                        onChange={handleChange}
                        error={touched.nombreSistema && Boolean(errors.nombreSistema)}
                        helperText={touched.nombreSistema && errors.nombreSistema}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="logoPrincipal"
                        label="URL del Logo Principal"
                        variant="outlined"
                        value={values.logoPrincipal}
                        onChange={handleChange}
                        error={touched.logoPrincipal && Boolean(errors.logoPrincipal)}
                        helperText={touched.logoPrincipal && errors.logoPrincipal}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="colorPrincipal"
                        label="Color Principal"
                        variant="outlined"
                        value={values.colorPrincipal}
                        onChange={handleChange}
                        type="color"
                        error={touched.colorPrincipal && Boolean(errors.colorPrincipal)}
                        helperText={touched.colorPrincipal && errors.colorPrincipal}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="colorSecundario"
                        label="Color Secundario"
                        variant="outlined"
                        value={values.colorSecundario}
                        onChange={handleChange}
                        type="color"
                        error={touched.colorSecundario && Boolean(errors.colorSecundario)}
                        helperText={touched.colorSecundario && errors.colorSecundario}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
                        <SchoolIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h3" color="primary.main">
                          Configuración Académica
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="periodoActual-label">Periodo Actual</InputLabel>
                        <Select
                          labelId="periodoActual-label"
                          name="periodoActual"
                          value={values.periodoActual}
                          onChange={handleChange}
                          label="Periodo Actual"
                          error={touched.periodoActual && Boolean(errors.periodoActual)}
                        >
                          <MenuItem value={1}>Periodo 1</MenuItem>
                          <MenuItem value={2}>Periodo 2</MenuItem>
                          <MenuItem value={3}>Periodo 3</MenuItem>
                          <MenuItem value={4}>Periodo 4</MenuItem>
                        </Select>
                        {touched.periodoActual && errors.periodoActual && (
                          <FormHelperText error>{errors.periodoActual}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="anioAcademico"
                        label="Año Académico"
                        variant="outlined"
                        value={values.anioAcademico}
                        onChange={handleChange}
                        type="number"
                        error={touched.anioAcademico && Boolean(errors.anioAcademico)}
                        helperText={touched.anioAcademico && errors.anioAcademico}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ mt: 2, mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting || loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Guardar Configuración'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </TabPanel>
          
          {/* Tab de Configuración de Correo */}
          <TabPanel value={tabActual} index={1}>
            <Formik
              initialValues={configuracionCorreo}
              validationSchema={configuracionCorreoSchema}
              onSubmit={handleGuardarConfiguracionCorreo}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange, isSubmitting }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmailIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h3" color="primary.main">
                          Configuración de Correo Electrónico
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        name="servidorSMTP"
                        label="Servidor SMTP"
                        variant="outlined"
                        value={values.servidorSMTP}
                        onChange={handleChange}
                        error={touched.servidorSMTP && Boolean(errors.servidorSMTP)}
                        helperText={touched.servidorSMTP && errors.servidorSMTP}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        name="puertoSMTP"
                        label="Puerto SMTP"
                        variant="outlined"
                        value={values.puertoSMTP}
                        onChange={handleChange}
                        type="number"
                        error={touched.puertoSMTP && Boolean(errors.puertoSMTP)}
                        helperText={touched.puertoSMTP && errors.puertoSMTP}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="usuarioSMTP"
                        label="Usuario SMTP"
                        variant="outlined"
                        value={values.usuarioSMTP}
                        onChange={handleChange}
                        error={touched.usuarioSMTP && Boolean(errors.usuarioSMTP)}
                        helperText={touched.usuarioSMTP && errors.usuarioSMTP}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="passwordSMTP"
                        label="Contraseña SMTP"
                        variant="outlined"
                        value={values.passwordSMTP}
                        onChange={handleChange}
                        type="password"
                        error={touched.passwordSMTP && Boolean(errors.passwordSMTP)}
                        helperText={touched.passwordSMTP && errors.passwordSMTP}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="remitente"
                        label="Email del Remitente"
                        variant="outlined"
                        value={values.remitente}
                        onChange={handleChange}
                        error={touched.remitente && Boolean(errors.remitente)}
                        helperText={touched.remitente && errors.remitente}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="pieCorreo"
                        label="Pie de Página para Correos"
                        variant="outlined"
                        value={values.pieCorreo}
                        onChange={handleChange}
                        multiline
                        rows={3}
                        error={touched.pieCorreo && Boolean(errors.pieCorreo)}
                        helperText={touched.pieCorreo && errors.pieCorreo}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'rgba(93, 169, 233, 0.1)', 
                          borderRadius: 2,
                          mb: 2 
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <ContactMailIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Enviar Correo de Prueba
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              Puedes enviar un correo de prueba para verificar que la configuración sea correcta. 
                              Se enviará un correo de prueba a la dirección configurada como remitente.
                            </Typography>
                            <Button
                              variant="outlined"
                              onClick={enviarCorreoPrueba}
                              disabled={loading}
                              size="small"
                              sx={{ mt: 1 }}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Enviar Correo de Prueba'}
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ mt: 2, mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting || loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Guardar Configuración'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </TabPanel>
          
          {/* Tab de Configuración de Notificaciones */}
          <TabPanel value={tabActual} index={2}>
            <Formik
              initialValues={configuracionNotificaciones}
              validationSchema={configuracionNotificacionesSchema}
              onSubmit={handleGuardarConfiguracionNotificaciones}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange, isSubmitting, setFieldValue }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <NotificationsIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h3" color="primary.main">
                          Configuración de Notificaciones
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.notificacionesActivas}
                            onChange={(e) => setFieldValue('notificacionesActivas', e.target.checked)}
                            name="notificacionesActivas"
                            color="primary"
                          />
                        }
                        label="Activar notificaciones en el sistema"
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom>
                        Configurar notificaciones por tipo
                      </Typography>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={values.notificarNuevosMensajes}
                                  onChange={(e) => setFieldValue('notificarNuevosMensajes', e.target.checked)}
                                  name="notificarNuevosMensajes"
                                  color="primary"
                                  disabled={!values.notificacionesActivas}
                                />
                              }
                              label="Notificar nuevos mensajes"
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={values.notificarCalificaciones}
                                  onChange={(e) => setFieldValue('notificarCalificaciones', e.target.checked)}
                                  name="notificarCalificaciones"
                                  color="primary"
                                  disabled={!values.notificacionesActivas}
                                />
                              }
                              label="Notificar nuevas calificaciones"
                            />
                          </Grid>
                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={values.notificarEventos}
                                  onChange={(e) => setFieldValue('notificarEventos', e.target.checked)}
                                  name="notificarEventos"
                                  color="primary"
                                  disabled={!values.notificacionesActivas}
                                />
                              }
                              label="Notificar eventos académicos"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl 
                        fullWidth 
                        variant="outlined"
                        disabled={!values.notificacionesActivas}
                      >
                        <InputLabel id="frecuenciaResumen-label">Frecuencia de Resumen</InputLabel>
                        <Select
                          labelId="frecuenciaResumen-label"
                          name="frecuenciaResumen"
                          value={values.frecuenciaResumen}
                          onChange={handleChange}
                          label="Frecuencia de Resumen"
                        >
                          <MenuItem value="diario">Diario</MenuItem>
                          <MenuItem value="semanal">Semanal</MenuItem>
                          <MenuItem value="quincenal">Quincenal</MenuItem>
                          <MenuItem value="mensual">Mensual</MenuItem>
                          <MenuItem value="nunca">No enviar resumen</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Divider sx={{ mt: 2, mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting || loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Guardar Configuración'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </TabPanel>
          
          {/* Tab de Configuración de Seguridad */}
          <TabPanel value={tabActual} index={3}>
            <Formik
              initialValues={configuracionSeguridad}
              validationSchema={configuracionSeguridadSchema}
              onSubmit={handleGuardarConfiguracionSeguridad}
              enableReinitialize
            >
              {({ errors, touched, values, handleChange, isSubmitting, setFieldValue }) => (
                <Form>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SecurityIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h3" color="primary.main">
                          Configuración de Seguridad
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="politicaPassword-label">Política de Contraseñas</InputLabel>
                        <Select
                          labelId="politicaPassword-label"
                          name="politicaPassword"
                          value={values.politicaPassword}
                          onChange={handleChange}
                          label="Política de Contraseñas"
                        >
                          <MenuItem value="baja">Baja</MenuItem>
                          <MenuItem value="media">Media</MenuItem>
                          <MenuItem value="alta">Alta</MenuItem>
                          <MenuItem value="personalizada">Personalizada</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="diasExpiracionPassword"
                        label="Días para expiración de contraseña"
                        variant="outlined"
                        value={values.diasExpiracionPassword}
                        onChange={handleChange}
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                        error={touched.diasExpiracionPassword && Boolean(errors.diasExpiracionPassword)}
                        helperText={touched.diasExpiracionPassword && errors.diasExpiracionPassword}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="intentosMaximos"
                        label="Intentos máximos de inicio de sesión"
                        variant="outlined"
                        value={values.intentosMaximos}
                        onChange={handleChange}
                        type="number"
                        InputProps={{ inputProps: { min: 1 } }}
                        error={touched.intentosMaximos && Boolean(errors.intentosMaximos)}
                        helperText={touched.intentosMaximos && errors.intentosMaximos}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        name="tiempoBloqueo"
                        label="Tiempo de bloqueo (minutos)"
                        variant="outlined"
                        value={values.tiempoBloqueo}
                        onChange={handleChange}
                        type="number"
                        InputProps={{ inputProps: { min: 1 } }}
                        error={touched.tiempoBloqueo && Boolean(errors.tiempoBloqueo)}
                        helperText={touched.tiempoBloqueo && errors.tiempoBloqueo}
                      />
                    </Grid>
                    
                    {values.politicaPassword === 'personalizada' && (
                      <>
                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            name="longitudMinima"
                            label="Longitud mínima de contraseña"
                            variant="outlined"
                            value={values.longitudMinima}
                            onChange={handleChange}
                            type="number"
                            InputProps={{ inputProps: { min: 6, max: 30 } }}
                            error={touched.longitudMinima && Boolean(errors.longitudMinima)}
                            helperText={touched.longitudMinima && errors.longitudMinima}
                          />
                        </Grid>
                        
                        <Grid item xs={12}>
                          <Typography variant="subtitle1" gutterBottom>
                            Requisitos de complejidad
                          </Typography>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.02)' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={values.requiereMayusculas}
                                      onChange={(e) => setFieldValue('requiereMayusculas', e.target.checked)}
                                      name="requiereMayusculas"
                                      color="primary"
                                    />
                                  }
                                  label="Requiere mayúsculas"
                                />
                              </Grid>
                              
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={values.requiereNumeros}
                                      onChange={(e) => setFieldValue('requiereNumeros', e.target.checked)}
                                      name="requiereNumeros"
                                      color="primary"
                                    />
                                  }
                                  label="Requiere números"
                                />
                              </Grid>
                              
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={values.requiereCaracteresEspeciales}
                                      onChange={(e) => setFieldValue('requiereCaracteresEspeciales', e.target.checked)}
                                      name="requiereCaracteresEspeciales"
                                      color="primary"
                                    />
                                  }
                                  label="Requiere caracteres especiales"
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={12}>
                      <Divider sx={{ mt: 2, mb: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={isSubmitting || loading}
                        >
                          {loading ? <CircularProgress size={24} /> : 'Guardar Configuración'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfiguracionSistema;