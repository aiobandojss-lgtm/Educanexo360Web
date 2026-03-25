// src/api/axiosConfig.ts
import axios from "axios";
import { getToken, refreshToken, logout } from "../services/authService";

const isDev = import.meta.env.MODE === "development";

// Solo mostrar diagnóstico en desarrollo
if (isDev) {
  console.log("==================== DIAGNÓSTICO AXIOS ====================");
  console.log(
    "BaseURL configurada:",
    import.meta.env.VITE_API_URL || "http://localhost:3000"
  );
  console.log("Ambiente:", import.meta.env.MODE);
  console.log("============================================================");
}

// Función para asegurarse de que todas las URLs tengan el prefijo /api/
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

  // Log de transformación solo en desarrollo
  if (isDev) {
    console.log(`URL transformada: ${originalUrl} -> ${url}`);
  }

  return url;
};

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 segundos para operaciones más lentas como carga de archivos
});

// Crear una instancia específica para carga de archivos con timeout más largo
export const axiosFileInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  timeout: 60000, // 60 segundos para subidas de archivos
});

// Interceptor para añadir el token de autenticación y asegurar el prefijo /api/
axiosInstance.interceptors.request.use(
  (config) => {
    if (isDev) {
      console.log(
        `📤 Solicitud original: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    // Asegurarse de que todas las URLs tienen el prefijo /api/
    if (config.url && !config.url.includes("http")) {
      const originalUrl = config.url;
      config.url = ensureApiPrefix(config.url);

      if (isDev && originalUrl !== config.url) {
        console.log(`URL modificada: ${originalUrl} -> ${config.url}`);
      }
    }

    // Añadir token de autenticación
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (isDev) {
      console.log(
        `📤 Solicitud final: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        {
          params: config.params,
          data: config.data ? "(datos presentes)" : "(sin datos)",
        }
      );
    }

    return config;
  },
  (error) => {
    if (isDev) console.error("❌ Error al preparar solicitud:", error);
    return Promise.reject(error);
  }
);

// Aplicar el mismo interceptor a la instancia para archivos
axiosFileInstance.interceptors.request.use(
  (config) => {
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

// Interceptor de respuesta con logging solo en desarrollo
axiosInstance.interceptors.response.use(
  (response) => {
    if (isDev) {
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
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log de errores solo en desarrollo
    if (isDev) {
      if (error.response) {
        console.error(
          `❌ Error ${error.response.status} en ${
            originalRequest?.url || "URL desconocida"
          }:`,
          {
            data: error.response.data,
            config: {
              url: originalRequest?.url,
              method: originalRequest?.method,
              params: originalRequest?.params,
            },
          }
        );

        if (error.response.status === 404) {
          console.error(`URL no encontrada: ${originalRequest.url}`);
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
    }

    // Si el error es 401 y no es un intento de refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/refresh-token" &&
      originalRequest.url !== "/api/auth/verify-token"
    ) {
      originalRequest._retry = true;
      if (isDev) {
        console.log("Intentando renovar token para solicitud:", originalRequest.url);
      }

      try {
        const newToken = await refreshToken();

        if (newToken) {
          if (isDev) console.log("Token renovado exitosamente, reintentando solicitud original");
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          if (isDev) console.log("No se pudo renovar el token, forzando logout");
          logout();
          return Promise.reject({
            ...error,
            sessionExpired: true,
            message:
              "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          });
        }
      } catch (refreshError) {
        if (isDev) console.error("Error al renovar token:", refreshError);
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

// Interceptor de respuesta para la instancia de archivos
axiosFileInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/api/auth/refresh-token" &&
      originalRequest.url !== "/api/auth/verify-token"
    ) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();

        if (newToken) {
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
