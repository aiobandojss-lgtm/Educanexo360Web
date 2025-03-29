// src/services/calendarioService.ts
import axiosInstance from '../api/axiosConfig';
import API_ROUTES from '../constants/apiRoutes';

// Interfaces para tipado
export interface IEvento {
  _id: string;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  todoElDia: boolean;
  lugar?: string;
  tipo: 'ACADEMICO' | 'INSTITUCIONAL' | 'CULTURAL' | 'DEPORTIVO' | 'OTRO';
  estado: 'PENDIENTE' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO';
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
   * Obtiene eventos del calendario con filtros opcionales
   */
  async obtenerEventos(filtros?: {
    inicio?: string;
    fin?: string;
    cursoId?: string;
    tipo?: string;
    estado?: string;
  }): Promise<IEvento[]> {
    try {
      const response = await axiosInstance.get(API_ROUTES.CALENDARIO.BASE, { params: filtros });
      return response.data.data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        throw new Error('No tienes permisos para ver los eventos del calendario');
      }
      
      if (error.response && error.response.status === 401) {
        throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente');
      }
      
      throw error;
    }
  }

  /**
   * Obtiene un evento específico por su ID
   */
  async obtenerEventoPorId(id: string): Promise<IEvento> {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.CALENDARIO.BASE}/${id}`);
      return response.data.data;
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new Error('El evento solicitado no existe o ha sido eliminado');
      }
      
      throw error;
    }
  }

  /**
   * Crea un nuevo evento en el calendario
   * SOLUCIÓN USANDO JSON EN LUGAR DE FORMDATA
   */
  async crearEvento(eventoData: any, archivo?: File): Promise<IEvento> {
    try {
      // CAMBIO CLAVE: Usar JSON en lugar de FormData
      // Esto significa que temporalmente no podemos manejar archivos adjuntos
      
      // Crear un objeto JSON simple con los datos
      const datosEvento = {
        titulo: String(eventoData.titulo || '').trim(),
        descripcion: String(eventoData.descripcion || '').trim(),
        fechaInicio: String(eventoData.fechaInicio || ''),
        fechaFin: String(eventoData.fechaFin || ''),
        tipo: String(eventoData.tipo || 'ACADEMICO'),
        todoElDia: Boolean(eventoData.todoElDia),
        lugar: String(eventoData.lugar || '').trim(),
        estado: eventoData.estado || 'PENDIENTE',
        color: eventoData.color || '#3788d8'
      };
      
      console.log('Enviando datos como JSON:', JSON.stringify(datosEvento, null, 2));
      
      // Enviar como JSON
      const response = await axiosInstance.post(
        API_ROUTES.CALENDARIO.BASE,
        datosEvento,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Si hay archivo y la creación inicial fue exitosa, podríamos
      // implementar una segunda llamada para adjuntar el archivo
      // (esto dependerá de si el backend lo soporta)
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear evento:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  }

  /**
   * Actualiza un evento existente
   */
  async actualizarEvento(id: string, eventoData: any, archivo?: File): Promise<IEvento> {
    try {
      // CAMBIO CLAVE: Usar JSON en lugar de FormData
      const datosEvento = {
        titulo: String(eventoData.titulo || '').trim(),
        descripcion: String(eventoData.descripcion || '').trim(),
        fechaInicio: String(eventoData.fechaInicio || ''),
        fechaFin: String(eventoData.fechaFin || ''),
        tipo: String(eventoData.tipo || 'ACADEMICO'),
        todoElDia: Boolean(eventoData.todoElDia),
        lugar: String(eventoData.lugar || '').trim(),
        estado: eventoData.estado || 'PENDIENTE',
        color: eventoData.color || '#3788d8'
      };
      
      // Enviar como JSON
      const response = await axiosInstance.put(
        `${API_ROUTES.CALENDARIO.BASE}/${id}`,
        datosEvento,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar evento:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  }

  /**
   * Elimina (cancela) un evento
   */
  async eliminarEvento(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`${API_ROUTES.CALENDARIO.BASE}/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.status === 403) {
        throw new Error('No tienes permisos para eliminar este evento');
      }
      
      if (error.response && error.response.status === 404) {
        throw new Error('El evento que intentas eliminar no existe o ya ha sido eliminado');
      }
      
      throw error;
    }
  }

  /**
   * Confirma asistencia a un evento
   */
  async confirmarAsistencia(id: string, confirmado: boolean): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.post(`${API_ROUTES.CALENDARIO.CONFIRMAR_ASISTENCIA(id)}`, { confirmado });
      return response.data;
    } catch (error) {
      console.error('Error al confirmar asistencia:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL para descargar un adjunto
   */
  getAdjuntoUrl(id: string): string {
    return `${axiosInstance.defaults.baseURL}${API_ROUTES.CALENDARIO.GET_ATTACHMENT(id)}`;
  }


/**
 * Cambia el estado de un evento (PENDIENTE, ACTIVO, FINALIZADO, CANCELADO)
 * @param id ID del evento
 * @param estado Nuevo estado del evento
 * @returns Evento actualizado
 */
async cambiarEstadoEvento(id: string, estado: 'PENDIENTE' | 'ACTIVO' | 'FINALIZADO' | 'CANCELADO'): Promise<IEvento> {
  try {
    const response = await axiosInstance.patch(
      `${API_ROUTES.CALENDARIO.BASE}/${id}/estado`,
      { estado },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error al cambiar el estado del evento:', error);
    
    if (error.response && error.response.status === 403) {
      throw new Error('No tienes permisos para cambiar el estado de este evento');
    }
    
    if (error.response && error.response.status === 404) {
      throw new Error('El evento no existe o ha sido eliminado');
    }
    
    if (error.response && error.response.data && error.response.data.message) {
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
      estado: 'ACTIVO'
    });
  }
}

export default new CalendarioService();