// src/components/system/SystemInitializationCheck.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { checkSystemStatus } from '../../services/systemService';

/**
 * Componente que verifica si el sistema está inicializado
 * Si no lo está, redirige a la página de inicialización
 */
const SystemInitializationCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // No verificar en la página de setup para evitar redirecciones en bucle
    if (location.pathname === '/setup') {
      setLoading(false);
      return;
    }

    const verifySystem = async () => {
      try {
        setLoading(true);
        const status = await checkSystemStatus();
        
        if (!status.initialized) {
          // Si el sistema no está inicializado, redirigir a la página de configuración inicial
          navigate('/setup');
        }
      } catch (error) {
        console.error('Error verificando estado del sistema:', error);
        setError('No se pudo verificar el estado del sistema. Por favor, intente más tarde.');
      } finally {
        setLoading(false);
      }
    };

    verifySystem();
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 3 }}>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default SystemInitializationCheck;