// src/types/tarea.types.ts

/**
 * Tipos y enums para el módulo de tareas
 */

export type TipoTarea = 'INDIVIDUAL' | 'GRUPAL';
export type PrioridadTarea = 'ALTA' | 'MEDIA' | 'BAJA';
export type EstadoTarea = 'ACTIVA' | 'CERRADA' | 'CANCELADA';
export type EstadoEntrega = 'PENDIENTE' | 'VISTA' | 'ENTREGADA' | 'ATRASADA' | 'CALIFICADA';

/**
 * Interface para archivos adjuntos (referencia y entregas)
 */
export interface ArchivoTarea {
  fileId: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  fechaSubida: string;
}

/**
 * Interface para tracking de vistas
 */
export interface VistaTarea {
  estudianteId: string;
  fechaVista: string;
}

/**
 * Interface para entregas de tareas
 */
export interface EntregaTarea {
  _id?: string;
  estudianteId: string | {
    _id: string;
    nombre: string;
    apellidos: string;
    email: string;
  };
  fechaEntrega?: string;
  estado: EstadoEntrega;
  archivos: ArchivoTarea[];
  comentarioEstudiante?: string;
  calificacion?: number;
  comentarioDocente?: string;
  fechaCalificacion?: string;
  intentos: number;
}

/**
 * Interface principal para Tarea
 */
export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  docenteId: string | {
    _id: string;
    nombre: string;
    apellidos: string;
    email: string;
  };
  asignaturaId: string | {
    _id: string;
    nombre: string;
  };
  cursoId: string | {
    _id: string;
    nombre: string;
    nivel: string;
  };
  estudiantesIds: string[];
  fechaAsignacion: string;
  fechaLimite: string;
  tipo: TipoTarea;
  prioridad: PrioridadTarea;
  permiteTardias: boolean;
  calificacionMaxima: number;
  pesoEvaluacion?: number;
  archivosReferencia: ArchivoTarea[];
  vistas: VistaTarea[];
  entregas: EntregaTarea[];
  estado: EstadoTarea;
  escuelaId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para crear/actualizar tarea
 */
export interface TareaInput {
  titulo: string;
  descripcion: string;
  asignaturaId: string;
  cursoId: string;
  estudiantesIds?: string[];
  fechaLimite: Date | string;
  tipo?: TipoTarea;
  prioridad?: PrioridadTarea;
  permiteTardias?: boolean;
  calificacionMaxima: number;
  pesoEvaluacion?: number;
}

/**
 * Interface para entregar tarea
 */
export interface EntregarTareaInput {
  comentarioEstudiante?: string;
}

/**
 * Interface para calificar entrega
 */
export interface CalificarEntregaInput {
  calificacion: number;
  comentarioDocente?: string;
}

/**
 * Interface para filtros de listado
 */
export interface TareaFilters {
  pagina?: number;
  limite?: number;
  estado?: EstadoTarea;
  prioridad?: PrioridadTarea;
  cursoId?: string;
  asignaturaId?: string;
  docenteId?: string;
  busqueda?: string;
  filtro?: 'pendientes' | 'entregadas' | 'calificadas';
}

/**
 * Interface para estadísticas
 */
export interface EstadisticasTarea {
  totalEstudiantes: number;
  entregadas: number;
  pendientes: number;
  atrasadas: number;
  calificadas: number;
  promedioCalificacion?: number;
  porcentajeEntrega: number;
}

/**
 * Interface para respuesta de API con metadata
 */
export interface TareaResponse {
  success: boolean;
  data: Tarea | Tarea[];
  meta?: {
    total: number;
    pagina: number;
    limite: number;
    paginas: number;
  };
  message?: string;
}

/**
 * Colores para badges de estado
 */
export const COLORES_ESTADO: Record<EstadoEntrega, string> = {
  PENDIENTE: '#9e9e9e',
  VISTA: '#2196f3',
  ENTREGADA: '#4caf50',
  ATRASADA: '#f44336',
  CALIFICADA: '#1b5e20',
};

/**
 * Colores para badges de prioridad
 */
export const COLORES_PRIORIDAD: Record<PrioridadTarea, string> = {
  ALTA: '#f44336',
  MEDIA: '#ff9800',
  BAJA: '#4caf50',
};

/**
 * Labels en español para estados
 */
export const LABELS_ESTADO: Record<EstadoEntrega, string> = {
  PENDIENTE: 'Pendiente',
  VISTA: 'Vista',
  ENTREGADA: 'Entregada',
  ATRASADA: 'Atrasada',
  CALIFICADA: 'Calificada',
};

/**
 * Labels en español para prioridades
 */
export const LABELS_PRIORIDAD: Record<PrioridadTarea, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};