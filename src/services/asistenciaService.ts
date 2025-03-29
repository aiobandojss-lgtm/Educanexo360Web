// src/services/asistenciaService.ts
import axiosInstance from '../api/axiosConfig';
import { format } from 'date-fns';

// Constantes para los tipos de asistencia
export const ESTADOS_ASISTENCIA = {
  PRESENTE: 'PRESENTE',
  AUSENTE: 'AUSENTE',
  TARDANZA: 'TARDANZA', // Aquí estamos unificando con TARDE que aparece en algunos componentes
  JUSTIFICADO: 'JUSTIFICADO',
  PERMISO: 'PERMISO'
};

export const TIPOS_SESION = {
  CLASE: 'CLASE',
  ACTIVIDAD: 'ACTIVIDAD',
  EVENTO: 'EVENTO',
  OTRO: 'OTRO'
};

// Interfaces
export interface EstudianteAsistencia {
  estudianteId: string;
  nombre?: string;
  apellidos?: string;
  estado: string;
  justificacion?: string;
  observaciones?: string;
}

export interface RegistroAsistencia {
  _id?: string;
  fecha: string | Date;
  cursoId: string;
  cursoNombre?: string;
  asignaturaId?: string;
  asignaturaNombre?: string;
  docenteId?: string;
  docenteNombre?: string;
  periodoId?: string;
  tipoSesion: string;
  horaInicio: string;
  horaFin: string;
  estudiantes: EstudianteAsistencia[];
  observacionesGenerales?: string;
  finalizado?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Obtener registros de asistencia con filtros
export const obtenerRegistrosAsistencia = async (
  fechaInicio?: string,
  fechaFin?: string,
  cursoId?: string,
  asignaturaId?: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    let url = '/asistencia?';
    
    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;
    if (cursoId) url += `cursoId=${cursoId}&`;
    if (asignaturaId) url += `asignaturaId=${asignaturaId}&`;
    
    url += `page=${page}&limit=${limit}`;
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error al obtener registros de asistencia:', error);
    throw error;
  }
};

// Obtener un registro específico
export const obtenerRegistroAsistencia = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/asistencia/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener registro de asistencia:', error);
    throw error;
  }
};

// Crear un nuevo registro
export const crearRegistroAsistencia = async (registro: RegistroAsistencia) => {
  try {
    // Formatear fecha si es necesario
    if (registro.fecha instanceof Date) {
      registro.fecha = format(registro.fecha, 'yyyy-MM-dd');
    }
    
    const response = await axiosInstance.post('/asistencia', registro);
    return response.data.data;
  } catch (error) {
    console.error('Error al crear registro de asistencia:', error);
    throw error;
  }
};

// Actualizar registro
export const actualizarRegistroAsistencia = async (id: string, registro: Partial<RegistroAsistencia>) => {
  try {
    // Formatear fecha si es necesario
    if (registro.fecha instanceof Date) {
      registro.fecha = format(registro.fecha, 'yyyy-MM-dd');
    }
    
    const response = await axiosInstance.put(`/asistencia/${id}`, registro);
    return response.data.data;
  } catch (error) {
    console.error('Error al actualizar registro de asistencia:', error);
    throw error;
  }
};

// Finalizar registro
export const finalizarRegistroAsistencia = async (id: string) => {
  try {
    const response = await axiosInstance.patch(`/asistencia/${id}/finalizar`, {});
    return response.data.data;
  } catch (error) {
    console.error('Error al finalizar registro de asistencia:', error);
    throw error;
  }
};

// Eliminar registro
export const eliminarRegistroAsistencia = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/asistencia/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar registro de asistencia:', error);
    throw error;
  }
};

// Obtener estadísticas por curso
export const obtenerEstadisticasPorCurso = async (cursoId: string, fechaInicio?: string, fechaFin?: string) => {
  try {
    let url = `/asistencia/estadisticas/curso/${cursoId}?`;
    
    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}`;
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener estadísticas por curso:', error);
    throw error;
  }
};

// Obtener asistencia por día
export const obtenerAsistenciaPorDia = async (fecha: string, cursoId?: string) => {
  try {
    let url = `/asistencia/dia?fecha=${fecha}`;
    if (cursoId) url += `&cursoId=${cursoId}`;
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener asistencia por día:', error);
    throw error;
  }
};

// Obtener cursos disponibles
export const obtenerCursosDisponibles = async () => {
  try {
    const response = await axiosInstance.get('/cursos');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    throw error;
  }
};

// Obtener asignaturas por curso
export const obtenerAsignaturasPorCurso = async (cursoId: string) => {
  try {
    const response = await axiosInstance.get(`/asignaturas/curso/${cursoId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener asignaturas por curso:', error);
    throw error;
  }
};

// Obtener estudiantes por curso
export const obtenerEstudiantesPorCurso = async (cursoId: string) => {
  try {
    const response = await axiosInstance.get(`/cursos/${cursoId}/estudiantes`);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener estudiantes por curso:', error);
    throw error;
  }
};

// Resumen de asistencia para informes
export const obtenerResumenAsistencia = async (
  fechaInicio?: string,
  fechaFin?: string,
  cursoId?: string
) => {
  try {
    let url = '/asistencia/resumen?';
    
    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;
    if (cursoId) url += `cursoId=${cursoId}`;
    
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener resumen de asistencia:', error);
    throw error;
  }
};

export default {
  obtenerRegistrosAsistencia,
  obtenerRegistroAsistencia,
  crearRegistroAsistencia,
  actualizarRegistroAsistencia,
  finalizarRegistroAsistencia,
  eliminarRegistroAsistencia,
  obtenerEstadisticasPorCurso,
  obtenerAsistenciaPorDia,
  obtenerCursosDisponibles,
  obtenerAsignaturasPorCurso,
  obtenerEstudiantesPorCurso,
  obtenerResumenAsistencia,
  ESTADOS_ASISTENCIA,
  TIPOS_SESION
};