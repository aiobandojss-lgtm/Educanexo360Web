// src/constants/apiRoutes.ts

/**
 * Definición centralizada de todas las rutas de la API
 * Esto facilita el mantenimiento y previene errores de tipeo
 */
const API_ROUTES = {
  // Rutas de autenticación
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    VERIFY_TOKEN: "/auth/verify-token",
  },

  // Rutas de usuarios
  USUARIOS: {
    BASE: "/usuarios",
    GET_ALL: "/usuarios",
    GET_BY_ID: (id: string) => `/usuarios/${id}`,
    CREATE: "/usuarios",
    UPDATE: (id: string) => `/usuarios/${id}`,
    DELETE: (id: string) => `/usuarios/${id}`,
    GET_DOCENTES: "/usuarios/docentes",
    GET_ESTUDIANTES: "/usuarios/estudiantes",
    GET_PADRES: "/usuarios/padres",
    CHANGE_PASSWORD: (id: string) => `/usuarios/${id}/cambiar-password`,
    CAMBIAR_PASSWORD: (id: string) => `/usuarios/${id}/cambiar-password`, // Alias en español para compatibilidad
    GET_PROFILE: "/usuarios/perfil",
    BUSCAR: "/usuarios/buscar", // Añadida ruta para búsqueda de usuarios
    GET_DESTINATARIOS: "/usuarios/destinatarios-disponibles",
    // Rutas para gestión de estudiantes asociados
    ESTUDIANTES_ASOCIADOS: (id: string) =>
      `/usuarios/${id}/estudiantes-asociados`,
    ASOCIAR_ESTUDIANTE: (id: string) => `/usuarios/${id}/estudiantes-asociados`,
    DESASOCIAR_ESTUDIANTE: (id: string, estudianteId: string) =>
      `/usuarios/${id}/estudiantes-asociados/${estudianteId}`,
  },

  // Rutas de escuelas
  ESCUELAS: {
    BASE: "/escuelas",
    GET_ALL: "/escuelas",
    GET_BY_ID: (id: string) => `/escuelas/${id}`,
    CREATE: "/escuelas",
    UPDATE: (id: string) => `/escuelas/${id}`,
    DELETE: (id: string) => `/escuelas/${id}`,
    UPDATE_PERIODOS: (id: string) => `/escuelas/${id}/periodos`,
  },

  // Rutas de cursos
  CURSOS: {
    BASE: "/cursos",
    GET_ALL: "/cursos",
    GET_BY_ID: (id: string) => `/cursos/${id}`,
    CREATE: "/cursos",
    UPDATE: (id: string) => `/cursos/${id}`,
    DELETE: (id: string) => `/cursos/${id}`,
    GET_ESTUDIANTES: (id: string) => `/cursos/${id}/estudiantes`,
    ADD_ESTUDIANTES: (id: string) => `/cursos/${id}/estudiantes`,
    REMOVE_ESTUDIANTE: (cursoId: string, estudianteId: string) =>
      `/cursos/${cursoId}/estudiantes/${estudianteId}`,
    GET_DISPONIBLES_PARA_MENSAJES: "/cursos/disponibles-para-mensajes",
  },

  // Rutas de asignaturas
  ASIGNATURAS: {
    BASE: "/asignaturas",
    GET_ALL: "/asignaturas",
    GET_BY_ID: (id: string) => `/asignaturas/${id}`,
    CREATE: "/asignaturas",
    UPDATE: (id: string) => `/asignaturas/${id}`,
    DELETE: (id: string) => `/asignaturas/${id}`,
    GET_BY_CURSO: (cursoId: string) => `/asignaturas/curso/${cursoId}`,
    DESASIGNAR_DE_CURSO: (id: string) => `/asignaturas/${id}/desasignar-curso`,
  },

  // Rutas de asistencia
  ASISTENCIA: {
    BASE: "/asistencia",
    GET_ALL: "/asistencia",
    GET_BY_ID: (id: string) => `/asistencia/${id}`,
    CREATE: "/asistencia",
    UPDATE: (id: string) => `/asistencia/${id}`,
    DELETE: (id: string) => `/asistencia/${id}`,
    FINALIZAR: (id: string) => `/asistencia/${id}/finalizar`,
    GET_BY_DAY: "/asistencia/dia",
    STATS_BY_CURSO: (cursoId: string) =>
      `/asistencia/estadisticas/curso/${cursoId}`,
    STATS_BY_ESTUDIANTE: (estudianteId: string) =>
      `/asistencia/estadisticas/estudiante/${estudianteId}`,
    RESUMEN_PERIODO: (periodoId: string) =>
      `/asistencia/resumen/periodo/${periodoId}`,
  },

  // Rutas de mensajería
  MENSAJES: {
    BASE: "/mensajes",
    GET_RECIBIDOS: "/mensajes",
    GET_ENVIADOS: "/mensajes/enviados",
    GET_BORRADORES: "/mensajes/borradores",
    GET_ARCHIVADOS: "/mensajes/archivados",
    GET_BY_ID: (id: string) => `/mensajes/${id}`,
    CREATE: "/mensajes",
    CREATE_MASIVO: "/mensajes/masivo",
    DELETE: (id: string) => `/mensajes/${id}`,
    MARK_AS_READ: (id: string) => `/mensajes/${id}/leer`,
    ARCHIVAR: (id: string) => `/mensajes/${id}/archivar`,
    GET_ATTACHMENT: (id: string) => `/mensajes/adjunto/${id}`,
  },

  // Rutas de calendario
  CALENDARIO: {
    BASE: "/calendario",
    GET_ALL: "/calendario",
    GET_BY_ID: (id: string) => `/calendario/${id}`,
    CREATE: "/calendario",
    UPDATE: (id: string) => `/calendario/${id}`,
    DELETE: (id: string) => `/calendario/${id}`,
    CONFIRMAR_ASISTENCIA: (id: string) => `/calendario/${id}/confirmar`,
    GET_ATTACHMENT: (id: string) => `/calendario/${id}/adjunto`,
    CAMBIAR_ESTADO: (id: string) => `/calendario/${id}/estado`,
  },

  // Rutas de anuncios
  ANUNCIOS: {
    BASE: "/anuncios",
    BY_ID: (id: string) => `/anuncios/${id}`,
    PUBLICAR: (id: string) => `/anuncios/${id}/publicar`,
    ARCHIVAR: (id: string) => `/anuncios/${id}/archivar`,
    // Nuevas rutas para carga de archivos separada
    UPLOAD_IMAGE: (id: string) => `/anuncios/${id}/imagen`,
    UPLOAD_ATTACHMENT: (id: string) => `/anuncios/${id}/adjunto`,
    GET_IMAGE: (anuncioId: string, imagenId: string) =>
      `/anuncios/${anuncioId}/imagen/${imagenId}`,
    GET_ATTACHMENT: (anuncioId: string, adjuntoId: string) =>
      `/anuncios/${anuncioId}/adjunto/${adjuntoId}`,
  },

  // Rutas de calificaciones
  CALIFICACIONES: {
    BASE: "/calificaciones",
    GET_ALL: "/calificaciones",
    GET_BY_ID: (id: string) => `/calificaciones/${id}`,
    CREATE: "/calificaciones",
    UPDATE: (id: string) => `/calificaciones/${id}`,
    DELETE: (id: string) => `/calificaciones/${id}`,
    GET_BY_ESTUDIANTE: (estudianteId: string) =>
      `/calificaciones/estudiante/${estudianteId}`,
    GET_BY_ASIGNATURA: (asignaturaId: string) =>
      `/calificaciones/asignatura/${asignaturaId}`,
  },

  // Rutas de boletines
  BOLETIN: {
    GET_BY_ESTUDIANTE: (estudianteId: string) =>
      `/boletin/estudiante/${estudianteId}`,
    GET_BY_CURSO: (cursoId: string) => `/boletin/curso/${cursoId}`,
    GENERAR: "/boletin/generar",
  },

  // Rutas de notificaciones
  NOTIFICACIONES: {
    BASE: "/notificaciones",
    GET_ALL: "/notificaciones",
    MARK_AS_READ: (id: string) => `/notificaciones/${id}/leer`,
    DELETE: (id: string) => `/notificaciones/${id}`,
    MARK_ALL_AS_READ: "/notificaciones/leer-todas",
  },

  // Rutas de logros académicos
  LOGROS: {
    BASE: "/logros",
    GET_ALL: "/logros",
    GET_BY_ID: (id: string) => `/logros/${id}`,
    CREATE: "/logros",
    UPDATE: (id: string) => `/logros/${id}`,
    DELETE: (id: string) => `/logros/${id}`,
    GET_BY_ASIGNATURA: (asignaturaId: string) =>
      `/logros/asignatura/${asignaturaId}`,
    GET_BY_PERIODO: (periodoId: string) => `/logros/periodo/${periodoId}`,
  },

  // Rutas de configuración
  CONFIGURACION: {
    GET: "/configuracion",
    UPDATE: "/configuracion",
  },

  // Rutas de invitaciones
  INVITACIONES: {
    BASE: "/invitaciones",
    GET_ALL: "/invitaciones",
    GET_BY_ID: (id: string) => `/invitaciones/${id}`,
    CREATE: "/invitaciones",
    DELETE: (id: string) => `/invitaciones/${id}`, // Para revocar
    GET_BY_CURSO: (cursoId: string) => `/invitaciones/curso/${cursoId}`,
    VALIDAR: "/invitaciones/validar",
  },

  // Rutas de solicitudes de registro
  REGISTRO: {
    // Rutas autenticadas
    BASE: "/registro",
    SOLICITUDES: "/registro/solicitudes",
    SOLICITUDES_PENDIENTES: "/registro/solicitudes?estado=PENDIENTE",
    SOLICITUD_BY_ID: (id: string) => `/registro/solicitudes/${id}`,
    HISTORIAL: "/registro/solicitudes/historial",
    APROBAR: (id: string) => `/registro/solicitudes/${id}/aprobar`,
    RECHAZAR: (id: string) => `/registro/solicitudes/${id}/rechazar`,
    // Rutas públicas
    CREAR_SOLICITUD: "/public/registro/solicitudes",
  },

  // Rutas públicas
  PUBLIC: {
    VALIDAR_INVITACION: "/public/invitaciones/validar",
    INFO_CURSO: (cursoId: string, codigoInvitacion: string) =>
      `/public/cursos/${cursoId}/invitacion/${codigoInvitacion}`,
    INFO_CURSO_PUBLIC: (cursoId: string) => `/public/cursos/${cursoId}/info`,
    CREAR_SOLICITUD: "/public/registro/solicitudes",
  },
};

export default API_ROUTES;
