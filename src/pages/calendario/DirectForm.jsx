// src/pages/calendario/DirectForm.jsx
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Alert, FormControlLabel, Checkbox, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { crearEventoTest } from '../../services/FixCalendarioService';

const DirectForm = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todoElDia, setTodoElDia] = useState(false);
  const [file, setFile] = useState(null);
  const [tipo, setTipo] = useState('ACADEMICO'); // Estado para el tipo
  
  // Manejar submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Obtener valores del formulario
      const titulo = document.getElementById('titulo').value;
      const descripcion = document.getElementById('descripcion').value;
      const lugar = document.getElementById('lugar').value;
      
      // Fechas - usamos fechas simples para pruebas
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + 1); // Un día después
      
      // Crear objeto de datos
      const eventoData = {
        titulo: titulo,
        descripcion: descripcion,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString(),
        tipo: tipo,
        lugar: lugar,
        todoElDia: todoElDia,
        color: '#3788d8'
      };
      
      // Mostrar datos que se van a enviar
      console.log('Datos del evento a enviar:', eventoData);
      
      // Usar el servicio arreglado que prueba múltiples URLs
      const response = await crearEventoTest(eventoData, file);
      
      console.log('Respuesta exitosa:', response);
      setSuccess(true);
      
      // Opcional: mostrar la URL que funcionó
      if (response.data) {
        setSuccess(`Evento creado correctamente con ID: ${response.data._id}`);
      } else {
        setSuccess('Evento creado correctamente');
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      
      if (error.response && error.response.data) {
        setError(`Error: ${error.response.data.message || JSON.stringify(error.response.data)}`);
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError('Error desconocido al crear el evento');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Formulario Directo - Crear Evento
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            id="titulo"
            label="Título"
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            id="descripcion"
            label="Descripción"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            required
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="tipo-label">Tipo de evento</InputLabel>
            <Select
              labelId="tipo-label"
              id="tipo"
              label="Tipo de evento"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              <MenuItem value="ACADEMICO">Académico</MenuItem>
              <MenuItem value="INSTITUCIONAL">Institucional</MenuItem>
              <MenuItem value="CULTURAL">Cultural</MenuItem>
              <MenuItem value="DEPORTIVO">Deportivo</MenuItem>
              <MenuItem value="OTRO">Otro</MenuItem>
            </Select>
          </FormControl>
          
          <Box sx={{ my: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={todoElDia}
                  onChange={(e) => setTodoElDia(e.target.checked)}
                />
              }
              label="Todo el día"
            />
          </Box>
          
          <TextField
            id="lugar"
            label="Lugar"
            fullWidth
            margin="normal"
          />
          
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Archivo adjunto
            </Typography>
            <input
              type="file"
              onChange={handleFileChange}
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Creando...' : 'Crear Evento'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
        Este es un formulario simplificado para probar la creación de eventos directamente.
        Probará automáticamente diferentes URLs para determinar cuál es la correcta.
      </Typography>
    </Box>
  );
};

export default DirectForm;