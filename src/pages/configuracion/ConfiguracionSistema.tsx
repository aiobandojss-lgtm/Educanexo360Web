import React from 'react';
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, Divider, Button } from '@mui/material';

const ConfiguracionSistema = () => {
  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Configuración del Sistema
      </Typography>
      
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Typography variant="h3" color="primary.main" gutterBottom>
          Configuración General
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Enviar notificaciones por correo"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch />} 
              label="Modo de alto contraste"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Mostrar calificaciones gráficamente"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Recordatorios automáticos"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Typography variant="h3" color="primary.main" gutterBottom>
          Configuración de Accesibilidad
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch />} 
              label="Reducir animaciones"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch />} 
              label="Aumentar tamaño de texto"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch />} 
              label="Usar colores de alto contraste"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch defaultChecked />} 
              label="Habilitar soporte para lectores de pantalla"
            />
          </Grid>
        </Grid>
      </Paper>
      
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
        <Typography variant="h3" color="primary.main" gutterBottom>
          Configuración Avanzada
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Estas opciones solo están disponibles para administradores del sistema.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch />} 
              label="Modo de desarrollo"
              disabled
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel 
              control={<Switch />} 
              label="Registro de actividad detallado"
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Button variant="contained" color="primary" sx={{ mr: 2 }}>
              Guardar Configuración
            </Button>
            <Button variant="outlined">
              Restaurar Valores Predeterminados
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
        Nota: Algunas configuraciones pueden requerir reiniciar la aplicación para aplicarse correctamente.
      </Typography>
    </Box>
  );
};

export default ConfiguracionSistema;