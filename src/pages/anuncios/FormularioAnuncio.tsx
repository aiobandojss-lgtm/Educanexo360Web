// src/pages/anuncios/FormularioAnuncio.tsx
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
  FormControlLabel,
  Checkbox,
  Paper,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Alert,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  List,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Attachment as AttachmentIcon,
} from '@mui/icons-material';
import anuncioService from '../../services/anuncioService';
import { RootState } from '../../redux/store';

// Definimos interfaces para los tipos
interface Adjunto {
  _id: string;
  nombre: string;
  url: string;
}

interface Anuncio {
  _id: string;
  titulo: string;
  contenido: string;
  destinatarios: string[];
  importante: boolean;
  fechaExpiracion: string | null;
  adjuntos?: Adjunto[];
  autor?: any;
}

// Modificamos el servicio de anuncios para incluir los métodos faltantes
// Estos métodos son simulados ya que decidimos desactivar la funcionalidad de anuncios
const anuncioServiceExtended = {
  ...anuncioService,
  subirAdjunto: async (_id: string, _archivo: File) => {
    console.log('Método subirAdjunto desactivado');
    return null;
  },
  eliminarAdjunto: async (_id: string, _adjuntoId: string) => {
    console.log('Método eliminarAdjunto desactivado');
    return null;
  }
};

const FormularioAnuncio: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [adjuntosOriginales, setAdjuntosOriginales] = useState<Adjunto[]>([]);
  const [adjuntosParaEliminar, setAdjuntosParaEliminar] = useState<string[]>([]);

  // Validación con Yup
  const validationSchema = Yup.object({
    titulo: Yup.string().required('El título es obligatorio'),
    contenido: Yup.string().required('El contenido es obligatorio'),
    destinatarios: Yup.array().min(1, 'Debe seleccionar al menos un destinatario'),
  });

  // Formik para gestionar el formulario
  const formik = useFormik({
    initialValues: {
      titulo: '',
      contenido: '',
      destinatarios: ['TODOS'],
      importante: false,
      fechaExpiracion: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        const anuncioData = {
          ...values,
          fechaExpiracion: values.fechaExpiracion ? new Date(values.fechaExpiracion).toISOString() : null,
        };
        
        if (id) {
          // Modo edición
          // Eliminar adjuntos marcados para eliminar
          for (const adjuntoId of adjuntosParaEliminar) {
            await anuncioServiceExtended.eliminarAdjunto(id, adjuntoId);
          }
          
          // Actualizar anuncio
          await anuncioService.actualizarAnuncio(id, anuncioData);
          
          // Subir nuevos adjuntos
          for (const archivo of adjuntos) {
            await anuncioServiceExtended.subirAdjunto(id, archivo);
          }
        } else {
          // Crear nuevo anuncio
          const nuevoAnuncio = await anuncioService.crearAnuncio(anuncioData);
          
          // Subir adjuntos al nuevo anuncio (simulado)
          if (adjuntos.length > 0) {
            console.log('Simulando carga de adjuntos para el anuncio');
            for (const archivo of adjuntos) {
              await anuncioServiceExtended.subirAdjunto(nuevoAnuncio._id, archivo);
            }
          }
        }
        
        navigate('/anuncios');
      } catch (err) {
        console.error('Error al guardar anuncio:', err);
        setError('Error al guardar el anuncio. Intente nuevamente más tarde.');
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    // Si estamos en modo edición, cargar los datos del anuncio
    if (id) {
      cargarAnuncio();
    }
  }, [id]);

  const cargarAnuncio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await anuncioService.obtenerAnuncioPorId(id!);
      setAnuncio(data as unknown as Anuncio | null);
      
      // Si se obtiene un anuncio, establecer los valores del formulario
      if (data) {
        const anuncioData = data as unknown as Anuncio;
        
        // Establecer valores iniciales del formulario
        formik.setValues({
          titulo: anuncioData.titulo,
          contenido: anuncioData.contenido,
          destinatarios: anuncioData.destinatarios,
          importante: anuncioData.importante,
          fechaExpiracion: anuncioData.fechaExpiracion ? new Date(anuncioData.fechaExpiracion).toISOString().split('T')[0] : '',
        });
        
        // Guardar adjuntos originales
        if (anuncioData.adjuntos) {
          setAdjuntosOriginales(anuncioData.adjuntos);
        }
      }
    } catch (err) {
      console.error('Error al cargar anuncio para edición:', err);
      setError('Error al cargar el anuncio. Intente nuevamente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAdjuntos((prevAdjuntos) => [...prevAdjuntos, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAdjuntos((prevAdjuntos) => prevAdjuntos.filter((_, i) => i !== index));
  };

  const handleRemoveOriginalAdjunto = (adjuntoId: string) => {
    setAdjuntosOriginales((prev) => prev.filter((adj) => adj._id !== adjuntoId));
    setAdjuntosParaEliminar((prev) => [...prev, adjuntoId]);
  };

  return (
    <Box>
      <Typography variant="h2" color="primary.main" gutterBottom>
        {id ? 'Editar Anuncio' : 'Nuevo Anuncio'}
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
          mb: 3,
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="titulo"
                name="titulo"
                label="Título del anuncio"
                value={formik.values.titulo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.titulo && Boolean(formik.errors.titulo)}
                helperText={formik.touched.titulo && formik.errors.titulo}
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="contenido"
                name="contenido"
                label="Contenido"
                multiline
                rows={6}
                value={formik.values.contenido}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.contenido && Boolean(formik.errors.contenido)}
                helperText={formik.touched.contenido && formik.errors.contenido}
                disabled={loading}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl
                fullWidth
                error={formik.touched.destinatarios && Boolean(formik.errors.destinatarios)}
                disabled={loading}
              >
                <InputLabel id="destinatarios-label">Destinatarios</InputLabel>
                <Select
                  labelId="destinatarios-label"
                  id="destinatarios"
                  name="destinatarios"
                  multiple
                  value={formik.values.destinatarios}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ADMIN">Administradores</MenuItem>
                  <MenuItem value="DOCENTE">Docentes</MenuItem>
                  <MenuItem value="ESTUDIANTE">Estudiantes</MenuItem>
                  <MenuItem value="PADRE">Padres</MenuItem>
                </Select>
                {formik.touched.destinatarios && formik.errors.destinatarios && (
                  <FormHelperText>{formik.errors.destinatarios as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="fechaExpiracion"
                name="fechaExpiracion"
                label="Fecha de expiración (opcional)"
                type="date"
                value={formik.values.fechaExpiracion}
                onChange={formik.handleChange}
                disabled={loading}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="importante"
                    name="importante"
                    checked={formik.values.importante}
                    onChange={formik.handleChange}
                    disabled={loading}
                  />
                }
                label="Marcar como importante"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h3" gutterBottom>
                Adjuntos
              </Typography>
              
              {/* Lista de adjuntos originales (en modo edición) */}
              {adjuntosOriginales.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Adjuntos actuales:
                  </Typography>
                  <List>
                    {adjuntosOriginales.map((adjunto) => (
                      <ListItem key={adjunto._id}>
                        <ListItemText
                          primary={adjunto.nombre}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveOriginalAdjunto(adjunto._id)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {/* Lista de nuevos adjuntos */}
              {adjuntos.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Nuevos adjuntos:
                  </Typography>
                  <List>
                    {adjuntos.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024).toFixed(2)} KB`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleRemoveFile(index)}
                            disabled={loading}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachmentIcon />}
                disabled={loading}
                sx={{ mb: 2 }}
              >
                Agregar Adjunto
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/anuncios')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default FormularioAnuncio;