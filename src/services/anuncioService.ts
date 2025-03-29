// src/services/anuncioService.ts
import axiosInstance from '../api/axiosConfig';
import API_ROUTES from '../constants/apiRoutes';

// Interfaces para tipado
export interface IAdjunto {
  _id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  url?: string;
}

export interface IAnuncio {
  _id: string;
  titulo: string;
  contenido: string;
  tipo: 'GENERAL' | 'CURSO' | 'DOCENTES' | 'PADRES' | 'ESTUDIANTES';
  estado: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
  creadorId: any; // Puede ser string u objeto con detalles del creador
  escuelaId: string;
  cursoId?: any; // Puede ser string u objeto con detalles del curso
  destacado: boolean;
  fechaPublicacion: string;
  fechaExpiracion?: string;
  adjuntos?: IAdjunto[];
  lecturas?: Array<{
    usuarioId: string;
    fechaLectura: string;
  }>;
  imagenPortada?: {
    fileId: string;
    url: string;
  };
}

class AnuncioService {
  /**
   * Obtiene anuncios con filtros opcionales
   * @param filtros Parámetros para filtrar anuncios
   * @returns Lista de anuncios
   */
  async obtenerAnuncios(filtros?: {
    tipo?: string;
    destacado?: boolean;
    estado?: string;
    curso?: string;
    pagina?: number;
    limite?: number;
    busqueda?: string;
  }): Promise<IAnuncio[]> {
    try {
      const response = await axiosInstance.get(API_ROUTES.ANUNCIOS.BASE, { params: filtros });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener anuncios:', error);
      throw error;
    }
  }

  /**
   * Obtiene un anuncio específico por su ID
   * @param id ID del anuncio
   * @returns Detalles del anuncio
   */
  async obtenerAnuncioPorId(id: string): Promise<IAnuncio> {
    try {
      const response = await axiosInstance.get(`${API_ROUTES.ANUNCIOS.BASE}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener anuncio:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo anuncio
   * @param anuncioData Datos del anuncio a crear
   * @param imagenPortada Imagen de portada opcional
   * @param adjuntos Archivos adjuntos opcionales
   * @returns Anuncio creado
   */
  async crearAnuncio(
    anuncioData: any, 
    imagenPortada?: File, 
    adjuntos?: File[]
  ): Promise<IAnuncio> {
    try {
      let formData: FormData | null = null;
      
      if (imagenPortada || (adjuntos && adjuntos.length > 0)) {
        formData = new FormData();
        
        // Añadir imagen de portada
        if (imagenPortada) {
          formData.append('imagenPortada', imagenPortada);
        }
        
        // Añadir archivos adjuntos
        if (adjuntos && adjuntos.length > 0) {
          adjuntos.forEach(adjunto => {
            formData!.append('adjuntos', adjunto);
          });
        }
        
        // Añadir todos los campos del anuncio al FormData
        Object.keys(anuncioData).forEach(key => {
          // Si es un objeto o array, convertirlo a JSON string
          if (typeof anuncioData[key] === 'object' && anuncioData[key] !== null && !(anuncioData[key] instanceof File)) {
            formData!.append(key, JSON.stringify(anuncioData[key]));
          } else {
            formData!.append(key, anuncioData[key]);
          }
        });
      }

      const response = await axiosInstance.post(
        API_ROUTES.ANUNCIOS.BASE, 
        formData || anuncioData,
        formData ? {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } : {}
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error al crear anuncio:', error);
      throw error;
    }
  }

  /**
   * Actualiza un anuncio existente
   * @param id ID del anuncio a actualizar
   * @param anuncioData Datos actualizados
   * @param imagenPortada Nueva imagen de portada opcional
   * @param adjuntos Nuevos archivos adjuntos opcionales
   * @returns Anuncio actualizado
   */
  async actualizarAnuncio(
    id: string, 
    anuncioData: any, 
    imagenPortada?: File, 
    adjuntos?: File[]
  ): Promise<IAnuncio> {
    try {
      let formData: FormData | null = null;
      
      if (imagenPortada || (adjuntos && adjuntos.length > 0)) {
        formData = new FormData();
        
        // Añadir imagen de portada
        if (imagenPortada) {
          formData.append('imagenPortada', imagenPortada);
        }
        
        // Añadir archivos adjuntos
        if (adjuntos && adjuntos.length > 0) {
          adjuntos.forEach(adjunto => {
            formData!.append('adjuntos', adjunto);
          });
        }
        
        // Añadir todos los campos del anuncio al FormData
        Object.keys(anuncioData).forEach(key => {
          // Si es un objeto o array, convertirlo a JSON string
          if (typeof anuncioData[key] === 'object' && anuncioData[key] !== null && !(anuncioData[key] instanceof File)) {
            formData!.append(key, JSON.stringify(anuncioData[key]));
          } else {
            formData!.append(key, anuncioData[key]);
          }
        });
      }

      const response = await axiosInstance.put(
        `${API_ROUTES.ANUNCIOS.BASE}/${id}`, 
        formData || anuncioData,
        formData ? {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } : {}
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error al actualizar anuncio:', error);
      throw error;
    }
  }

  /**
   * Publica un anuncio (cambia su estado a PUBLICADO)
   * @param id ID del anuncio
   * @param fechaPublicacion Fecha de publicación opcional
   * @param fechaExpiracion Fecha de expiración opcional
   * @returns Anuncio actualizado
   */
  async publicarAnuncio(
    id: string, 
    fechaPublicacion?: string, 
    fechaExpiracion?: string
  ): Promise<IAnuncio> {
    try {
      const response = await axiosInstance.patch(
        API_ROUTES.ANUNCIOS.PUBLICAR(id), 
        { fechaPublicacion, fechaExpiracion }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al publicar anuncio:', error);
      throw error;
    }
  }

  /**
   * Archiva un anuncio (cambia su estado a ARCHIVADO)
   * @param id ID del anuncio
   * @returns Anuncio actualizado
   */
  async archivarAnuncio(id: string): Promise<IAnuncio> {
    try {
      const response = await axiosInstance.patch(API_ROUTES.ANUNCIOS.ARCHIVAR(id), {});
      return response.data.data;
    } catch (error) {
      console.error('Error al archivar anuncio:', error);
      throw error;
    }
  }

  /**
   * Elimina un anuncio
   * @param id ID del anuncio a eliminar
   * @returns Respuesta de confirmación
   */
  async eliminarAnuncio(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosInstance.delete(`${API_ROUTES.ANUNCIOS.BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL de una imagen de portada
   * @param anuncioId ID del anuncio
   * @param imagenId ID de la imagen
   * @returns URL de la imagen
   */
  getImagenPortadaUrl(anuncioId: string, imagenId: string): string {
    return `${axiosInstance.defaults.baseURL}${API_ROUTES.ANUNCIOS.GET_IMAGE(anuncioId, imagenId)}`;
  }

  /**
   * Obtiene la URL de un archivo adjunto
   * @param anuncioId ID del anuncio
   * @param adjuntoId ID del adjunto
   * @returns URL del adjunto
   */
  getAdjuntoUrl(anuncioId: string, adjuntoId: string): string {
    return `${axiosInstance.defaults.baseURL}${API_ROUTES.ANUNCIOS.GET_ATTACHMENT(anuncioId, adjuntoId)}`;
  }
}

export default new AnuncioService();