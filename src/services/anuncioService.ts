import axios from "../api/axiosConfig";
import { AxiosRequestConfig } from "axios";

interface AnuncioInput {
  titulo: string;
  contenido: string;
  paraEstudiantes?: boolean;
  paraDocentes?: boolean;
  paraPadres?: boolean;
  destacado?: boolean;
  estaPublicado?: boolean;
}

interface ListarAnunciosParams {
  pagina?: number;
  limite?: number;
  soloDestacados?: boolean;
  soloPublicados?: boolean;
  paraRol?: "ESTUDIANTE" | "DOCENTE" | "ACUDIENTE";
  busqueda?: string;
}

const anuncioService = {
  /**
   * Crear un nuevo anuncio
   */
  crearAnuncio: async (anuncioData: AnuncioInput) => {
    const response = await axios.post("/api/anuncios", anuncioData);
    return response.data;
  },

  /**
   * Obtener lista de anuncios con filtros opcionales
   */
  listarAnuncios: async (params: ListarAnunciosParams = {}) => {
    const config: AxiosRequestConfig = {
      params,
    };
    const response = await axios.get("/api/anuncios", config);
    return response.data;
  },

  /**
   * Obtener un anuncio específico por ID
   */
  obtenerAnuncio: async (id: string) => {
    const response = await axios.get(`/api/anuncios/${id}`);
    return response.data;
  },

  /**
   * Actualizar un anuncio existente
   */
  actualizarAnuncio: async (id: string, anuncioData: Partial<AnuncioInput>) => {
    const response = await axios.put(`/api/anuncios/${id}`, anuncioData);
    return response.data;
  },

  /**
   * Publicar un anuncio (cambiar estado a publicado)
   */
  publicarAnuncio: async (id: string) => {
    const response = await axios.patch(`/api/anuncios/${id}/publicar`);
    return response.data;
  },

  /**
   * Eliminar un anuncio
   */
  eliminarAnuncio: async (id: string) => {
    const response = await axios.delete(`/api/anuncios/${id}`);
    return response.data;
  },

  descargarAdjunto: async (anuncioId: string, archivoId: string) => {
    const response = await axios.get(
      `/api/anuncios/${anuncioId}/adjunto/${archivoId}`,
      {
        responseType: "blob", // Crucial para manejar archivos binarios correctamente
      }
    );
    return response.data; // Esto será un Blob
  },

  /**
   * Obtener URL de un archivo adjunto
   */
  obtenerUrlAdjunto: (anuncioId: string, archivoId: string) => {
    const baseUrl = process.env.REACT_APP_API_URL || "";
    return `${baseUrl}/api/anuncios/${anuncioId}/adjunto/${archivoId}`;
  },
  /**
   * Subir archivos adjuntos a un anuncio
   */
  subirAdjuntos: async (anuncioId: string, archivos: File[]) => {
    const formData = new FormData();

    archivos.forEach((archivo) => {
      formData.append("archivos", archivo);
    });

    const response = await axios.post(
      `/api/anuncios/${anuncioId}/adjuntos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * Eliminar un archivo adjunto
   */
  eliminarAdjunto: async (anuncioId: string, archivoId: string) => {
    const response = await axios.delete(
      `/api/anuncios/${anuncioId}/adjuntos/${archivoId}`
    );
    return response.data;
  },
};

export default anuncioService;
