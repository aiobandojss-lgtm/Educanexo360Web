// src/pages/calificaciones/Estadisticas.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  Timeline,
  BarChart as BarChartIcon,
  School,
  Person
} from '@mui/icons-material';
import EstadisticasDocente from './EstadisticasDocente';

// Interfaz para el estado de las pestañas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Componente para el panel de pestañas
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`estadisticas-tabpanel-${index}`}
      aria-labelledby={`estadisticas-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Estadisticas = () => {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Estadísticas Académicas
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            borderBottom: 1, 
            borderColor: 'divider',
            px: 2,
            bgcolor: 'white',
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
            '& .Mui-selected': {
              color: 'primary.main',
              fontWeight: 'bold',
            },
          }}
        >
          <Tab 
            label="Rendimiento Docente" 
            icon={<BarChartIcon />} 
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
          <Tab 
            label="Rendimiento por Curso" 
            icon={<School />} 
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
          <Tab 
            label="Rendimiento por Estudiante" 
            icon={<Person />} 
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
          <Tab 
            label="Tendencias Periódicas" 
            icon={<Timeline />} 
            iconPosition="start"
            sx={{ textTransform: 'none', minHeight: 48 }}
          />
        </Tabs>

        {/* Panel de Rendimiento Docente */}
        <TabPanel value={tabValue} index={0}>
          <EstadisticasDocente />
        </TabPanel>

        {/* Panel de Rendimiento por Curso - Futuro desarrollo */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h3" gutterBottom>
              Rendimiento por Curso
            </Typography>
            <Typography variant="body1">
              Esta sección está en desarrollo. Próximamente podrá visualizar estadísticas detalladas por curso.
            </Typography>
          </Box>
        </TabPanel>

        {/* Panel de Rendimiento por Estudiante - Futuro desarrollo */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h3" gutterBottom>
              Rendimiento por Estudiante
            </Typography>
            <Typography variant="body1">
              Esta sección está en desarrollo. Próximamente podrá visualizar estadísticas detalladas por estudiante.
            </Typography>
          </Box>
        </TabPanel>

        {/* Panel de Tendencias Periódicas - Futuro desarrollo */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h3" gutterBottom>
              Tendencias Periódicas
            </Typography>
            <Typography variant="body1">
              Esta sección está en desarrollo. Próximamente podrá visualizar tendencias de rendimiento a lo largo del tiempo.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Estadisticas;