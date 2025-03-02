// src/pages/calificaciones/CalificacionesLayout.tsx (actualizado)
import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import {
  AssessmentOutlined,
  GradeOutlined,
  SchoolOutlined,
  Add
} from '@mui/icons-material';
import { RootState } from '../../redux/store';

const CalificacionesLayout = () => {
  const location = useLocation();
  const [value, setValue] = React.useState(() => {
    if (location.pathname.includes('/calificaciones/lista')) return 0;
    if (location.pathname.includes('/calificaciones/boletin')) return 1;
    if (location.pathname.includes('/calificaciones/estadisticas')) return 2;
    return 0;
  });
  
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    
    // Navegar según el tab seleccionado
    switch (newValue) {
      case 0:
        navigate('/calificaciones/lista');
        break;
      case 1:
        navigate('/calificaciones/boletin');
        break;
      case 2:
        navigate('/calificaciones/estadisticas');
        break;
      default:
        navigate('/calificaciones/lista');
    }
  };

  const handleNuevaCalificacion = () => {
    navigate('/calificaciones/nueva');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1" color="primary.main">
          Calificaciones
        </Typography>
        
        {/* Mostrar botón de nueva calificación solo para docentes y administradores */}
        {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleNuevaCalificacion}
            sx={{ borderRadius: 20, px: 3 }}
          >
            Nueva Calificación
          </Button>
        )}
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="primary"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontWeight: 500
            },
            '& .Mui-selected': {
              fontWeight: 700,
              color: 'primary.main'
            }
          }}
        >
          <Tab 
            icon={<GradeOutlined />} 
            label="Calificaciones" 
            iconPosition="start"
          />
          <Tab 
            icon={<SchoolOutlined />} 
            label="Boletín" 
            iconPosition="start"
          />
          
          {/* Mostrar pestaña de estadísticas solo para docentes y administradores */}
          {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') && (
            <Tab 
              icon={<AssessmentOutlined />} 
              label="Estadísticas" 
              iconPosition="start"
            />
          )}
        </Tabs>
      </Paper>

      <Box>
        <Outlet />
      </Box>
    </Box>
  );
};

export default CalificacionesLayout;