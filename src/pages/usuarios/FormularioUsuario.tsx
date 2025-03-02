// src/pages/usuarios/FormularioUsuario.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';

// Interfaces
interface Escuela {
  _id: string;
  nombre: string;
}

interface FormValues {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  confirmPassword: string;
  tipo: string;
  estado: string;
  escuelaId: string;
}

const FormularioUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<any>(null);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const isEditMode = Boolean(id);

  // Esquema de validación
  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es requerido'),
    apellidos: Yup.string().required('Los apellidos son requeridos'),
    email: Yup.string()
      .email('Formato de email no válido')
      .required('El email es requerido'),
    password: isEditMode
      ? Yup.string()
      : Yup.string()
          .min(6, 'La contraseña debe tener al menos 6 caracteres')
          .required('La contraseña es requerida'),
    confirmPassword: isEditMode
      ? Yup.string().oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
      : Yup.string()
          .oneOf([Yup.ref('password')], 'Las contraseñas deben coincidir')
          .required('Confirma tu contraseña'),
    tipo: Yup.string().required('El tipo de usuario es requerido'),
    estado: Yup.string().required('El estado es requerido'),
    escuelaId: Yup.string().required('La escuela es requerida'),
  });

  // Valores iniciales para el formulario
  const initialValues: FormValues = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: 'ESTUDIANTE', // Valor por defecto
    estado: 'ACTIVO', // Valor por defecto
    escuelaId: '',
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar escuelas
        const escuelasResponse = await axiosInstance.get('/escuelas');
        setEscuelas(escuelasResponse.data.data || []);

        // Si estamos en modo edición, cargar datos del usuario
        if (isEditMode && id) {
          const usuarioResponse = await axiosInstance.get(`/usuarios/${id}`);
          if (usuarioResponse.data?.success) {
            setUsuario(usuarioResponse.data.data);
          }
        }
      } catch (err: any) {
        console.error('Error al cargar datos:', err);
        setError(
          err.response?.data?.message || 'No se pudieron cargar los datos. Intente nuevamente.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, isEditMode]);

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      setSubmitting(true);
      setError(null);

      // Si no hay cambios en la contraseña en modo edición, eliminarla de los datos a enviar
      if (isEditMode && !values.password) {
        const { password, confirmPassword, ...dataToSend } = values;
        
        // Actualizar usuario
        await axiosInstance.put(`/usuarios/${id}`, dataToSend);
      } else {
        // Para nueva creación o actualización con contraseña
        const { confirmPassword, ...dataToSend } = values;
        
        if (isEditMode) {
          await axiosInstance.put(`/usuarios/${id}`, dataToSend);
        } else {
          // Crear nuevo usuario - usar la ruta de registro para nuevos usuarios
          await axiosInstance.post('/auth/register', dataToSend);
        }
      }

      // Redireccionar a la lista de usuarios con mensaje de éxito
      navigate('/usuarios', {
        state: {
          message: isEditMode
            ? 'Usuario actualizado exitosamente'
            : 'Usuario creado exitosamente',
        },
      });
    } catch (err: any) {
      console.error('Error al guardar usuario:', err);
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
  const formValues = isEditMode && usuario
    ? {
        ...initialValues,
        ...usuario,
        password: '', // No mostrar contraseña en modo edición
        confirmPassword: '',
        escuelaId: usuario.escuelaId?._id || usuario.escuelaId,
      }
    : initialValues;

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/usuarios')}
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
          {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
        </Typography>
      </Box>

      {/* Mensaje de error global */}
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
            {isEditMode ? 'Información del Usuario' : 'Nuevo Usuario'}
          </Typography>
        </Box>

        <Formik
          initialValues={formValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur }) => (
            <Form>
              <Box sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Datos personales */}
                  <Grid item xs={12}>
                    <Typography variant="h3" color="primary.main" gutterBottom>
                      Datos Personales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

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

                  {/* Contraseña */}
                  <Grid item xs={12}>
                    <Typography variant="h3" color="primary.main" gutterBottom>
                      Contraseña
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {isEditMode && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        Dejar en blanco para mantener la contraseña actual
                      </Typography>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="password"
                      label="Contraseña"
                      fullWidth
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="confirmPassword"
                      label="Confirmar Contraseña"
                      fullWidth
                      variant="outlined"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        ),
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>

                  {/* Información del sistema */}
                  <Grid item xs={12}>
                    <Typography variant="h3" color="primary.main" gutterBottom>
                      Información del Sistema
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl
                      fullWidth
                      error={touched.tipo && Boolean(errors.tipo)}
                      variant="outlined"
                    >
                      <InputLabel id="tipo-label">Tipo de Usuario</InputLabel>
                      <Select
                        labelId="tipo-label"
                        id="tipo"
                        name="tipo"
                        value={values.tipo}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Tipo de Usuario"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="ADMIN">Administrador</MenuItem>
                        <MenuItem value="DOCENTE">Docente</MenuItem>
                        <MenuItem value="PADRE">Padre de Familia</MenuItem>
                        <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
                      </Select>
                      <FormHelperText>{touched.tipo && errors.tipo}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
                      </Select>
                      <FormHelperText>{touched.estado && errors.estado}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      error={touched.escuelaId && Boolean(errors.escuelaId)}
                      variant="outlined"
                    >
                      <InputLabel id="escuela-label">Escuela</InputLabel>
                      <Select
                        labelId="escuela-label"
                        id="escuelaId"
                        name="escuelaId"
                        value={values.escuelaId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="Escuela"
                        sx={{ borderRadius: 2 }}
                      >
                        {escuelas.map((escuela) => (
                          <MenuItem key={escuela._id} value={escuela._id}>
                            {escuela.nombre}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{touched.escuelaId && errors.escuelaId}</FormHelperText>
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
                        onClick={() => navigate('/usuarios')}
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

export default FormularioUsuario;