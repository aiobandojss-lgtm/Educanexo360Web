// src/services/usuarioService.ts
import axiosInstance from '../api/axiosConfig';
import API_ROUTES from '../constants/apiRoutes';

export interface IUsuario {
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

// Tipo para respuestas de la API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class UsuarioService {
  /**
   * Obtiene una lista de usuarios con filtros opcionales
   * @param params Parámetros para filtrar usuarios
   * @returns Lista de usuarios
   */
  async obtenerUsuarios(params?: {
    tipo?: string;
    escuelaId?: string;
    estado?: string;
  }): Promise<IUsuario[]> {
    try {
      const response = await axiosInstance.get(API_ROUTES.USUARIOS.BASE, { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtiene un usuario específico por su ID
   * @param id ID del usuario
   * @returns Respuesta con los detalles del usuario
   */
  async obtenerUsuario(id: string): Promise<ApiResponse<IUsuario>> {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.USUARIOS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Busca usuarios por un término
   * @param query Término de búsqueda
   * @returns Lista de usuarios que coinciden con la búsqueda
   */
  async buscarUsuarios(query: string): Promise<IUsuario[]> {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.USUARIOS.BUSCAR}`, {
        params: { q: query }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un usuario
   * @param id ID del usuario
   * @param data Datos a actualizar
   * @returns Usuario actualizado
   */
  async actualizarUsuario(id: string, data: {
    nombre?: string;
    apellidos?: string;
    email?: string;
    tipo?: string;
  }): Promise<IUsuario> {
    try {
      const response = await axiosInstance.put(`${API_ROUTES.USUARIOS.BASE}/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Cambia la contraseña de un usuario
   * @param id ID del usuario
   * @param passwordActual Contraseña actual
   * @param nuevaPassword Nueva contraseña
   * @returns Mensaje de confirmación
   */
  async cambiarPassword(id: string, data: {
    passwordActual: string;
    nuevaPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(API_ROUTES.USUARIOS.CAMBIAR_PASSWORD(id), data);
      return response.data;
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario (desactivación)
   * @param id ID del usuario
   * @returns Mensaje de confirmación
   */
  async eliminarUsuario(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`${API_ROUTES.USUARIOS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

export default new UsuarioService();