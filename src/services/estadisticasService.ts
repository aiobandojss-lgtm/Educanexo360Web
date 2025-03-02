// src/services/estadisticasService.ts
import axiosInstance from '../api/axiosConfig';

// Interfaces para estadísticas
export interface EstadisticaAsignatura {
  _id: string;
  nombre: string;
  promedio: number;
  aprobados: number;
  reprobados: number;
  total: number;
  porcentajeAprobados: number;
  porcentajeReprobados: number;
}

export interface EstadisticaCurso {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
  promedio: number;
  aprobados: number;
  reprobados: number;
  total: number;
  porcentajeAprobados: number;
  porcentajeReprobados: number;
}

export interface EstadisticasPeriodo {
  periodo: string;
  año_academico: string;
  promedio: number;
  aprobados: number;
  reprobados: number;
  total: number;
  porcentajeAprobados: number;
  porcentajeReprobados: number;
}

export interface EstadisticasDocente {
  asignaturas: EstadisticaAsignatura[];
  cursos: EstadisticaCurso[];
  periodos: EstadisticasPeriodo[];
  general: {
    promedio: number;
    aprobados: number;
    reprobados: number;
    total: number;
    porcentajeAprobados: number;
    porcentajeReprobados: number;
  };
}

export interface FiltrosEstadisticas {
  periodo?: string;
  año_academico?: string;
  asignaturaId?: string;
  cursoId?: string;
}

class EstadisticasService {
  /**
   * Obtiene las estadísticas para un docente
   */
  async obtenerEstadisticasDocente(filtros: FiltrosEstadisticas = {}) {
    const response = await axiosInstance.get('/academic/estadisticas/docente', { params: filtros });
    return response.data;
  }

  /**
   * Obtiene las estadísticas para un curso específico
   */
  async obtenerEstadisticasCurso(cursoId: string, filtros: FiltrosEstadisticas = {}) {
    const response = await axiosInstance.get(`/academic/estadisticas/curso/${cursoId}`, { params: filtros });
    return response.data;
  }

  /**
   * Obtiene las estadísticas para una asignatura específica
   */
  async obtenerEstadisticasAsignatura(asignaturaId: string, filtros: FiltrosEstadisticas = {}) {
    const response = await axiosInstance.get(`/academic/estadisticas/asignatura/${asignaturaId}`, { params: filtros });
    return response.data;
  }

  /**
   * Obtiene las estadísticas generales de la escuela (solo para administradores)
   */
  async obtenerEstadisticasEscuela(filtros: FiltrosEstadisticas = {}) {
    const response = await axiosInstance.get('/academic/estadisticas/escuela', { params: filtros });
    return response.data;
  }
}

export default new EstadisticasService();