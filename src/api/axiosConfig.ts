// src/api/axiosConfig.ts
import axios from 'axios';
import { getToken, refreshToken } from '../services/authService';

// Definir la URL base de nuestra API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Crear instancia de axios
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autenticación
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si el error es 401 (No autorizado) y no hemos intentado refrescar el token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Intentar refrescar el token
        const newToken = await refreshToken();
        
        // Si se obtuvo un nuevo token, reintentar la solicitud original
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si no se pudo refrescar, redirigir al login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;