export interface Usuario {
  _id: string;
  nombre: string;
  apellidos: string;
}

export interface ArchivoAdjunto {
  fileId: string;
  nombre: string;
  tipo: string;
  tamaño: number;
}

export interface ImagenPortada {
  fileId: string;
  url: string;
}

export interface Lectura {
  usuarioId: string;
  fechaLectura: string;
}

export interface Anuncio {
  _id: string;
  titulo: string;
  contenido: string;
  creador: string | Usuario;
  escuelaId: string;
  fechaPublicacion: string;
  estaPublicado: boolean;
  paraEstudiantes: boolean;
  paraDocentes: boolean;
  paraPadres: boolean;
  destacado: boolean;
  archivosAdjuntos: ArchivoAdjunto[];
  imagenPortada?: ImagenPortada;
  lecturas: Lectura[];
  createdAt: string;
  updatedAt: string;
}

export interface AnuncioInput {
  titulo: string;
  contenido: string;
  paraEstudiantes?: boolean;
  paraDocentes?: boolean;
  paraPadres?: boolean;
  destacado?: boolean;
  estaPublicado?: boolean;
}

export interface AnuncioFilters {
  pagina?: number;
  limite?: number;
  soloDestacados?: boolean;
  soloPublicados?: boolean;
  paraRol?: "ESTUDIANTE" | "DOCENTE" | "ACUDIENTE";
  busqueda?: string;
}

export interface AnunciosPaginados {
  data: Anuncio[];
  meta: {
    total: number;
    pagina: number;
    limite: number;
    paginas: number;
  };
}
