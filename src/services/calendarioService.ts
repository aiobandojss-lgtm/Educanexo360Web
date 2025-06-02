// src/services/calendarioService.ts
import axiosInstance from "../api/axiosConfig";
import API_ROUTES from "../constants/apiRoutes";
import { store } from "../redux/store";

// Interfaces para tipado
export interface IEvento {
  _id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  lugar?: string;
  tipo: "ACADEMICO" | "INSTITUCIONAL" | "CULTURAL" | "DEPORTIVO" | "OTRO";
  estado: "PENDIENTE" | "ACTIVO" | "FINALIZADO" | "CANCELADO";
  color?: string;
  creadorId: any;
  cursoId?: any;
  escuelaId: string;
  archivoAdjunto?: {
    fileId: string;
    nombre: string;
    tipo: string;
    tamaño: number;
  };
  invitados?: Array<{
    usuarioId: string;
    confirmado: boolean;
    fechaConfirmacion?: string;
  }>;
}

class CalendarioService {
  /**
   * 🚨 FUNCIÓN PRINCIPAL MODIFICADA - Obtiene eventos con filtrado automático por tipo de usuario
   */
  async obtenerEventos(filtros?: {
    inicio?: string;
    fin?: string;
    cursoId?: string;
    tipo?: string;
    estado?: string;
  }): Promise<IEvento[]> {
    try {
      // Verificar el tipo de usuario para aplicar restricciones de seguridad
      const state = store.getState();
      const userRole = state?.auth?.user?.tipo;

      console.log(
        "🔍 Obteniendo eventos - Usuario:",
        userRole,
        "Estado solicitado:",
        filtros?.estado
      );

      // 🚨 LÓGICA SIMPLIFICADA
      let filtrosAplicados = { ...filtros };

      if (
        userRole === "ESTUDIANTE" ||
        userRole === "PADRE" ||
        userRole === "ACUDIENTE"
      ) {
        // Estudiantes, padres y acudientes SOLO pueden ver eventos ACTIVOS
        filtrosAplicados.estado = "ACTIVO";
        console.log("✅ Usuario estudiante/padre/acudiente - Forzando ACTIVO");
      }
      // Admin/Docentes: enviar el estado tal como viene (ACTIVO, PENDIENTE, CANCELADO)

      console.log("🔍 Filtros aplicados finales:", filtrosAplicados);

      const response = await axiosInstance.get(API_ROUTES.CALENDARIO.BASE, {
        params: filtrosAplicados,
      });

      const eventos = response.data.data || [];
      console.log(`✅ Eventos obtenidos: ${eventos.length}`);

      // Log de estados para verificar filtrado
      if (eventos.length > 0) {
        const estadosSummary = eventos.reduce((acc: any, evento: IEvento) => {
          acc[evento.estado] = (acc[evento.estado] || 0) + 1;
          return acc;
        }, {});
        console.log("✅ Estados de eventos obtenidos:", estadosSummary);
      } else {
        console.log(
          "⚠️ No se obtuvieron eventos - Verificar filtros:",
          filtrosAplicados
        );
      }

      return eventos;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        throw new Error(
          "No tienes permisos para ver los eventos del calendario"
        );
      }

      if (error.response && error.response.status === 401) {
        throw new Error(
          "Tu sesión ha expirado. Por favor inicia sesión nuevamente"
        );
      }

      console.error("❌ Error al obtener eventos:", error);
      throw error;
    }
  }

  /**
   * Obtiene un evento específico por su ID
   */
  async obtenerEventoPorId(id: string): Promise<IEvento> {
    try {
      const response = await axiosInstance.get(
        `${API_ROUTES.CALENDARIO.BASE}/${id}`
      );
      return response.data.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error("El evento solicitado no existe o ha sido eliminado");
      }

      throw error;
    }
  }

  /**
   * Crea un nuevo evento en el calendario
   */
  async crearEvento(eventoData: any, archivo?: File): Promise<IEvento> {
    try {
      // Validar datos básicos
      if (!eventoData.titulo?.trim()) {
        throw new Error("El título del evento es obligatorio");
      }

      if (!eventoData.descripcion?.trim()) {
        throw new Error("La descripción del evento es obligatoria");
      }

      if (!eventoData.fechaInicio) {
        throw new Error("La fecha de inicio es obligatoria");
      }

      if (!eventoData.fechaFin) {
        throw new Error("La fecha de fin es obligatoria");
      }

      // Crear objeto limpio con los datos
      const datosEvento = {
        titulo: String(eventoData.titulo || "").trim(),
        descripcion: String(eventoData.descripcion || "").trim(),
        fechaInicio: String(eventoData.fechaInicio || ""),
        fechaFin: String(eventoData.fechaFin || ""),
        tipo: String(eventoData.tipo || "ACADEMICO"),
        todoElDia: Boolean(eventoData.todoElDia),
        lugar: String(eventoData.lugar || "").trim(),
        estado: eventoData.estado || "PENDIENTE",
        color: eventoData.color || "#3788d8",
      };

      console.log(
        "📅 Creando evento - Datos finales:",
        JSON.stringify(datosEvento, null, 2)
      );

      // Enviar como JSON
      const response = await axiosInstance.post(
        API_ROUTES.CALENDARIO.BASE,
        datosEvento,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Evento creado exitosamente:", response.data.data);

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error al crear evento:", error);

      // Manejo mejorado de errores
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error("Debes estar autenticado para crear eventos");
      } else if (error.response?.status === 403) {
        throw new Error("No tienes permisos para crear eventos");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Error desconocido al crear el evento");
      }
    }
  }

  /**
   * Actualiza un evento existente
   */
  async actualizarEvento(
    id: string,
    eventoData: any,
    archivo?: File
  ): Promise<IEvento> {
    try {
      // Validar ID
      if (!id) {
        throw new Error("ID del evento es requerido para actualizar");
      }

      // Crear objeto limpio con los datos
      const datosEvento = {
        titulo: String(eventoData.titulo || "").trim(),
        descripcion: String(eventoData.descripcion || "").trim(),
        fechaInicio: String(eventoData.fechaInicio || ""),
        fechaFin: String(eventoData.fechaFin || ""),
        tipo: String(eventoData.tipo || "ACADEMICO"),
        todoElDia: Boolean(eventoData.todoElDia),
        lugar: String(eventoData.lugar || "").trim(),
        estado: eventoData.estado || "PENDIENTE",
        color: eventoData.color || "#3788d8",
      };

      console.log(
        "📅 Actualizando evento - Datos finales:",
        JSON.stringify(datosEvento, null, 2)
      );

      // Enviar como JSON
      const response = await axiosInstance.put(
        `${API_ROUTES.CALENDARIO.BASE}/${id}`,
        datosEvento,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Evento actualizado exitosamente:", response.data.data);

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error al actualizar evento:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
        throw new Error("Debes estar autenticado para actualizar eventos");
      } else if (error.response?.status === 403) {
        throw new Error("No tienes permisos para actualizar este evento");
      } else if (error.response?.status === 404) {
        throw new Error("El evento que intentas actualizar no existe");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Error desconocido al actualizar el evento");
      }
    }
  }

  /**
   * 🚨 FUNCIÓN MODIFICADA - Elimina (cancela) un evento
   */
  async eliminarEvento(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validar ID
      if (!id) {
        throw new Error("ID del evento es requerido para eliminar");
      }

      console.log(`🗑️ Cancelando evento con ID: ${id}`);

      const response = await axiosInstance.delete(
        `${API_ROUTES.CALENDARIO.BASE}/${id}`
      );

      console.log("✅ Evento cancelado exitosamente:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("❌ Error al cancelar evento:", error);

      if (error.response && error.response.status === 403) {
        throw new Error("No tienes permisos para eliminar este evento");
      }

      if (error.response && error.response.status === 401) {
        throw new Error("Debes estar autenticado para eliminar eventos");
      }

      if (error.response && error.response.status === 404) {
        throw new Error(
          "El evento que intentas eliminar no existe o ya ha sido eliminado"
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error("Error desconocido al eliminar el evento");
    }
  }

  /**
   * Confirma asistencia a un evento
   */
  async confirmarAsistencia(
    id: string,
    confirmado: boolean
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(
        `${API_ROUTES.CALENDARIO.CONFIRMAR_ASISTENCIA(id)}`,
        { confirmado }
      );
      return response.data;
    } catch (error) {
      console.error("Error al confirmar asistencia:", error);
      throw error;
    }
  }

  /**
   * Obtiene la URL para descargar un adjunto
   */
  getAdjuntoUrl(id: string): string {
    return `${
      axiosInstance.defaults.baseURL
    }${API_ROUTES.CALENDARIO.GET_ATTACHMENT(id)}`;
  }

  /**
   * Cambia el estado de un evento (PENDIENTE, ACTIVO, FINALIZADO, CANCELADO)
   */
  async cambiarEstadoEvento(
    id: string,
    estado: "PENDIENTE" | "ACTIVO" | "FINALIZADO" | "CANCELADO"
  ): Promise<IEvento> {
    try {
      console.log(`🔄 Cambiando estado del evento ${id} a: ${estado}`);

      const response = await axiosInstance.patch(
        `${API_ROUTES.CALENDARIO.BASE}/${id}/estado`,
        { estado },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Estado cambiado exitosamente:", response.data.data);

      return response.data.data;
    } catch (error: any) {
      console.error("❌ Error al cambiar el estado del evento:", error);

      if (error.response && error.response.status === 403) {
        throw new Error(
          "No tienes permisos para cambiar el estado de este evento"
        );
      }

      if (error.response && error.response.status === 404) {
        throw new Error("El evento no existe o ha sido eliminado");
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }

  /**
   * Obtiene eventos para un mes específico
   */
  async obtenerEventosPorMes(año: number, mes: number): Promise<IEvento[]> {
    const inicio = new Date(año, mes - 1, 1);
    const fin = new Date(año, mes, 0);

    return this.obtenerEventos({
      inicio: inicio.toISOString(),
      fin: fin.toISOString(),
    });
  }

  /**
   * Función específica para obtener eventos activos (útil para estudiantes/padres)
   */
  async obtenerEventosActivos(
    inicio?: string,
    fin?: string,
    tipo?: string
  ): Promise<IEvento[]> {
    return this.obtenerEventos({
      inicio,
      fin,
      tipo,
      estado: "ACTIVO",
    });
  }

  /**
   * Función para aprobar eventos pendientes (solo para roles administrativos)
   */
  async aprobarEvento(id: string): Promise<IEvento> {
    try {
      return await this.cambiarEstadoEvento(id, "ACTIVO");
    } catch (error) {
      console.error("Error al aprobar evento:", error);
      throw error;
    }
  }

  /**
   * Función para rechazar eventos pendientes (solo para roles administrativos)
   */
  async rechazarEvento(id: string): Promise<IEvento> {
    try {
      return await this.cambiarEstadoEvento(id, "CANCELADO");
    } catch (error) {
      console.error("Error al rechazar evento:", error);
      throw error;
    }
  }
}

export default new CalendarioService();
