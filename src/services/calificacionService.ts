// src/services/calificacionService.ts
import axiosInstance from '../api/axiosConfig';
import { ICalificacion, ILogro, IBoletin } from '../types/calificacion.types';

// Puedes agregar esta interfaz al archivo calificacion.types.ts
export interface IEstadisticasGrupo {
  total_estudiantes: number;
  promedio_grupo: number;
  desviacion_estandar: number;
  maximo: number;
  minimo: number;
  distribucion: {
    excelente: number; // >= 4.5
    bueno: number; // >= 4.0 y < 4.5
    aceptable: number; // >= 3.0 y < 4.0
    insuficiente: number; // < 3.0
  };
}

class CalificacionService {
  async obtenerCalificaciones(params: {
    estudianteId?: string;
    asignaturaId?: string;
    cursoId?: string;
    periodo?: number;
    año_academico?: string;
  }): Promise<ICalificacion[]> {
    try {
      const response = await axiosInstance.get('/calificaciones', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      throw error;
    }
  }

  async obtenerCalificacionPorId(id: string): Promise<ICalificacion> {
    try {
      const response = await axiosInstance.get(`/calificaciones/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener calificación:', error);
      throw error;
    }
  }

  async crearCalificacion(calificacion: Partial<ICalificacion>): Promise<ICalificacion> {
    try {
      const response = await axiosInstance.post('/calificaciones', calificacion);
      return response.data.data;
    } catch (error) {
      console.error('Error al crear calificación:', error);
      throw error;
    }
  }

  async actualizarCalificacion(id: string, calificacion: Partial<ICalificacion>): Promise<ICalificacion> {
    try {
      const response = await axiosInstance.put(`/calificaciones/${id}`, calificacion);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar calificación:', error);
      throw error;
    }
  }

  async agregarCalificacionLogro(
    calificacionId: string,
    data: { logroId: string; calificacion: number; observacion?: string }
  ): Promise<ICalificacion> {
    try {
      const response = await axiosInstance.post(`/calificaciones/${calificacionId}/logros`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al agregar calificación de logro:', error);
      throw error;
    }
  }

  async actualizarCalificacionLogro(
    calificacionId: string,
    data: { logroId: string; calificacion: number; observacion?: string }
  ): Promise<ICalificacion> {
    try {
      const response = await axiosInstance.put(`/calificaciones/${calificacionId}/logros`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar calificación de logro:', error);
      throw error;
    }
  }

  async obtenerLogros(params: {
    asignaturaId?: string;
    periodo?: number;
    año_academico?: string;
    estado?: string;
  }): Promise<ILogro[]> {
    try {
      const response = await axiosInstance.get('/logros', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener logros:', error);
      throw error;
    }
  }

  async obtenerBoletinPeriodo(params: {
    estudianteId: string;
    periodo: number;
    año_academico: string;
  }): Promise<IBoletin> {
    try {
      const response = await axiosInstance.get('/boletin/periodo', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener boletín de periodo:', error);
      throw error;
    }
  }

  async obtenerBoletinFinal(params: {
    estudianteId: string;
    año_academico: string;
  }): Promise<IBoletin> {
    try {
      const response = await axiosInstance.get('/boletin/final', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener boletín final:', error);
      throw error;
    }
  }

  async obtenerEstadisticasGrupo(
    cursoId: string,
    asignaturaId: string,
    periodo: number,
    año_academico: string
  ): Promise<IEstadisticasGrupo> {
    try {
      const response = await axiosInstance.get('/academic/estadisticas-grupo', {
        params: {
          cursoId,
          asignaturaId,
          periodo,
          año_academico
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del grupo:', error);
      throw error;
    }
  }
}

export default new CalificacionService();