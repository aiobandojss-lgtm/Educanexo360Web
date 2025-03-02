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
    tipo: 'CIRCULAR' | 'INDIVIDUAL' | 'NOTIFICACION' | 'BORRADOR';
    prioridad: 'ALTA' | 'NORMAL' | 'BAJA';
    estado: 'ENVIADO' | 'LEIDO' | 'ARCHIVADO' | 'BORRADOR';
    etiquetas?: string[];
    adjuntos?: Array<{
      nombre: string;
      tipo: string;
      tamaño: number;
      fileId: string;
      fechaSubida: Date;
    }>;
    esRespuesta?: boolean;
    mensajeOriginalId?: string;
    lecturas?: Array<{
      usuarioId: string;
      fechaLectura: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IMensajeNuevo {
    destinatarios: string[];
    destinatariosCc?: string[];
    asunto: string;
    contenido: string;
    tipo?: 'CIRCULAR' | 'INDIVIDUAL' | 'BORRADOR';
    prioridad?: 'ALTA' | 'NORMAL' | 'BAJA';
    etiquetas?: string[];
    esRespuesta?: boolean;
    mensajeOriginalId?: string;
  }