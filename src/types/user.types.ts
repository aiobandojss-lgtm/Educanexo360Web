// src/types/user.types.ts

// Tipos de roles disponibles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DOCENTE: 'DOCENTE',
  ESTUDIANTE: 'ESTUDIANTE',
  ACUDIENTE: 'ACUDIENTE', // Cambiado de PADRE
  COORDINADOR: 'COORDINADOR', // Nuevo
  RECTOR: 'RECTOR', // Nuevo
  ADMINISTRATIVO: 'ADMINISTRATIVO' // Nuevo
};

// Jerarquía de roles (para permisos)
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 100,
  [USER_ROLES.RECTOR]: 90,
  [USER_ROLES.COORDINADOR]: 80,
  [USER_ROLES.ADMINISTRATIVO]: 70,
  [USER_ROLES.DOCENTE]: 60,
  [USER_ROLES.ACUDIENTE]: 50,
  [USER_ROLES.ESTUDIANTE]: 40
};

/**
 * Interfaz para el usuario con todos los campos requeridos
 */
export interface User {
  _id: string;
  email: string;
  nombre: string;
  apellidos: string;
  tipo: string;
  escuelaId: string;
  estado: string;
}

/**
 * Interfaz para credenciales de login
 */
export interface UserLogin {
  email: string;
  password: string;
}

/**
 * Interfaz para registro de usuario
 */
export interface UserRegister extends UserLogin {
  nombre: string;
  apellidos: string;
  tipo: string;
  escuelaId: string;
}

/**
 * Interfaz para actualización de perfil
 */
export interface UserProfile {
  nombre?: string;
  apellidos?: string;
  email?: string;
}

/**
 * Interfaces para respuestas de API
 */
export interface UserResponse {
  _id: string;
  email: string;
  nombre: string;
  apellidos: string;
  tipo: string;
  escuelaId: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: {
    access: {
      token: string;
      expires: string;
    };
    refresh: {
      token: string;
      expires: string;
    };
  };
}

/**
 * Función auxiliar para asegurar que un objeto de usuario tenga la propiedad estado
 * @param user Objeto de usuario que podría no tener la propiedad estado
 * @returns Objeto de usuario completo con la propiedad estado
 */
export const ensureUserHasState = (user: any): User => {
  if (!user) return {} as User;
  
  return {
    ...user,
    estado: user.estado || 'ACTIVO'
  };
};

/**
 * Función para determinar si un usuario tiene un rol específico
 * @param user Usuario a verificar
 * @param roles Array de roles permitidos
 * @returns true si el usuario tiene alguno de los roles especificados
 */
export const userHasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false;
  return roles.includes(user.tipo);
};

export default {
  ensureUserHasState,
  userHasRole
};