// src/pages/asistencia/InformesAsistencia.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Leaderboard as LeaderboardIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import InformeRiesgo from '../../components/asistencia/informes/InformeRiesgo';
import InformeTendencia from '../../components/asistencia/informes/InformeTendencia';
import InformeRankingCursos from '../../components/asistencia/informes/InformeRankingCursos';
import InformePatronDias from '../../components/asistencia/informes/InformePatronDias';
import InformeHistorialEstudiante from '../../components/asistencia/informes/InformeHistorialEstudiante';
import InformeCierrePeriodo from '../../components/asistencia/informes/InformeCierrePeriodo';

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const TABS = [
  { label: 'Riesgo', icon: <WarningIcon fontSize="small" /> },
  { label: 'Tendencia', icon: <TrendingUpIcon fontSize="small" /> },
  { label: 'Ranking', icon: <LeaderboardIcon fontSize="small" /> },
  { label: 'Patrón días', icon: <CalendarIcon fontSize="small" /> },
  { label: 'Historial', icon: <PersonIcon fontSize="small" /> },
  { label: 'Cierre de Período', icon: <AssessmentIcon fontSize="small" /> },
];

const InformesAsistencia: React.FC = () => {
  const [tabActivo, setTabActivo] = useState(0);

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Informes de Asistencia
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={tabActivo}
          onChange={(_, v) => setTabActivo(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '& .MuiTab-root': {
              minHeight: 56,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
            },
            '& .Mui-selected': {
              fontWeight: 700,
              color: 'primary.main',
            },
          }}
        >
          {TABS.map((tab, idx) => (
            <Tab
              key={idx}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabActivo} index={0}>
            <InformeRiesgo />
          </TabPanel>
          <TabPanel value={tabActivo} index={1}>
            <InformeTendencia />
          </TabPanel>
          <TabPanel value={tabActivo} index={2}>
            <InformeRankingCursos />
          </TabPanel>
          <TabPanel value={tabActivo} index={3}>
            <InformePatronDias />
          </TabPanel>
          <TabPanel value={tabActivo} index={4}>
            <InformeHistorialEstudiante />
          </TabPanel>
          <TabPanel value={tabActivo} index={5}>
            <InformeCierrePeriodo />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};

export default InformesAsistencia;
