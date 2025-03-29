// src/services/systemService.ts
import axiosInstance from '../api/axiosConfig';

export interface SystemStatus {
  initialized: boolean;
  hasSchools: boolean;
  hasAdmins: boolean;
}

/**
 * Verifica si el sistema está inicializado
 * Un sistema se considera inicializado si tiene al menos una escuela y un usuario administrador
 */
export const checkSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const response = await axiosInstance.get('/system/status');
    return response.data.data;
  } catch (error) {
    console.error('Error verificando el estado del sistema:', error);
    
    // En caso de error, asumir que el sistema no está inicializado
    return {
      initialized: false,
      hasSchools: false,
      hasAdmins: false
    };
  }
};

/**
 * Inicializa el sistema con la primera escuela y el primer administrador
 * Interfaz actualizada para coincidir con el modelo real de Escuela
 */
export const initializeSystem = async (data: {
  escuela: {
    nombre: string;
    codigo: string; // Añadido nuevamente el campo codigo
    direccion: string;
    telefono: string;
    email: string;
    configuracion: {
      periodos_academicos: number;
      escala_calificacion: {
        minima: number;
        maxima: number;
      };
    };
  };
  admin: {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
  };
}): Promise<boolean> => {
  try {
    console.log('Enviando solicitud de inicialización del sistema:', data);
    
    // Limpiar y validar datos antes de enviar
    const cleanData = {
      escuela: {
        ...data.escuela,
        configuracion: {
          periodos_academicos: Number(data.escuela.configuracion.periodos_academicos) || 4,
          escala_calificacion: {
            minima: Number(data.escuela.configuracion.escala_calificacion.minima) || 0,
            maxima: Number(data.escuela.configuracion.escala_calificacion.maxima) || 5
          }
        }
      },
      admin: {
        ...data.admin
      }
    };
    
    const response = await axiosInstance.post('/system/initialize', cleanData);
    console.log('Respuesta de inicialización:', response.data);
    return true;
  } catch (error) {
    console.error('Error inicializando el sistema:', error);
    
    // Extraer información detallada del error para debugging
    if (error && typeof error === 'object' && 'response' in error && error.response && 
        typeof error.response === 'object' && 'status' in error.response && 'data' in error.response) {
      // El servidor respondió con un código de error
      console.error('Respuesta de error del servidor:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error && typeof error === 'object' && 'request' in error) {
      // No se recibió respuesta del servidor
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Error en la configuración de la solicitud
      console.error('Error en la solicitud:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    throw error;
  }
};