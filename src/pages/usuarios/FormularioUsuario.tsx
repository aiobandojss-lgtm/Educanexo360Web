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
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Phone,
  PersonRemove,
  Search,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaces
interface Escuela {
  _id: string;
  nombre: string;
}

interface Estudiante {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
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
  perfil: {
    telefono?: string;
  };
  info_academica?: {
    estudiantes_asociados?: string[];
  };
}

const FormularioUsuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [usuario, setUsuario] = useState<any>(null);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const isEditMode = Boolean(id);
  const [telefono, setTelefono] = useState("");
  
  // Nuevos estados para la asociación de estudiantes
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState<boolean>(false);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState<string>("");
  
  // Determinar si el usuario actual es super admin
  const isSuperAdmin = user?.tipo === 'SUPER_ADMIN';
  
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
    perfil: Yup.object().shape({
      telefono: Yup.string().max(20, 'El teléfono no puede tener más de 20 caracteres')
    })
  });

  // Valores iniciales para el formulario
  const initialValues: FormValues = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: 'ESTUDIANTE',
    estado: 'ACTIVO',
    escuelaId: user?.escuelaId || '', // Por defecto, asignar la escuela del usuario actual
    perfil: {
      telefono: ''
    },
    info_academica: {
      estudiantes_asociados: []
    }
  };

  // Función para cargar estudiantes
  const cargarEstudiantes = async (query: string = "") => {
    try {
      setLoadingEstudiantes(true);
      console.log("[DEBUG] Cargando estudiantes con query:", query);
      
      // Construir URL con parámetros de búsqueda
      let url = '/usuarios?tipo=ESTUDIANTE&estado=ACTIVO';
      if (query) {
        url += `&busqueda=${encodeURIComponent(query)}`;
      }
      
      const response = await axiosInstance.get(url);
      
      if (response.data?.success) {
        console.log("[DEBUG] Estudiantes cargados:", response.data.data.length);
        setEstudiantes(response.data.data || []);
      }
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
    } finally {
      setLoadingEstudiantes(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar escuelas según permisos
        if (isSuperAdmin) {
          // Si es super admin, cargar todas las escuelas
          const escuelasResponse = await axiosInstance.get('/escuelas');
          setEscuelas(escuelasResponse.data.data || []);
        } else if (user?.escuelaId) {
          // Si no es super admin, cargar solo su escuela
          try {
            const escuelaResponse = await axiosInstance.get(`/escuelas/${user.escuelaId}`);
            if (escuelaResponse.data?.success) {
              setEscuelas([escuelaResponse.data.data]);
            }
          } catch (error) {
            // Si falla, al menos tener el ID disponible
            setEscuelas([{ _id: user.escuelaId, nombre: 'Tu escuela' }]);
          }
        }

        // Si estamos en modo edición, cargar datos del usuario
        if (isEditMode && id) {
          const usuarioResponse = await axiosInstance.get(`/usuarios/${id}`);
          if (usuarioResponse.data?.success) {
            const userData = usuarioResponse.data.data;
            setUsuario(userData);
            
            if (userData.perfil?.telefono) {
              setTelefono(userData.perfil.telefono);
            }
            
            // Si es un acudiente, cargar los estudiantes asociados
            if (userData.tipo === 'ACUDIENTE' && userData.info_academica?.estudiantes_asociados) {
              try {
                const estudiantesIds = userData.info_academica.estudiantes_asociados;
                console.log("[DEBUG] Cargando estudiantes asociados:", estudiantesIds);
                
                if (estudiantesIds && estudiantesIds.length > 0) {
                  // Cargar detalles de los estudiantes asociados
                  const promesas = estudiantesIds.map((estId: string) => 
                    axiosInstance.get(`/usuarios/${estId}`)
                  );
                  
                  const resultados = await Promise.all(promesas);
                  const estudiantesData = resultados
                    .filter(res => res.data && res.data.success)
                    .map(res => res.data.data);
                  
                  console.log("[DEBUG] Estudiantes asociados cargados:", estudiantesData.length);
                  setEstudiantesSeleccionados(estudiantesData);
                }
                
                // También cargar posibles estudiantes para asociar
                cargarEstudiantes();
              } catch (err) {
                console.error('Error al cargar estudiantes asociados:', err);
              }
            }
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
  }, [id, isEditMode, user?.escuelaId, isSuperAdmin]);

  // Función para agregar estudiante a la lista
  const agregarEstudiante = (estudiante: Estudiante) => {
    // Verificar si ya está seleccionado
    const yaSeleccionado = estudiantesSeleccionados.some(e => e._id === estudiante._id);
    
    if (!yaSeleccionado) {
      console.log("[DEBUG] Agregando estudiante:", estudiante.nombre, estudiante.apellidos);
      setEstudiantesSeleccionados([...estudiantesSeleccionados, estudiante]);
    }
  };
  
  // Función para eliminar estudiante de la lista
  const eliminarEstudiante = (estudianteId: string) => {
    console.log("[DEBUG] Eliminando estudiante con ID:", estudianteId);
    setEstudiantesSeleccionados(estudiantesSeleccionados.filter(e => e._id !== estudianteId));
  };

  // Función para buscar estudiantes
  const buscarEstudiantes = () => {
    console.log("[DEBUG] Buscando estudiantes con término:", busquedaEstudiante);
    cargarEstudiantes(busquedaEstudiante);
  };

  const handleSubmit = async (values: FormValues, { setSubmitting }: any) => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Asegurar que se asigne la escuela del usuario actual si no es super admin
      if (!isSuperAdmin) {
        values.escuelaId = user?.escuelaId || values.escuelaId;
      }
  
      // Si es acudiente, añadir los estudiantes seleccionados
      if (values.tipo === 'ACUDIENTE') {
        console.log("[DEBUG] Guardando acudiente con estudiantes:", estudiantesSeleccionados.map(e => e._id));
        
        // Crear objeto con la información completa
        const dataToSend = {
          ...values,
          info_academica: {
            estudiantes_asociados: estudiantesSeleccionados.map(e => e._id)
          },
          perfil: {
            telefono: telefono
          }
        };
        
        // Eliminar campos que no deben enviarse
        if (isEditMode && !values.password) {
          // En lugar de usar delete, crear un objeto nuevo omitiendo las propiedades
          const { password, confirmPassword, ...dataSinPassword } = dataToSend;
          
          // Guardar
          if (isEditMode) {
            await axiosInstance.put(`/usuarios/${id}`, dataSinPassword);
          } else {
            await axiosInstance.post('/auth/register', dataSinPassword);
          }
        } else {
          // Omitir solo confirmPassword
          const { confirmPassword, ...dataSinConfirm } = dataToSend;
          
          // Guardar
          if (isEditMode) {
            await axiosInstance.put(`/usuarios/${id}`, dataSinConfirm);
          } else {
            await axiosInstance.post('/auth/register', dataSinConfirm);
          }
        }
        
        // Guardar
        if (isEditMode) {
          await axiosInstance.put(`/usuarios/${id}`, dataToSend);
        } else {
          await axiosInstance.post('/auth/register', dataToSend);
        }
      } else {
        // Código normal para otros tipos de usuario
        const dataWithPhone = {
          ...values,
          perfil: {
            telefono: telefono
          }
        };
      
        if (isEditMode && !values.password) {
          const { password, confirmPassword, ...dataToSend } = dataWithPhone;
          await axiosInstance.put(`/usuarios/${id}`, dataToSend);
        } else {
          const { confirmPassword, ...dataToSend } = dataWithPhone;
          if (isEditMode) {
            await axiosInstance.put(`/usuarios/${id}`, dataToSend);
          } else {
            await axiosInstance.post('/auth/register', dataToSend);
          }
        }
      }
  
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
      password: '',
      confirmPassword: '',
      escuelaId: usuario.escuelaId?._id || usuario.escuelaId,
      perfil: {
        telefono: usuario.perfil?.telefono || ''
      },
      info_academica: usuario.info_academica || { estudiantes_asociados: [] }
    }
  : initialValues;

  console.log("TIPO DE USUARIO EN FORMULARIO:", formValues.tipo);

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
          {({ errors, touched, isSubmitting, values, handleChange, handleBlur, setFieldValue }) => (
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

                  <Grid item xs={12} sm={6}>
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
                  
                  {/* Nuevo campo de teléfono */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Teléfono"
                      fullWidth
                      variant="outlined"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
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
                        onChange={(e) => {
                          // Cambiar el tipo en el formulario
                          handleChange(e);
                          
                          // Si cambia a acudiente, cargar estudiantes
                          if (e.target.value === 'ACUDIENTE') {
                            console.log("[DEBUG] Tipo cambiado a ACUDIENTE, cargando estudiantes...");
                            setTimeout(() => cargarEstudiantes(), 100);
                          }
                        }}
                        onBlur={handleBlur}
                        label="Tipo de Usuario"
                        sx={{ borderRadius: 2 }}
                      >
                        {/* Mostrar SUPER_ADMIN solo si el usuario actual es SUPER_ADMIN */}
                        {isSuperAdmin && (
                          <MenuItem value="SUPER_ADMIN">Super Administrador</MenuItem>
                        )}
                        <MenuItem value="ADMIN">Administrador</MenuItem>
                        <MenuItem value="DOCENTE">Docente</MenuItem>
                        <MenuItem value="ACUDIENTE">Acudiente</MenuItem> {/* Cambiado de PADRE a ACUDIENTE */}
                        <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
                        <MenuItem value="COORDINADOR">Coordinador</MenuItem> {/* Nuevo rol */}
                        <MenuItem value="RECTOR">Rector</MenuItem> {/* Nuevo rol */}
                        <MenuItem value="ADMINISTRATIVO">Administrativo</MenuItem> {/* Nuevo rol */}
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
                    {isSuperAdmin ? (
                      // Si es super admin, mostrar selector de escuelas
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
                    ) : (
                      // Si no es super admin, mostrar campo de solo lectura y establecer el valor
                      <>
                        <TextField
                          fullWidth
                          label="Escuela"
                          value={escuelas.length > 0 ? escuelas[0].nombre : 'Tu escuela'}
                          disabled
                          variant="outlined"
                          sx={{ mb: 1 }}
                          InputProps={{
                            readOnly: true,
                            sx: { borderRadius: 2 }
                          }}
                        />
                        <input 
                          type="hidden" 
                          name="escuelaId" 
                          value={user?.escuelaId || values.escuelaId} 
                        />
                        <Typography variant="caption" color="text.secondary">
                          Los usuarios se crearán automáticamente en tu escuela
                        </Typography>
                      </>
                    )}
                  </Grid>

                  {/* SECCIÓN DE ESTUDIANTES ASOCIADOS - SOLO PARA ACUDIENTES */}
                  {formValues.tipo === 'ACUDIENTE' && (
                    <Grid item xs={12}>
                      <Box sx={{ 
                        mt: 4, 
                        p: 3, 
                        bgcolor: '#f0f7ff', 
                        borderRadius: 3,
                        border: '2px solid #3f51b5'
                      }}>
                        <Typography variant="h3" color="primary.main" gutterBottom>
                          Estudiantes Asociados
                        </Typography>
                        <Typography variant="body1" paragraph>
                          Seleccione los estudiantes que estarán asociados a este acudiente.
                          Esta información es crucial para el sistema de mensajería.
                        </Typography>
                        
                        {/* Buscador de estudiantes */}
                        <Box sx={{ display: 'flex', mb: 3, mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Buscar estudiante"
                            variant="outlined"
                            placeholder="Nombre, apellido o email"
                            value={busquedaEstudiante}
                            onChange={(e) => setBusquedaEstudiante(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Search />
                                </InputAdornment>
                              ),
                              sx: { borderRadius: 2 }
                            }}
                            sx={{ mr: 1 }}
                          />
                          <Button 
                            variant="contained" 
                            onClick={buscarEstudiantes}
                            disabled={loadingEstudiantes}
                            sx={{ minWidth: '120px', borderRadius: 2 }}
                          >
                            {loadingEstudiantes ? <CircularProgress size={24} /> : "Buscar"}
                          </Button>
                        </Box>
                        
                        {/* Resultados de búsqueda */}
                        {estudiantes.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                              Resultados de búsqueda ({estudiantes.length}):
                            </Typography>
                            <Paper variant="outlined" sx={{ maxHeight: '300px', overflow: 'auto' }}>
                              <List dense>
                                {estudiantes.map((estudiante) => (
                                  <ListItem key={estudiante._id} divider>
                                    <ListItemText
                                      primary={`${estudiante.nombre} ${estudiante.apellidos}`}
                                      secondary={estudiante.email}
                                    />
                                    <Button
                                      variant="outlined"
                                      color="primary"
                                      onClick={() => agregarEstudiante(estudiante)}
                                      size="small"
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Asociar
                                    </Button>
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          </Box>
                        )}
                        
                        {/* Lista de estudiantes asociados */}
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            Estudiantes asociados a este acudiente:
                          </Typography>
                          
                          {estudiantesSeleccionados.length === 0 ? (
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                              No hay estudiantes asociados a este acudiente. Utilice el buscador para añadir estudiantes.
                            </Alert>
                          ) : (
                            <Paper variant="outlined" sx={{ maxHeight: '300px', overflow: 'auto' }}>
                              <List dense>
                                {estudiantesSeleccionados.map((estudiante) => (
                                  <ListItem key={estudiante._id} divider>
                                    <ListItemText
                                      primary={`${estudiante.nombre} ${estudiante.apellidos}`}
                                      secondary={estudiante.email}
                                    />
                                    <ListItemSecondaryAction>
                                      <IconButton 
                                        edge="end" 
                                        aria-label="delete" 
                                        onClick={() => eliminarEstudiante(estudiante._id)}
                                        color="error"
                                      >
                                        <PersonRemove />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </List>
                            </Paper>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                  )}

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