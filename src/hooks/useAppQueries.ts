// src/hooks/useAppQueries.ts
// Hooks de caché con @tanstack/react-query v5 para los datos más frecuentemente consultados.
// Uso: reemplaza useState + useEffect + llamada directa al servicio en componentes.
//
// Ejemplo de adopción:
//   ANTES:  const [cursos, setCursos] = useState([]); useEffect(() => { fetchCursos()... }, []);
//   AHORA:  const { data: cursos = [], isLoading } = useCursos();

import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import dashboardService from "../services/dashboardService";
import tareaService from "../services/tareaService";
import escuelaService from "../services/escuelaService";
import cursoService from "../services/cursoService";
import usuarioService from "../services/usuarioService";
import anuncioService from "../services/anuncioService";
import calendarioService from "../services/calendarioService";
import invitacionService from "../services/invitacionService";
import asignaturaService from "../services/asignaturaService";
import mensajeService from "../services/mensajeService";
import asistenciaService from "../services/asistenciaService";
import axiosInstance from "../api/axiosConfig";
import { extraerIdComoString } from "../utils/mongoUtils";
import API_ROUTES from "../constants/apiRoutes";

// ─────────────────────────────────────────────
// CLAVES DE CACHÉ (evitar strings duplicados)
// ─────────────────────────────────────────────
export const QUERY_KEYS = {
  DASHBOARD_STATS: ["dashboard-stats"],
  ESCUELA: (id: string) => ["escuela", id],
  CURSOS: ["cursos"],
  CURSO_DETALLE: (id: string) => ["curso", id],
  CURSO_ESTUDIANTES: (id: string) => ["curso-estudiantes", id],
  CURSO_ASIGNATURAS: (id: string) => ["curso-asignaturas", id],
  USUARIOS: (tipo?: string) => ["usuarios", tipo ?? "todos"],
  ANUNCIOS: ["anuncios"],
  EVENTOS: ["eventos"],
  TAREAS: ["tareas"],
  INVITACIONES: (pagina: number, limite: number, estado: string) => ["invitaciones", pagina, limite, estado],
  MENSAJES: (bandeja: string, userId: string) => ["mensajes", bandeja, userId],
  ASISTENCIA_CURSOS: ["asistencia-cursos"],
  ASISTENCIA_RESUMEN: (inicio: string, fin: string, curso: string) => ["asistencia-resumen", inicio, fin, curso],
  DETALLE_TAREA: (id: string, rol: string) => ["tarea-detalle", id, rol],
  MIS_TAREAS: (key: string) => ["mis-tareas", key],
} as const;

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

/** Estadísticas del panel principal. Caché de 2 minutos — refresca en background. */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_STATS,
    queryFn: () => dashboardService.obtenerEstadisticas(),
    staleTime: 1000 * 60 * 2,
  });
};

/** Datos de la escuela del usuario autenticado. */
export const useEscuela = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const escuelaId = user?.escuelaId ?? "";

  return useQuery({
    queryKey: QUERY_KEYS.ESCUELA(escuelaId),
    queryFn: () => escuelaService.obtenerPorId(escuelaId),
    enabled: !!escuelaId,
    staleTime: 1000 * 60 * 10, // 10 minutos — cambia poco
  });
};

// ─────────────────────────────────────────────
// CURSOS
// ─────────────────────────────────────────────

/** Lista de cursos. Caché de 5 minutos. */
export const useCursos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.CURSOS,
    queryFn: () => cursoService.obtenerCursos(),
    staleTime: 1000 * 60 * 5,
  });
};

/** Detalle de un curso por ID. */
export const useCurso = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CURSO_DETALLE(id),
    queryFn: () => cursoService.obtenerCursoPorId(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// ─────────────────────────────────────────────
// USUARIOS
// ─────────────────────────────────────────────

/** Lista de usuarios, opcionalmente filtrada por tipo. */
export const useUsuarios = (tipo?: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.USUARIOS(tipo),
    queryFn: () => usuarioService.obtenerUsuarios(tipo ? { tipo } : {}),
    staleTime: 1000 * 60 * 3,
  });
};

// ─────────────────────────────────────────────
// ANUNCIOS
// ─────────────────────────────────────────────

/** Lista de anuncios activos (sin filtros, para uso general). */
export const useAnuncios = () => {
  return useQuery({
    queryKey: QUERY_KEYS.ANUNCIOS,
    queryFn: () => anuncioService.listarAnuncios(),
    staleTime: 1000 * 60 * 3,
  });
};

/** Lista de anuncios con filtros y paginación dinámica.
 *  El queryKey incluye los filtros para que react-query diferencie cada combinación. */
export const useAnunciosFiltrados = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.ANUNCIOS, params],
    queryFn: () => anuncioService.listarAnuncios(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev, // Mantiene datos anteriores mientras carga la nueva página
  });
};

// ─────────────────────────────────────────────
// CALENDARIO
// ─────────────────────────────────────────────

/** Eventos del mes actual y el siguiente. */
export const useEventos = () => {
  const hoy = new Date();
  const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
  const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0).toISOString();

  return useQuery({
    queryKey: QUERY_KEYS.EVENTOS,
    queryFn: () => calendarioService.obtenerEventos({ inicio, fin }),
    staleTime: 1000 * 60 * 5,
  });
};

// ─────────────────────────────────────────────
// TAREAS
// ─────────────────────────────────────────────

/** Lista de tareas con filtros y paginación dinámica. */
export const useTareasFiltradas = (params: Record<string, unknown>) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.TAREAS, params],
    queryFn: () => tareaService.listarTareas(params),
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
};

// ─────────────────────────────────────────────
// INVITACIONES
// ─────────────────────────────────────────────

/** Lista de invitaciones paginada. Resuelve cursos asociados en paralelo (fix N+1). */
export const useInvitaciones = (pagina: number, limite: number, estadoFiltro: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVITACIONES(pagina, limite, estadoFiltro),
    queryFn: async () => {
      const resp = await invitacionService.obtenerInvitaciones(
        pagina,
        limite,
        estadoFiltro || undefined
      );
      const invitaciones = resp?.invitaciones || [];

      // Recolectar IDs de cursos únicos
      const cursosIds = Array.from(
        new Set(
          invitaciones
            .filter((inv: any) => inv.cursoId)
            .map((inv: any) => extraerIdComoString(inv.cursoId))
            .filter((id: string) => id && id.length > 0)
        )
      ) as string[];

      // Cargar todos los cursos en paralelo (fix del N+1)
      const cursosInfo: { [key: string]: any } = {};
      if (cursosIds.length > 0) {
        const resultados = await Promise.allSettled(
          cursosIds.map((id) => cursoService.obtenerCursoPorId(id))
        );
        cursosIds.forEach((id, index) => {
          const resultado = resultados[index];
          cursosInfo[id] = resultado.status === "fulfilled"
            ? resultado.value
            : { nombre: "No disponible", grado: "", seccion: "", grupo: "" };
        });
      }

      return { invitaciones, total: resp?.total || 0, cursosInfo };
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: (prev) => prev,
  });
};

// ─────────────────────────────────────────────
// DETALLE DE CURSO (estudiantes y asignaturas)
// ─────────────────────────────────────────────

/** Estudiantes de un curso. */
export const useCursoEstudiantes = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CURSO_ESTUDIANTES(id),
    queryFn: () => cursoService.obtenerEstudiantesCurso(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/** Asignaturas de un curso con info de docentes resuelta en una sola petición batch. */
export const useCursoAsignaturas = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.CURSO_ASIGNATURAS(id),
    queryFn: async () => {
      const response = await asignaturaService.obtenerAsignaturas({ cursoId: id, expand: "docente" });
      if (!response.success) return [];

      let asignaturasData: any[] = response.data || [];

      // Recolectar IDs únicos de docentes
      const docenteIds = Array.from(new Set(
        asignaturasData
          .map((a: any) => a.docenteId || (typeof a.docente === "string" ? a.docente : a.docente?._id))
          .filter(Boolean)
      )) as string[];

      // Una sola petición batch para todos los docentes
      if (docenteIds.length > 0) {
        try {
          const respuesta = await axiosInstance.get("/api/usuarios", {
            params: { ids: docenteIds.join(","), tipo: "DOCENTE" },
          });
          if (respuesta.data?.success && respuesta.data.data) {
            const docentesMap = new Map<string, any>(
              respuesta.data.data.map((d: any) => [d._id, d])
            );
            asignaturasData = asignaturasData.map((a: any) => {
              const docenteId = a.docenteId || (typeof a.docente === "string" ? a.docente : a.docente?._id);
              const docenteInfo = docenteId ? docentesMap.get(docenteId) : null;
              return { ...a, docente: docenteInfo || a.docente || { _id: "", nombre: "No asignado", apellidos: "" } };
            });
          }
        } catch {
          // Si falla, se muestran los datos sin info de docente
        }
      }

      return asignaturasData.map((a: any) => ({
        ...a,
        docente: a.docente || { _id: "", nombre: "No asignado", apellidos: "" },
      }));
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/** Eventos de un mes específico con filtros opcionales.
 *  Cada combinación mes+año+filtros tiene su propia entrada en caché. */
export const useEventosMes = (
  month: number,
  year: number,
  filtros?: { tipo?: string; estado?: string }
) => {
  const inicio = new Date(year, month, 1).toISOString();
  const fin = new Date(year, month + 1, 0).toISOString();

  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTOS, year, month, filtros?.tipo, filtros?.estado],
    queryFn: () =>
      calendarioService.obtenerEventos({
        inicio,
        fin,
        ...(filtros?.tipo && { tipo: filtros.tipo }),
        ...(filtros?.estado && { estado: filtros.estado }),
      }),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev, // Mantiene el mes anterior visible mientras carga
  });
};

// ─────────────────────────────────────────────
// MENSAJES
// ─────────────────────────────────────────────

/** Mensajes de una bandeja. Caché de 1 minuto (alta frecuencia de cambios). */
export const useMensajes = (bandeja: string, userId: string, puedeTenerBorradores: boolean) => {
  return useQuery({
    queryKey: QUERY_KEYS.MENSAJES(bandeja, userId),
    queryFn: () => {
      if (bandeja === "borradores" && puedeTenerBorradores) {
        return mensajeService.obtenerBorradores();
      }
      return mensajeService.obtenerMensajes(bandeja, 1, 20, userId);
    },
    staleTime: 1000 * 60 * 1,
    enabled: !!userId,
  });
};

// ─────────────────────────────────────────────
// ASISTENCIA
// ─────────────────────────────────────────────

/** Cursos disponibles para registro de asistencia. Caché de 10 minutos. */
export const useAsistenciaCursos = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return useQuery({
    queryKey: QUERY_KEYS.ASISTENCIA_CURSOS,
    queryFn: () => asistenciaService.obtenerCursosDisponibles(),
    staleTime: 1000 * 60 * 10,
    enabled: !!user,
  });
};

/** Resumen de asistencia filtrado por rango de fechas y curso. */
export const useResumenAsistencia = (
  fechaInicio: string,
  fechaFin: string,
  cursoSeleccionado: string,
  userTipo: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.ASISTENCIA_RESUMEN(fechaInicio, fechaFin, cursoSeleccionado),
    queryFn: () =>
      asistenciaService.obtenerResumenAsistencia(fechaInicio, fechaFin, cursoSeleccionado),
    staleTime: 1000 * 60 * 2,
    enabled: !!(cursoSeleccionado || ["ADMIN", "DOCENTE"].includes(userTipo)),
  });
};

// ─────────────────────────────────────────────
// DETALLE DE TAREA
// ─────────────────────────────────────────────

/** Detalle completo de una tarea: datos + entrega del estudiante o lista de entregas del docente. */
export const useDetalleTarea = (id: string, esEstudiante: boolean, esDocente: boolean) => {
  const rol = esEstudiante ? "estudiante" : esDocente ? "docente" : "otro";
  return useQuery({
    queryKey: QUERY_KEYS.DETALLE_TAREA(id, rol),
    queryFn: async () => {
      const tareaRes = await tareaService.obtenerTarea(id);
      const tarea = tareaRes.data;

      let miEntrega = null;
      let entregas: any[] = [];

      if (esEstudiante) {
        try { await tareaService.marcarVista(id); } catch {}
        try {
          const entregaRes = await tareaService.verMiEntrega(id);
          miEntrega = entregaRes.data;
        } catch {}
      }

      if (esDocente) {
        try {
          const entregasRes = await tareaService.verEntregas(id);
          entregas = entregasRes.data || [];
        } catch {}
      }

      return { tarea, miEntrega, entregas };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

// ─────────────────────────────────────────────
// MIS TAREAS (ESTUDIANTE / ACUDIENTE)
// ─────────────────────────────────────────────

/** Tareas del estudiante actual o de un hijo (acudiente). Incluye info del estudiante si aplica. */
export const useMisTareas = (
  estudianteId: string | undefined,
  userId: string | undefined,
  esVistaAcudiente: boolean,
  userTipo: string
) => {
  const key = esVistaAcudiente ? `acudiente-${estudianteId}` : `estudiante-${userId}`;
  return useQuery({
    queryKey: QUERY_KEYS.MIS_TAREAS(key),
    queryFn: async () => {
      let estudianteInfo = null;
      let tareasData: any[] = [];

      if (esVistaAcudiente && estudianteId) {
        try {
          const response = await axiosInstance.get(API_ROUTES.USUARIOS.GET_BY_ID(estudianteId));
          estudianteInfo =
            response.data.success && response.data.data
              ? response.data.data
              : response.data.data || response.data;
        } catch {}
        const response = await tareaService.tareasEstudiante(estudianteId);
        tareasData = response.data || [];
      } else if (userTipo === "ESTUDIANTE") {
        const response = await tareaService.misTareas();
        tareasData = response.data || [];
      }

      return { tareasData, estudianteInfo };
    },
    enabled: esVistaAcudiente ? !!estudianteId : !!(userId && userTipo === "ESTUDIANTE"),
    staleTime: 1000 * 60 * 2,
  });
};
