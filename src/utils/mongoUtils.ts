// src/utils/mongoUtils.ts
/**
 * Utilidades para manejar ObjectIds de MongoDB en el frontend
 */

/**
 * Extrae un ID como string desde diferentes formatos de ObjectId
 * @param id - Puede ser string, ObjectId, o cualquier objeto con _id o $oid
 * @returns string - El ID como string limpio
 */
export const extraerIdComoString = (id: any): string => {
  if (!id) return "";

  // Si ya es string, devolverlo
  if (typeof id === "string") return id;

  // Si es un objeto con _id
  if (typeof id === "object" && id._id) {
    return typeof id._id === "string" ? id._id : id._id.toString();
  }

  // Si es un objeto con $oid (formato MongoDB)
  if (typeof id === "object" && id.$oid) {
    return id.$oid;
  }

  // Si tiene método toString
  if (id.toString && typeof id.toString === "function") {
    return id.toString();
  }

  // Fallback
  return String(id);
};

/**
 * Extrae múltiples IDs de un array, filtrando los vacíos
 * @param items - Array de elementos con IDs
 * @param idField - Campo que contiene el ID (default: '_id')
 * @returns string[] - Array de IDs como strings únicos
 */
export const extraerIdsComoStrings = (
  items: any[],
  idField: string = "_id"
): string[] => {
  return Array.from(
    new Set(
      items
        .filter((item) => item && item[idField])
        .map((item) => extraerIdComoString(item[idField]))
        .filter((id) => id && id.length > 0)
    )
  );
};

/**
 * Valida si un string es un ObjectId válido de MongoDB
 * @param id - String a validar
 * @returns boolean - true si es un ObjectId válido
 */
export const esObjectIdValido = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Crea un objeto de mapeo desde un array de elementos
 * @param items - Array de elementos
 * @param keyField - Campo que se usará como clave (default: '_id')
 * @returns object - Objeto con IDs como claves
 */
export const crearMapaPorId = (
  items: any[],
  keyField: string = "_id"
): { [key: string]: any } => {
  const mapa: { [key: string]: any } = {};

  items.forEach((item) => {
    if (item && item[keyField]) {
      const id = extraerIdComoString(item[keyField]);
      if (id) {
        mapa[id] = item;
      }
    }
  });

  return mapa;
};
