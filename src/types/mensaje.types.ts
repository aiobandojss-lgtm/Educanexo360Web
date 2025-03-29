// src/types/mensaje.types.ts

export interface IMensaje {
  _id: string;
  remitente: {
    _id: string;
    nombre: string;
    apellidos: string;
    email: string;
    tipo: string;
  };
  destinatarios: Array<{
    _id: string;
    nombre: string;
    apellidos: string;
    email: string;
    tipo: string;
  }>;
  destinatariosCc?: Array<{
    _id: string;
    nombre: string;
    apellidos: string;
    email: string;
    tipo: string;
  }>;
  asunto: string;
  contenido: string;
  tipo: 'CIRCULAR' | 'INDIVIDUAL' | 'NOTIFICACION' | 'BORRADOR' | 'MASIVO' | 'GRUPAL'; 
  prioridad: 'ALTA' | 'NORMAL' | 'BAJA';
  
  // Estado global del mensaje
  estado?: 'ENVIADO' | 'BORRADOR';
  
  // Estado individualizado por usuario (nuevo)
  estadosUsuarios?: Array<{
    usuarioId: string;
    estado: 'ENVIADO' | 'LEIDO' | 'ARCHIVADO' | 'ELIMINADO';
    fechaModificacion: Date;
  }>;
  
  // Estado para el usuario actual (propiedad computada)
  estadoUsuarioActual?: 'ENVIADO' | 'LEIDO' | 'ARCHIVADO' | 'ELIMINADO';
  
  etiquetas?: string[];
  cursoId?: string; // Para mensajes masivos a cursos
  cursoNombre?: string; // Nombre del curso para mensajes masivos
  adjuntos?: Array<{
    nombre: string;
    tipo: string;
    tamaño: number;
    fileId: string;
    fechaSubida?: Date;
  }>;
  esRespuesta?: boolean;
  mensajeOriginalId?: string;
  lecturas?: Array<{
    usuarioId: string;
    fechaLectura: Date;
  }>;
  leido?: boolean; // Propiedad computada para el usuario actual
  fechaEliminacion?: string; // Fecha en que se movió a papelera
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface IMensajeNuevo {
  destinatarios: string[];
  destinatariosCc?: string[];
  asunto: string;
  contenido: string;
  tipo?: 'CIRCULAR' | 'INDIVIDUAL' | 'GRUPAL' | 'BORRADOR'; 
  prioridad?: 'ALTA' | 'NORMAL' | 'BAJA';
  etiquetas?: string[];
  esRespuesta?: boolean;
  mensajeOriginalId?: string;
  cursoId?: string; // Para mensajes masivos a cursos
}

export interface IBorrador {
  _id?: string;
  destinatarios: string[];
  destinatariosCc?: string[];
  asunto: string;
  contenido: string;
  prioridad: 'ALTA' | 'NORMAL' | 'BAJA';
  tipo?: 'INDIVIDUAL' | 'GRUPAL' | 'BORRADOR';
  cursoId?: string;
  adjuntos?: Array<{
    nombre: string;
    tipo: string;
    tamaño: number;
    fileId: string;
  }>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Constantes para roles que pueden usar borradores
export const ROLES_CON_BORRADORES = ['ADMIN', 'RECTOR', 'COORDINADOR', 'ADMINISTRATIVO', 'DOCENTE'];