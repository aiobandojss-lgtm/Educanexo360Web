// src/pages/cursos/FormularioCurso.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  FormHelperText,
  Divider,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';

// Definir interfaces
interface Curso {
  _id: string;
  nombre: string;
  nivel: string;
  grado: string;
  grupo: string;
  jornada: string; // Nuevo campo
  año_academico: string;
  director_grupo: string | { _id: string; nombre: string; apellidos: string; };
  estado: string;
}

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
}

const FormularioCurso: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewCurso = !id || id === 'nuevo';
  
  const [curso, setCurso] = useState<Curso | null>(null);
  const [docentes, setDocentes] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<boolean>(false);

  const currentYear = new Date().getFullYear();

  // Schema de validación actualizado para incluir jornada
  const validationSchema = Yup.object({
    nombre: Yup.string().required('El nombre es requerido'),
    nivel: Yup.string().required('El nivel es requerido'),
    grado: Yup.string().required('El grado es requerido'),
    grupo: Yup.string().required('El grupo es requerido'),
    jornada: Yup.string().required('La jornada es requerida'),
    año_academico: Yup.string()
      .required('El año académico es requerido')
      .matches(/^\d{4}$/, 'El año académico debe tener formato YYYY'),
    director_grupo: Yup.string().required('El docente titular es requerido'),
    estado: Yup.string().required('El estado es requerido'),
  });

  // Formik para manejo del formulario (con campos actualizados)
  const formik = useFormik({
    initialValues: {
      nombre: '',
      nivel: '',
      grado: '',
      grupo: '',
      jornada: 'COMPLETA', // Valor predeterminado para jornada
      año_academico: currentYear.toString(), // Valor por defecto con el año actual
      director_grupo: '',
      estado: 'ACTIVO',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setNetworkError(false);
        
        // Preparo los valores a enviar al servidor
        const cursoData = {
          ...values,
          // Asegurarse de que director_grupo sea siempre un string (ID)
          director_grupo: typeof values.director_grupo === 'object' 
            ? (values.director_grupo as { _id: string })._id 
            : values.director_grupo,
          año_academico: values.año_academico,
        };
        
        console.log('Datos a enviar al servidor:', cursoData);
        
        if (isNewCurso) {
          // Llamada real al API para crear un nuevo curso
          const response = await axiosInstance.post('/cursos', cursoData);
          
          if (response.data.success) {
            setSuccess('Curso creado exitosamente');
            setTimeout(() => navigate('/cursos'), 2000);
          } else {
            throw new Error(response.data.message || 'Error al crear el curso');
          }
        } else {
          // Llamada real al API para actualizar un curso existente
          const response = await axiosInstance.put(`/cursos/${id}`, cursoData);
          
          if (response.data.success) {
            setSuccess('Curso actualizado exitosamente');
            setCurso(response.data.data);
          } else {
            throw new Error(response.data.message || 'Error al actualizar el curso');
          }
        }
      } catch (err: any) {
        console.error('Error al guardar curso:', err);
        
        // Detectar error de conexión
        if (err.message && err.message.includes('Network Error')) {
          setNetworkError(true);
        } else {
          setError(err.response?.data?.message || 'Error al guardar los datos del curso');
        }
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Cargar docentes y curso (si estamos en modo edición)
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        // Cargar lista de docentes
        try {
          const response = await axiosInstance.get('/usuarios', {
            params: { tipo: 'DOCENTE' } // Aseguramos que solo cargue DOCENTES
          });
          
          // Filtrar explícitamente solo usuarios de tipo DOCENTE
          const docentesFiltrados = (response.data.data || []).filter(
            (usuario: Usuario) => usuario.tipo === 'DOCENTE'
          );
          
          setDocentes(docentesFiltrados);
        } catch (err) {
          console.error('Error al cargar docentes:', err);
          setError('No se pudieron cargar los docentes disponibles');
        }
        
        // Si estamos en modo edición, cargar el curso
        if (!isNewCurso) {
          try {
            const cursoResponse = await axiosInstance.get(`/cursos/${id}`);
            const cursoData = cursoResponse.data.data;
            setCurso(cursoData);
            
            // Extraer el ID del director_grupo si es un objeto
            let directorGrupoId = cursoData.director_grupo;
            if (typeof cursoData.director_grupo === 'object' && cursoData.director_grupo !== null) {
              directorGrupoId = cursoData.director_grupo._id;
            }
            
            console.log("Valor recibido para director_grupo:", cursoData.director_grupo);
            console.log("Valor usado para formulario:", directorGrupoId);
            
            // Establecer valores del formulario, mapeando a los nombres de campo correctos
            formik.setValues({
              nombre: cursoData.nombre || '',
              nivel: cursoData.nivel || '',
              grado: cursoData.grado || '',
              grupo: cursoData.grupo || '',
              jornada: cursoData.jornada || 'COMPLETA', // Usar el valor del curso o el predeterminado
              año_academico: cursoData.año_academico || currentYear.toString(),
              director_grupo: directorGrupoId || '', // Usar el ID extraído
              estado: cursoData.estado || 'ACTIVO',
            });
          } catch (err) {
            console.error('Error al cargar curso:', err);
            setError('No se pudo cargar la información del curso. Por favor, intente nuevamente.');
          }
        }
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, [id, isNewCurso, currentYear]);

  const handleCloseNetworkError = () => {
    setNetworkError(false);
  };

  // Generar grados disponibles según el nivel
  const getGrados = (nivel: string) => {
    switch(nivel) {
      case 'PREESCOLAR':
        return ['Prejardín','Jardín', 'Transición'];
      case 'PRIMARIA':
        return ['1', '2', '3', '4', '5'];
      case 'SECUNDARIA':
        return ['6', '7', '8', '9'];
      case 'MEDIA':
        return ['10', '11'];
      default:
        return [];
    }
  };

  // Generar grupos disponibles
  const grupos = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        {isNewCurso ? 'Nuevo Curso' : 'Editar Curso'}
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
      
      {initialLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="nombre"
                  name="nombre"
                  label="Nombre del Curso"
                  value={formik.values.nombre}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                  helperText={formik.touched.nombre && formik.errors.nombre}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.nivel && Boolean(formik.errors.nivel)}
                  disabled={loading}
                >
                  <InputLabel id="nivel-label">Nivel</InputLabel>
                  <Select
                    labelId="nivel-label"
                    id="nivel"
                    name="nivel"
                    value={formik.values.nivel}
                    label="Nivel"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="PREESCOLAR">Preescolar</MenuItem>
                    <MenuItem value="PRIMARIA">Primaria</MenuItem>
                    <MenuItem value="SECUNDARIA">Secundaria</MenuItem>
                    <MenuItem value="MEDIA">Media</MenuItem>
                  </Select>
                  {formik.touched.nivel && formik.errors.nivel && (
                    <FormHelperText>{formik.errors.nivel}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="año_academico"
                  name="año_academico"
                  label="Año Académico (YYYY)"
                  value={formik.values.año_academico}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.año_academico && Boolean(formik.errors.año_academico)}
                  helperText={formik.touched.año_academico && formik.errors.año_academico}
                  disabled={loading}
                  placeholder="Ejemplo: 2025"
                />
              </Grid>
              
              {/* Campo de Jornada (nuevo) */}
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.jornada && Boolean(formik.errors.jornada)}
                  disabled={loading}
                >
                  <InputLabel id="jornada-label">Jornada</InputLabel>
                  <Select
                    labelId="jornada-label"
                    id="jornada"
                    name="jornada"
                    value={formik.values.jornada}
                    label="Jornada"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="MATUTINA">Matutina (Mañana)</MenuItem>
                    <MenuItem value="VESPERTINA">Vespertina (Tarde)</MenuItem>
                    <MenuItem value="NOCTURNA">Nocturna (Noche)</MenuItem>
                    <MenuItem value="COMPLETA">Completa (Todo el día)</MenuItem>
                  </Select>
                  {formik.touched.jornada && formik.errors.jornada && (
                    <FormHelperText>{formik.errors.jornada}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Campo de Grado */}
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.grado && Boolean(formik.errors.grado)}
                  disabled={loading || !formik.values.nivel}
                >
                  <InputLabel id="grado-label">Grado</InputLabel>
                  <Select
                    labelId="grado-label"
                    id="grado"
                    name="grado"
                    value={formik.values.grado}
                    label="Grado"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={!formik.values.nivel}
                  >
                    <MenuItem value="">
                      <em>Seleccione un grado</em>
                    </MenuItem>
                    {getGrados(formik.values.nivel).map((grado) => (
                      <MenuItem key={grado} value={grado}>
                        {grado}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.grado && formik.errors.grado && (
                    <FormHelperText>{formik.errors.grado}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Campo de Grupo */}
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.grupo && Boolean(formik.errors.grupo)}
                  disabled={loading}
                >
                  <InputLabel id="grupo-label">Grupo</InputLabel>
                  <Select
                    labelId="grupo-label"
                    id="grupo"
                    name="grupo"
                    value={formik.values.grupo}
                    label="Grupo"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">
                      <em>Seleccione un grupo</em>
                    </MenuItem>
                    {grupos.map((grupo) => (
                      <MenuItem key={grupo} value={grupo}>
                        {grupo}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.grupo && formik.errors.grupo && (
                    <FormHelperText>{formik.errors.grupo}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.director_grupo && Boolean(formik.errors.director_grupo)}
                  disabled={loading}
                >
                  <InputLabel id="director-grupo-label">Director de Grupo</InputLabel>
                  <Select
                    labelId="director-grupo-label"
                    id="director_grupo"
                    name="director_grupo"
                    value={formik.values.director_grupo}
                    label="Director de Grupo"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="">
                      <em>Seleccione un docente</em>
                    </MenuItem>
                    {docentes.map((docente) => (
                      <MenuItem key={docente._id} value={docente._id}>
                        {docente.nombre} {docente.apellidos}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.director_grupo && formik.errors.director_grupo && (
                    <FormHelperText>{formik.errors.director_grupo}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth
                  error={formik.touched.estado && Boolean(formik.errors.estado)}
                  disabled={loading}
                >
                  <InputLabel id="estado-label">Estado</InputLabel>
                  <Select
                    labelId="estado-label"
                    id="estado"
                    name="estado"
                    value={formik.values.estado}
                    label="Estado"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <MenuItem value="ACTIVO">Activo</MenuItem>
                    <MenuItem value="INACTIVO">Inactivo</MenuItem>
                  </Select>
                  {formik.touched.estado && formik.errors.estado && (
                    <FormHelperText>{formik.errors.estado}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/cursos')}
                    disabled={loading}
                    sx={{ borderRadius: '20px' }}
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                    disabled={loading}
                    sx={{ borderRadius: '20px' }}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
      
      {/* Snackbar para error de conexión */}
      <Snackbar
        open={networkError}
        autoHideDuration={6000}
        onClose={handleCloseNetworkError}
        message="Error de conexión con el servidor. Funcionando en modo demo."
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseNetworkError}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Box>
  );
};

export default FormularioCurso;