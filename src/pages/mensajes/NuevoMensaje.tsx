// src/pages/mensajes/NuevoMensaje.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Autocomplete,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  FormHelperText,
} from '@mui/material';
import {
  ArrowBack,
  AttachFile,
  Send,
  Save,
  Delete,
} from '@mui/icons-material';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../api/axiosConfig';
import { RootState } from '../../redux/store';

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
}

interface ArchivoAdjunto {
  file: File;
  id: string; // ID temporal para gestión en UI
}

const MensajeSchema = Yup.object().shape({
  destinatarios: Yup.array()
    .min(1, 'Debe seleccionar al menos un destinatario')
    .required('Los destinatarios son requeridos'),
  asunto: Yup.string().required('El asunto es requerido'),
  contenido: Yup.string().required('El contenido es requerido'),
  prioridad: Yup.string().required('La prioridad es requerida'),
});

const NuevoMensaje = () => {
  const navigate = useNavigate();
  const { id: mensajeOriginalId } = useParams(); // Para respuestas
  const { user } = useSelector((state: RootState) => state.auth);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [adjuntos, setAdjuntos] = useState<ArchivoAdjunto[]>([]);
  const [mensajeOriginal, setMensajeOriginal] = useState<any>(null);
  
  const esRespuesta = Boolean(mensajeOriginalId);
  
  useEffect(() => {
    fetchUsuarios();
    if (esRespuesta) {
      fetchMensajeOriginal();
    }
  }, [mensajeOriginalId]);
  
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/usuarios/buscar', {
        params: { q: '' } // Búsqueda vacía para obtener usuarios recientes o destacados
      });
      setUsuarios(res.data.data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMensajeOriginal = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/mensajes/${mensajeOriginalId}`);
      setMensajeOriginal(res.data.data);
    } catch (error) {
      console.error('Error al obtener mensaje original:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const buscarUsuarios = async (query: string) => {
    if (!query) return;
    try {
      const res = await axiosInstance.get('/usuarios/buscar', {
        params: { q: query }
      });
      setUsuarios(res.data.data);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
    }
  };
  
  const handleVolver = () => {
    navigate(-1);
  };
  
  const handleAdjuntarArchivo = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files).map(file => ({
        file,
        id: Math.random().toString(36).substring(7)
      }));
      setAdjuntos([...adjuntos, ...newFiles]);
    }
  };
  
  const handleRemoverAdjunto = (id: string) => {
    setAdjuntos(adjuntos.filter(a => a.id !== id));
  };
  
  const handleEnviarMensaje = async (values: any, { resetForm }: any) => {
    try {
      setEnviando(true);
      
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('asunto', values.asunto);
      formData.append('contenido', values.contenido);
      formData.append('prioridad', values.prioridad);
      
      // Agregar destinatarios
      values.destinatarios.forEach((dest: Usuario) => {
        formData.append('destinatarios', dest._id);
      });
      
      // Agregar destinatarios CC
      if (values.destinatariosCc && values.destinatariosCc.length > 0) {
        values.destinatariosCc.forEach((dest: Usuario) => {
          formData.append('destinatariosCc', dest._id);
        });
      }
      
      // Agregar archivos adjuntos
      adjuntos.forEach(adjunto => {
        formData.append('adjuntos', adjunto.file);
      });
      
      // Agregar datos de respuesta si es una respuesta
      if (esRespuesta) {
        formData.append('esRespuesta', 'true');
        formData.append('mensajeOriginalId', mensajeOriginalId || '');
      }
      
      // Enviar según si es respuesta o nuevo mensaje
      let endpoint = '/mensajes';
      if (esRespuesta) {
        endpoint = `/mensajes/${mensajeOriginalId}/responder`;
      }
      
      const res = await axiosInstance.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Limpiar formulario y adjuntos
      resetForm();
      setAdjuntos([]);
      
      // Volver a la bandeja de entrada
      navigate('/mensajes/enviados');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };
  
  const handleGuardarBorrador = async (values: any) => {
    try {
      setEnviando(true);
      
      // Crear FormData
      const formData = new FormData();
      formData.append('asunto', values.asunto);
      formData.append('contenido', values.contenido);
      formData.append('prioridad', values.prioridad || 'NORMAL');
      formData.append('tipo', 'BORRADOR');
      
      // Agregar destinatarios
      if (values.destinatarios && values.destinatarios.length > 0) {
        values.destinatarios.forEach((dest: Usuario) => {
          formData.append('destinatarios', dest._id);
        });
      }
      
      // Agregar archivos adjuntos
      adjuntos.forEach(adjunto => {
        formData.append('adjuntos', adjunto.file);
      });
      
      await axiosInstance.post('/mensajes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Volver a borradores
      navigate('/mensajes/borradores');
    } catch (error) {
      console.error('Error al guardar borrador:', error);
    } finally {
      setEnviando(false);
    }
  };
  
  // Valores iniciales para el formulario de respuesta
  const getInitialValues = () => {
    if (esRespuesta && mensajeOriginal) {
      // Para respuestas
      return {
        destinatarios: [mensajeOriginal.remitente],
        destinatariosCc: [],
        asunto: `Re: ${mensajeOriginal.asunto}`,
        contenido: '',
        prioridad: 'NORMAL',
      };
    }
    
    // Para nuevos mensajes
    return {
      destinatarios: [],
      destinatariosCc: [],
      asunto: '',
      contenido: '',
      prioridad: 'NORMAL',
    };
  };
  
  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleVolver}
        >
          Volver
        </Button>
        <Typography variant="h5">
          {esRespuesta ? 'Responder Mensaje' : 'Nuevo Mensaje'}
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        {loading && esRespuesta ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Formik
            initialValues={getInitialValues()}
            validationSchema={MensajeSchema}
            onSubmit={handleEnviarMensaje}
            enableReinitialize
          >
            {({ values, errors, touched, setFieldValue, isValid }) => (
              <Form>
                <Box sx={{ mb: 3 }}>
                  <Field name="destinatarios">
                    {({ field, meta }: FieldProps) => (
                      <Autocomplete
                        multiple
                        id="destinatarios"
                        options={usuarios}
                        value={values.destinatarios}
                        getOptionLabel={(option: Usuario) => 
                          `${option.nombre} ${option.apellidos} (${option.email})`
                        }
                        onChange={(_e, newValue) => {
                          setFieldValue('destinatarios', newValue);
                        }}
                        onInputChange={(e, value) => {
                          if (e && e.type === 'change') {
                            buscarUsuarios(value);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Destinatarios"
                            placeholder="Buscar destinatarios..."
                            error={touched.destinatarios && Boolean(errors.destinatarios)}
                            helperText={
                              touched.destinatarios && typeof errors.destinatarios === 'string'
                                ? errors.destinatarios
                                : undefined
                            }
                            fullWidth
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={`${option.nombre} ${option.apellidos}`}
                              {...getTagProps({ index })}
                              key={option._id}
                            />
                          ))
                        }
                      />
                    )}
                  </Field>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Field name="destinatariosCc">
                    {({ field, meta }: FieldProps) => (
                      <Autocomplete
                        multiple
                        id="destinatariosCc"
                        options={usuarios}
                        value={values.destinatariosCc}
                        getOptionLabel={(option: Usuario) => 
                          `${option.nombre} ${option.apellidos} (${option.email})`
                        }
                        onChange={(_e, newValue) => {
                          setFieldValue('destinatariosCc', newValue);
                        }}
                        onInputChange={(e, value) => {
                          if (e && e.type === 'change') {
                            buscarUsuarios(value);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="CC"
                            placeholder="Copias..."
                            fullWidth
                          />
                        )}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={`${option.nombre} ${option.apellidos}`}
                              {...getTagProps({ index })}
                              key={option._id}
                            />
                          ))
                        }
                      />
                    )}
                  </Field>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Field name="asunto">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Asunto"
                        fullWidth
                        error={touched.asunto && Boolean(errors.asunto)}
                        helperText={touched.asunto && errors.asunto}
                      />
                    )}
                  </Field>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Field name="prioridad">
                    {({ field, meta }: FieldProps) => (
                      <FormControl fullWidth>
                        <InputLabel id="prioridad-label">Prioridad</InputLabel>
                        <Select
                          {...field}
                          labelId="prioridad-label"
                          label="Prioridad"
                          error={touched.prioridad && Boolean(errors.prioridad)}
                        >
                          <MenuItem value="ALTA">Alta</MenuItem>
                          <MenuItem value="NORMAL">Normal</MenuItem>
                          <MenuItem value="BAJA">Baja</MenuItem>
                        </Select>
                        {touched.prioridad && errors.prioridad && (
                          <FormHelperText error>{errors.prioridad}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Field>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Field name="contenido">
                    {({ field, meta }: FieldProps) => (
                      <TextField
                        {...field}
                        label="Contenido"
                        multiline
                        rows={10}
                        fullWidth
                        error={touched.contenido && Boolean(errors.contenido)}
                        helperText={touched.contenido && errors.contenido}
                      />
                    )}
                  </Field>
                </Box>
                
                {/* Mensaje original en caso de respuesta */}
                {esRespuesta && mensajeOriginal && (
                  <Box sx={{ mb: 3, mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Mensaje original de {mensajeOriginal.remitente.nombre} {mensajeOriginal.remitente.apellidos}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {mensajeOriginal.contenido.substring(0, 300)}
                      {mensajeOriginal.contenido.length > 300 ? '...' : ''}
                    </Typography>
                  </Box>
                )}
                
                {/* Sección de archivos adjuntos */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Archivos adjuntos
                  </Typography>
                  <input
                    accept="*/*"
                    style={{ display: 'none' }}
                    id="archivo-adjunto"
                    type="file"
                    multiple
                    onChange={handleAdjuntarArchivo}
                  />
                  <label htmlFor="archivo-adjunto">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<AttachFile />}
                    >
                      Adjuntar archivo
                    </Button>
                  </label>
                  
                  {adjuntos.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      {adjuntos.map((adjunto) => (
                        <Chip
                          key={adjunto.id}
                          label={adjunto.file.name}
                          onDelete={() => handleRemoverAdjunto(adjunto.id)}
                          sx={{ m: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Save />}
                    onClick={() => handleGuardarBorrador(values)}
                    disabled={enviando}
                    sx={{ mr: 2 }}
                  >
                    Guardar como borrador
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<Send />}
                    disabled={!isValid || enviando}
                  >
                    {enviando ? <CircularProgress size={24} /> : 'Enviar'}
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        )}
      </Paper>
    </Box>
  );
};

export default NuevoMensaje;