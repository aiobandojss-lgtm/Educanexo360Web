// src/pages/perfil/EditarPerfil.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Save, Email, Phone, Person } from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { RootState } from '../../redux/store';
import { loginSuccess } from '../../redux/slices/authSlice';
import { ensureUserHasState } from '../../types/user.types';

// Esquema de validación para el formulario
const EditarPerfilSchema = Yup.object().shape({
  nombre: Yup.string()
    .required('El nombre es requerido')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  apellidos: Yup.string()
    .required('Los apellidos son requeridos')
    .max(50, 'Los apellidos no pueden tener más de 50 caracteres'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  perfil: Yup.object().shape({
    telefono: Yup.string()
      .max(20, 'El teléfono no puede tener más de 20 caracteres')
  })
});

// Definir la interfaz para el usuario con perfil
interface UserWithProfile {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  escuelaId: string;
  estado: string;
  perfil?: {
    telefono?: string;
    [key: string]: any;
  };
}

const EditarPerfil = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Box>
        <Alert severity="error">Debe iniciar sesión para editar su perfil.</Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{ mt: 2, borderRadius: '20px' }}
        >
          Iniciar Sesión
        </Button>
      </Box>
    );
  }

  // Usar aserción de tipo para acceder a la propiedad perfil
  const userWithProfile = user as unknown as UserWithProfile;

  // Definir valores iniciales del formulario
  const initialValues = {
    nombre: userWithProfile.nombre || '',
    apellidos: userWithProfile.apellidos || '',
    email: userWithProfile.email || '',
    perfil: {
      telefono: userWithProfile.perfil?.telefono || ''
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      setError(null);

      // Actualizar perfil
      const response = await axiosInstance.put(`/usuarios/${userWithProfile._id}`, values);

      if (response.data.success) {
        // Actualizar datos en Redux - asegurando el formato correcto del objeto
        dispatch(loginSuccess(ensureUserHasState({
          _id: userWithProfile._id || '',
          nombre: values.nombre,
          apellidos: values.apellidos,
          email: userWithProfile.tipo === 'ADMIN' ? values.email : userWithProfile.email,
          tipo: userWithProfile.tipo || '',
          escuelaId: userWithProfile.escuelaId || '',
          estado: userWithProfile.estado || 'ACTIVO',
          perfil: values.perfil
        })));
        
        // Redirigir al perfil
        navigate('/perfil', { state: { message: 'Perfil actualizado exitosamente' } });
      } else {
        setError('No se pudo actualizar el perfil');
      }
    } catch (err: any) {
      console.error('Error al actualizar perfil:', err);
      setError(err.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Editar Perfil
      </Typography>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={EditarPerfilSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h3" color="primary.main">
                    Información Personal
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="nombre"
                    label="Nombre"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                    error={touched.nombre && Boolean(errors.nombre)}
                    helperText={touched.nombre && errors.nombre}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="apellidos"
                    label="Apellidos"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                    error={touched.apellidos && Boolean(errors.apellidos)}
                    helperText={touched.apellidos && errors.apellidos}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="perfil.telefono"
                    label="Teléfono"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone />
                        </InputAdornment>
                      ),
                    }}
                    error={touched.perfil?.telefono && Boolean(errors.perfil?.telefono)}
                    helperText={touched.perfil?.telefono && errors.perfil?.telefono}
                  />
                </Grid>

                {/* Email solo visible para administradores */}
                {userWithProfile.tipo === 'ADMIN' && (
                  <Grid item xs={12}>
                    <Field
                      as={TextField}
                      fullWidth
                      name="email"
                      label="Email"
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                    />
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || loading}
                      startIcon={isSubmitting || loading ? <CircularProgress size={20} /> : <Save />}
                      sx={{ borderRadius: '20px' }}
                    >
                      Guardar Cambios
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => navigate('/perfil')}
                      startIcon={<ArrowBack />}
                      sx={{ borderRadius: '20px' }}
                    >
                      Volver al Perfil
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Typography variant="h3" color="primary.main" gutterBottom>
          Cambiar Contraseña
        </Typography>

        <Typography variant="body1" paragraph>
          Para cambiar tu contraseña, haz clic en el siguiente botón:
        </Typography>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/perfil/cambiar-password')}
          sx={{ borderRadius: '20px' }}
        >
          Cambiar Contraseña
        </Button>
      </Paper>
    </Box>
  );
};

export default EditarPerfil;