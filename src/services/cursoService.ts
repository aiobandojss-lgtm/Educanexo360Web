// src/services/cursoService.ts
import axiosInstance from '../api/axiosConfig';

// Interfaces para el tipo de curso
export interface Curso {
  _id: string;
  nombre: string;
  nivel: string;
  año_academico: string;
  grado: string;
  grupo: string;
  jornada: string; // Nuevo campo añadido
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
  nivel: string;
  año_academico: string;
  grado: string;
  grupo: string;
  jornada: string; // Nuevo campo añadido
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
    try {
      const response = await axiosInstance.get('/cursos', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener cursos:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Obtiene la información de un curso por su ID
   */
  async obtenerCurso(id: string) {
    try {
      const response = await axiosInstance.get(`/cursos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener curso:', error);
      return { success: false, data: null };
    }
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
    try {
      // Asegurarse de que el director_grupo sea un string (ID)
      if (curso.director_grupo && typeof curso.director_grupo === 'object') {
        // @ts-ignore - Permite acceder a _id aunque TypeScript no lo reconozca
        curso.director_grupo = curso.director_grupo._id || curso.director_grupo.toString();
      }
      
      // Log para depuración
      console.log('Datos enviados al backend:', {
        id,
        curso: JSON.stringify(curso)
      });

      const response = await axiosInstance.put(`/cursos/${id}`, curso);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      throw error;
    }
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
   * MODIFICADO: Ahora extrae los estudiantes del curso obtenido por ID
   */
  async obtenerEstudiantesCurso(cursoId: string) {
    try {
      // Obtener el curso completo que ya incluye los estudiantes
      const response = await axiosInstance.get(`/cursos/${cursoId}`);
      
      if (response.data?.success && response.data.data && Array.isArray(response.data.data.estudiantes)) {
        // Extraer solo los estudiantes del curso
        return {
          success: true,
          data: response.data.data.estudiantes || []
        };
      }
      
      // Probar con ruta alternativa: buscar usuarios estudiantes y filtrar por curso
      try {
        const usuariosResponse = await axiosInstance.get('/usuarios', {
          params: { 
            tipo: 'ESTUDIANTE',
            curso: cursoId 
          }
        });
        
        return usuariosResponse.data;
      } catch (err) {
        console.error('Error al buscar estudiantes por curso:', err);
      }
      
      return { success: false, data: [] };
    } catch (error) {
      console.error('Error al obtener estudiantes del curso:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Añade un estudiante a un curso
   * MODIFICADO: Usa la ruta correcta según el backend
   */
  async añadirEstudianteCurso(cursoId: string, estudianteId: string) {
    try {
      // La ruta espera un array de IDs de estudiantes
      const response = await axiosInstance.post(`/cursos/${cursoId}/estudiantes`, {
        estudiantes: [estudianteId],
      });
      return response.data;
    } catch (error) {
      console.error('Error al añadir estudiante al curso:', error);
      throw error;
    }
  }

  /**
   * Elimina un estudiante de un curso
   * MODIFICADO: Usa la ruta correcta según el backend
   */
  async eliminarEstudianteCurso(cursoId: string, estudianteId: string) {
    try {
      // La ruta espera un array de IDs de estudiantes
      const response = await axiosInstance.delete(`/cursos/${cursoId}/estudiantes`, {
        data: { estudiantes: [estudianteId] }
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar estudiante del curso:', error);
      throw error;
    }
  }

  /**
   * Obtiene las asignaturas asociadas a un curso
   * MODIFICADO: Ahora usa la ruta de asignaturas con filtro
   */
  async obtenerAsignaturasCurso(cursoId: string) {
    try {
      // No existe una ruta específica para obtener asignaturas de un curso
      // Probamos obteniendo todas las asignaturas y filtrando por cursoId
      const response = await axiosInstance.get('/asignaturas', {
        params: { cursoId }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener asignaturas del curso:', error);
      return { success: false, data: [] };
    }
  }

  /**
   * Añade una asignatura a un curso
   * MODIFICADO: Versión mejorada que maneja tanto asignaturas existentes como nuevas
   */
  async añadirAsignaturaCurso(cursoId: string, asignaturaData: any) {
    try {
      console.log('Datos recibidos en añadirAsignaturaCurso:', asignaturaData);
      
      if (asignaturaData.asignaturaId) {
        // Caso 1: Asignar una asignatura existente a un curso
        console.log('Asignando asignatura existente al curso');
        
        // Intentamos con la ruta específica para asignar asignaturas a cursos
        try {
          const response = await axiosInstance.post(`/cursos/${cursoId}/asignaturas`, {
            asignaturaId: asignaturaData.asignaturaId,
            docenteId: asignaturaData.docenteId
          });
          return response.data;
        } catch (err) {
          console.error('Error usando ruta específica, intentando actualizar asignatura:', err);
          
          // Si falla, intentamos actualizar la asignatura directamente
          const response = await axiosInstance.put(`/asignaturas/${asignaturaData.asignaturaId}`, {
            cursoId: cursoId,
            docenteId: asignaturaData.docenteId
          });
          return response.data;
        }
      } else {
        // Caso 2: Crear una nueva asignatura para el curso
        console.log('Creando nueva asignatura para el curso');
        
        // Asegurarse de que los valores numéricos sean números
        const payload = {
          ...asignaturaData,
          cursoId,
          creditos: Number(asignaturaData.creditos || 0),
          intensidadHoraria: Number(asignaturaData.intensidadHoraria || 0)
        };
        
        const response = await axiosInstance.post('/asignaturas', payload);
        return response.data;
      }
    } catch (error) {
      console.error('Error al añadir asignatura al curso:', error);
      throw error;
    }
  }

  /**
   * Elimina una asignatura de un curso
   * MODIFICADO: Usa la ruta correcta según el backend
   */
  async eliminarAsignaturaCurso(cursoId: string, asignaturaId: string) {
    try {
      // Es probable que se pueda actualizar la asignatura para quitarle el curso
      const response = await axiosInstance.patch(`/asignaturas/${asignaturaId}`, {
        cursoId: null
      });
      return response.data;
    } catch (error) {
      console.error('Error al eliminar asignatura del curso:', error);
      throw error;
    }
  }
}

export default new CursoService();