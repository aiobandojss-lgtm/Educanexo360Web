// src/pages/mensajes/MensajesLayout.tsx
import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, Paper, Tab, Tabs, Typography } from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon 
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { ROLES_CON_BORRADORES } from '../../types/mensaje.types';

const MensajesLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Determinar si el usuario puede tener borradores
  const puedeTenerBorradores = user && ROLES_CON_BORRADORES.includes(user.tipo);
  
  // Determinar la pestaña activa basada en la URL
  const getActiveTab = () => {
  if (location.pathname.includes('recibidos')) return 0;
  if (location.pathname.includes('enviados')) return 1;
  if (location.pathname.includes('borradores')) return 2; // Solo aparece si puedeTenerBorradores
  if (location.pathname.includes('archivados')) {
    // Para estudiantes: recibidos(0), enviados(1), archivados(2), eliminados(3)
    if (user?.tipo === 'ESTUDIANTE') return 2;
    // Para acudientes: recibidos(0), enviados(1), archivados(2), eliminados(3)
    if (user?.tipo === 'ACUDIENTE') return 2;
    // Para usuarios con borradores: recibidos(0), enviados(1), borradores(2), archivados(3), eliminados(4)
    if (puedeTenerBorradores) return 3;
    return 2;
  }
  if (location.pathname.includes('eliminados')) {
    // Para estudiantes: eliminados es índice 3
    if (user?.tipo === 'ESTUDIANTE') return 3;
    // Para acudientes: eliminados es índice 3
    if (user?.tipo === 'ACUDIENTE') return 3;
    // Para usuarios con borradores: eliminados es índice 4
    if (puedeTenerBorradores) return 4;
    return 3;
  }
  return 0;
};
  
  // Establecer índices de pestañas según el rol del usuario
  const tabIndexMapping = () => {
  // NUEVA LÓGICA: Estudiantes ahora tienen acceso similar a acudientes
  if (user?.tipo === 'ESTUDIANTE') {
    return {
      recibidos: 0,
      enviados: 1,
      archivados: 2,
      eliminados: 3
    };
  }
  
  // Para rol ACUDIENTE o usuarios sin acceso a borradores (sin cambios)
  if (user?.tipo === 'ACUDIENTE' || !puedeTenerBorradores) {
    return {
      recibidos: 0,
      enviados: 1,
      archivados: 2,
      eliminados: 3
    };
  }
  
  // Para los demás roles con acceso a borradores (sin cambios)
  return {
    recibidos: 0,
    enviados: 1,
    borradores: 2,
    archivados: 3,
    eliminados: 4
  };
};
  
  const tabIndices = tabIndexMapping();
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // Mapping inverso: de índice a ruta
    const tabIndexToPath = Object.entries(tabIndices).reduce((acc, [path, index]) => {
      acc[index] = path;
      return acc;
    }, {} as Record<number, string>);
    
    const path = tabIndexToPath[newValue];
    if (path) {
      navigate(`/mensajes/${path}`);
    }
  };
  
  // Verificar si el rol actual tiene acceso a la ruta actual
  useEffect(() => {
    const currentPath = location.pathname.split('/').pop();
   
    // Verificar restricciones para ACUDIENTE
    if (user?.tipo === 'ACUDIENTE') {
      if (currentPath === 'borradores') {
        navigate('/mensajes/recibidos');
        return;
      }
    }
    
    // Verificar restricciones para usuarios sin acceso a borradores
    if (!puedeTenerBorradores && currentPath === 'borradores') {
      navigate('/mensajes/recibidos');
      return;
    }
  }, [location.pathname, user?.tipo, navigate, puedeTenerBorradores]);
  
  // Verificar si el usuario es estudiante
  const isEstudiante = user?.tipo === 'ESTUDIANTE';
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h1" color="primary.main">
          Mensajería
        </Typography>
        
        {/* Mostrar botones según permisos */}
        
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/mensajes/nuevo')}
              sx={{ borderRadius: '20px', mr: 1 }}
            >
              Nuevo Mensaje
            </Button>
            
            {puedeTenerBorradores && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate('/mensajes/borradores/nuevo')}
                sx={{ borderRadius: '20px' }}
              >
                Crear Borrador
              </Button>
            )}
          </Box>
        
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          mb: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Tabs
          value={getActiveTab()}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 500
            }
          }}
        >
          <Tab label="Recibidos" />
          <Tab label="Enviados" />
          {puedeTenerBorradores && <Tab label="Borradores" />}
          <Tab label="Archivados" />
          <Tab label="Eliminados" />
        </Tabs>
      </Paper>
      
      <Outlet />
    </Box>
  );
};

export default MensajesLayout;