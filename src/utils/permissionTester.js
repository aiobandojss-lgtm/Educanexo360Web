// src/utils/permissionTester.js
// Esta utilidad permite probar rápidamente los permisos de diferentes roles

import axiosInstance from '../api/axiosConfig';

/**
 * Prueba los permisos de un endpoint específico para todos los roles
 * @param {string} endpoint - Ruta a probar
 * @param {Object} params - Parámetros de consulta
 * @returns {Promise<Object>} - Resultados para cada rol
 */
export const testEndpointPermissions = async (endpoint, params = {}) => {
  const results = {};
  
  // Guarda el token actual
  const currentToken = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('Probando permisos para endpoint:', endpoint);
  console.log('Usuario actual:', currentUser?.tipo);
  
  try {
    // Prueba con el usuario actual (sin modificar nada)
    try {
      console.log(`Probando con rol ACTUAL (${currentUser?.tipo})...`);
      const response = await axiosInstance.get(endpoint, { params });
      console.log(`✅ Éxito con rol ACTUAL (${currentUser?.tipo})`, response.data);
      results.current = {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`❌ Error con rol ACTUAL (${currentUser?.tipo})`, error);
      results.current = {
        success: false,
        error: error.response?.data || error.message
      };
    }
  } catch (error) {
    console.error('Error en la prueba de permisos:', error);
  }
  
  return results;
};

/**
 * Muestra el usuario actual en la consola
 * Útil para depuración rápida
 */
export const logCurrentUser = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  console.log('=== INFORMACIÓN DE USUARIO ACTUAL ===');
  console.log('Token existente:', token ? '✅ Sí' : '❌ No');
  console.log('Datos de usuario:', user);
  
  if (user.tipo) {
    console.log('Rol:', user.tipo);
  } else {
    console.log('⚠️ Usuario sin rol definido');
  }
  
  if (user.escuelaId) {
    console.log('Escuela ID:', user.escuelaId);
  } else {
    console.log('⚠️ Usuario sin escuela asociada');
  }
  
  console.log('=== FIN INFORMACIÓN DE USUARIO ===');
};

/**
 * Solución temporal: accede al calendario sin filtros para estudiantes
 * @returns {Promise<Array>} - Lista de eventos
 */
export const getCalendarioEventosDirecto = async () => {
  try {
    // Intenta acceder directamente a la ruta de eventos sin filtros
    const response = await axiosInstance.get('/api/calendario');
    return response.data.data;
  } catch (error) {
    console.error('Error al obtener eventos sin filtro:', error);
    return [];
  }
};