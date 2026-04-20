// src/services/asistenciaInformesService.ts
import axiosInstance from '../api/axiosConfig';

// ─── Interfaces de respuesta ────────────────────────────────────────────────

export interface EstudianteRiesgo {
  estudianteId: string;
  nombre: string;
  apellidos: string;
  curso: { _id: string; nombre: string; grado: string; grupo: string };
  clasesTotales: number;
  ausencias: number;
  tardanzas: number;
  porcentajeAsistencia: number;
  nivelRiesgo: 'CRITICO' | 'ALERTA';
}

export interface RespuestaRiesgo {
  ok: boolean;
  umbral: number;
  total: number;
  criticos: number;
  alertas: number;
  estudiantes: EstudianteRiesgo[];
}

export interface PuntoTendencia {
  periodo: string;
  fechaInicio: string;
  totalClases: number;
  totalEstudiantes: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  porcentajeAsistencia: number;
}

export interface RespuestaTendencia {
  ok: boolean;
  agrupacion: string;
  puntos: number;
  tendencia: PuntoTendencia[];
}

export interface FilaCursoRanking {
  posicion: number;
  cursoId: string;
  nombre: string;
  grado: string;
  grupo: string;
  totalClases: number;
  totalEstudiantes: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  porcentajeAsistencia: number;
}

export interface RespuestaRankingCursos {
  ok: boolean;
  total: number;
  ranking: FilaCursoRanking[];
}

export interface PatronDia {
  diaSemana: number;
  nombreDia: string;
  totalClases: number;
  totalEstudiantes: number;
  ausencias: number;
  tardanzas: number;
  porcentajeAusentismo: number;
}

export interface RespuestaPatronDias {
  ok: boolean;
  dias: PatronDia[];
}

export interface RegistroHistorial {
  fecha: string;
  diaSemana: string;
  curso: { _id: string; nombre: string; grado: string; grupo: string };
  asignatura: { _id: string; nombre: string } | null;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO' | 'PERMISO';
  justificacion: string;
  observaciones: string;
  registradoPor: { _id: string; nombre: string; apellidos: string };
}

export interface RespuestaHistorial {
  ok: boolean;
  estudiante: { _id: string; nombre: string; apellidos: string; email: string };
  resumen: {
    clasesTotales: number;
    presentes: number;
    ausentes: number;
    tardanzas: number;
    justificados: number;
    permisos: number;
    porcentajeAsistencia: number;
  };
  registros: RegistroHistorial[];
}

// ─── Parámetros de consulta ──────────────────────────────────────────────────

export interface ParamsRiesgo {
  umbral?: number;
  cursoId?: string;
  desde?: string;
  hasta?: string;
}

export interface ParamsTendencia {
  desde: string;
  hasta: string;
  agrupacion?: 'semana' | 'mes';
  cursoId?: string;
}

export interface ParamsRanking {
  desde: string;
  hasta: string;
}

export interface ParamsPatronDias {
  desde: string;
  hasta: string;
  cursoId?: string;
}

export interface ParamsHistorial {
  desde: string;
  hasta: string;
}

// ─── Funciones fetch ─────────────────────────────────────────────────────────

export const getInformeRiesgo = async (params: ParamsRiesgo): Promise<RespuestaRiesgo> => {
  const response = await axiosInstance.get('/asistencia/informes/riesgo', { params });
  return response.data;
};

export const getInformeTendencia = async (params: ParamsTendencia): Promise<RespuestaTendencia> => {
  const response = await axiosInstance.get('/asistencia/informes/tendencia', { params });
  return response.data;
};

export const getInformeRankingCursos = async (params: ParamsRanking): Promise<RespuestaRankingCursos> => {
  const response = await axiosInstance.get('/asistencia/informes/ranking-cursos', { params });
  return response.data;
};

export const getInformePatronDias = async (params: ParamsPatronDias): Promise<RespuestaPatronDias> => {
  const response = await axiosInstance.get('/asistencia/informes/patron-dias', { params });
  return response.data;
};

export const getInformeHistorial = async (
  estudianteId: string,
  params: ParamsHistorial
): Promise<RespuestaHistorial> => {
  const response = await axiosInstance.get(`/asistencia/informes/historial/${estudianteId}`, { params });
  return response.data;
};

export interface EstadisticaEstudiantePeriodo {
  estudianteId: string;
  nombreEstudiante: string;
  clasesTotales: number;
  presentes: number;
  ausentes: number;
  tardanzas: number;
  justificados: number;
  permisos: number;
  porcentajeAsistencia: number;
}

export const getResumenPeriodo = async (
  periodoId: string,
  cursoId: string
): Promise<EstadisticaEstudiantePeriodo[]> => {
  const response = await axiosInstance.get(
    `/asistencia/resumen/periodo/${periodoId}`,
    { params: { cursoId } }
  );
  return response.data.data;
};
