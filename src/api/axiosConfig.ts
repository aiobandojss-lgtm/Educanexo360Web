// src/api/axiosConfig.ts
import axios from "axios";
import { getToken, refreshToken, logout } from "../services/authService";

// INICIO DE DIAGNÓSTICO
console.log("==================== DIAGNÓSTICO AXIOS ====================");
console.log(
  "BaseURL configurada:",
  process.env.REACT_APP_API_URL || "http://localhost:3000"
);
console.log("Ambiente:", process.env.NODE_ENV);
console.log("============================================================");
// FIN DE DIAGNÓSTICO

// Función para asegurarse de que todas las URLs tengan el prefijo /api/
// NOTA: Esta función puede ser parte del problema - la dejamos por ahora pero con diagnóstico adicional
export const ensureApiPrefix = (url: string): string => {
  const originalUrl = url;

  if (url.startsWith("/api/")) {
    return url;
  }

  // Si la URL no comienza con /api/, añadirla
  if (url.startsWith("/")) {
    url = `/api${url}`;
  } else {
    url = `/api/${url}`;
  }

  // Log para diagnóstico de transformación de URL
  console.log(`URL transformada: ${originalUrl} -> ${url}`);

  return url;
};

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000", // Asegúrate de que este puerto coincida con el del backend
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Aumentado a 30 segundos para operaciones más lentas como carga de archivos
});

// Crear una instancia específica para carga de archivos con timeout más largo
export const axiosFileInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3000",
  timeout: 60000, // 60 segundos para subidas de archivos
});

// Interceptor para añadir el token de autenticación a las solicitudes y asegurar el prefijo /api/
axiosInstance.interceptors.request.use(
  (config) => {
    // Log antes de la transformación
    console.log(
      `📤 Solicitud original: ${config.method?.toUpperCase()} ${config.url}`
    );

    // Asegurarse de que todas las URLs tienen el prefijo /api/
    if (config.url && !config.url.includes("http")) {
      const originalUrl = config.url;
      config.url = ensureApiPrefix(config.url);

      // Si la URL fue modificada, registrarlo
      if (originalUrl !== config.url) {
        console.log(`URL modificada: ${originalUrl} -> ${config.url}`);
      }
    }

    // Añadir token de autenticación
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log después de todas las transformaciones
    console.log(
      `📤 Solicitud final: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      {
        params: config.params,
        data: config.data ? "(datos presentes)" : "(sin datos)",
      }
    );

    return config;
  },
  (error) => {
    console.error("❌ Error al preparar solicitud:", error);
    return Promise.reject(error);
  }
);

// Aplicar el mismo interceptor a la instancia para archivos
axiosFileInstance.interceptors.request.use(
  (config) => {
    // Configuración para asegurar que Content-Type sea eliminado (el navegador lo establece automáticamente con boundary)
    if (config.url && !config.url.includes("http")) {
      config.url = ensureApiPrefix(config.url);
    }

    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // No establecer Content-Type cuando se usa FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mejorar el interceptor de respuesta con más información de debugging
axiosInstance.interceptors.response.use(
  (response) => {
    // Log para respuestas exitosas
    console.log(
      `📥 Respuesta (${response.status}) de ${response.config.url}:`,
      {
        url: response.config.url,
        método: response.config.method,
        código: response.status,
        tieneData: !!response.data,
        estructuraDatos: response.data
          ? Object.keys(response.data)
          : "sin datos",
      }
    );

    // Si la respuesta tiene estructura de paginación, mostrarla
    if (
      response.data &&
      response.data.data &&
      (response.data.data.invitaciones || response.data.data.solicitudes)
    ) {
      const items =
        response.data.data.invitaciones || response.data.data.solicitudes;
      console.log(
        `Paginación: ${items?.length || 0} items, total: ${
          response.data.data.total || 0
        }`
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log mejorado para debugging
    if (error.response) {
      console.error(
        `❌ Error ${error.response.status} en ${
          originalRequest?.url || "URL desconocida"
        }:`,
        {
          data: error.response.data,
          headers: error.response.headers,
          config: {
            url: originalRequest?.url,
            method: originalRequest?.method,
            baseURL: originalRequest?.baseURL,
            params: originalRequest?.params,
          },
        }
      );

      if (error.response.status === 404) {
        console.error(`URL no encontrada: ${originalRequest.url}`);
        console.error(`Prueba estas alternativas:`);

        if (originalRequest.url.startsWith("/api/")) {
          console.error(`- ${originalRequest.url.substring(4)} (sin /api)`);
        } else {
          console.error(`- /api${originalRequest.url} (con /api)`);
        }
      }
    } else if (error.request) {
      console.error("❌ No se recibió respuesta del servidor:", error.request);
    } else {
      console.error("❌ Error al configurar la solicitud:", error.message);
    }

    // Si el error es 401 (No autorizado) y no es un intento de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const newToken = await refreshToken();

        if (newToken) {
          // Actualizar el token en la solicitud original y reintentarla
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          // Si no se pudo renovar el token, cerrar sesión
          logout();
          // En lugar de redirigir con window.location, retornamos un objeto con info para que el componente decida
          return Promise.reject({
            ...error,
            sessionExpired: true,
            message:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          });
        }
      } catch (refreshError) {
        // Si hay un error al renovar el token, cerrar sesión
        logout();
        return Promise.reject({
          ...error,
          sessionExpired: true,
          message:
            "Error al renovar la sesión. Por favor, inicia sesión nuevamente.",
        });
      }
    }

    return Promise.reject(error);
  }
);

// Aplicar el mismo interceptor de respuesta a la instancia para archivos
axiosFileInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (No autorizado) y no es un intento de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/refresh-token"
    ) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const newToken = await refreshToken();

        if (newToken) {
          // Actualizar el token en la solicitud original y reintentarla
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosFileInstance(originalRequest);
        } else {
          logout();
          return Promise.reject({
            ...error,
            sessionExpired: true,
            message:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          });
        }
      } catch (refreshError) {
        logout();
        return Promise.reject({
          ...error,
          sessionExpired: true,
          message:
            "Error al renovar la sesión. Por favor, inicia sesión nuevamente.",
        });
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
