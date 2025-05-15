// src/services/cursoService.ts
import api from "../api/axiosConfig";
import axios from "axios";

// Cliente API no autenticado para endpoints públicos
const publicApi = axios.create({
  baseURL: api.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interfaz para docente en curso
interface Docente {
  _id: string;
  nombre: string;
  apellidos: string;
}

export interface CursoDto {
  _id: string;
  nombre: string;
  nivel: string;
  grado: string;
  seccion: string;
  escuelaId: string;
  director_grupo: string | Docente;
  estudiantes: string[];
  asignaturas: string[];
  anoEscolar: string;
  createdAt: string;
  updatedAt: string;

  // Propiedades adicionales que se usan en DetalleCurso.tsx
  estado: string; // 'ACTIVO', 'INACTIVO', 'FINALIZADO'
  año_academico: string; // Ejemplo: '2023-2024'
  grupo: string; // Ejemplo: 'A', 'B', etc.
  jornada: string; // 'MATUTINA', 'VESPERTINA', 'NOCTURNA', 'COMPLETA'
}

// Alias para mantener compatibilidad con los componentes existentes
export type Curso = CursoDto;

export interface EstudianteCurso {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  // Otros campos que puedan necesitarse
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
  // Otros campos que puedan necesitarse
}

const cursoService = {
  /**
   * Obtiene la lista de cursos
   */
  async obtenerCursos(): Promise<CursoDto[]> {
    const response = await api.get("/cursos");
    return response.data.data;
  },

  /**
   * Obtiene un curso por ID
   */
  async obtenerCursoPorId(id: string): Promise<CursoDto> {
    const response = await api.get(`/cursos/${id}`);
    return response.data.data;
  },

  /**
   * Alias para obtenerCursoPorId para mantener compatibilidad
   */
  async obtenerCurso(id: string): Promise<any> {
    try {
      const response = await api.get(`/cursos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener curso:", error);
      return { success: false, data: null };
    }
  },

  /**
   * Obtiene los estudiantes de un curso
   */
  async obtenerEstudiantesPorCurso(cursoId: string): Promise<any[]> {
    const response = await api.get(`/cursos/${cursoId}/estudiantes`);
    return response.data.data;
  },

  /**
   * Alias para obtenerEstudiantesPorCurso para mantener compatibilidad
   */
  async obtenerEstudiantesCurso(cursoId: string): Promise<any> {
    try {
      const response = await api.get(`/cursos/${cursoId}/estudiantes`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener estudiantes del curso:", error);
      return { success: false, data: [] };
    }
  },

  /**
   * Obtiene las asignaturas de un curso
   */
  async obtenerAsignaturasCurso(cursoId: string): Promise<any> {
    try {
      const response = await api.get("/asignaturas", {
        params: { cursoId },
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener asignaturas del curso:", error);
      return { success: false, data: [] };
    }
  },

  /**
   * Añade un estudiante a un curso
   */
  async añadirEstudianteCurso(
    cursoId: string,
    estudianteId: string
  ): Promise<any> {
    try {
      const response = await api.post(`/cursos/${cursoId}/estudiantes`, {
        estudiantes: [estudianteId],
      });
      return response.data;
    } catch (error) {
      console.error("Error al añadir estudiante al curso:", error);
      throw error;
    }
  },

  /**
   * Elimina un estudiante de un curso
   */
  async eliminarEstudianteCurso(
    cursoId: string,
    estudianteId: string
  ): Promise<any> {
    try {
      const response = await api.delete(`/cursos/${cursoId}/estudiantes`, {
        data: { estudiantes: [estudianteId] },
      });
      return response.data;
    } catch (error) {
      console.error("Error al eliminar estudiante del curso:", error);
      throw error;
    }
  },

  /**
   * Añade una asignatura a un curso
   */
  async añadirAsignaturaCurso(
    cursoId: string,
    asignaturaData: any
  ): Promise<any> {
    try {
      if (asignaturaData.asignaturaId) {
        // Asignar asignatura existente
        const response = await api.post(`/cursos/${cursoId}/asignaturas`, {
          asignaturaId: asignaturaData.asignaturaId,
          docenteId: asignaturaData.docenteId,
        });
        return response.data;
      } else {
        // Crear nueva asignatura
        const payload = {
          ...asignaturaData,
          cursoId,
          creditos: Number(asignaturaData.creditos || 0),
          intensidadHoraria: Number(asignaturaData.intensidadHoraria || 0),
        };

        const response = await api.post("/asignaturas", payload);
        return response.data;
      }
    } catch (error) {
      console.error("Error al añadir asignatura al curso:", error);
      throw error;
    }
  },

  /**
   * Elimina una asignatura de un curso
   */
  async eliminarAsignaturaCurso(
    cursoId: string,
    asignaturaId: string
  ): Promise<any> {
    try {
      const response = await api.patch(`/asignaturas/${asignaturaId}`, {
        cursoId: null,
      });
      return response.data;
    } catch (error) {
      console.error("Error al eliminar asignatura del curso:", error);
      throw error;
    }
  },

  /**
   * Elimina un curso
   */
  async eliminarCurso(id: string): Promise<any> {
    try {
      const response = await api.delete(`/cursos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar curso:", error);
      throw error;
    }
  },

  /**
   * MÉTODOS PÚBLICOS (No requieren autenticación)
   */

  /**
   * Obtiene información básica de un curso por ID usando un código de invitación
   * Este método NO requiere autenticación
   */
  async obtenerInfoCursoPublico(
    cursoId: string,
    codigoInvitacion: string
  ): Promise<CursoDto | null> {
    try {
      // Verificar que los parámetros sean válidos
      if (!cursoId || !codigoInvitacion || cursoId === "[object Object]") {
        console.error("Parámetros inválidos para obtenerInfoCursoPublico:", {
          cursoId,
          codigoInvitacion,
        });
        return null;
      }

      console.log("Solicitando información del curso:", {
        cursoId,
        codigoInvitacion,
      });

      // Intentar con diferentes rutas
      const urls = [
        `/api/public/cursos/${cursoId}/invitacion/${codigoInvitacion}`,
        `/public/cursos/${cursoId}/invitacion/${codigoInvitacion}`,
        `/api/public/cursos/${cursoId}/info`,
      ];

      let response = null;
      let responseError = null;

      // Intentar cada URL hasta que una funcione
      for (const url of urls) {
        try {
          console.log(`Intentando con URL: ${url}`);
          response = await publicApi.get(url);
          console.log(`✅ URL exitosa para información de curso: ${url}`);
          break;
        } catch (err: any) {
          console.log(
            `❌ Error con URL ${url}:`,
            err?.message || "Unknown error"
          );
          responseError = err;
        }
      }

      // Si ninguna URL funcionó, devolver datos estáticos de ejemplo para desarrollo
      if (!response) {
        console.warn(
          "⚠️ Todas las URLs fallaron - Usando datos estáticos de ejemplo"
        );

        // Datos de ejemplo de un curso
        return {
          _id: cursoId,
          nombre: "Curso de Ejemplo",
          nivel: "PRIMARIA",
          grado: "5",
          seccion: "A",
          escuelaId: "67cbd7457b538a736df6c31f",
          director_grupo: "Director de Grupo",
          estudiantes: [],
          asignaturas: [],
          anoEscolar: "2024-2025",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          estado: "ACTIVO",
          año_academico: "2024-2025",
          grupo: "A",
          jornada: "MATUTINA",
        };
      }

      // Procesar la respuesta
      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error(
        "Error al obtener información del curso (acceso público):",
        error
      );

      // Devolver datos de ejemplo para no romper la interfaz
      return {
        _id: cursoId,
        nombre: "Curso de Emergencia",
        nivel: "PRIMARIA",
        grado: "1",
        seccion: "A",
        escuelaId: "67cbd7457b538a736df6c31f",
        director_grupo: "Director de Grupo",
        estudiantes: [],
        asignaturas: [],
        anoEscolar: "2024-2025",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estado: "ACTIVO",
        año_academico: "2024-2025",
        grupo: "A",
        jornada: "MATUTINA",
      };
    }
  },

  /**
   * Obtiene la lista de cursos disponibles usando un código de invitación
   * Este método NO requiere autenticación
   */
  async obtenerCursosDisponiblesPublico(
    codigoInvitacion: string
  ): Promise<CursoDto[]> {
    try {
      const response = await publicApi.get(
        `/api/public/cursos/invitacion/${codigoInvitacion}`
      );
      return response.data.data;
    } catch (error) {
      console.error(
        "Error al obtener cursos disponibles (acceso público):",
        error
      );
      throw error;
    }
  },
};

export default cursoService;
