// src/App.tsx (actualizado)
import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppRoutes from './routes/AppRoutes';
import { getCurrentUser } from './services/authService';
import { loginSuccess } from './redux/slices/authSlice';
import theme from './theme/theme';
import { NotificacionProvider } from './components/common/Notificaciones';

// Importar fuente Roboto de Google Fonts (ahora lo hacemos desde CDN para mejor rendimiento)
// import '@fontsource/roboto/300.css';
// import '@fontsource/roboto/400.css';
// import '@fontsource/roboto/500.css';
// import '@fontsource/roboto/700.css';

function App() {
  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar la aplicación
    const user = getCurrentUser();
    if (user) {
      store.dispatch(loginSuccess(user));
    }
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificacionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificacionProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;