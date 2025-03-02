// src/pages/mensajes/MensajesLayout.tsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { Mail, Send, Drafts, Archive } from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const MensajesLayout = () => {
  const location = useLocation();
  const [value, setValue] = useState(() => {
    if (location.pathname.includes('/recibidos')) return 0;
    if (location.pathname.includes('/enviados')) return 1;
    if (location.pathname.includes('/borradores')) return 2;
    if (location.pathname.includes('/archivados')) return 3;
    return 0;
  });

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<Mail />} label="Recibidos" component={Link} to="/mensajes/recibidos" />
          <Tab icon={<Send />} label="Enviados" component={Link} to="/mensajes/enviados" />
          <Tab icon={<Drafts />} label="Borradores" component={Link} to="/mensajes/borradores" />
          <Tab icon={<Archive />} label="Archivados" component={Link} to="/mensajes/archivados" />
        </Tabs>
      </Paper>
      <Box sx={{ p: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default MensajesLayout;