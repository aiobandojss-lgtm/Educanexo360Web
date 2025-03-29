// src/services/authService.ts
import axiosInstance from '../api/axiosConfig';
import { jwtDecode } from "jwt-decode";
import API_ROUTES from '../constants/apiRoutes';
import { User, UserRegister, AuthResponse } from '../types/user.types';
import { ROLE_HIERARCHY, USER_ROLES } from '../types/user.types';

// Interfaz para tokens
export interface Tokens {
  access: {
    token: string;
    expires: string;
  };
  refresh: {
    token: string;
    expires: string;
  };
}

// Guardar tokens en localStorage con mejor seguridad
const saveTokens = (tokens: Tokens) => {
  localStorage.setItem('accessToken', tokens.access.token);
  localStorage.setItem('refreshToken', tokens.refresh.token);
  // Guardar tiempo de expiración para validaciones del lado del cliente
  localStorage.setItem('tokenExpires', tokens.access.expires);
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
    console.error('Error decodificando token:', error);
    return null;
  }
};

// Obtener perfil completo del usuario (información más allá del token)
export const fetchUserProfile = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get(API_ROUTES.USUARIOS.GET_PROFILE);
    return response.data.data;
  } catch (error) {
    console.error('Error obteniendo perfil de usuario:', error);
    throw error;
  }
};

// Login
export const login = async (email: string, password: string): Promise<{ user: User, tokens: Tokens }> => {
  try {
    const response = await axiosInstance.post(API_ROUTES.AUTH.LOGIN, { email, password });
    const { user, tokens } = response.data.data;
    saveTokens(tokens);
    return { user, tokens };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// Registro
export const register = async (userData: UserRegister): Promise<{ user: User, tokens: Tokens }> => {
  try {
    const response = await axiosInstance.post<{data: AuthResponse}>(API_ROUTES.AUTH.REGISTER, userData);
    const { user, tokens } = response.data.data;
    saveTokens(tokens);
    return { user, tokens };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

// Logout
export const logout = (): void => {
  // Intentar realizar logout en el servidor (invalidar token)
  try {
    const token = getToken();
    if (token) {
      // Solicitud asíncrona sin awaitar para no bloquear la UI
      axiosInstance.post(API_ROUTES.AUTH.LOGOUT)
        .catch(error => console.error('Error en logout del servidor:', error));
    }
  } catch (e) {
    console.error('Error intentando logout:', e);
  }
  
  // Limpiar localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpires');
  localStorage.removeItem('userProfile');
};

// Refrescar token
export const refreshToken = async (): Promise<string | null> => {
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    return null;
  }
  
  try {
    const response = await axiosInstance.post(API_ROUTES.AUTH.REFRESH_TOKEN, {
      refreshToken: refreshTokenValue,
    });
    
    const tokens = response.data.data;
    saveTokens(tokens);
    return tokens.access.token;
  } catch (error) {
    console.error('Error refrescando token:', error);
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
    console.error('Error verificando autenticación:', error);
    return false;
  }
};

// Cambiar contraseña
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  try {
    await axiosInstance.post(API_ROUTES.AUTH.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return true;
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    throw error;
  }
};

// Solicitar recuperación de contraseña
export const requestPasswordReset = async (email: string): Promise<boolean> => {
  try {
    await axiosInstance.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { email });
    return true;
  } catch (error) {
    console.error('Error solicitando reset de contraseña:', error);
    throw error;
  }
};

// Resetear contraseña
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<boolean> => {
  try {
    await axiosInstance.post(API_ROUTES.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
    return true;
  } catch (error) {
    console.error('Error reseteando contraseña:', error);
    throw error;
  }
};

// Verificar permisos basados en rol
export const hasPermission = (requiredRoles: string[], userRole?: string): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

export default {
  login,
  logout,
  register,
  refreshToken,
  getToken,
  getRefreshToken,
  getCurrentUser,
  fetchUserProfile,
  isAuthenticated,
  changePassword,
  requestPasswordReset,
  resetPassword,
  hasPermission
};