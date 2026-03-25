// src/App.tsx (mejorado)
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./redux/store";

// Cliente global de @tanstack/react-query v5 con caché inteligente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,   // Datos frescos por 2 minutos
      gcTime: 1000 * 60 * 10,     // Garbage collection tras 10 min sin uso (antes: cacheTime)
      retry: 1,                    // Solo 1 reintento en caso de error
      refetchOnWindowFocus: false, // No re-fetchar al volver al tab
    },
  },
});
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppRoutes from "./routes/AppRoutes";
import {
  isAuthenticated,
  getCurrentUser,
  verifyTokenWithServer,
} from "./services/authService";
import { loginSuccess, logout } from "./redux/slices/authSlice";
import { ensureUserHasState } from "./types/user.types";
import theme from "./theme/theme";
import { performanceMonitor } from "./utils/performanceUtils";
import SystemInitializationCheck from "./components/system/SystemInitializationCheck"; // Importamos el componente
import ErrorBoundary from "./components/common/ErrorBoundary";

// Importar fuente Roboto de Google Fonts
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

// Componente interno para manejar la lógica de autenticación
const AuthInitializer = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      console.log("Inicializando autenticación...");

      // Primero verificamos localmente
      if (isAuthenticated()) {
        console.log("Token encontrado localmente");

        try {
          // Verificar con el servidor si el token es válido
          const serverValidatedUser = await verifyTokenWithServer();

          if (serverValidatedUser) {
            console.log(
              "Token verificado con el servidor:",
              serverValidatedUser.nombre
            );
            // Despachar acción para autenticar al usuario con datos del servidor
            dispatch(loginSuccess(ensureUserHasState(serverValidatedUser)));
          } else {
            console.log("Token rechazado por el servidor, haciendo logout");
            // Si el servidor rechaza el token, hacer logout
            dispatch(logout());
          }
        } catch (error) {
          console.error("Error verificando token con el servidor:", error);
          // En caso de error de conexión u otro problema, hacer logout por seguridad
          dispatch(logout());
        }
      } else {
        console.log("No hay token o es inválido localmente");
        // Asegurarse de que el estado refleje que no estamos autenticados
        dispatch(logout());
      }
    };

    initAuth();
  }, [dispatch]);

  return null;
};

function App() {
  useEffect(() => {
    // Iniciar monitoreo de rendimiento global
    performanceMonitor.setEnabled(import.meta.env.MODE === "development");

    // Configurar atributos de accesibilidad a nivel de documento
    document.documentElement.lang = "es";

    // Escuchar eventos de teclado para establecer el foco visible
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        document.body.setAttribute("data-keyboard-focus", "true");
      }
    };

    const handleMouseDown = () => {
      document.body.removeAttribute("data-keyboard-focus");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);

      // Desactivar monitoreo de rendimiento al desmontar
      performanceMonitor.setEnabled(false);
    };
  }, []);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {/* Inicializador de autenticación */}
          <AuthInitializer />

          {/* Verificación de inicialización del sistema */}
          <ErrorBoundary>
          <SystemInitializationCheck>
            {/* Contexto de anuncios para lectores de pantalla */}
            <div
              aria-live="polite"
              id="polite-announcer"
              className="sr-only"
            ></div>
            <div
              aria-live="assertive"
              id="assertive-announcer"
              className="sr-only"
            ></div>

            <AppRoutes />
          </SystemInitializationCheck>
          </ErrorBoundary>
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
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
