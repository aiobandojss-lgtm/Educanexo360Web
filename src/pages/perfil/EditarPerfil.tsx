// src/pages/perfil/EditarPerfil.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  Person,
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import { loginSuccess } from '../../redux/slices/authSlice';
import usuarioService from '../../services/usuarioService';

// Esquema de validación
const profileSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es requerido'),
  apellidos: Yup.string().required('Los apellidos son requeridos'),
  email: Yup.string()
    .email('Formato de email no válido')
    .required('El email es requerido'),
});

const EditarPerfil = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      cargarDatosUsuario();
    }
  }, [user]);

  const cargarDatosUsuario = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar información detallada del usuario
      const response = await usuarioService.obtenerUsuario(user?._id || '');
      
      if (response.success) {
        setUserDetails(response.data);
      } else {
        throw new Error('Error al cargar datos del usuario');
      }
    } catch (err: any) {
      console.error('Error al cargar datos del perfil:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      setSubmitting(true);
      setError(null);

      // Actualizar datos del usuario
      const response = await usuarioService.actualizarUsuario(user?._id || '', values);
      
      if (response.success) {
        // Actualizar datos en Redux - asegurando el formato correcto del objeto
        dispatch(loginSuccess({
          _id: user?._id || '',
          nombre: values.nombre,
          apellidos: values.apellidos,
          email: values.email,
          tipo: user?.tipo || '',
          escuelaId: user?.escuelaId || ''
        }));
        
        // Redirigir al perfil
        navigate('/perfil', { state: { message: 'Perfil actualizado exitosamente' } });
      } else {
        throw new Error('Error al actualizar el perfil');
      }
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setError(
        err.response?.data?.message || 'Ocurrió un error al guardar los datos. Intente nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Obtener iniciales para el avatar
  const getInitials = (nombre: string, apellidos: string) => {
    if (!nombre || !apellidos) return '?';
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  };

  // Obtener color de fondo para el avatar según el tipo
  const getAvatarBgColor = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN': return '#003F91'; // Color principal
      case 'DOCENTE': return '#5DA9E9'; // Color secundario
      case 'PADRE': return '#4CAF50'; // Verde
      case 'ESTUDIANTE': return '#FFC107'; // Amarillo
      default: return '#f8f9fa'; // Gris claro
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !userDetails) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/perfil')}
          sx={{ mb: 3 }}
        >
          Volver al perfil
        </Button>
        
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!userDetails) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/perfil')}
          sx={{ mb: 3 }}
        >
          Volver al perfil
        </Button>
        
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          No se pudo cargar la información del perfil. Intente nuevamente más tarde.
        </Alert>
      </Box>
    );
  }

  // Valores iniciales para el formulario
  const initialValues = {
    nombre: userDetails.nombre || '',
    apellidos: userDetails.apellidos || '',
    email: userDetails.email || '',
  };

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/perfil')}
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
          Editar Perfil
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
            Información del Perfil
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={profileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
            <Form>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Avatar y tipo de usuario */}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 100, 
                          height: 100, 
                          bgcolor: getAvatarBgColor(userDetails.tipo), 
                          fontSize: 36,
                          fontWeight: 'bold',
                          mb: 1,
                          mx: 'auto'
                        }}
                      >
                        {getInitials(values.nombre, values.apellidos)}
                      </Avatar>
                      <Typography variant="body1" color="text.secondary">
                        {userDetails.tipo === 'ADMIN' 
                          ? 'Administrador' 
                          : userDetails.tipo === 'DOCENTE' 
                            ? 'Docente' 
                            : userDetails.tipo === 'PADRE' 
                              ? 'Padre de Familia' 
                              : 'Estudiante'}
                      </Typography>
                    </Box>
                  </Grid>

                  <Divider sx={{ width: '100%', my: 2 }} />

                  {/* Campos de formulario */}
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      name="nombre"
                      label="Nombre"
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
                    <Field
                      as={TextField}
                      name="apellidos"
                      label="Apellidos"
                      fullWidth
                      variant="outlined"
                      error={touched.apellidos && Boolean(errors.apellidos)}
                      helperText={touched.apellidos && errors.apellidos}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      name="email"
                      label="Correo Electrónico"
                      fullWidth
                      variant="outlined"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  {/* Botones de acción */}
                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<Cancel />}
                        onClick={() => navigate('/perfil')}
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

export default EditarPerfil;