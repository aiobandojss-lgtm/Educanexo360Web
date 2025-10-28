// src/services/tareaService.ts
import axios from "../api/axiosConfig";
import { AxiosRequestConfig } from "axios";
import API_ROUTES from "../constants/apiRoutes";
import {
  TareaInput,
  TareaFilters,
  EntregarTareaInput,
  CalificarEntregaInput,
} from "../types/tarea.types";

interface ListarTareasParams {
  pagina?: number;
  limite?: number;
  estado?: string;
  prioridad?: string;
  cursoId?: string;
  asignaturaId?: string;
  docenteId?: string;
  busqueda?: string;
  filtro?: string;
}

const tareaService = {
  /**
   * ==========================================
   * GESTIÓN DE TAREAS (CRUD)
   * ==========================================
   */

  /**
   * Crear una nueva tarea
   */
  crearTarea: async (tareaData: TareaInput) => {
    const response = await axios.post(API_ROUTES.TAREAS.CREATE, tareaData);
    return response.data;
  },

  /**
   * Listar tareas con filtros
   */
  listarTareas: async (params: ListarTareasParams = {}) => {
    const config: AxiosRequestConfig = {
      params,
    };
    const response = await axios.get(API_ROUTES.TAREAS.GET_ALL, config);
    return response.data;
  },

  /**
   * Obtener una tarea específica por ID
   */
  obtenerTarea: async (id: string) => {
    const response = await axios.get(API_ROUTES.TAREAS.GET_BY_ID(id));
    return response.data;
  },

  /**
   * Actualizar una tarea existente
   */
  actualizarTarea: async (id: string, tareaData: Partial<TareaInput>) => {
    const response = await axios.put(
      API_ROUTES.TAREAS.UPDATE(id),
      tareaData
    );
    return response.data;
  },

  /**
   * Eliminar una tarea
   */
  eliminarTarea: async (id: string) => {
    const response = await axios.delete(API_ROUTES.TAREAS.DELETE(id));
    return response.data;
  },

  /**
   * Cerrar una tarea (no permite más entregas)
   */
  cerrarTarea: async (id: string) => {
    const response = await axios.patch(API_ROUTES.TAREAS.CERRAR(id));
    return response.data;
  },

  /**
   * ==========================================
   * ARCHIVOS DE REFERENCIA (MATERIAL DOCENTE)
   * ==========================================
   */

  /**
   * Subir archivos de referencia a una tarea
   */
  subirArchivosReferencia: async (tareaId: string, archivos: File[]) => {
    const formData = new FormData();

    archivos.forEach((archivo) => {
      formData.append("archivos", archivo);
    });

    const response = await axios.post(
      API_ROUTES.TAREAS.SUBIR_ARCHIVOS_REF(tareaId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Eliminar un archivo de referencia
   */
  eliminarArchivoReferencia: async (tareaId: string, archivoId: string) => {
    const response = await axios.delete(
      API_ROUTES.TAREAS.ELIMINAR_ARCHIVO_REF(tareaId, archivoId)
    );
    return response.data;
  },

  /**
   * Descargar archivo (referencia o entrega)
   */
  descargarArchivo: async (
    tareaId: string,
    archivoId: string,
    tipo: "referencia" | "entrega" = "referencia"
  ) => {
    const response = await axios.get(
      `${API_ROUTES.TAREAS.DESCARGAR_ARCHIVO(tareaId, archivoId)}?tipo=${tipo}`,
      {
        responseType: "blob", // Crucial para archivos binarios
      }
    );
    return response.data;
  },

  /**
   * Obtener URL de descarga de archivo
   */
  obtenerUrlArchivo: (
    tareaId: string,
    archivoId: string,
    tipo: "referencia" | "entrega" = "referencia"
  ) => {
    const baseUrl = process.env.REACT_APP_API_URL || "";
    return `${baseUrl}${API_ROUTES.TAREAS.DESCARGAR_ARCHIVO(
      tareaId,
      archivoId
    )}?tipo=${tipo}`;
  },

  /**
   * ==========================================
   * ENTREGAS (ESTUDIANTES)
   * ==========================================
   */

  /**
   * Marcar tarea como vista (estudiante)
   */
  marcarVista: async (tareaId: string) => {
    const response = await axios.patch(
      API_ROUTES.TAREAS.MARCAR_VISTA(tareaId)
    );
    return response.data;
  },

  /**
   * Entregar una tarea con archivos
   */
  entregarTarea: async (
    tareaId: string,
    entregaData: EntregarTareaInput,
    archivos: File[]
  ) => {
    const formData = new FormData();

    // Agregar comentario si existe
    if (entregaData.comentarioEstudiante) {
      formData.append("comentarioEstudiante", entregaData.comentarioEstudiante);
    }

    // Agregar archivos
    archivos.forEach((archivo) => {
      formData.append("archivos", archivo);
    });

    const response = await axios.post(
      API_ROUTES.TAREAS.ENTREGAR(tareaId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Ver mi propia entrega (estudiante)
   */
  verMiEntrega: async (tareaId: string) => {
    const response = await axios.get(API_ROUTES.TAREAS.MI_ENTREGA(tareaId));
    return response.data;
  },

  /**
   * ==========================================
   * CALIFICACIONES (DOCENTE)
   * ==========================================
   */

  /**
   * Ver todas las entregas de una tarea (docente)
   */
  verEntregas: async (tareaId: string) => {
    const response = await axios.get(API_ROUTES.TAREAS.VER_ENTREGAS(tareaId));
    return response.data;
  },

  /**
   * Calificar una entrega
   */
  calificarEntrega: async (
    tareaId: string,
    entregaId: string,
    calificacionData: CalificarEntregaInput
  ) => {
    const response = await axios.put(
      API_ROUTES.TAREAS.CALIFICAR(tareaId, entregaId),
      calificacionData
    );
    return response.data;
  },

  /**
   * ==========================================
   * VISTAS ESPECIALES
   * ==========================================
   */

  /**
   * Mis tareas (estudiante) con filtros opcionales
   */
  misTareas: async (filtro?: "pendientes" | "entregadas" | "calificadas") => {
    const params: any = {};
    if (filtro) {
      params.filtro = filtro;
    }

    const config: AxiosRequestConfig = { params };
    const response = await axios.get(API_ROUTES.TAREAS.MIS_TAREAS, config);
    return response.data;
  },

  /**
   * Tareas de un estudiante específico (acudiente)
   */
  tareasEstudiante: async (estudianteId: string) => {
    const response = await axios.get(
      API_ROUTES.TAREAS.TAREAS_ESTUDIANTE(estudianteId)
    );
    return response.data;
  },

  /**
   * Estadísticas generales de tareas
   */
  estadisticas: async () => {
    const response = await axios.get(API_ROUTES.TAREAS.ESTADISTICAS);
    return response.data;
  },

  /**
   * Tareas próximas a vencer (3 días)
   */
  proximasVencer: async () => {
    const response = await axios.get(API_ROUTES.TAREAS.PROXIMAS_VENCER);
    return response.data;
  },
};

export default tareaService;