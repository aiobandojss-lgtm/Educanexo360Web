// src/pages/usuarios/DetalleUsuario.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  FormHelperText,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Key as KeyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import AsociarEstudiantes from '../../components/usuarios/AsociarEstudiantes';
import { RootState } from '../../redux/store';

interface Escuela {
  _id: string;
  nombre: string;
}

interface InfoAcademica {
  grado?: string;
  docente_principal?: string;
  cursos?: string[];
  estudiantes_asociados?: string[];
}

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  escuelaId: string;
  estado: string;
  info_academica?: InfoAcademica;
}

const DetalleUsuario: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const isNewUser = id === 'nuevo' || !id;
  
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [escuelas, setEscuelas] = useState<Escuela[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [estudiantesAsociados, setEstudiantesAsociados] = useState<string[]>([]);
  const [escuelasLoaded, setEscuelasLoaded] = useState<boolean>(false);

  // Schema de validación
  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es requerido'),
    apellidos: Yup.string().required('Los apellidos son requeridos'),
    email: Yup.string().email('Email inválido').required('El email es requerido'),
    tipo: Yup.string().required('El tipo de usuario es requerido'),
    escuelaId: Yup.string().required('La escuela es requerida'),
    password: isNewUser ? Yup.string().min(6, 'La contraseña debe tener al menos 6 caracteres').required('La contraseña es requerida') : Yup.string(),
  });

  // Formik para manejo del formulario
  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellidos: '',
      email: '',
      tipo: '',
      escuelaId: '',
      password: '',
      estado: 'ACTIVO',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaveLoading(true);
        setError(null);
        setSuccess(null);
        
        // Preparar datos a enviar
        const dataToSend = { ...values } as { [key: string]: any };
        
        // Eliminamos password si está vacío para no enviarlo
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        
        // Si es un acudiente, incluir estudiantes asociados
        if (values.tipo === 'ACUDIENTE' && !isNewUser) {
          dataToSend.info_academica = {
            ...dataToSend.info_academica,
            estudiantes_asociados: estudiantesAsociados
          };
        }
        
        console.log('Datos a enviar:', dataToSend);
        
        if (isNewUser) {
          // Crear nuevo usuario
          const createResponse = await axiosInstance.post('/auth/register', dataToSend);
          console.log('Respuesta de creación:', createResponse);
          setSuccess('Usuario creado exitosamente');
          setTimeout(() => navigate('/usuarios'), 2000);
        } else {
          // Actualizar usuario existente
          const updateResponse = await axiosInstance.put(`/usuarios/${id}`, dataToSend);
          console.log('Respuesta de actualización:', updateResponse);
          setSuccess('Usuario actualizado exitosamente');
          
          // Recargar el usuario para mostrar los cambios
          cargarUsuario();
        }
      } catch (err: any) {
        console.error('Error al guardar usuario:', err);
        setError(err.response?.data?.message || 'Error al guardar los datos del usuario');
      } finally {
        setSaveLoading(false);
      }
    },
  });

  // Función para cargar las escuelas
  const cargarEscuelas = async () => {
    try {
      console.log('Cargando escuelas...');
      const response = await axiosInstance.get('/escuelas');
      
      if (response.data && response.data.data) {
        console.log('Escuelas cargadas:', response.data.data.length);
        setEscuelas(response.data.data || []);
        setEscuelasLoaded(true);
      } else {
        console.error('Formato de respuesta inesperado al cargar escuelas:', response);
        setError('Error al cargar la lista de escuelas');
      }
    } catch (err: any) {
      console.error('Error al cargar escuelas:', err);
      
      if (err.response && err.response.status === 403) {
        console.log('Error de permisos. Intentando usar la escuela del usuario actual.');
        // Si hay error de permisos, usamos la escuela del usuario actual
        if (user && user.escuelaId) {
          setEscuelas([{ _id: user.escuelaId, nombre: 'Tu escuela actual' }]);
          setEscuelasLoaded(true);
        }
      }
    }
  };

  // Función para cargar el usuario
  const cargarUsuario = async () => {
    try {
      setError(null);
      
      if (!isNewUser && id) {
        console.log('Cargando usuario con ID:', id);
        const response = await axiosInstance.get(`/usuarios/${id}`);
        
        if (response.data && response.data.data) {
          const userData = response.data.data;
          console.log('Usuario cargado:', userData);
          setUsuario(userData);
          
          // Establecer los valores del formulario
          formik.setValues({
            nombre: userData.nombre || '',
            apellidos: userData.apellidos || '',
            email: userData.email || '',
            tipo: userData.tipo || '',
            escuelaId: userData.escuelaId || '',
            password: '', // No cargamos la contraseña por seguridad
            estado: userData.estado || 'ACTIVO',
          });
          
          // Establecer estudiantes asociados si es un acudiente
          if (userData.tipo === 'ACUDIENTE' && userData.info_academica?.estudiantes_asociados) {
            setEstudiantesAsociados(userData.info_academica.estudiantes_asociados);
          }
        } else {
          console.error('Formato de respuesta inesperado al cargar usuario:', response);
          setError('Error al cargar los datos del usuario');
        }
      } else if (isNewUser && user && user.escuelaId) {
        // Si es un usuario nuevo, establecer la escuela del usuario actual por defecto
        formik.setFieldValue('escuelaId', user.escuelaId);
      }
    } catch (err: any) {
      console.error('Error al cargar usuario:', err);
      setError(err.response?.data?.message || 'Error al cargar los datos del usuario');
    }
  };

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    const inicializarComponente = async () => {
      setLoading(true);
      
      try {
        // Primero cargar las escuelas
        await cargarEscuelas();
        
        // Luego cargar el usuario (si no es nuevo)
        if (!isNewUser) {
          await cargarUsuario();
        } else {
          // Si es un usuario nuevo y tenemos la escuelaId del usuario actual, la usamos
          if (user && user.escuelaId) {
            formik.setFieldValue('escuelaId', user.escuelaId);
          }
        }
      } catch (err) {
        console.error('Error durante la inicialización del componente:', err);
      } finally {
        setLoading(false);
      }
    };
    
    inicializarComponente();
  }, [id, isNewUser]);

  const handleCambiarPassword = () => {
    navigate(`/usuarios/${id}/cambiar-password`);
  };

  const handleEstudiantesChange = (estudiantes: string[]) => {
    setEstudiantesAsociados(estudiantes);
  };

  const handleRecargarEscuelas = async () => {
    setLoading(true);
    await cargarEscuelas();
    setLoading(false);
  };

  const getTipoLabel = (tipo: string) => {
    switch(tipo) {
      case 'ADMIN': return 'Administrador';
      case 'DOCENTE': return 'Docente';
      case 'ESTUDIANTE': return 'Estudiante';
      case 'ACUDIENTE': return 'Acudiente';
      case 'COORDINADOR': return 'Coordinador';
      case 'RECTOR': return 'Rector';
      case 'ADMINISTRATIVO': return 'Administrativo';
      default: return tipo;
    }
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        {isNewUser ? 'Nuevo Usuario' : 'Editar Usuario'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {success}
        </Alert>
      )}
      
      {!escuelasLoaded && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRecargarEscuelas}
            >
              Intentar de nuevo
            </Button>
          }
        >
          No se pudieron cargar las escuelas. Puede continuar con la escuela actual o intentar recargar.
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              mb: 3
            }}
          >
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="nombre"
                    name="nombre"
                    label="Nombre"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                    disabled={saveLoading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="apellidos"
                    name="apellidos"
                    label="Apellidos"
                    value={formik.values.apellidos}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.apellidos && Boolean(formik.errors.apellidos)}
                    helperText={formik.touched.apellidos && formik.errors.apellidos}
                    disabled={saveLoading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    disabled={saveLoading}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth
                    error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                    disabled={saveLoading}
                  >
                    <InputLabel id="tipo-label">Tipo de Usuario</InputLabel>
                    <Select
                      labelId="tipo-label"
                      id="tipo"
                      name="tipo"
                      value={formik.values.tipo}
                      label="Tipo de Usuario"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      <MenuItem value="ADMIN">Administrador</MenuItem>
                      <MenuItem value="DOCENTE">Docente</MenuItem>
                      <MenuItem value="ESTUDIANTE">Estudiante</MenuItem>
                      <MenuItem value="ACUDIENTE">Acudiente</MenuItem>
                      <MenuItem value="COORDINADOR">Coordinador</MenuItem>
                      <MenuItem value="RECTOR">Rector</MenuItem>
                      <MenuItem value="ADMINISTRATIVO">Administrativo</MenuItem>
                    </Select>
                    {formik.touched.tipo && formik.errors.tipo && (
                      <FormHelperText>{formik.errors.tipo}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth
                    error={formik.touched.escuelaId && Boolean(formik.errors.escuelaId)}
                    // Siempre deshabilitar el campo escuela para todos los roles
                    disabled={true}
                  >
                    <InputLabel id="escuela-label">Escuela</InputLabel>
                    <Select
                      labelId="escuela-label"
                      id="escuelaId"
                      name="escuelaId"
                      value={formik.values.escuelaId}
                      label="Escuela"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    >
                      {escuelas.map((escuela) => (
                        <MenuItem key={escuela._id} value={escuela._id}>
                          {escuela.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                    {formik.touched.escuelaId && formik.errors.escuelaId && (
                      <FormHelperText>{formik.errors.escuelaId}</FormHelperText>
                    )}
                    <FormHelperText>La escuela no puede modificarse. Se utiliza la escuela actual.</FormHelperText>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl 
                    fullWidth
                    disabled={saveLoading}
                  >
                    <InputLabel id="estado-label">Estado</InputLabel>
                    <Select
                      labelId="estado-label"
                      id="estado"
                      name="estado"
                      value={formik.values.estado}
                      label="Estado"
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="ACTIVO">Activo</MenuItem>
                      <MenuItem value="INACTIVO">Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {isNewUser && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="Contraseña"
                      type="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      disabled={saveLoading}
                    />
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    {!isNewUser && (
                      <Button
                        variant="outlined"
                        startIcon={<KeyIcon />}
                        onClick={handleCambiarPassword}
                        disabled={saveLoading}
                        sx={{ borderRadius: '20px' }}
                      >
                        Cambiar Contraseña
                      </Button>
                    )}
                    
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => navigate('/usuarios')}
                      disabled={saveLoading}
                      sx={{ borderRadius: '20px' }}
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={saveLoading ? <CircularProgress size={24} /> : <SaveIcon />}
                      disabled={saveLoading}
                      sx={{ borderRadius: '20px' }}
                    >
                      {saveLoading ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
          
          {/* Sección de estudiantes asociados (solo visible para usuarios tipo ACUDIENTE y cuando no es nuevo) */}
          {!isNewUser && formik.values.tipo === 'ACUDIENTE' && (
            <AsociarEstudiantes 
              acudienteId={id} 
              estudiantes={estudiantesAsociados}
              onEstudiantesChange={handleEstudiantesChange}
            />
          )}
        </>
      )}
    </Box>
  );
};

export default DetalleUsuario;