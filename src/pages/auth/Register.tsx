// src/pages/auth/Register.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { register } from '../../services/authService';
import { registerStart, registerSuccess, registerFailure } from '../../redux/slices/authSlice';
import { RootState } from '../../redux/store';
import { ensureUserHasState } from '../../types/user.types';
import axiosInstance from '../../api/axiosConfig';

// Esquema de validación con Yup
const RegisterSchema = Yup.object().shape({
  nombre: Yup.string()
    .required('El nombre es requerido'),
  apellidos: Yup.string()
    .required('Los apellidos son requeridos'),
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  tipo: Yup.string()
    .required('El tipo de usuario es requerido'),
  escuelaId: Yup.string()
    .required('La escuela es requerida'),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [escuelas, setEscuelas] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  
  // Obtener estado de autenticación del Redux store
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  useEffect(() => {
    // Cargar la lista de escuelas
    const fetchEscuelas = async () => {
      try {
        const response = await axiosInstance.get('/escuelas');
        if (response.data && response.data.data) {
          setEscuelas(response.data.data);
        } else {
          console.warn('Formato de respuesta inesperado al cargar escuelas');
          setEscuelas([{ _id: '67b929303b00e9a4c428c9f2', nombre: 'Escuela Demo' }]);
        }
      } catch (err) {
        console.error('Error al cargar escuelas:', err);
        // Valor por defecto para desarrollo
        setEscuelas([{ _id: '67b929303b00e9a4c428c9f2', nombre: 'Escuela Demo' }]);
      }
    };
    
    fetchEscuelas();
  }, []);

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      dispatch(registerStart());
      
      const { user } = await register(values);
      dispatch(registerSuccess(ensureUserHasState(user)));
      
      // Registro exitoso, redirigir al login
      navigate('/login', { state: { message: 'Registro exitoso. Puedes iniciar sesión ahora.' } });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrarse';
      dispatch(registerFailure(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    navigate('/login');
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
            Registro de Usuario
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Formik
            initialValues={{
              nombre: '',
              apellidos: '',
              email: '',
              password: '',
              tipo: '',
              escuelaId: '',
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values, handleChange }) => (
              <Form>
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="nombre"
                    label="Nombre"
                    name="nombre"
                    margin="normal"
                    error={touched.nombre && Boolean(errors.nombre)}
                    helperText={touched.nombre && errors.nombre}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="apellidos"
                    label="Apellidos"
                    name="apellidos"
                    margin="normal"
                    error={touched.apellidos && Boolean(errors.apellidos)}
                    helperText={touched.apellidos && errors.apellidos}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoComplete="email"
                    margin="normal"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Field
                    as={TextField}
                    fullWidth
                    name="password"
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
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
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth margin="normal" error={touched.tipo && Boolean(errors.tipo)}>
                    <InputLabel id="tipo-label">Tipo de Usuario</InputLabel>
                    <Select
                      labelId="tipo-label"
                      id="tipo"
                      name="tipo"
                      value={values.tipo}
                      onChange={handleChange}
                      label="Tipo de Usuario"
                    >
                      <MenuItem value="ADMIN">Administrador</MenuItem>
                      <MenuItem value="DOCENTE">Docente</MenuItem>
                      <MenuItem value="PADRE">Padre de Familia</MenuItem>
                      <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
                    </Select>
                    {touched.tipo && errors.tipo && (
                      <Typography variant="caption" color="error">
                        {errors.tipo}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth margin="normal" error={touched.escuelaId && Boolean(errors.escuelaId)}>
                    <InputLabel id="escuela-label">Escuela</InputLabel>
                    <Select
                      labelId="escuela-label"
                      id="escuelaId"
                      name="escuelaId"
                      value={values.escuelaId}
                      onChange={handleChange}
                      label="Escuela"
                    >
                      {escuelas.map((escuela) => (
                        <MenuItem key={escuela._id} value={escuela._id}>
                          {escuela.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.escuelaId && errors.escuelaId && (
                      <Typography variant="caption" color="error">
                        {errors.escuelaId}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || loading}
                  sx={{ mt: 3, mb: 2, borderRadius: '20px' }}
                >
                  {(isSubmitting || loading) ? <CircularProgress size={24} /> : 'Registrarse'}
                </Button>
                
                <Button
                  fullWidth
                  variant="text"
                  onClick={navigateToLogin}
                  sx={{ mt: 1 }}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;