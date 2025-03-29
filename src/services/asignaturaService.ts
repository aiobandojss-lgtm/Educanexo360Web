// src/services/asignaturaService.ts
import axiosInstance from '../api/axiosConfig';

interface IAsignatura {
  _id: string;
  nombre: string;
  cursoId: string;
  docenteId: string;
  escuelaId: string;
  descripcion?: string;
  createdAt: string;
  updatedAt: string;
}

class AsignaturaService {
  /**
   * Obtiene todas las asignaturas o filtra por parámetros
   */
  async obtenerAsignaturas(params?: {
    cursoId?: string;
    docenteId?: string;
    escuelaId?: string;
  }): Promise<IAsignatura[]> {
    try {
      const response = await axiosInstance.get('/api/asignaturas', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una asignatura por su ID
   */
  async obtenerAsignaturaPorId(id: string): Promise<IAsignatura> {
    try {
      const response = await axiosInstance.get(`/api/asignaturas/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener asignatura:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva asignatura
   */
  async crearAsignatura(data: {
    nombre: string;
    cursoId: string;
    docenteId: string;
    descripcion?: string;
  }): Promise<IAsignatura> {
    try {
      const response = await axiosInstance.post('/api/asignaturas', data);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear asignatura:', error);
      throw error;
    }
  }

  /**
   * Actualiza una asignatura existente
   */
  async actualizarAsignatura(id: string, data: {
    nombre?: string;
    docenteId?: string;
    descripcion?: string;
  }): Promise<IAsignatura> {
    try {
      const response = await axiosInstance.put(`/api/asignaturas/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar asignatura:', error);
      throw error;
    }
  }

  /**
   * Elimina una asignatura
   */
  async eliminarAsignatura(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`/api/asignaturas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar asignatura:', error);
      throw error;
    }
  }
}

export default new AsignaturaService();