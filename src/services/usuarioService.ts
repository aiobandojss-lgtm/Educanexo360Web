// src/services/usuarioService.ts
import axiosInstance from '../api/axiosConfig';

// Interfaces para el tipo de usuario
export interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  estado: string;
  escuelaId: string | { _id: string; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioInput {
  nombre: string;
  apellidos: string;
  email: string;
  password?: string;
  tipo: string;
  estado: string;
  escuelaId: string;
}

class UsuarioService {
  /**
   * Obtiene la lista de usuarios con paginación y filtros
   */
  async obtenerUsuarios(params = {}) {
    const response = await axiosInstance.get('/usuarios', { params });
    return response.data;
  }

  /**
   * Obtiene la información de un usuario por su ID
   */
  async obtenerUsuario(id: string) {
    const response = await axiosInstance.get(`/usuarios/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo usuario
   */
  async crearUsuario(usuario: UsuarioInput) {
    const response = await axiosInstance.post('/auth/register', usuario);
    return response.data;
  }

  /**
   * Actualiza la información de un usuario
   */
  async actualizarUsuario(id: string, usuario: Partial<UsuarioInput>) {
    const response = await axiosInstance.put(`/usuarios/${id}`, usuario);
    return response.data;
  }

  /**
   * Elimina (desactiva) un usuario
   */
  async eliminarUsuario(id: string) {
    const response = await axiosInstance.delete(`/usuarios/${id}`);
    return response.data;
  }

  /**
   * Cambia la contraseña de un usuario
   */
  async cambiarPassword(id: string, passwordActual: string, nuevaPassword: string) {
    const response = await axiosInstance.post(`/usuarios/${id}/cambiar-password`, {
      passwordActual,
      nuevaPassword,
    });
    return response.data;
  }

  /**
   * Buscar usuarios
   */
  async buscarUsuarios(query: string) {
    const response = await axiosInstance.get('/usuarios/buscar', {
      params: { q: query },
    });
    return response.data;
  }
}

export default new UsuarioService();