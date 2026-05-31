// src/services/perfilRolService.ts
import axiosInstance from '../api/axiosConfig';
import { PerfilRol, CatalogoPermiso, RolBase } from '../types/user.types';

export interface CreatePerfilRolData {
  nombre: string;
  descripcion?: string;
  rolBase: RolBase;
  permisos: string[];
}

export interface UpdatePerfilRolData {
  nombre?: string;
  descripcion?: string;
  permisos?: string[];
  activo?: boolean;
}

// Lista todos los perfiles activos de la escuela
export const getPerfilesRol = async (): Promise<PerfilRol[]> => {
  const response = await axiosInstance.get('/perfiles-rol');
  return response.data.data as PerfilRol[];
};

// Obtiene un perfil por ID
export const getPerfilRol = async (id: string): Promise<PerfilRol> => {
  const response = await axiosInstance.get(`/perfiles-rol/${id}`);
  return response.data.data as PerfilRol;
};

// Crea un perfil nuevo
export const createPerfilRol = async (data: CreatePerfilRolData): Promise<PerfilRol> => {
  const response = await axiosInstance.post('/perfiles-rol', data);
  return response.data.data as PerfilRol;
};

// Actualiza nombre, descripción, permisos o activo
export const updatePerfilRol = async (id: string, data: UpdatePerfilRolData): Promise<PerfilRol> => {
  const response = await axiosInstance.put(`/perfiles-rol/${id}`, data);
  return response.data.data as PerfilRol;
};

// Elimina el perfil y reasigna usuarios al rol base puro
export const deletePerfilRol = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/perfiles-rol/${id}`);
};

// Lista todos los permisos disponibles en el sistema
export const getCatalogoPermisos = async (): Promise<CatalogoPermiso[]> => {
  const response = await axiosInstance.get('/perfiles-rol/catalogo/permisos');
  return response.data.data as CatalogoPermiso[];
};

// Devuelve permisos sugeridos para un rol base como punto de partida
export const getPermisosSugeridos = async (rolBase: RolBase): Promise<string[]> => {
  const response = await axiosInstance.get(`/perfiles-rol/catalogo/sugeridos/${rolBase}`);
  return response.data.data as string[];
};

// Asigna un perfil a un usuario
export const asignarPerfilAUsuario = async (usuarioId: string, perfilRolId: string): Promise<void> => {
  await axiosInstance.post(`/perfiles-rol/usuarios/${usuarioId}/asignar`, { perfilRolId });
};

// Remueve el perfil personalizado del usuario
export const removerPerfilDeUsuario = async (usuarioId: string): Promise<void> => {
  await axiosInstance.delete(`/perfiles-rol/usuarios/${usuarioId}/perfil`);
};
