// src/pages/usuarios/CambiarPassword.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  LockReset,
} from '@mui/icons-material';
import usuarioService from '../../services/usuarioService';

// Esquema de validación
const PasswordSchema = Yup.object().shape({
  passwordActual: Yup.string().required('La contraseña actual es requerida'),
  nuevaPassword: Yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La nueva contraseña es requerida'),
  confirmarPassword: Yup.string()
    .oneOf([Yup.ref('nuevaPassword')], 'Las contraseñas deben coincidir')
    .required('Confirme su nueva contraseña'),
});

// Interfaz para los valores iniciales del formulario
interface FormValues {
  passwordActual: string;
  nuevaPassword: string;
  confirmarPassword: string;
}

const CambiarPassword = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordActual, setShowPasswordActual] = useState<boolean>(false);
  const [showNuevaPassword, setShowNuevaPassword] = useState<boolean>(false);
  const [showConfirmarPassword, setShowConfirmarPassword] = useState<boolean>(false);

  // Valores iniciales para el formulario
  const initialValues: FormValues = {
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: '',
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: any) => {
    try {
      setError(null);
      setSuccess(null);
      
      if (!id) {
        throw new Error('ID de usuario no especificado');
      }

      await usuarioService.cambiarPassword(
        id,
        values.passwordActual,
        values.nuevaPassword
      );

      setSuccess('Contraseña actualizada exitosamente');
      resetForm();
    } catch (err: any) {
      console.error('Error al cambiar contraseña:', err);
      setError(
        err.response?.data?.message || 'Ocurrió un error al cambiar la contraseña. Intente nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/usuarios/${id}`)}
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
          Cambiar Contraseña
        </Typography>
      </Box>

      {/* Mensajes de error y éxito */}
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

      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {success}
        </Alert>
      )}

      {/* Formulario */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
          <Typography variant="h3">
            Actualizar Contraseña
          </Typography>
        </Box>

        <Formik
          initialValues={initialValues}
          validationSchema={PasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
            <Form>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      name="passwordActual"
                      label="Contraseña Actual"
                      fullWidth
                      variant="outlined"
                      type={showPasswordActual ? 'text' : 'password'}
                      value={values.passwordActual}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.passwordActual && Boolean(errors.passwordActual)}
                      helperText={touched.passwordActual && errors.passwordActual}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPasswordActual(!showPasswordActual)}
                            edge="end"
                          >
                            {showPasswordActual ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="nuevaPassword"
                      label="Nueva Contraseña"
                      fullWidth
                      variant="outlined"
                      type={showNuevaPassword ? 'text' : 'password'}
                      value={values.nuevaPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nuevaPassword && Boolean(errors.nuevaPassword)}
                      helperText={touched.nuevaPassword && errors.nuevaPassword}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowNuevaPassword(!showNuevaPassword)}
                            edge="end"
                          >
                            {showNuevaPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      name="confirmarPassword"
                      label="Confirmar Nueva Contraseña"
                      fullWidth
                      variant="outlined"
                      type={showConfirmarPassword ? 'text' : 'password'}
                      value={values.confirmarPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmarPassword && Boolean(errors.confirmarPassword)}
                      helperText={touched.confirmarPassword && errors.confirmarPassword}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowConfirmarPassword(!showConfirmarPassword)}
                            edge="end"
                          >
                            {showConfirmarPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
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
                        onClick={() => navigate(`/usuarios/${id}`)}
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
                        startIcon={<LockReset />}
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
                          'Actualizar Contraseña'
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

export default CambiarPassword;