export interface CursoResumen {
  _id: string;
  nombre: string;
}

export interface EstadisticaDocente {
  docenteId: string;
  nombre: string;
  apellidos: string;
  count: number;
  ultimoMensaje: string | null;
  cursos: CursoResumen[];
}

export interface DestinatarioResumen {
  _id: string;
  nombre: string;
  apellidos: string;
}

export interface MensajeAuditoriaIndividual {
  _id: string;
  asunto: string;
  contenido: string;
  createdAt: string;
  tipo: 'INDIVIDUAL';
  destinatario: DestinatarioResumen | null;
  cursoEstudiante: { _id: string; nombre: string } | null;
  cursoNombre?: never;
  cantidadDestinatariosEstudiantes?: never;
}

export interface MensajeAuditoriaGrupal {
  _id: string;
  asunto: string;
  contenido: string;
  createdAt: string;
  tipo: 'GRUPAL' | 'INSTITUCIONAL';
  cursoNombre: string | null;
  cantidadDestinatariosEstudiantes: number;
  destinatario?: never;
}

export type MensajeAuditoria = MensajeAuditoriaIndividual | MensajeAuditoriaGrupal;

export interface EstadisticasDocentesParams {
  desde: string;
  hasta: string;
  cursoId?: string;
  docenteId?: string;
}

export interface MensajesAuditoriaParams {
  remitenteId: string;
  desde: string;
  hasta: string;
  pagina?: number;
  limite?: number;
}
