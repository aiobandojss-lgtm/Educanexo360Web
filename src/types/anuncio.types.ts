// src/types/anuncio.types.ts
export interface IAnuncio {
    _id: string;
    titulo: string;
    contenido: string;
    autor: {
      _id: string;
      nombre: string;
      apellidos: string;
      tipo: string;
    };
    escuelaId: string;
    fechaPublicacion: Date | string;
    fechaExpiracion?: Date | string;
    importante: boolean;
    destinatarios: string[]; // 'TODOS', 'DOCENTES', 'ESTUDIANTES', 'PADRES', 'ADMIN'
    adjuntos?: {
      nombre: string;
      url: string;
      tipo: string;
      tamanio: number;
    }[];
    estado: 'ACTIVO' | 'INACTIVO';
    createdAt: Date | string;
    updatedAt: Date | string;
  }
  
  export interface IAnuncioListItem {
    _id: string;
    titulo: string;
    autor: {
      nombre: string;
      apellidos: string;
    };
    fechaPublicacion: Date | string;
    importante: boolean;
    estado: 'ACTIVO' | 'INACTIVO';
  }
  
  export interface IAnuncioNuevo {
    titulo: string;
    contenido: string;
    importante: boolean;
    destinatarios: string[];
    fechaExpiracion?: Date | string;
    escuelaId: string;
  }
  
  export interface IAnuncioFiltros {
    importante?: boolean;
    estado?: 'ACTIVO' | 'INACTIVO';
    fechaDesde?: Date | string;
    fechaHasta?: Date | string;
    destinatarios?: string[];
  }