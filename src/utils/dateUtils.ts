// src/utils/dateUtils.ts
// Utilidades para el manejo de fechas y zonas horarias

/**
 * Convierte una fecha ISO en formato UTC a una fecha local
 * @param isoDate Fecha en formato ISO (UTC)
 * @returns Date objeto con la fecha en zona horaria local
 */
export const utcToLocalDate = (isoDate: string): Date => {
  return new Date(isoDate);
};

/**
 * Determina si un evento ocurre en una fecha específica
 * @param eventStartISO Fecha de inicio del evento (ISO)
 * @param eventEndISO Fecha de fin del evento (ISO)
 * @param dayDate Fecha del día a verificar
 * @param isAllDay Si el evento es de todo el día
 * @returns true si el evento ocurre en la fecha especificada
 */
export const eventOccursOnDate = (
  eventStartISO: string,
  eventEndISO: string,
  dayDate: Date,
  isAllDay: boolean
): boolean => {
  // Convertir fechas ISO a objetos Date (zona horaria local)
  const eventStart = new Date(eventStartISO);
  const eventEnd = new Date(eventEndISO || eventStartISO);

  // Crear objeto Date para el inicio y fin del día seleccionado
  const dayStart = new Date(dayDate);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayDate);
  dayEnd.setHours(23, 59, 59, 999);

  if (isAllDay) {
    // Para eventos de todo el día, comparar solo las fechas (sin hora)
    const startDay = new Date(eventStart);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(eventEnd);
    endDay.setHours(0, 0, 0, 0);

    // Verificar si el día seleccionado está dentro del rango de fechas del evento
    return startDay <= dayStart && endDay >= dayStart;
  } else {
    // Para eventos con hora específica, verificar si ocurre durante el día seleccionado
    const startsOnDay = eventStart >= dayStart && eventStart <= dayEnd;
    const endsOnDay = eventEnd >= dayStart && eventEnd <= dayEnd;
    const spansDay = eventStart <= dayStart && eventEnd >= dayEnd;

    return startsOnDay || endsOnDay || spansDay;
  }
};

/**
 * Formatea una fecha ISO para mostrarla en la interfaz de usuario
 * @param isoDate Fecha en formato ISO
 * @param format Formato deseado ('date', 'time', 'datetime')
 * @returns Cadena formateada en el idioma local
 */
export const formatDate = (
  isoDate: string,
  format: "date" | "time" | "datetime" = "datetime"
): string => {
  if (!isoDate) return "";

  try {
    const date = new Date(isoDate);

    switch (format) {
      case "date":
        return date.toLocaleDateString();
      case "time":
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "datetime":
      default:
        return date.toLocaleString();
    }
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return "";
  }
};

/**
 * Obtiene la fecha local de un evento para mostrar en el calendario
 * @param evento Evento del calendario
 * @returns Objeto con fechaInicio y fechaFin como objetos Date locales
 */
export const getLocalEventDates = (evento: any) => {
  return {
    fechaInicio: new Date(evento.fechaInicio),
    fechaFin: new Date(evento.fechaFin || evento.fechaInicio),
  };
};

/**
 * Ajusta una fecha ISO para que sea consistente con la zona horaria local
 * Útil cuando quieres preservar el día del mes al enviar al backend
 * @param dateObj Objeto Date local
 * @returns Cadena ISO ajustada para preservar la fecha local
 */
export const getLocalAwareISOString = (dateObj: Date): string => {
  // Esta función es útil para preservar el día del mes cuando se envía al backend
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  // Crear una fecha UTC con los mismos componentes (no la misma hora absoluta)
  const utcDate = new Date(Date.UTC(year, month, day, hours, minutes, 0, 0));
  return utcDate.toISOString();
};

/**
 * Debug helper para mostrar información de una fecha en consola
 */
export const debugDate = (label: string, date: Date | string) => {
  if (typeof date === "string") {
    date = new Date(date);
  }

  console.group(`Debug: ${label}`);
  console.log("Date object:", date);
  console.log("ISO String:", date.toISOString());
  console.log("Local string:", date.toString());
  console.log("getDate():", date.getDate());
  console.log("getMonth():", date.getMonth());
  console.log("getFullYear():", date.getFullYear());
  console.log("getHours():", date.getHours());
  console.log("getTimezoneOffset():", date.getTimezoneOffset());
  console.groupEnd();
};

// === NUEVAS FUNCIONES AGREGADAS ===

/**
 * Crear fecha en zona horaria local (Colombia)
 * Útil para crear eventos en la fecha correcta
 */
export const createLocalDate = (
  year: number,
  month: number,
  day: number,
  hours = 12,
  minutes = 0
): Date => {
  const fecha = new Date(year, month, day, hours, minutes, 0);
  debugDate("Fecha creada local", fecha);
  return fecha;
};

/**
 * Formatear fecha para input type="date"
 */
export const formatDateForInput = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    console.warn("Fecha inválida:", date);
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Formatear hora para input type="time"
 */
export const formatTimeForInput = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return "12:00";
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

/**
 * Crear fecha de evento manteniendo zona horaria local
 */
export const createEventDate = (
  dateString: string,
  timeString: string = "12:00",
  isAllDay: boolean = false
): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  const [hours, minutes] = timeString.split(":").map(Number);

  const finalHours = isAllDay ? 12 : hours;
  const finalMinutes = isAllDay ? 0 : minutes;

  const fecha = new Date(year, month - 1, day, finalHours, finalMinutes, 0);

  console.log("=== CREAR FECHA EVENTO ===");
  console.log("Input:", { dateString, timeString, isAllDay });
  console.log("Resultado:", fecha.toString());
  console.log("ISO:", fecha.toISOString());
  console.log("===========================");

  return fecha;
};
