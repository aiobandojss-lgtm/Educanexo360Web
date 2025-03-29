// src/pages/perfil/PerfilCambiarPassword.tsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { RootState } from '../../redux/store';
import usuarioService from '../../services/usuarioService';

// Esquema de validación
const CambiarPasswordSchema = Yup.object().shape({
  passwordActual: Yup.string()
    .required('La contraseña actual es requerida'),
  nuevaPassword: Yup.string()
    .required('La nueva contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmarPassword: Yup.string()
    .required('Debe confirmar la nueva contraseña')
    .oneOf([Yup.ref('nuevaPassword')], 'Las contraseñas no coinciden'),
});

const PerfilCambiarPassword = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Llamar al servicio para cambiar la contraseña
      await usuarioService.cambiarPassword(user._id, {
        passwordActual: values.passwordActual,
        nuevaPassword: values.nuevaPassword
      });
      
      setSuccess('Contraseña actualizada exitosamente');
      resetForm();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al cambiar la contraseña';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Cambiar Contraseña
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Formik
          initialValues={{
            passwordActual: '',
            nuevaPassword: '',
            confirmarPassword: '',
          }}
          validationSchema={CambiarPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="passwordActual"
                    label="Contraseña Actual"
                    type="password"
                    fullWidth
                    error={touched.passwordActual && Boolean(errors.passwordActual)}
                    helperText={touched.passwordActual && errors.passwordActual}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="nuevaPassword"
                    label="Nueva Contraseña"
                    type="password"
                    fullWidth
                    error={touched.nuevaPassword && Boolean(errors.nuevaPassword)}
                    helperText={touched.nuevaPassword && errors.nuevaPassword}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="confirmarPassword"
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    fullWidth
                    error={touched.confirmarPassword && Boolean(errors.confirmarPassword)}
                    helperText={touched.confirmarPassword && errors.confirmarPassword}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || loading}
                      sx={{ borderRadius: 20 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Cambiar Contraseña'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
      
      {/* Notificación de éxito */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Box>
  );
};

export default PerfilCambiarPassword;