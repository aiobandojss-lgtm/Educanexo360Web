// src/pages/mensajes/NuevoMensaje.tsx
// Versión optimizada con manejo especializado según roles

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Grid,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  OutlinedInput,
  FormControlLabel,
  Radio,
  RadioGroup,
  Autocomplete,
  FormHelperText,
} from '@mui/material';
import {
  Send as SendIcon,
  Cancel as CancelIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { axiosFileInstance } from '../../api/axiosConfig';
import axiosInstance from '../../api/axiosConfig';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { RootState } from '../../redux/store';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import mensajeService from '../../services/mensajeService';
import { USER_ROLES } from '../../types/user.types';

// Configuración de Quill
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false
  }
};

const quillFormats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'link'
];

interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  asignatura?: string;    // Campo adicional para docentes (asignatura que imparte)
  curso?: string;         // Campo adicional para mostrar el curso
  infoContextual?: string; // Campo adicional que muestra relación con estudiantes
}

interface Curso {
  _id: string;
  nombre: string;
  grado: string;
  seccion: string;
  grupo?: string;
  cantidadEstudiantes: number;
  infoAdicional?: string;
  estudiantes?: any[]; // Añadimos esta propiedad como opcional
}

// Tipos de mensaje
const TIPOS_MENSAJE = {
  INDIVIDUAL: 'individual',
  MASIVO: 'masivo',
};

const NuevoMensaje: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [destinatarios, setDestinatarios] = useState<Usuario[]>([]);
  const [destinatariosSeleccionados, setDestinatariosSeleccionados] = useState<Usuario[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [buscando, setBuscando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);
  const [tipoMensaje, setTipoMensaje] = useState<string>(TIPOS_MENSAJE.INDIVIDUAL);
  const [query, setQuery] = useState<string>('');
  const [isAcudiente, setIsAcudiente] = useState<boolean>(false);
  const [destinatariosCargados, setDestinatariosCargados] = useState<boolean>(false);
  
  // Obtener el ID del mensaje a responder de los parámetros de la ruta
  const { id: mensajeAResponder } = useParams<{ id?: string }>();
  const [respondiendo, setRespondiendo] = useState<boolean>(false);
  
  // Determinar si el usuario puede enviar mensajes masivos
  const puedeEnviarMasivo = user?.tipo === USER_ROLES.ADMIN || 
                           user?.tipo === USER_ROLES.RECTOR || 
                           user?.tipo === USER_ROLES.COORDINADOR || 
                           user?.tipo === USER_ROLES.ADMINISTRATIVO || 
                           user?.tipo === USER_ROLES.DOCENTE;
  
  // Detectar si el usuario es ACUDIENTE o ESTUDIANTE
  useEffect(() => {
    if (user?.tipo === 'ACUDIENTE' || user?.tipo === 'ESTUDIANTE') {
      setIsAcudiente(true);
    }
    
    // Si es estudiante, redirigir a la página de mensajes
  }, [user?.tipo, navigate]);
  
  // Si el usuario no puede enviar masivos, forzar a individual
  useEffect(() => {
    if (!puedeEnviarMasivo) {
      setTipoMensaje(TIPOS_MENSAJE.INDIVIDUAL);
    }
  }, [puedeEnviarMasivo]);

  // Validación con Yup
  const validationSchema = Yup.object().shape({
    asunto: Yup.string().required('El asunto es requerido'),
    contenido: Yup.string().required('El contenido es requerido'),
    // Validación condicional según tipo de mensaje
    ...(tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL ? {
      destinatarios: Yup.array().min(1, 'Debe seleccionar al menos un destinatario')
    } : {
      cursoId: Yup.string().required('Debe seleccionar un curso')
    }),
    prioridad: Yup.string().required('Seleccione la prioridad del mensaje')
  });

  const formik = useFormik({
    initialValues: {
      destinatarios: [] as string[],
      asunto: '',
      contenido: '',
      cursoId: '',
      prioridad: 'NORMAL' as 'ALTA' | 'NORMAL' | 'BAJA'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        setExito(null);
        
        // Determinar si estamos respondiendo o creando un nuevo mensaje
        if (respondiendo && mensajeAResponder) {
          // Usar el método específico para respuestas
          await mensajeService.responderMensaje(
            mensajeAResponder,
            values.contenido,
            values.asunto,
            values.prioridad,
            adjuntos
          );
        } else if (tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL) {
          // Enviar mensaje individual normal
          await mensajeService.enviarMensaje({
            destinatarios: values.destinatarios,
            asunto: values.asunto,
            contenido: values.contenido,
            tipo: 'INDIVIDUAL',
            prioridad: values.prioridad
          }, adjuntos);
        } else {
          // Enviar mensaje masivo
          await mensajeService.enviarMensajeMasivo(
            values.cursoId,
            values.asunto,
            values.contenido,
            values.prioridad,
            adjuntos
          );
        }
        
        setExito('Mensaje enviado exitosamente');
        
        // Limpiar formulario después de 2 segundos y redirigir
        setTimeout(() => {
          navigate('/mensajes/enviados');
        }, 2000);
      } catch (err: any) {
        console.error('Error al enviar mensaje:', err);
        setError(err.message || err.response?.data?.message || 
                'Error al enviar mensaje. Intente nuevamente.');
      } finally {
        setLoading(false);
      }
    },
  });

  // Cargar mensaje a responder si existe
  useEffect(() => {
    const cargarMensajeAResponder = async () => {
      if (!mensajeAResponder) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Cargar el mensaje original
        try {
          const response = await axiosInstance.get(`/mensajes/${mensajeAResponder}`);
          
          if (response.data.success) {
            const mensajeOriginal = response.data.data;
            
            // Configurar como respuesta
            setRespondiendo(true);
            
            // Preseleccionar al remitente como destinatario
            if (mensajeOriginal.remitente && mensajeOriginal.remitente._id) {
              const remitente = {
                _id: mensajeOriginal.remitente._id,
                nombre: mensajeOriginal.remitente.nombre || '',
                apellidos: mensajeOriginal.remitente.apellidos || '',
                tipo: mensajeOriginal.remitente.tipo || '',
                email: mensajeOriginal.remitente.email || ''
              };
              
              setDestinatariosSeleccionados([remitente]);
              formik.setFieldValue('destinatarios', [remitente._id]);
            }
            
            // Configurar el asunto con "Re: "
            const asunto = mensajeOriginal.asunto || '';
            formik.setFieldValue('asunto', asunto.startsWith('Re:') ? asunto : `Re: ${asunto}`);
            
            // Preparar el contenido citando el mensaje original
            const fechaFormateada = new Date(mensajeOriginal.createdAt).toLocaleString();
            const remitenteNombre = mensajeOriginal.remitente 
              ? `${mensajeOriginal.remitente.nombre || ''} ${mensajeOriginal.remitente.apellidos || ''}` 
              : 'Remitente';
            
            const contenidoCitado = `
              <br><br>
              <p>--------- Mensaje Original ---------</p>
              <p><strong>De:</strong> ${remitenteNombre}</p>
              <p><strong>Fecha:</strong> ${fechaFormateada}</p>
              <p><strong>Asunto:</strong> ${mensajeOriginal.asunto}</p>
              <blockquote style="border-left: 2px solid #ccc; padding-left: 10px; color: #555;">
                ${mensajeOriginal.contenido || ''}
              </blockquote>
            `;
            
            // No establecer contenido inmediatamente para permitir al usuario escribir primero
            setTimeout(() => {
              formik.setFieldValue('contenido', contenidoCitado);
            }, 100);
          }
        } catch (err) {
          console.error('Error al cargar mensaje a responder:', err);
          setError('No se pudo cargar el mensaje a responder. Puede continuar escribiendo su mensaje manualmente.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    cargarMensajeAResponder();
  }, [mensajeAResponder]);

  // Cargar datos iniciales
  useEffect(() => {
    if (tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL) {
      // Para todos los roles, cargar destinatarios de inmediato
      if (!destinatariosCargados && !respondiendo) {
        buscarDestinatarios();
      }
    } else if (puedeEnviarMasivo) {
      cargarCursosDisponibles();
    }
  }, [tipoMensaje, destinatariosCargados, respondiendo]);

  // Función optimizada para buscar destinatarios según permisos
  const buscarDestinatarios = async (busqueda: string = '') => {
    try {
      setBuscando(true);
      setError(null);
      
      console.log(`[DEBUG] Buscando destinatarios con query: "${busqueda}", isAcudiente: ${isAcudiente}`);
      
      // Usar el método apropiado según el rol del usuario
      let data;
      if (isAcudiente) {
        // Para ACUDIENTES, cargar la lista completa sin filtrado
        data = await mensajeService.buscarDestinatariosParaAcudiente();
      } else {
        // Para otros roles, usar la búsqueda con el término proporcionado
        data = await mensajeService.buscarDestinatarios(busqueda, false);
      }
      
      if (Array.isArray(data) && data.length === 0) {
        if (isAcudiente) {
          setError('No se encontraron destinatarios disponibles. Por favor contacte a la administración del colegio.');
        } else if (busqueda.trim()) {
          setError(`No se encontraron destinatarios para "${busqueda}". Intente con otro nombre.`);
        }
      } else {
        console.log(`[DEBUG] Destinatarios encontrados: ${data.length}`);
        setDestinatarios(data || []);
        setDestinatariosCargados(true);
      }
    } catch (err: any) {
      console.error('Error al buscar destinatarios:', err);
      
      // Mensaje de error mejorado
      if (respondiendo) {
        setError('No se pudieron cargar los destinatarios, pero podrá responder al remitente original.');
      } else {
        setError('No se pudieron cargar los destinatarios. Por favor intente más tarde.');
      }
      
      setDestinatarios([]);
    } finally {
      setBuscando(false);
    }
  };

  // Función para cargar cursos disponibles
  const cargarCursosDisponibles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mensajeService.obtenerCursosDisponibles();
      
      // Asegurar que siempre tenemos un array
      const cursosFormateados = Array.isArray(data) ? data : [];
      setCursos(cursosFormateados);
    } catch (err: any) {
      console.error('Error al cargar cursos:', err);
      setError('No se pudieron cargar los cursos disponibles. Por favor, intente más tarde o use mensaje individual.');
      setCursos([]);
      // Si falla la carga de cursos, cambiar a modo individual
      setTipoMensaje(TIPOS_MENSAJE.INDIVIDUAL);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de búsqueda con debounce
  useEffect(() => {
    // No aplicar debounce para acudientes ya que cargamos todos los datos de una vez
    if (!isAcudiente && tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL && query.trim() && !respondiendo) {
      const handler = setTimeout(() => {
        buscarDestinatarios(query);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }
  }, [query, tipoMensaje, isAcudiente, respondiendo]);

  // Manejo de archivos adjuntos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setAdjuntos((prevAdjuntos) => [...prevAdjuntos, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAdjuntos((prevAdjuntos) => prevAdjuntos.filter((_, i) => i !== index));
  };

  // Manejo de selección de destinatarios
  const handleDestinatarioSeleccionado = (_: any, value: Usuario | null) => {
    if (value && !destinatariosSeleccionados.find(d => d._id === value._id)) {
      setDestinatariosSeleccionados([...destinatariosSeleccionados, value]);
      formik.setFieldValue('destinatarios', [
        ...formik.values.destinatarios,
        value._id
      ]);
    }
    // No limpiar el query para acudientes
    if (!isAcudiente) {
      setQuery('');
    }
  };

  const handleRemoveDestinatario = (id: string) => {
    setDestinatariosSeleccionados(
      destinatariosSeleccionados.filter((d) => d._id !== id)
    );
    formik.setFieldValue(
      'destinatarios',
      formik.values.destinatarios.filter((d) => d !== id)
    );
  };

  // Cambio de tipo de mensaje
  const handleChangeTipoMensaje = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nuevoTipo = event.target.value;
    setTipoMensaje(nuevoTipo);
    
    // Limpiar mensajes de error previos
    setError(null);
    
    // Limpiar selecciones previas
    if (nuevoTipo === TIPOS_MENSAJE.INDIVIDUAL) {
      formik.setFieldValue('cursoId', '');
    } else {
      formik.setFieldValue('destinatarios', []);
      setDestinatariosSeleccionados([]);
      // Si no hay cursos cargados, intentar cargarlos
      if (cursos.length === 0) {
        cargarCursosDisponibles();
      }
    }
  };

  // Función para reintentar cargar datos
  const handleRetry = () => {
    setError(null);
    if (tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL) {
      buscarDestinatarios(isAcudiente ? '' : query);
    } else {
      cargarCursosDisponibles();
    }
  };

  // Función que formatea el texto del destinatario con información contextual
  const getDestinatarioLabel = (destinatario: Usuario) => {
    // Nombre base y tipo
    let label = `${destinatario.nombre} ${destinatario.apellidos} (${destinatario.tipo})`;
    
    // Si es DOCENTE, mostrar información detallada
    if (destinatario.tipo === 'DOCENTE') {
      // Si tiene asignatura, añadirla
      if (destinatario.asignatura) {
        label += ` - ${destinatario.asignatura}`;
      }
      
      // Si tiene curso, añadirlo
      if (destinatario.curso) {
        label += ` en ${destinatario.curso}`;
      }
      
      // Si existe información contextual (para acudientes), añadirla
      if (isAcudiente && destinatario.infoContextual) {
        label += ` - ${destinatario.infoContextual}`;
      }
    }
    
    return label;
  };

  return (
    <Box>
      <Typography variant="h2" color="primary.main" gutterBottom>
        {respondiendo ? 'Responder Mensaje' : 'Nuevo Mensaje'}
      </Typography>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
            >
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      {exito && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          {exito}
        </Alert>
      )}
      
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
            {/* Tipo de mensaje - ocultar si estamos respondiendo */}
            {puedeEnviarMasivo && !respondiendo && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Tipo de mensaje
                </Typography>
                <RadioGroup
                  row
                  name="tipoMensaje"
                  value={tipoMensaje}
                  onChange={handleChangeTipoMensaje}
                >
                  <FormControlLabel 
                    value={TIPOS_MENSAJE.INDIVIDUAL} 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1 }} /> Individual
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value={TIPOS_MENSAJE.MASIVO} 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon sx={{ mr: 1 }} /> Masivo (Curso completo)
                      </Box>
                    } 
                  />
                </RadioGroup>
              </Grid>
            )}
            
            {/* Destinatarios o curso según tipo de mensaje */}
            {tipoMensaje === TIPOS_MENSAJE.INDIVIDUAL ? (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Destinatarios
                </Typography>
                
                {/* Mensaje de ayuda para ACUDIENTES */}
                {isAcudiente && !respondiendo && (
                  <Alert 
                    severity="info" 
                    sx={{ mb: 2 }}
                    icon={<SchoolIcon />}
                  >
                    A continuación se muestra la lista de docentes y personal administrativo que puede contactar.
                    Los docentes muestran las asignaturas y cursos relacionados con sus estudiantes.
                  </Alert>
                )}
                
                {/* No mostrar campo de búsqueda si estamos respondiendo */}
                {!respondiendo && (
                  <Box sx={{ mb: 2 }}>
                    <Autocomplete
                      id="destinatarios-autocomplete"
                      options={destinatarios}
                      getOptionLabel={(option) => getDestinatarioLabel(option)}
                      loading={buscando}
                      onChange={handleDestinatarioSeleccionado}
                      onInputChange={(_, value) => !isAcudiente && setQuery(value)}
                      noOptionsText={isAcudiente ? 
                        "No hay destinatarios disponibles" : 
                        (query.trim() ? "No se encontraron destinatarios" : "Escriba para buscar")}
                      loadingText="Buscando destinatarios..."
                      renderOption={(props, option) => (
                        <li {...props}>
                          <Box sx={{ py: 1 }}>
                            <Typography variant="body1">
                              {option.nombre} {option.apellidos} 
                              <Typography component="span" color="primary.main" variant="body2">
                                {" "}({option.tipo})
                              </Typography>
                            </Typography>
                            
                            {/* Información detallada para docentes */}
                            {option.tipo === 'DOCENTE' && (
                              <>
                                {option.asignatura && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Asignatura:</strong> {option.asignatura}
                                  </Typography>
                                )}
                                
                                {option.curso && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Curso:</strong> {option.curso}
                                  </Typography>
                                )}
                                
                                {/* Información contextual para acudientes */}
                                {isAcudiente && option.infoContextual && (
                                  <Typography variant="body2" sx={{ color: 'success.main', fontStyle: 'italic' }}>
                                    {option.infoContextual}
                                  </Typography>
                                )}
                              </>
                            )}
                          </Box>
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={isAcudiente ? "Seleccionar destinatario" : "Buscar destinatario"}
                          placeholder={isAcudiente ? 
                            "Seleccione un docente relacionado con sus estudiantes" : 
                            "Buscar destinatario"}
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {buscando ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                    
                    {formik.touched.destinatarios && formik.errors.destinatarios && (
                      <FormHelperText error>
                        {formik.errors.destinatarios as string}
                      </FormHelperText>
                    )}
                  </Box>
                )}
                
                {/* Si estamos respondiendo, mostrar mensaje informativo */}
                {respondiendo && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Su respuesta será enviada al remitente del mensaje original.
                  </Alert>
                )}
                
                {/* Lista de destinatarios seleccionados */}
                {destinatariosSeleccionados.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {destinatariosSeleccionados.map((d) => (
                        <Chip
                          key={d._id}
                          label={getDestinatarioLabel(d)}
                          onDelete={respondiendo ? undefined : () => handleRemoveDestinatario(d._id)}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                  </Box>
                )}
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.cursoId && Boolean(formik.errors.cursoId)}
                >
                  <InputLabel id="curso-label">Curso</InputLabel>
                  <Select
                    labelId="curso-label"
                    id="cursoId"
                    name="cursoId"
                    value={formik.values.cursoId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    label="Curso"
                    disabled={loading}
                    renderValue={(value) => {
                      const curso = cursos.find(c => c._id === value);
                      return curso ? `${curso.nombre} (${curso.cantidadEstudiantes} estudiantes)` : '';
                    }}
                  >
                    {cursos.length > 0 ? (
                        cursos.map((curso) => (
                          <MenuItem key={curso._id} value={curso._id}>
                            <Box>
                              <Typography variant="body1">
                                {curso.nombre}
                                <Typography component="span" color="primary.main">
                                  {` (${curso.cantidadEstudiantes} estudiantes)`}
                                </Typography>
                              </Typography>
                              {curso.infoAdicional && (
                                <Typography variant="body2" color="text.secondary">
                                  {curso.infoAdicional}
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled value="">
                          No hay cursos disponibles
                        </MenuItem>
                      )}
                  </Select>
                  {formik.touched.cursoId && formik.errors.cursoId && (
                    <FormHelperText error>
                      {formik.errors.cursoId}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}
            
            {/* Prioridad del mensaje */}
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                error={formik.touched.prioridad && Boolean(formik.errors.prioridad)}
              >
                <InputLabel id="prioridad-label">Prioridad</InputLabel>
                <Select
                  labelId="prioridad-label"
                  id="prioridad"
                  name="prioridad"
                  value={formik.values.prioridad}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Prioridad"
                  disabled={loading}
                >
                  <MenuItem value="ALTA">Alta</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="BAJA">Baja</MenuItem>
                </Select>
                {formik.touched.prioridad && formik.errors.prioridad && (
                  <FormHelperText error>
                    {formik.errors.prioridad}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            {/* Asunto */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="asunto"
                name="asunto"
                label="Asunto"
                value={formik.values.asunto}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.asunto && Boolean(formik.errors.asunto)}
                helperText={formik.touched.asunto && formik.errors.asunto}
                disabled={loading}
              />
            </Grid>
            
            {/* Contenido */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Contenido
              </Typography>
              <ReactQuill
                theme="snow"
                value={formik.values.contenido}
                onChange={(content) => formik.setFieldValue('contenido', content)}
                modules={quillModules}
                formats={quillFormats}
                style={{ height: '200px', marginBottom: '50px' }}
              />
              {formik.touched.contenido && formik.errors.contenido && (
                <Typography color="error" variant="caption">
                  {formik.errors.contenido}
                </Typography>
              )}
            </Grid>
            
            {/* Adjuntos */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Adjuntos
              </Typography>
              
              {/* Lista de adjuntos */}
              {adjuntos.length > 0 && (
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
              )}
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<AttachFileIcon />}
                disabled={loading}
                sx={{ mt: 1, borderRadius: '20px' }}
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
            
            {/* Botones de acción */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/mensajes')}
                disabled={loading}
                sx={{ borderRadius: '20px' }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={24} /> : <SendIcon />}
                disabled={loading}
                sx={{ borderRadius: '20px' }}
              >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default NuevoMensaje;