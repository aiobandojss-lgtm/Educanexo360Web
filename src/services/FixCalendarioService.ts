// src/services/FixCalendarioService.ts
import axios from 'axios'; // Añadir esta importación

/**
 * Servicio temporal para crear eventos del calendario sin usar interceptores
 */
export async function crearEventoTest(eventoData: any, archivo?: File): Promise<any> {
  try {
    // Crear FormData
    const formData = new FormData();
    
    // Añadir campos básicos
    formData.append('titulo', String(eventoData.titulo || '').trim());
    formData.append('descripcion', String(eventoData.descripcion || '').trim());
    formData.append('fechaInicio', String(eventoData.fechaInicio || ''));
    formData.append('fechaFin', String(eventoData.fechaFin || ''));
    formData.append('tipo', String(eventoData.tipo || 'ACADEMICO'));
    formData.append('lugar', String(eventoData.lugar || '').trim());
    formData.append('todoElDia', eventoData.todoElDia ? 'true' : 'false');
    formData.append('color', String(eventoData.color || '#3788d8'));
    
    // Añadir archivo si existe
    if (archivo) {
      formData.append('archivo', archivo);
    }
    
    // Token de autorización
    const token = localStorage.getItem('token');
    
    // Intentar los tres posibles endpoints
    const baseURLs = [
      'http://localhost:3000/api/calendario', 
      'http://localhost:3000/calendario',
      'http://localhost:3001/api/calendario'
    ];
    
    let lastError;
    
    // Probar con cada URL hasta que funcione
    for (const url of baseURLs) {
      try {
        console.log(`Intentando con URL: ${url}`);
        
        const response = await axios({
          method: 'post',
          url: url,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`Éxito con URL: ${url}`);
        
        // Si llegamos aquí, la llamada fue exitosa
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.error(`Error con URL ${url}:`, error.message);
        
        // Si el error no es 404, no seguir intentando
        if (error.response && error.response.status !== 404) {
          throw error;
        }
      }
    }
    
    // Si llegamos aquí, todas las URLs fallaron
    throw lastError;
  } catch (error: any) {
    console.error('Todos los intentos fallaron:', error);
    throw error;
  }
}