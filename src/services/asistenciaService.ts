// src/services/asistenciaService.ts
import axiosInstance from "../api/axiosConfig";
import { format } from "date-fns";

// Constantes para los tipos de asistencia
export const ESTADOS_ASISTENCIA = {
  PRESENTE: "PRESENTE",
  AUSENTE: "AUSENTE",
  TARDANZA: "TARDANZA", // Aquí estamos unificando con TARDE que aparece en algunos componentes
  JUSTIFICADO: "JUSTIFICADO",
  PERMISO: "PERMISO",
};

export const TIPOS_SESION = {
  CLASE: "CLASE",
  ACTIVIDAD: "ACTIVIDAD",
  EVENTO: "EVENTO",
  OTRO: "OTRO",
};

// Interfaces
export interface EstudianteAsistencia {
  estudianteId: string;
  nombre?: string;
  apellidos?: string;
  estado: string;
  justificacion?: string;
  observaciones?: string;
}

export interface RegistroAsistencia {
  _id?: string;
  fecha: string | Date;
  cursoId: string;
  cursoNombre?: string;
  asignaturaId?: string;
  asignaturaNombre?: string;
  docenteId?: string;
  docenteNombre?: string;
  periodoId?: string;
  tipoSesion: string;
  horaInicio: string;
  horaFin: string;
  estudiantes: EstudianteAsistencia[];
  observacionesGenerales?: string;
  finalizado?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Obtener registros de asistencia con filtros
export const obtenerRegistrosAsistencia = async (
  fechaInicio?: string,
  fechaFin?: string,
  cursoId?: string,
  asignaturaId?: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    let url = "/asistencia?";

    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;
    if (cursoId) url += `cursoId=${cursoId}&`;
    if (asignaturaId) url += `asignaturaId=${asignaturaId}&`;

    url += `page=${page}&limit=${limit}`;

    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener registros de asistencia:", error);
    throw error;
  }
};

// Obtener un registro específico
export const obtenerRegistroAsistencia = async (id: string) => {
  try {
    const response = await axiosInstance.get(`/asistencia/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener registro de asistencia:", error);
    throw error;
  }
};

// Crear un nuevo registro
export const crearRegistroAsistencia = async (registro: RegistroAsistencia) => {
  try {
    // Formatear fecha si es necesario
    if (registro.fecha instanceof Date) {
      registro.fecha = format(registro.fecha, "yyyy-MM-dd");
    }

    const response = await axiosInstance.post("/asistencia", registro);
    return response.data.data;
  } catch (error) {
    console.error("Error al crear registro de asistencia:", error);
    throw error;
  }
};

// Actualizar registro
export const actualizarRegistroAsistencia = async (
  id: string,
  registro: Partial<RegistroAsistencia>
) => {
  try {
    // Formatear fecha si es necesario
    if (registro.fecha instanceof Date) {
      registro.fecha = format(registro.fecha, "yyyy-MM-dd");
    }

    const response = await axiosInstance.put(`/asistencia/${id}`, registro);
    return response.data.data;
  } catch (error) {
    console.error("Error al actualizar registro de asistencia:", error);
    throw error;
  }
};

// Finalizar registro
export const finalizarRegistroAsistencia = async (id: string) => {
  try {
    const response = await axiosInstance.patch(
      `/asistencia/${id}/finalizar`,
      {}
    );
    return response.data.data;
  } catch (error) {
    console.error("Error al finalizar registro de asistencia:", error);
    throw error;
  }
};

// Eliminar registro
export const eliminarRegistroAsistencia = async (id: string) => {
  try {
    const response = await axiosInstance.delete(`/asistencia/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error al eliminar registro de asistencia:", error);
    throw error;
  }
};

// Obtener estadísticas por curso
export const obtenerEstadisticasPorCurso = async (
  cursoId: string,
  fechaInicio?: string,
  fechaFin?: string
) => {
  try {
    let url = `/asistencia/estadisticas/curso/${cursoId}?`;

    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}`;

    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener estadísticas por curso:", error);
    throw error;
  }
};

// Obtener asistencia por día
export const obtenerAsistenciaPorDia = async (
  fecha: string,
  cursoId?: string
) => {
  try {
    let url = `/asistencia/dia?fecha=${fecha}`;
    if (cursoId) url += `&cursoId=${cursoId}`;

    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener asistencia por día:", error);
    throw error;
  }
};

// Obtener cursos disponibles
export const obtenerCursosDisponibles = async () => {
  try {
    // No es necesario añadir prefijos explícitamente, axiosConfig ya lo hace por nosotros
    const response = await axiosInstance.get("/cursos");
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener cursos:", error);
    throw error;
  }
};

// Obtener asignaturas por curso
export const obtenerAsignaturasPorCurso = async (cursoId: string) => {
  try {
    // Usar la ruta correcta para obtener asignaturas por curso
    const response = await axiosInstance.get(`/asignaturas/curso/${cursoId}`);
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener asignaturas por curso:", error);
    throw error;
  }
};

// Obtener estudiantes por curso
export const obtenerEstudiantesPorCurso = async (cursoId: string) => {
  try {
    // Usar la ruta correcta para obtener estudiantes por curso
    const response = await axiosInstance.get(`/cursos/${cursoId}/estudiantes`);
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener estudiantes por curso:", error);
    throw error;
  }
};

/**
 * Genera y descarga un reporte de asistencia en formato PDF o Excel
 * @param asistenciaId ID del registro de asistencia
 * @param formato 'pdf' o 'excel'
 */
export const descargarReporteAsistencia = async (
  asistenciaId: string,
  formato: "pdf" | "excel" = "pdf"
) => {
  try {
    // 1. Obtener los datos del registro de asistencia
    const asistencia = await obtenerRegistroAsistencia(asistenciaId);

    // 2. Determinar el tipo de descarga según el formato solicitado
    if (formato === "pdf") {
      return generarPDFAsistencia(asistencia);
    } else {
      return generarExcelAsistencia(asistencia);
    }
  } catch (error) {
    console.error("Error al descargar reporte:", error);
    throw error;
  }
};

/**
 * Genera un archivo PDF con el reporte de asistencia
 */
const generarPDFAsistencia = async (asistencia: any) => {
  try {
    // Aquí usaríamos una biblioteca como jsPDF, pero por simplicidad,
    // creamos una versión CSV y la descargamos

    // Crear encabezado del reporte
    const fechaStr = new Date(asistencia.fecha).toLocaleDateString();
    const titulo = `Reporte de Asistencia - ${
      asistencia.cursoNombre || "Curso"
    } - ${fechaStr}`;

    // Crear contenido CSV
    let csv = `${titulo}\n\n`;
    csv += `Fecha:,${fechaStr}\n`;
    csv += `Curso:,${asistencia.cursoNombre || ""}\n`;
    csv += `Asignatura:,${asistencia.asignaturaNombre || ""}\n`;
    csv += `Hora:,${asistencia.horaInicio || ""} - ${
      asistencia.horaFin || ""
    }\n`;
    csv += `Tipo de Sesión:,${asistencia.tipoSesion || ""}\n`;
    csv += `Observaciones:,${asistencia.observacionesGenerales || ""}\n\n`;

    // Cabecera de la tabla de estudiantes
    csv += "N°,Estudiante,Estado,Observaciones\n";

    // Filas de estudiantes
    asistencia.estudiantes.forEach((est: any, index: number) => {
      const nombreCompleto = `${est.nombre || ""} ${est.apellidos || ""}`;
      csv += `${index + 1},${nombreCompleto},${est.estado},${
        est.observaciones || ""
      }\n`;
    });

    // Estadísticas
    const presentes = asistencia.estudiantes.filter(
      (est: any) => est.estado === "PRESENTE"
    ).length;
    const ausentes = asistencia.estudiantes.filter(
      (est: any) => est.estado === "AUSENTE"
    ).length;
    const tardanzas = asistencia.estudiantes.filter(
      (est: any) => est.estado === "TARDANZA"
    ).length;
    const justificados = asistencia.estudiantes.filter(
      (est: any) => est.estado === "JUSTIFICADO"
    ).length;
    const permisos = asistencia.estudiantes.filter(
      (est: any) => est.estado === "PERMISO"
    ).length;

    csv += `\nResumen:\n`;
    csv += `Presentes:,${presentes}\n`;
    csv += `Ausentes:,${ausentes}\n`;
    csv += `Tardanzas:,${tardanzas}\n`;
    csv += `Justificados:,${justificados}\n`;
    csv += `Permisos:,${permisos}\n`;

    // Crear blob y descargar
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `asistencia_${fechaStr.replace(/\//g, "-")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Error al generar PDF:", error);
    throw error;
  }
};

/**
 * Genera un archivo Excel con el reporte de asistencia
 */
/**
 * Genera un archivo Excel con el reporte de asistencia
 */
const generarExcelAsistencia = async (asistencia: any) => {
  // Implementación similar a PDF pero utilizando SheetJS o similar
  // Por ahora simplemente llamamos a la función de CSV
  return generarPDFAsistencia(asistencia);
};

// Resumen de asistencia para informes
export const obtenerResumenAsistencia = async (
  fechaInicio?: string,
  fechaFin?: string,
  cursoId?: string
) => {
  try {
    let url = "/asistencia/resumen?";

    if (fechaInicio) url += `fechaInicio=${fechaInicio}&`;
    if (fechaFin) url += `fechaFin=${fechaFin}&`;
    if (cursoId) url += `cursoId=${cursoId}`;

    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error("Error al obtener resumen de asistencia:", error);
    throw error;
  }
};

export default {
  obtenerRegistrosAsistencia,
  obtenerRegistroAsistencia,
  crearRegistroAsistencia,
  actualizarRegistroAsistencia,
  finalizarRegistroAsistencia,
  eliminarRegistroAsistencia,
  obtenerEstadisticasPorCurso,
  obtenerAsistenciaPorDia,
  obtenerCursosDisponibles,
  obtenerAsignaturasPorCurso,
  obtenerEstudiantesPorCurso,
  obtenerResumenAsistencia,
  descargarReporteAsistencia, // Añadimos la nueva función aquí
  ESTADOS_ASISTENCIA,
  TIPOS_SESION,
};
