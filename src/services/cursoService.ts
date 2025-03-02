// src/services/cursoService.ts
import axiosInstance from '../api/axiosConfig';

// Interfaces para el tipo de curso
export interface Curso {
  _id: string;
  nombre: string;
  año_academico: string;
  grado: string;
  grupo: string;
  director_grupo: string | { _id: string; nombre: string; apellidos: string };
  estado: string;
  escuelaId: string | { _id: string; nombre: string };
  estudiantes?: any[];
  estudiantes_count?: number;
  asignaturas?: any[];
  asignaturas_count?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CursoInput {
  nombre: string;
  año_academico: string;
  grado: string;
  grupo: string;
  director_grupo: string;
  estado: string;
  escuelaId: string;
}

export interface EstudianteCurso {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
}

export interface AsignaturaCurso {
  _id: string;
  nombre: string;
  codigo: string;
  creditos: number;
  docente: {
    _id: string;
    nombre: string;
    apellidos: string;
  };
}

class CursoService {
  /**
   * Obtiene la lista de cursos con paginación y filtros
   */
  async obtenerCursos(params = {}) {
    const response = await axiosInstance.get('/cursos', { params });
    return response.data;
  }

  /**
   * Obtiene la información de un curso por su ID
   */
  async obtenerCurso(id: string) {
    const response = await axiosInstance.get(`/cursos/${id}`);
    return response.data;
  }

  /**
   * Crea un nuevo curso
   */
  async crearCurso(curso: CursoInput) {
    const response = await axiosInstance.post('/cursos', curso);
    return response.data;
  }

  /**
   * Actualiza la información de un curso
   */
  async actualizarCurso(id: string, curso: Partial<CursoInput>) {
    const response = await axiosInstance.put(`/cursos/${id}`, curso);
    return response.data;
  }

  /**
   * Elimina un curso
   */
  async eliminarCurso(id: string) {
    const response = await axiosInstance.delete(`/cursos/${id}`);
    return response.data;
  }

  /**
   * Obtiene los estudiantes asociados a un curso
   */
  async obtenerEstudiantesCurso(cursoId: string) {
    const response = await axiosInstance.get(`/cursos/${cursoId}/estudiantes`);
    return response.data;
  }

  /**
   * Añade un estudiante a un curso
   */
  async añadirEstudianteCurso(cursoId: string, estudianteId: string) {
    const response = await axiosInstance.post(`/cursos/${cursoId}/estudiantes`, {
      estudianteId,
    });
    return response.data;
  }

  /**
   * Elimina un estudiante de un curso
   */
  async eliminarEstudianteCurso(cursoId: string, estudianteId: string) {
    const response = await axiosInstance.delete(`/cursos/${cursoId}/estudiantes/${estudianteId}`);
    return response.data;
  }

  /**
   * Obtiene las asignaturas asociadas a un curso
   */
  async obtenerAsignaturasCurso(cursoId: string) {
    const response = await axiosInstance.get(`/cursos/${cursoId}/asignaturas`);
    return response.data;
  }

  /**
   * Añade una asignatura a un curso
   */
  async añadirAsignaturaCurso(cursoId: string, asignaturaData: any) {
    const response = await axiosInstance.post(`/cursos/${cursoId}/asignaturas`, asignaturaData);
    return response.data;
  }

  /**
   * Elimina una asignatura de un curso
   */
  async eliminarAsignaturaCurso(cursoId: string, asignaturaId: string) {
    const response = await axiosInstance.delete(`/cursos/${cursoId}/asignaturas/${asignaturaId}`);
    return response.data;
  }
}

export default new CursoService();