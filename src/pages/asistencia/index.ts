// src/Pages/asistencia/index.ts

import RegistroAsistencia from './RegistroAsistencia';
import ListaAsistencia from './ListaAsistencia';
import DetalleAsistencia from './DetalleAsistencia';
// Podemos agregar otras importaciones en el futuro como EstadisticasAsistencia

export {
  RegistroAsistencia,
  ListaAsistencia,
  DetalleAsistencia,
  // EstadisticasAsistencia (cuando se implemente)
};

// Exportación por defecto para rutas dinámicas
export default {
  RegistroAsistencia,
  ListaAsistencia,
  DetalleAsistencia,
  // EstadisticasAsistencia (cuando se implemente)
};