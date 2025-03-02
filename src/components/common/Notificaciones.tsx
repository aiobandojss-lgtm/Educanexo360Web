// src/components/common/Notificaciones.tsx
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Definimos la interfaz para el contexto
interface NotificacionContextProps {
  mostrarNotificacion: (mensaje: string, tipo: AlertColor, duracion?: number) => void;
  ocultarNotificacion: () => void;
}

// Definimos la interfaz para el proveedor
interface NotificacionProviderProps {
  children: ReactNode;
}

// Creamos el contexto con un valor por defecto
const NotificacionContext = createContext<NotificacionContextProps>({
  mostrarNotificacion: () => {},
  ocultarNotificacion: () => {},
});

// Hook personalizado para usar el contexto
export const useNotificacion = () => useContext(NotificacionContext);

// Componente proveedor que contiene la lógica de las notificaciones
export const NotificacionProvider: React.FC<NotificacionProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipo, setTipo] = useState<AlertColor>('info');
  const [duracion, setDuracion] = useState(6000); // Duración predeterminada: 6 segundos
  
  // Función para mostrar una notificación
  const mostrarNotificacion = (
    nuevoMensaje: string, 
    nuevoTipo: AlertColor = 'info',
    nuevaDuracion: number = 6000
  ) => {
    setMensaje(nuevoMensaje);
    setTipo(nuevoTipo);
    setDuracion(nuevaDuracion);
    setOpen(true);
  };
  
  // Función para ocultar la notificación
  const ocultarNotificacion = () => {
    setOpen(false);
  };
  
  // Manejador para el evento de cierre
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return; // No cerrar si el usuario hace clic fuera de la notificación
    }
    ocultarNotificacion();
  };
  
  // Proveemos el contexto y el componente de notificación
  return (
    <NotificacionContext.Provider value={{ mostrarNotificacion, ocultarNotificacion }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={duracion}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleClose} 
          severity={tipo} 
          sx={{ 
            width: '100%', 
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            fontWeight: 500,
          }}
          variant="filled"
        >
          {mensaje}
        </Alert>
      </Snackbar>
    </NotificacionContext.Provider>
  );
};

// Exportamos un componente directo para pruebas o uso simple
const Notificaciones: React.FC<{ 
  open: boolean; 
  mensaje: string; 
  tipo?: AlertColor;
  duracion?: number;
  onClose: () => void;
}> = ({ open, mensaje, tipo = 'info', duracion = 6000, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duracion}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert 
        onClose={onClose} 
        severity={tipo} 
        sx={{ 
          width: '100%', 
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          fontWeight: 500,
        }}
        variant="filled"
      >
        {mensaje}
      </Alert>
    </Snackbar>
  );
};

export default Notificaciones;