// src/services/asignaturaService.ts
import axiosInstance from "../api/axiosConfig";

// Función para normalizar una asignatura
const normalizarAsignatura = (asignatura: any) => {
  // Si la asignatura tiene docenteId pero no tiene docente
  if (asignatura.docenteId && !asignatura.docente) {
    asignatura.docente = asignatura.docenteId;
  }

  // Si la asignatura tiene docente pero es una cadena (ID)
  if (asignatura.docente && typeof asignatura.docente === "string") {
    asignatura.docenteId = asignatura.docente;
    // No sobrescribir docente, se necesita para la representación
  }

  return asignatura;
};

const asignaturaService = {
  obtenerAsignaturas: async (params: any = {}) => {
    try {
      const response = await axiosInstance.get("/asignaturas", { params });

      if (response.data?.success) {
        const asignaturas = response.data.data.map(normalizarAsignatura);
        return { success: true, data: asignaturas };
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener asignaturas:", error);
      throw error;
    }
  },

  obtenerAsignatura: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/asignaturas/${id}`);

      if (response.data?.success) {
        const asignatura = normalizarAsignatura(response.data.data);
        return { success: true, data: asignatura };
      }

      return response.data;
    } catch (error) {
      console.error(`Error al obtener asignatura ${id}:`, error);
      throw error;
    }
  },

  crearAsignatura: async (datos: any) => {
    try {
      const response = await axiosInstance.post("/asignaturas", datos);
      return response.data;
    } catch (error) {
      console.error("Error al crear asignatura:", error);
      throw error;
    }
  },

  actualizarAsignatura: async (id: string, datos: any) => {
    try {
      const response = await axiosInstance.put(`/asignaturas/${id}`, datos);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar asignatura ${id}:`, error);
      throw error;
    }
  },

  eliminarAsignatura: async (id: string) => {
    try {
      const response = await axiosInstance.delete(`/asignaturas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar asignatura ${id}:`, error);
      throw error;
    }
  },
};

export default asignaturaService;
