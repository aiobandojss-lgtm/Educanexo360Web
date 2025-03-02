// src/services/logroService.ts
import axiosInstance from '../api/axiosConfig';

// Interfaces para el tipo de logro
export interface Logro {
  _id: string;
  descripcion: string;
  asignaturaId: string | { 
    _id: string; 
    nombre: string;
    codigo: string;
  };
  cursoId: string | {
    _id: string;
    nombre: string;
    grado: string;
    grupo: string;
  };
  periodo: number;
  año_academico: string;
  peso: number;
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogroInput {
  descripcion: string;
  asignaturaId: string;
  cursoId: string;
  periodo: number;
  año_academico: string;
  peso: number;
  estado: string;
}

class LogroService {
  /**
   * Obtiene la lista de logros con filtros opcionales
   */
  async obtenerLogros(params = {}) {
    const response = await axiosInstance.get('/logros', { params });
    return response.data;
  }

  /**
   * Obtiene un logro específico por su ID
   */
  async obtenerLogro(id: string) {
    const response = await axiosInstance.get(`/logros/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo logro
   */
  async crearLogro(logro: LogroInput) {
    const response = await axiosInstance.post('/logros', logro);
    return response.data;
  }

  /**
   * Actualiza un logro existente
   */
  async actualizarLogro(id: string, logro: Partial<LogroInput>) {
    const response = await axiosInstance.put(`/logros/${id}`, logro);
    return response.data;
  }

  /**
   * Elimina un logro
   */
  async eliminarLogro(id: string) {
    const response = await axiosInstance.delete(`/logros/${id}`);
    return response.data;
  }

  /**
   * Obtiene logros por asignatura y curso
   */
  async obtenerLogrosPorAsignaturaCurso(asignaturaId: string, cursoId: string, params = {}) {
    const response = await axiosInstance.get(`/logros/asignatura/${asignaturaId}/curso/${cursoId}`, { params });
    return response.data;
  }

  /**
   * Obtiene logros por periodo académico
   */
  async obtenerLogrosPorPeriodo(asignaturaId: string, cursoId: string, periodo: number, año: string) {
    const response = await axiosInstance.get(`/logros/asignatura/${asignaturaId}/curso/${cursoId}/periodo/${periodo}`, {
      params: { año_academico: año }
    });
    return response.data;
  }
}

export default new LogroService();