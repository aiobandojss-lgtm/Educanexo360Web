// src/api/axiosConfig.ts
import axios from 'axios';
import { getToken, refreshToken, logout } from '../services/authService';

// Función para asegurarse de que todas las URLs tengan el prefijo /api/
export const ensureApiPrefix = (url: string): string => {
  if (url.startsWith('/api/')) {
    return url;
  }
  
  // Si la URL no comienza con /api/, añadirla
  if (url.startsWith('/')) {
    return `/api${url}`;
  }
  
  return `/api/${url}`;
};

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000', // Asegúrate de que este puerto coincida con el del backend
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Aumentado a 30 segundos para operaciones más lentas como carga de archivos
});

// Crear una instancia específica para carga de archivos con timeout más largo
export const axiosFileInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  timeout: 60000, // 60 segundos para subidas de archivos
});

// Interceptor para añadir el token de autenticación a las solicitudes y asegurar el prefijo /api/
axiosInstance.interceptors.request.use(
  (config) => {
    // Asegurarse de que todas las URLs tienen el prefijo /api/
    if (config.url && !config.url.includes('http')) {
      config.url = ensureApiPrefix(config.url);
    }
    
    // Añadir token de autenticación
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Aplicar el mismo interceptor a la instancia para archivos
axiosFileInstance.interceptors.request.use(
  (config) => {
    // Configuración para asegurar que Content-Type sea eliminado (el navegador lo establece automáticamente con boundary)
    if (config.url && !config.url.includes('http')) {
      config.url = ensureApiPrefix(config.url);
    }
    
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // No establecer Content-Type cuando se usa FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mejorar el interceptor de respuesta con más información de debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Log mejorado para debugging
    if (error.response) {
      console.error(`Error ${error.response.status}:`, error.response.data);
      
      if (error.response.status === 404) {
        console.error(`URL no encontrada: ${originalRequest.url}`);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      console.error('Error al configurar la solicitud:', error.message);
    }
    
    // Si el error es 401 (No autorizado) y no es un intento de refresh
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh-token') {
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
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          });
        }
      } catch (refreshError) {
        // Si hay un error al renovar el token, cerrar sesión
        logout();
        return Promise.reject({
          ...error,
          sessionExpired: true,
          message: 'Error al renovar la sesión. Por favor, inicia sesión nuevamente.'
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
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/api/auth/refresh-token') {
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
            message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
          });
        }
      } catch (refreshError) {
        logout();
        return Promise.reject({
          ...error,
          sessionExpired: true,
          message: 'Error al renovar la sesión. Por favor, inicia sesión nuevamente.'
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;