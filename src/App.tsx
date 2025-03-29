// src/App.tsx (mejorado)
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './routes/AppRoutes';
import { isAuthenticated, getCurrentUser } from './services/authService';
import { loginSuccess, logout } from './redux/slices/authSlice';
import { ensureUserHasState } from './types/user.types';
import theme from './theme/theme';
import { performanceMonitor } from './utils/performanceUtils';
import SystemInitializationCheck from './components/system/SystemInitializationCheck'; // Importamos el componente

// Importar fuente Roboto de Google Fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// Componente interno para manejar la lógica de autenticación
const AuthInitializer = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    if (isAuthenticated()) {
      const userFromStorage = getCurrentUser();
      if (userFromStorage) {
        // Despachar acción para autenticar al usuario
        dispatch(loginSuccess(ensureUserHasState(userFromStorage)));
      } else {
        // Si el token existe pero no se puede decodificar correctamente
        dispatch(logout());
      }
    }
  }, [dispatch]);
  
  return null;
};

function App() {
  useEffect(() => {
    // Iniciar monitoreo de rendimiento global
    performanceMonitor.setEnabled(process.env.NODE_ENV === 'development');
    
    // Configurar atributos de accesibilidad a nivel de documento
    document.documentElement.lang = 'es';
    
    // Escuchar eventos de teclado para establecer el foco visible
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        document.body.setAttribute('data-keyboard-focus', 'true');
      }
    };
    
    const handleMouseDown = () => {
      document.body.removeAttribute('data-keyboard-focus');
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      
      // Desactivar monitoreo de rendimiento al desmontar
      performanceMonitor.setEnabled(false);
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {/* Inicializador de autenticación */}
          <AuthInitializer />
          
          {/* Verificación de inicialización del sistema */}
          <SystemInitializationCheck>
            {/* Contexto de anuncios para lectores de pantalla */}
            <div aria-live="polite" id="polite-announcer" className="sr-only"></div>
            <div aria-live="assertive" id="assertive-announcer" className="sr-only"></div>
            
            <AppRoutes />
          </SystemInitializationCheck>
        </BrowserRouter>
      </ThemeProvider>
      
      <style>
        {`
          .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
          }
          
          body[data-keyboard-focus="true"] *:focus {
            outline: 2px solid #5DA9E9 !important;
            outline-offset: 2px !important;
          }
          
          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </Provider>
  );
}

export default App;