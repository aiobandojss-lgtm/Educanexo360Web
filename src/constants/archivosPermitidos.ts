// src/constants/archivosPermitidos.ts
// Tipos de archivo que acepta el backend (Fase 5: lista blanca validada por contenido).
// Mantener alineado con el backend; si se agrega un tipo allá, agregarlo aquí.

export const EXTENSIONES_PERMITIDAS = [
  'pdf',
  'doc', 'docx',
  'xls', 'xlsx',
  'ppt', 'pptx',
  'txt', 'csv',
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'heic', 'heif',
  'zip',
];

/** Valor para el atributo accept de <input type="file"> */
export const ACCEPT_ARCHIVOS = EXTENSIONES_PERMITIDAS.map((ext) => `.${ext}`).join(',');

export const MENSAJE_TIPO_NO_PERMITIDO =
  'Solo se permiten documentos (PDF, Word, Excel, PowerPoint, TXT, CSV), imágenes (JPG, PNG, GIF, WEBP, HEIC) y archivos ZIP.';

export const esArchivoPermitido = (archivo: File): boolean => {
  const extension = archivo.name.split('.').pop()?.toLowerCase() ?? '';
  return archivo.name.includes('.') && EXTENSIONES_PERMITIDAS.includes(extension);
};
