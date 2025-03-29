// src/services/eventoDirecto.js
// Este es un servicio simplificado para crear eventos sin complicaciones

import axios from 'axios';

/**
 * Crea un evento en el calendario de forma directa y simple
 * @param {Object} datos - Los datos del evento 
 * @param {File} archivo - Archivo adjunto opcional
 * @returns {Promise} - Promesa con la respuesta
 */
export async function crearEventoDirecto(datos, archivo = null) {
  try {
    console.log('⚡ Creando evento usando método directo');
    
    // Crear FormData
    const formData = new FormData();
    
    // Añadir datos básicos obligatorios 
    formData.append('titulo', datos.titulo || '');
    formData.append('descripcion', datos.descripcion || '');
    formData.append('fechaInicio', datos.fechaInicio || '');
    formData.append('fechaFin', datos.fechaFin || '');
    formData.append('tipo', datos.tipo || 'ACADEMICO');
    
    // Añadir datos opcionales
    formData.append('todoElDia', datos.todoElDia ? 'true' : 'false');
    formData.append('lugar', datos.lugar || '');
    formData.append('color', datos.color || '#3788d8');
    formData.append('estado', datos.estado || 'PENDIENTE');
    
    // Si hay archivo, añadirlo
    if (archivo) {
      formData.append('archivo', archivo);
      console.log('📎 Adjuntando archivo:', archivo.name);
    }
    
    // Log de lo que estamos enviando
    console.log('📤 Enviando datos:');
    console.log('- titulo:', datos.titulo);
    console.log('- descripcion:', datos.descripcion);
    console.log('- fechaInicio:', datos.fechaInicio);
    console.log('- fechaFin:', datos.fechaFin);
    console.log('- todoElDia:', datos.todoElDia);
    console.log('- tipo:', datos.tipo);
    
    // Realizar petición directa
    const response = await axios.post(
      'http://localhost:3000/api/calendario',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    console.log('✅ Evento creado exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear evento de forma directa:', error);
    
    // Log detallado del error
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
      console.error('🔢 Código de estado:', error.response.status);
    }
    
    throw error;
  }
}