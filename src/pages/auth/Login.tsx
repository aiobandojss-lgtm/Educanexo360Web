// src/pages/auth/Login.tsx (actualizado)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { login } from '../../services/authService';
import { loginStart, loginSuccess, loginFailure } from '../../redux/slices/authSlice';

// Esquema de validación con Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: any) => {
    try {
      setError(null);
      dispatch(loginStart());
      
      const { user } = await login(values.email, values.password);
      dispatch(loginSuccess(user));
      
      // Redirigir al dashboard
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        bgcolor: 'background.default',
        py: 8
      }}
    >
      <Container component="main" maxWidth="xs">
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Box 
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h1" align="center" color="primary.main" gutterBottom>
              EducaNexo360
            </Typography>
            <Typography variant="h3" align="center" color="text.secondary" gutterBottom>
              Iniciar Sesión
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2, width: '100%', borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form style={{ width: '100%' }}>
                  <Field
                    as={TextField}
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    sx={{ mb: 2 }}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <Field
                    as={TextField}
                    margin="normal"
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    sx={{ mb: 3 }}
                    InputProps={{ sx: { borderRadius: 2 } }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, mb: 2, py: 1.2 }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
                  </Button>
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button 
                      color="secondary"
                      onClick={() => navigate('/register')}
                    >
                      ¿No tienes cuenta? Regístrate
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;