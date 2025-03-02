// src/pages/cursos/AgregarAsignaturaCurso.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Chip,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack,
  Save,
  MenuBook,
  Add,
  Search,
  Delete,
  Class,
} from '@mui/icons-material';
import cursoService from '../../services/cursoService';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Interfaces
interface Asignatura {
  _id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  docente: string | {
    _id: string;
    nombre: string;
    apellidos: string;
  };
}

interface Docente {
  _id: string;
  nombre: string;
  apellidos: string;
}

interface AsignaturaSeleccionada {
  asignaturaId: string;
  docenteId: string;
  nombre: string;
  codigo: string;
  creditos: number;
  docenteNombre?: string;
}

interface CursoBasico {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
  año_academico: string;
}

// Esquema de validación para nueva asignatura
const asignaturaSchema = Yup.object().shape({
  nombre: Yup.string().required('El nombre es requerido'),
  codigo: Yup.string().required('El código es requerido'),
  creditos: Yup.number()
    .required('Los créditos son requeridos')
    .min(1, 'Debe ser al menos 1')
    .max(10, 'No debe exceder 10'),
  docenteId: Yup.string().required('El docente es requerido'),
});

const AgregarAsignaturaCurso = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [curso, setCurso] = useState<CursoBasico | null>(null);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState<AsignaturaSeleccionada[]>([]);
  const [asignaturaActual, setAsignaturaActual] = useState<Asignatura | null>(null);
  const [docenteActual, setDocenteActual] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [savingLoading, setSavingLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showNewAsignaturaForm, setShowNewAsignaturaForm] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      cargarCurso();
      cargarAsignaturas();
      cargarDocentes();
    }
  }, [id]);

  const cargarCurso = async () => {
    if (!id) return;

    try {
      const response = await cursoService.obtenerCurso(id);
      
      if (response?.success) {
        setCurso(response.data);
      } else {
        throw new Error('Error al cargar curso');
      }
    } catch (err: any) {
      console.error('Error al cargar curso:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la información del curso');
    }
  };

  const cargarAsignaturas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener todas las asignaturas que no están en el curso
      const response = await axiosInstance.get('/asignaturas', {
        params: {
          not_in_curso: id
        }
      });
      
      if (response.data?.success) {
        setAsignaturas(response.data.data || []);
      } else {
        throw new Error('Error al cargar asignaturas');
      }
    } catch (err: any) {
      console.error('Error al cargar asignaturas:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar las asignaturas');
    } finally {
      setLoading(false);
    }
  };

  const cargarDocentes = async () => {
    try {
      const response = await axiosInstance.get('/usuarios', {
        params: { tipo: 'DOCENTE' }
      });
      
      if (response.data?.success) {
        setDocentes(response.data.data || []);
      }
    } catch (err: any) {
      console.error('Error al cargar docentes:', err);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddAsignatura = () => {
    if (asignaturaActual && docenteActual) {
      // Verificar si la asignatura ya está seleccionada
      if (!asignaturasSeleccionadas.some(a => a.asignaturaId === asignaturaActual._id)) {
        const docenteSeleccionado = docentes.find(d => d._id === docenteActual);
        
        setAsignaturasSeleccionadas([
          ...asignaturasSeleccionadas, 
          {
            asignaturaId: asignaturaActual._id,
            docenteId: docenteActual,
            nombre: asignaturaActual.nombre,
            codigo: asignaturaActual.codigo,
            creditos: asignaturaActual.creditos,
            docenteNombre: docenteSeleccionado ? `${docenteSeleccionado.nombre} ${docenteSeleccionado.apellidos}` : undefined
          }
        ]);
      }
      setAsignaturaActual(null);
      setDocenteActual('');
    }
  };

  const handleRemoveAsignatura = (asignaturaId: string) => {
    setAsignaturasSeleccionadas(asignaturasSeleccionadas.filter(a => a.asignaturaId !== asignaturaId));
  };

  const handleGuardar = async () => {
    if (!id || asignaturasSeleccionadas.length === 0) return;

    try {
      setSavingLoading(true);
      setError(null);
      setSuccess(null);

      // Añadir cada asignatura al curso
      for (const asignatura of asignaturasSeleccionadas) {
        await cursoService.añadirAsignaturaCurso(id, {
          asignaturaId: asignatura.asignaturaId,
          docenteId: asignatura.docenteId
        });
      }

      setSuccess(`${asignaturasSeleccionadas.length} asignatura(s) añadida(s) exitosamente al curso`);
      setAsignaturasSeleccionadas([]);
      
      // Recargar la lista de asignaturas disponibles
      await cargarAsignaturas();
      
    } catch (err: any) {
      console.error('Error al añadir asignaturas:', err);
      setError(err.response?.data?.message || 'No se pudieron agregar las asignaturas al curso');
    } finally {
      setSavingLoading(false);
    }
  };

  const handleSubmitNewAsignatura = async (values: any, { resetForm }: any) => {
    try {
      setSavingLoading(true);
      setError(null);

      // Crear la nueva asignatura
      const response = await axiosInstance.post('/asignaturas', {
        ...values,
        escuelaId: user?.escuelaId
      });

      if (response.data?.success) {
        // Agregar la asignatura recién creada a la lista de seleccionadas
        const nuevaAsignatura = response.data.data;
        const docenteSeleccionado = docentes.find(d => d._id === values.docenteId);
        
        setAsignaturasSeleccionadas([
          ...asignaturasSeleccionadas, 
          {
            asignaturaId: nuevaAsignatura._id,
            docenteId: values.docenteId,
            nombre: nuevaAsignatura.nombre,
            codigo: nuevaAsignatura.codigo,
            creditos: nuevaAsignatura.creditos,
            docenteNombre: docenteSeleccionado ? `${docenteSeleccionado.nombre} ${docenteSeleccionado.apellidos}` : undefined
          }
        ]);

        // Recargar asignaturas y mostrar mensaje de éxito
        await cargarAsignaturas();
        setSuccess('Asignatura creada y añadida exitosamente');
        resetForm();
        setShowNewAsignaturaForm(false);
      }
    } catch (err: any) {
      console.error('Error al crear asignatura:', err);
      setError(err.response?.data?.message || 'No se pudo crear la asignatura');
    } finally {
      setSavingLoading(false);
    }
  };

  // Filtrar asignaturas por término de búsqueda
  const asignaturasFiltradas = asignaturas.filter(
    asignatura => 
      asignatura.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asignatura.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      {/* Botón para regresar y título */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/cursos/${id}`)}
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
          Agregar Asignaturas al Curso
        </Typography>
      </Box>

      {curso && (
        <Typography variant="h3" color="text.secondary" gutterBottom>
          {curso.nombre} ({curso.grado}° {curso.grupo} - {curso.año_academico})
        </Typography>
      )}

      {/* Alertas */}
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

      <Grid container spacing={3}>
        {/* Panel de búsqueda/creación */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 3, py: 2 }}>
              <Typography variant="h3">
                {showNewAsignaturaForm ? 'Nueva Asignatura' : 'Buscar Asignaturas'}
              </Typography>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1 }}>
              {!showNewAsignaturaForm ? (
                // Búsqueda de asignaturas existentes
                <>
                  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <Autocomplete
                      fullWidth
                      options={asignaturasFiltradas}
                      getOptionLabel={(option) => `${option.nombre} (${option.codigo})`}
                      value={asignaturaActual}
                      onChange={(_event, newValue) => {
                        setAsignaturaActual(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Buscar asignatura"
                          variant="outlined"
                          onChange={handleSearchChange}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <>
                                <Search color="action" sx={{ mr: 1 }} />
                                {params.InputProps.startAdornment}
                              </>
                            ),
                            sx: { borderRadius: 2 }
                          }}
                        />
                      )}
                    />
                  </Box>

                  {asignaturaActual && (
                    <Box sx={{ mb: 3 }}>
                      <FormControl
                        fullWidth
                        variant="outlined"
                        sx={{ mb: 2 }}
                      >
                        <InputLabel id="docente-label">Asignar Docente</InputLabel>
                        <Select
                          labelId="docente-label"
                          value={docenteActual}
                          onChange={(e) => setDocenteActual(e.target.value)}
                          label="Asignar Docente"
                          sx={{ borderRadius: 2 }}
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
                      </FormControl>

                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        startIcon={<Add />}
                        onClick={handleAddAsignatura}
                        disabled={!docenteActual}
                        sx={{ 
                          borderRadius: 20,
                          fontWeight: 500,
                          boxShadow: 'none',
                          '&:hover': {
                            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                          }
                        }}
                      >
                        Agregar Asignatura
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      ¿No encuentras la asignatura que buscas?
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => setShowNewAsignaturaForm(true)}
                      sx={{ 
                        borderRadius: 20
                      }}
                    >
                      Crear Nueva Asignatura
                    </Button>
                  </Box>

                  {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                      <CircularProgress />
                    </Box>
                  )}
                </>
              ) : (
                // Formulario para crear nueva asignatura
                <Formik
                  initialValues={{
                    nombre: '',
                    codigo: '',
                    creditos: 1,
                    docenteId: '',
                  }}
                  validationSchema={asignaturaSchema}
                  onSubmit={handleSubmitNewAsignatura}
                >
                  {({ errors, touched, values, handleChange, handleBlur, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            name="nombre"
                            label="Nombre de la Asignatura"
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
                            name="codigo"
                            label="Código"
                            fullWidth
                            variant="outlined"
                            error={touched.codigo && Boolean(errors.codigo)}
                            helperText={touched.codigo && errors.codigo}
                            InputProps={{
                              sx: { borderRadius: 2 }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Field
                            as={TextField}
                            name="creditos"
                            label="Créditos"
                            type="number"
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              inputProps: { min: 1, max: 10 },
                              sx: { borderRadius: 2 }
                            }}
                            error={touched.creditos && Boolean(errors.creditos)}
                            helperText={touched.creditos && errors.creditos}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl
                            fullWidth
                            error={touched.docenteId && Boolean(errors.docenteId)}
                            variant="outlined"
                          >
                            <InputLabel id="docente-id-label">Docente</InputLabel>
                            <Select
                              labelId="docente-id-label"
                              id="docenteId"
                              name="docenteId"
                              value={values.docenteId}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              label="Docente"
                              sx={{ borderRadius: 2 }}
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
                            <FormHelperText>{touched.docenteId && errors.docenteId}</FormHelperText>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <Button
                              type="button"
                              variant="outlined"
                              color="inherit"
                              onClick={() => setShowNewAsignaturaForm(false)}
                              sx={{ 
                                borderRadius: 20,
                                flex: 1
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              disabled={isSubmitting}
                              sx={{ 
                                borderRadius: 20,
                                fontWeight: 500,
                                boxShadow: 'none',
                                flex: 1,
                                '&:hover': {
                                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                                }
                              }}
                            >
                              {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                              ) : (
                                'Crear y Agregar'
                              )}
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Panel de asignaturas seleccionadas */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ bgcolor: 'secondary.main', color: 'white', px: 3, py: 2 }}>
              <Typography variant="h3">
                Asignaturas a Agregar ({asignaturasSeleccionadas.length})
              </Typography>
            </Box>

            <Box sx={{ p: 3, flexGrow: 1 }}>
              {asignaturasSeleccionadas.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <List>
                    {asignaturasSeleccionadas.map((asignatura) => (
                      <ListItem 
                        key={asignatura.asignaturaId}
                        sx={{ 
                          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                          py: 2
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <Class />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {asignatura.nombre}
                              <Chip 
                                label={`${asignatura.creditos} créditos`} 
                                size="small" 
                                color="primary" 
                                sx={{ borderRadius: 8 }}
                              />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {asignatura.codigo}
                              </Typography>
                              <Divider orientation="vertical" flexItem sx={{ mx: 1, display: 'inline-block' }} />
                              <Typography variant="body2" component="span">
                                Docente: {asignatura.docenteNombre}
                              </Typography>
                            </>
                          }
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveAsignatura(asignatura.asignaturaId)}
                          sx={{ 
                            bgcolor: 'rgba(244, 67, 54, 0.1)',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ) : (
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-message': {
                      fontWeight: 500
                    }
                  }}
                >
                  Seleccione asignaturas para agregar al curso.
                </Alert>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={handleGuardar}
                  disabled={asignaturasSeleccionadas.length === 0 || savingLoading}
                  sx={{ 
                    borderRadius: 20,
                    fontWeight: 500,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                    }
                  }}
                >
                  {savingLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgregarAsignaturaCurso;