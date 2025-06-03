// src/services/mensajeService.ts

import axiosInstance, { axiosFileInstance } from "../api/axiosConfig";

// Función auxiliar para depuración
const logRequest = (method: string, url: string, data?: any) => {
  console.log(`[DEBUG] ${method} request to: ${url}`, data ? { data } : "");
};

// Interfaz para mensaje
interface MensajeRequest {
  destinatarios: string[];
  asunto: string;
  contenido: string;
  tipo: string;
  prioridad: string;
  esRespuesta?: boolean;
  mensajeOriginalId?: string | null;
}

// Interfaz para destinatario extendida con información adicional
interface DestinatarioExtendido {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  asignatura?: string; // Campo opcional para mostrar la asignatura que dicta el docente
  curso?: string; // Campo opcional para mostrar el curso
  infoContextual?: string; // Campo opcional para mostrar relación con estudiantes
}

interface MensajeConEstados {
  _id: string;
  estadosUsuarios?: Array<{
    usuarioId: string | { _id: string };
    estado: string;
    fechaAccion?: Date | string;
    _id?: string;
  }>;
  [key: string]: any;
}

// Enum correcto según el backend
const TipoMensaje = {
  INDIVIDUAL: "INDIVIDUAL",
  GRUPAL: "GRUPAL",
  BORRADOR: "BORRADOR",
};

// Función auxiliar para verificar el estado del mensaje para un usuario
const verificarEstadoMensajeParaUsuario = (
  mensaje: MensajeConEstados,
  userId: string,
  estadoEsperado: string
): boolean => {
  if (!mensaje.estadosUsuarios || !Array.isArray(mensaje.estadosUsuarios)) {
    return false;
  }

  const estadoUsuario = mensaje.estadosUsuarios.find((estado) => {
    if (typeof estado.usuarioId === "string") {
      return estado.usuarioId === userId;
    }
    return estado.usuarioId && estado.usuarioId._id === userId;
  });

  return estadoUsuario ? estadoUsuario.estado === estadoEsperado : false;
};

// Buscar destinatarios para ACUDIENTES (docentes y personal relacionados con sus estudiantes)
const buscarDestinatariosParaAcudiente = async () => {
  try {
    console.log("[DEBUG] Usando endpoint específico para acudientes");
    // Utilizar endpoint específico para acudientes
    const response = await axiosInstance.get(
      "/mensajes/destinatarios-acudiente"
    );
    return response.data.data || [];
  } catch (error: any) {
    console.error(
      "[Frontend] Error buscando destinatarios para acudiente:",
      error
    );
    // Devolver array vacío para que la UI siga funcionando
    return [];
  }
};

// Buscar destinatarios para mensajes - Versión optimizada
const buscarDestinatarios = async (query = "", isAcudiente = false) => {
  try {
    console.log(
      `[DEBUG] Buscando destinatarios con query: "${query}", isAcudiente: ${isAcudiente}`
    );

    // Si es un acudiente, usar endpoint específico
    if (isAcudiente) {
      return await buscarDestinatariosParaAcudiente();
    }

    // Para otros roles, usar la búsqueda en el endpoint principal
    // Construir parámetros de búsqueda
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append("q", query.trim());
    }

    // Llamar al endpoint
    const response = await axiosInstance.get(
      `/mensajes/destinatarios-disponibles?${params.toString()}`
    );
    return response.data.data || [];
  } catch (error: any) {
    console.error("[Frontend] Error buscando destinatarios:", error);

    // Verificar si es un error de permisos
    if (error.response && error.response.status === 403) {
      console.log(
        "Usuario con permisos restringidos para listar estos destinatarios"
      );
    }

    // Devolver array vacío para que la UI siga funcionando
    return [];
  }
};

// Obtener mensaje por ID
const obtenerMensajePorId = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/mensajes/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("[Frontend] Error obteniendo mensaje:", error);
    throw error;
  }
};

// Enviar mensaje individual
const enviarMensaje = async (
  mensaje: MensajeRequest,
  adjuntos: File[] = []
) => {
  try {
    // Si no hay adjuntos, usamos la API normal
    if (adjuntos.length === 0) {
      const response = await axiosInstance.post("/mensajes", mensaje);
      return response.data;
    }

    // Si hay adjuntos, usamos FormData
    const formData = new FormData();

    // Agregar datos del mensaje
    formData.append("asunto", mensaje.asunto);
    formData.append("contenido", mensaje.contenido);
    formData.append("tipo", mensaje.tipo);
    formData.append("prioridad", mensaje.prioridad);

    // Agregar campos opcionales si existen
    if (mensaje.esRespuesta) {
      formData.append("esRespuesta", String(mensaje.esRespuesta));
    }

    if (mensaje.mensajeOriginalId) {
      formData.append("mensajeOriginalId", mensaje.mensajeOriginalId);
    }

    // Agregar destinatarios como array
    mensaje.destinatarios.forEach((destinatario) => {
      formData.append("destinatarios", destinatario);
    });

    // Agregar adjuntos
    adjuntos.forEach((file) => {
      formData.append("adjuntos", file);
    });

    const response = await axiosFileInstance.post("/mensajes", formData);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error enviando mensaje:", error);
    throw error;
  }
};

// Responder mensaje - Función específica para respuestas
const responderMensaje = async (
  mensajeOriginalId: string,
  contenido: string,
  asunto: string = "",
  prioridad: string = "NORMAL",
  adjuntos: File[] = []
) => {
  try {
    // Primero obtenemos el mensaje original para saber a quién responder
    const mensajeOriginal = await obtenerMensajePorId(mensajeOriginalId);

    if (!mensajeOriginal || !mensajeOriginal.remitente) {
      throw new Error(
        "No se pudo obtener la información del remitente original"
      );
    }

    // Crear el mensaje de respuesta
    const mensaje = {
      destinatarios: [mensajeOriginal.remitente._id],
      asunto: asunto || `Re: ${mensajeOriginal.asunto}`,
      contenido,
      tipo: TipoMensaje.INDIVIDUAL,
      prioridad,
      esRespuesta: true,
      mensajeOriginalId,
    };

    // Usar el método estándar para enviar
    return await enviarMensaje(mensaje, adjuntos);
  } catch (error) {
    console.error("[Frontend] Error respondiendo mensaje:", error);
    throw error;
  }
};

// Enviar mensaje masivo
const enviarMensajeMasivo = async (
  cursoId: string,
  asunto: string,
  contenido: string,
  prioridad: string,
  adjuntos: File[] = []
) => {
  try {
    console.log("Preparando mensaje masivo para el curso:", cursoId);

    // Si no hay adjuntos, usamos JSON normal
    if (adjuntos.length === 0) {
      const response = await axiosInstance.post("/mensajes", {
        cursoIds: [cursoId], // Como array
        asunto,
        contenido,
        prioridad,
        tipo: TipoMensaje.GRUPAL, // Usar GRUPAL en lugar de MASIVO
      });
      return response.data;
    }

    // Con adjuntos usamos FormData
    const formData = new FormData();

    // Usar 'cursoIds' como array
    formData.append("cursoIds", cursoId);

    formData.append("asunto", asunto);
    formData.append("contenido", contenido);
    formData.append("tipo", TipoMensaje.GRUPAL);
    formData.append("prioridad", prioridad);

    // Agregar adjuntos
    adjuntos.forEach((file) => {
      formData.append("adjuntos", file);
    });

    const response = await axiosFileInstance.post("/mensajes", formData);

    return response.data;
  } catch (error: any) {
    console.error("[Frontend] Error enviando mensaje masivo:", error);

    // Mejorar el manejo de errores para mostrar el mensaje exacto
    if (error.response?.status === 404) {
      throw new Error("Ruta no encontrada");
    } else if (error.response?.status === 400) {
      if (error.response.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(
          "El servidor rechazó la solicitud. Verifique los datos."
        );
      }
    } else if (error.response?.status === 403) {
      throw new Error("No tiene permisos para enviar mensajes masivos.");
    } else if (error.response?.status === 500) {
      // Para errores de servidor, intentar extraer el mensaje específico
      const errorText =
        error.response.data?.message ||
        (typeof error.response.data === "string" ? error.response.data : null);

      if (errorText && errorText.includes("not a valid enum value")) {
        throw new Error(
          `Error de validación: El tipo de mensaje no es válido. ${errorText}`
        );
      } else {
        throw new Error(
          "Error interno del servidor. Por favor contacte al administrador."
        );
      }
    } else {
      throw error;
    }
  }
};

// Obtener cursos disponibles con conteo correcto de estudiantes
const obtenerCursosDisponibles = async () => {
  try {
    console.log("[DEBUG] Obteniendo cursos disponibles para mensajes masivos");
    const response = await axiosInstance.get("/mensajes/cursos-disponibles");

    // Obtener los cursos de la respuesta
    const cursos = response.data.data || [];

    // Hacer debug con el primer curso para ver su estructura
    if (cursos.length > 0) {
      console.log(
        "[DEBUG] Ejemplo de estructura de curso:",
        JSON.stringify({
          id: cursos[0]._id,
          nombre: cursos[0].nombre,
          cantidadEstudiantes: cursos[0].cantidadEstudiantes,
          infoAdicional: cursos[0].infoAdicional || "",
        })
      );
    }

    return cursos;
  } catch (error: any) {
    console.error("[Frontend] Error obteniendo cursos:", error);

    // Verificar si es un error de permisos
    if (error.response?.status === 403) {
      console.log("Usuario no tiene permisos para enviar mensajes masivos");
      throw new Error("No tiene permisos para enviar mensajes masivos");
    }

    throw error;
  }
};

// NUEVAS FUNCIONES PARA MANEJAR ESTADOS DE MENSAJES

// Archivar mensaje
const archivarMensaje = async (id: string, bandeja?: string) => {
  try {
    // Añadir la bandeja como parámetro para que el backend sepa el contexto
    const params = new URLSearchParams();
    if (bandeja) {
      params.append("bandeja", bandeja);
    }

    const url = `/mensajes/${id}/archivar${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    logRequest("PUT", url);
    const response = await axiosInstance.put(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error archivando mensaje:", error);
    throw error;
  }
};

// Desarchivar mensaje (restaurar mensaje archivado)
const desarchivarMensaje = async (id: string) => {
  try {
    const url = `/mensajes/${id}/desarchivar`;
    logRequest("PUT", url);
    const response = await axiosInstance.put(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error desarchivando mensaje:", error);
    throw error;
  }
};

// Eliminar mensaje (mover a papelera)
const eliminarMensaje = async (id: string) => {
  try {
    const url = `/mensajes/${id}/eliminar`;
    logRequest("PUT", url);
    const response = await axiosInstance.put(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error eliminando mensaje:", error);
    throw error;
  }
};

// Restaurar mensaje eliminado
const restaurarMensaje = async (id: string) => {
  try {
    const url = `/mensajes/${id}/restaurar`;
    logRequest("PUT", url);
    const response = await axiosInstance.put(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error restaurando mensaje:", error);
    throw error;
  }
};

// Eliminar mensaje permanentemente
const eliminarDefinitivamente = async (id: string) => {
  try {
    if (!id) {
      throw new Error("ID de mensaje no válido");
    }

    console.log(`Eliminando permanentemente mensaje con ID: ${id}`);
    const url = `/mensajes/${id}`;
    logRequest("DELETE", url);
    const response = await axiosInstance.delete(url);

    return response.data;
  } catch (error) {
    console.error(
      "[Frontend] Error eliminando definitivamente mensaje:",
      error
    );
    throw error;
  }
};

// FUNCIONES PARA BORRADORES

// Guardar borrador (crear o actualizar)
const guardarBorrador = async (
  borrador: {
    _id?: string;
    destinatarios: string[];
    asunto: string;
    contenido: string;
    prioridad: string;
    cursoId?: string;
    tipo?: string;
  },
  adjuntos: File[] = []
) => {
  try {
    console.log("=== DEBUG FRONTEND ===");
    console.log("Destinatarios antes de enviar:", borrador.destinatarios);
    console.log("Longitud destinatarios:", borrador.destinatarios.length);

    const formData = new FormData();

    // Al agregar destinatarios al FormData:
    if (borrador.destinatarios && Array.isArray(borrador.destinatarios)) {
      borrador.destinatarios.forEach((dest, index) => {
        console.log(`Agregando destinatario ${index}: ${dest}`);
        formData.append("destinatarios", dest);
      });
    }

    // ... resto sin cambios
  } catch (error) {
    console.error("Error en guardarBorrador frontend:", error);
    throw error;
  }
};

// Obtener borradores
const obtenerBorradores = async (pagina = 1, limite = 20) => {
  try {
    const url = `/mensajes/borradores?pagina=${pagina}&limite=${limite}`;
    logRequest("GET", url);
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error obteniendo borradores:", error);
    throw error;
  }
};

// Obtener un borrador específico
const obtenerBorrador = async (id: string) => {
  try {
    const url = `/mensajes/borradores/${id}`;
    logRequest("GET", url);
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error("[Frontend] Error obteniendo borrador:", error);
    throw error;
  }
};

// Enviar un borrador (convertirlo en mensaje enviado)
const enviarBorrador = async (id: string) => {
  try {
    const url = `/mensajes/borradores/${id}/enviar`;
    logRequest("POST", url);
    const response = await axiosInstance.post(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error enviando borrador:", error);
    throw error;
  }
};

// Eliminar un borrador
const eliminarBorrador = async (id: string) => {
  try {
    const url = `/mensajes/borradores/${id}`;
    logRequest("DELETE", url);
    const response = await axiosInstance.delete(url);
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error eliminando borrador:", error);
    throw error;
  }
};

// Versión modificada para probar diferentes endpoints
const marcarComoLeido = async (id: string, leido: boolean) => {
  try {
    console.log(
      `Intentando marcar mensaje ${id} como ${leido ? "leído" : "no leído"}`
    );

    // Usar el endpoint específico que hemos agregado al backend
    const endpoint = `/mensajes/${id}/lectura`;

    // Hacer la petición al nuevo endpoint
    try {
      const response = await axiosInstance.put(endpoint, { leido });
      console.log(
        "[DEBUG] Mensaje marcado correctamente como",
        leido ? "leído" : "no leído"
      );
      return response.data;
    } catch (error: any) {
      // Si falla, lanzamos el error para manejo externo
      throw error;
    }
  } catch (error: any) {
    console.error(
      "[Frontend] Error marcando mensaje como leído/no leído:",
      error
    );
    throw error;
  }
};

// Descargar adjunto de un mensaje
const descargarAdjunto = async (mensajeId: string, adjuntoId: string) => {
  try {
    const url = `/mensajes/${mensajeId}/adjuntos/${adjuntoId}`;
    logRequest("GET", url, { responseType: "blob" });
    const response = await axiosInstance.get(url, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    console.error("[Frontend] Error descargando adjunto:", error);
    throw error;
  }
};

// Obtener mensajes
const obtenerMensajes = async (
  bandeja: string = "recibidos",
  pagina: number = 1,
  limite: number = 20,
  userId?: string
) => {
  try {
    console.log(`Solicitando mensajes de bandeja: ${bandeja}`);
    const url = "/mensajes";
    const params = {
      bandeja,
      pagina,
      limite,
    };

    logRequest("GET", url, { params });

    const response = await axiosInstance.get(url, { params });

    // Filtrado adicional en el frontend para asegurar que los mensajes están en la bandeja correcta
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data) &&
      userId
    ) {
      // Función auxiliar para verificar el estado del mensaje para un usuario
      const verificarEstado = (
        mensaje: MensajeConEstados,
        estado: string
      ): boolean => {
        if (
          !mensaje.estadosUsuarios ||
          !Array.isArray(mensaje.estadosUsuarios)
        ) {
          return false;
        }

        const estadoUsuario = mensaje.estadosUsuarios.find((e) => {
          if (typeof e.usuarioId === "string") {
            return e.usuarioId === userId;
          }
          return e.usuarioId && e.usuarioId._id === userId;
        });

        return estadoUsuario ? estadoUsuario.estado === estado : false;
      };

      // Primero filtrar mensajes con estado ELIMINADO_PERMANENTE para este usuario
      response.data.data = response.data.data.filter(
        (mensaje: MensajeConEstados) => {
          // Verificar que el mensaje no tenga estado ELIMINADO_PERMANENTE para este usuario
          const estadoUsuario = mensaje.estadosUsuarios?.find((e) => {
            if (typeof e.usuarioId === "string") {
              return e.usuarioId === userId;
            }
            return e.usuarioId && e.usuarioId._id === userId;
          });

          return (
            !estadoUsuario || estadoUsuario.estado !== "ELIMINADO_PERMANENTE"
          );
        }
      );

      // Luego aplicar filtros específicos por bandeja
      if (bandeja === "enviados") {
        // Para bandeja enviados, excluir mensajes archivados por el remitente
        response.data.data = response.data.data.filter(
          (mensaje: MensajeConEstados) => !verificarEstado(mensaje, "ARCHIVADO")
        );
      } else if (bandeja === "archivados") {
        // Para bandeja archivados, incluir solo mensajes archivados por el usuario
        response.data.data = response.data.data.filter(
          (mensaje: MensajeConEstados) => verificarEstado(mensaje, "ARCHIVADO")
        );
      } else if (bandeja === "eliminados") {
        // Para bandeja eliminados, incluir solo mensajes eliminados (pero no permanentemente) por el usuario
        response.data.data = response.data.data.filter(
          (mensaje: MensajeConEstados) => verificarEstado(mensaje, "ELIMINADO")
        );
      }
    }

    console.log(`Respuesta filtrada para bandeja ${bandeja}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[Frontend] Error obteniendo mensajes de ${bandeja}:`, error);
    throw error;
  }
};

// Exportar todas las funciones
const mensajeService = {
  buscarDestinatarios,
  buscarDestinatariosParaAcudiente,
  enviarMensaje,
  enviarMensajeMasivo,
  obtenerCursosDisponibles,
  obtenerMensajes,
  obtenerMensajePorId,
  responderMensaje,
  // Nuevas funciones para estados de mensajes
  archivarMensaje,
  desarchivarMensaje,
  eliminarMensaje,
  restaurarMensaje,
  eliminarDefinitivamente,
  // Funciones para borradores
  guardarBorrador,
  obtenerBorradores,
  obtenerBorrador,
  enviarBorrador,
  eliminarBorrador,
  // Funciones nuevas
  marcarComoLeido,
  descargarAdjunto,
  verificarEstadoMensajeParaUsuario,
};

export default mensajeService;
