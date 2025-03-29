// src/pages/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../../services/authService';
import { loginSuccess } from '../../redux/slices/authSlice';
import { ensureUserHasState } from '../../types/user.types';

// Schema de validación para login
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().required('La contraseña es requerida'),
});

// Componente de Login
const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Verificar si hay un mensaje en location state (ej: después de registro exitoso)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  const handleSubmit = async (values: { email: string; password: string }, { setSubmitting }: any) => {
    try {
      setError(null);
      
      const { user } = await login(values.email, values.password);
      dispatch(loginSuccess(ensureUserHasState(user)));
      
      // Redirigir al dashboard
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            EducaNexo360
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom>
            Iniciar Sesión
          </Typography>
          
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  id="email"
                  name="email"
                  label="Correo electrónico"
                  margin="normal"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                
                <Field
                  as={TextField}
                  fullWidth
                  id="password"
                  name="password"
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  margin="normal"
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2, borderRadius: '20px' }}
                >
                  {isSubmitting ? <CircularProgress size={24} /> : 'Ingresar'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link href="#" variant="body2">
                    ¿Olvidaste tu contraseña?
                  </Link>
                  <Box mt={1}>
                    <Link href="/register" variant="body2">
                      {"¿No tienes cuenta? Regístrate"}
                    </Link>
                  </Box>
                </Box>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;