// src/services/dashboardService.ts
import axiosConfig from "../api/axiosConfig";
import escuelaService, { Escuela } from "./escuelaService";

export interface DashboardStats {
  mensajesSinLeer: number;
  eventosProximos: number;
  anunciosRecientes: number;
}

class DashboardService {
  // Obtener estadísticas del dashboard
  async obtenerEstadisticas(): Promise<DashboardStats> {
    try {
      const response = await axiosConfig.get("/api/dashboard/estadisticas");
      return response.data.data;
    } catch (error) {
      console.error("Error obteniendo estadísticas del dashboard:", error);
      // Retornamos datos por defecto si hay error
      return {
        mensajesSinLeer: 0,
        eventosProximos: 0,
        anunciosRecientes: 0,
      };
    }
  }

  // Obtener información de la escuela (reutiliza escuelaService)
  async obtenerEscuela(escuelaId: string): Promise<Escuela | null> {
    return await escuelaService.obtenerPorId(escuelaId);
  }

  // Obtener mensajes sin leer
  async obtenerMensajesSinLeer(): Promise<number> {
    try {
      const response = await axiosConfig.get("/api/mensajes?leido=false");
      return response.data.data?.length || 0;
    } catch (error) {
      console.error("Error obteniendo mensajes sin leer:", error);
      return 0;
    }
  }

  // Obtener eventos próximos
  async obtenerEventosProximos(): Promise<number> {
    try {
      const fechaActual = new Date().toISOString();
      const response = await axiosConfig.get(
        `/api/calendario?fechaInicio_gte=${fechaActual}&limit=10`
      );
      return response.data.data?.length || 0;
    } catch (error) {
      console.error("Error obteniendo eventos próximos:", error);
      return 0;
    }
  }

  // Obtener anuncios recientes
  async obtenerAnunciosRecientes(): Promise<number> {
    try {
      const response = await axiosConfig.get(
        "/api/anuncios?estado=PUBLICADO&limit=10"
      );
      return response.data.data?.length || 0;
    } catch (error) {
      console.error("Error obteniendo anuncios recientes:", error);
      return 0;
    }
  }

  // Obtener resumen completo del dashboard
  async obtenerResumenCompleto(): Promise<{
    estadisticas: DashboardStats;
    escuela: Escuela | null;
  }> {
    try {
      const [estadisticas] = await Promise.all([this.obtenerEstadisticas()]);

      return {
        estadisticas,
        escuela: null, // Se cargará por separado con el escuelaId del usuario
      };
    } catch (error) {
      console.error("Error obteniendo resumen completo:", error);
      return {
        estadisticas: {
          mensajesSinLeer: 0,
          eventosProximos: 0,
          anunciosRecientes: 0,
        },
        escuela: null,
      };
    }
  }
}

export default new DashboardService();
