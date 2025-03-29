// src/components/dashboard/AnunciosRecientes.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Divider,
} from '@mui/material';

// Versión simplificada que no carga datos de anuncios
const AnunciosRecientes = () => {
  return (
    <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
      <CardHeader 
        title="Información Escolar" 
        sx={{ bgcolor: 'secondary.main', color: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
      />
      <Divider />
      <CardContent>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Próximamente información relevante de tu institución
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AnunciosRecientes;