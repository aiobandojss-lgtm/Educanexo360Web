// src/services/registroService.ts
import axios from "axios";
import api from "../api/axiosConfig";
import API_ROUTES from "../constants/apiRoutes";

// Interfaces para el módulo de registro
export interface EstudianteSolicitud {
  nombre: string;
  apellidos: string;
  fechaNacimiento?: string;
  cursoId: string;
  codigo_estudiante?: string;
  email?: string;
}

export interface SolicitudRegistro {
  _id: string;
  invitacionId: string;
  escuelaId: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  estudiantes: EstudianteSolicitud[];
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  fechaSolicitud: string;
  fechaRevision?: string;
  revisadoPor?: string;
  comentarios?: string;
  usuariosCreados?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CrearSolicitudDto {
  invitacionId: string;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  estudiantes: EstudianteSolicitud[];
}

// Alias para mantener compatibilidad con las importaciones existentes
export type SolicitudRegistroInput = CrearSolicitudDto;

interface PaginatedResponse<T> {
  total: number;
  pagina: number;
  limite: number;
  solicitudes: T[];
}

// Cliente API no autenticado para endpoints públicos
const publicApi = axios.create({
  baseURL: api.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const registroService = {
  /**
   * Crea una nueva solicitud de registro (endpoint público)
   */
  async crearSolicitud(data: CrearSolicitudDto): Promise<SolicitudRegistro> {
    try {
      console.log("Enviando solicitud de registro:", JSON.stringify(data));

      // Usar el cliente público para llamadas sin autenticación
      const response = await publicApi.post(
        "/api/public/registro/solicitudes",
        data
      );

      console.log("Respuesta de creación de solicitud:", response.data);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: unknown) {
      console.error("Error al crear solicitud de registro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Detalles del error:", error.message);
      }
      throw error;
    }
  },

  /**
   * Obtiene solicitudes pendientes
   */
  async obtenerSolicitudesPendientes(
    pagina: number = 1,
    limite: number = 10
  ): Promise<PaginatedResponse<SolicitudRegistro>> {
    try {
      console.log("Solicitando solicitudes con estado PENDIENTE");
      console.log(`Parámetros: pagina=${pagina}, limite=${limite}`);

      // Usamos la ruta correcta basada en cómo está configurado el backend
      const response = await api.get("/api/registro/solicitudes", {
        params: {
          pagina,
          limite,
          estado: "PENDIENTE",
        },
      });

      console.log("Respuesta de solicitudes pendientes:", response.data);

      // Manejar diferentes estructuras de respuesta
      if (response.data && response.data.data) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }

      // Proporcionar una estructura vacía pero válida para evitar errores
      return {
        total: 0,
        pagina,
        limite,
        solicitudes: [],
      };
    } catch (error: unknown) {
      console.error("Error al obtener solicitudes pendientes:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Detalles del error:", error.message);
      }

      // Proporcionar una estructura vacía pero válida para evitar errores
      return {
        total: 0,
        pagina,
        limite,
        solicitudes: [],
      };
    }
  },

  /**
   * Obtiene el historial de solicitudes
   */
  async obtenerHistorialSolicitudes(
    estado?: "PENDIENTE" | "APROBADA" | "RECHAZADA",
    pagina: number = 1,
    limite: number = 10
  ): Promise<PaginatedResponse<SolicitudRegistro>> {
    try {
      const params: any = { pagina, limite };
      if (estado) {
        params.estado = estado;
      }

      // Usamos la ruta correcta basada en cómo está configurado el backend
      const response = await api.get("/api/registro/solicitudes/historial", {
        params,
      });

      console.log("Respuesta de historial de solicitudes:", response.data);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error("Error al obtener historial de solicitudes:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Detalles del error:", error.message);
      }

      // Proporcionar una estructura vacía pero válida para evitar errores
      return {
        total: 0,
        pagina,
        limite,
        solicitudes: [],
      };
    }
  },

  /**
   * Obtiene una solicitud por su ID
   */
  async obtenerSolicitudPorId(id: string): Promise<SolicitudRegistro> {
    try {
      // Usamos la ruta correcta basada en cómo está configurado el backend
      const response = await api.get(`/api/registro/solicitudes/${id}`);

      console.log("Respuesta de solicitud por ID:", response.data);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: unknown) {
      console.error("Error al obtener solicitud de registro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Detalles del error:", error.message);
      }
      throw error;
    }
  },

  /**
   * Aprueba una solicitud de registro
   */
  async aprobarSolicitud(id: string): Promise<any> {
    try {
      // Usamos la ruta correcta basada en cómo está configurado el backend
      const response = await api.put(`/api/registro/solicitudes/${id}/aprobar`);

      console.log("Respuesta de aprobación:", response.data);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: unknown) {
      console.error("Error al aprobar solicitud de registro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Detalles del error:", error.message);
      }
      throw error;
    }
  },

  /**
   * Rechaza una solicitud de registro
   */
  async rechazarSolicitud(id: string, motivo: string): Promise<any> {
    try {
      // Usamos la ruta correcta basada en cómo está configurado el backend
      const response = await api.put(
        `/api/registro/solicitudes/${id}/rechazar`,
        {
          motivo,
        }
      );

      console.log("Respuesta de rechazo:", response.data);

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: unknown) {
      console.error("Error al rechazar solicitud de registro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", error.response?.data);
      } else if (error instanceof Error) {
        console.error("Detalles del error:", error.message);
      }
      throw error;
    }
  },
};

export default registroService;
