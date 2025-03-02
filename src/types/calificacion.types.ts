// src/types/calificacion.types.ts
export interface ILogro {
    _id: string;
    nombre: string;
    descripcion: string;
    tipo: 'COGNITIVO' | 'PROCEDIMENTAL' | 'ACTITUDINAL';
    porcentaje: number;
    asignaturaId: string;
    cursoId: string;
    periodo: number;
    año_academico: string;
    estado: 'ACTIVO' | 'INACTIVO';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ICalificacionLogro {
    logroId: string;
    calificacion: number;
    observacion?: string;
    fecha_calificacion: string;
  }
  
  export interface ICalificacion {
    _id: string;
    estudianteId: string;
    asignaturaId: string;
    cursoId: string;
    escuelaId: string;
    periodo: number;
    año_academico: string;
    calificaciones_logros: ICalificacionLogro[];
    promedio_periodo: number;
    observaciones: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface IEstudiante {
    _id: string;
    nombre: string;
    apellidos: string;
    email: string;
    tipo: 'ESTUDIANTE';
  }
  
  export interface IAsignatura {
    _id: string;
    nombre: string;
    descripcion: string;
    cursoId: string;
    docenteId: string;
  }
  
  export interface ICurso {
    _id: string;
    nombre: string;
    nivel: string;
    año_academico: string;
    director_grupo: string;
    estudiantes: string[];
  }
  
  export interface IBoletin {
    estudiante: {
      _id: string;
      nombre: string;
      curso: string;
    };
    periodo: number;
    año_academico: string;
    fecha_generacion: string;
    asignaturas: {
      asignatura: {
        _id: string;
        nombre: string;
        docente: string;
      };
      logros: {
        logro: {
          _id: string;
          nombre: string;
          descripcion: string;
          tipo: string;
          porcentaje: number;
        };
        calificacion: {
          valor: number;
          observacion: string;
          fecha: string;
        } | null;
      }[];
      promedio: number;
      observaciones: string;
      progreso: {
        logros_calificados: number;
        total_logros: number;
        porcentaje_completado: number;
      };
    }[];
    estadisticas: {
      asignaturas_total: number;
      asignaturas_aprobadas: number;
      asignaturas_reprobadas: number;
      asignaturas_sin_calificar: number;
      promedio_general: number;
    };
  }