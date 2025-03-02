// src/services/authService.ts
import axiosInstance from '../api/axiosConfig';
import { jwtDecode } from "jwt-decode";

// Interfaz para tokens
interface Tokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

// Interfaz para el usuario
interface User {
  _id: string;
  email: string;
  nombre: string;
  apellidos: string;
  tipo: string;
  escuelaId: string;
}

// Guardar tokens en localStorage
const saveTokens = (tokens: Tokens) => {
  localStorage.setItem('accessToken', tokens.access.token);
  localStorage.setItem('refreshToken', tokens.refresh.token);
};

// Obtener token de acceso
export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Obtener token de refresco
export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

// Obtener usuario actual del token
export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    return jwtDecode<User>(token);
  } catch (error) {
    return null;
  }
};

// Login
export const login = async (email: string, password: string): Promise<{ user: User, tokens: Tokens }> => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  const { user, tokens } = response.data.data;
  saveTokens(tokens);
  return { user, tokens };
};

// Logout
export const logout = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // También podríamos hacer una llamada al backend para invalidar el token
};

// Refrescar token
export const refreshToken = async (): Promise<string | null> => {
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    return null;
  }
  
  try {
    const response = await axiosInstance.post('/auth/refresh-token', {
      refreshToken: refreshTokenValue,
    });
    
    const tokens = response.data.data;
    saveTokens(tokens);
    return tokens.access.token;
  } catch (error) {
    logout();
    return null;
  }
};

// Verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Verificar si el token no ha expirado
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};