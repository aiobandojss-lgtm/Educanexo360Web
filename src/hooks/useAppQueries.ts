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

// ─────────────────────────────────────────────
// CLAVES DE CACHÉ (evitar strings duplicados)
// ─────────────────────────────────────────────
export const QUERY_KEYS = {
  DASHBOARD_STATS: ["dashboard-stats"],
  ESCUELA: (id: string) => ["escuela", id],
  CURSOS: ["cursos"],
  CURSO_DETALLE: (id: string) => ["curso", id],
  USUARIOS: (tipo?: string) => ["usuarios", tipo ?? "todos"],
  ANUNCIOS: ["anuncios"],
  EVENTOS: ["eventos"],
  TAREAS: ["tareas"],
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
