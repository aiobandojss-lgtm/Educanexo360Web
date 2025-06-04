// src/services/escuelaService.ts
import axiosConfig from "../api/axiosConfig";

export interface Escuela {
  _id: string;
  codigo: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  sitioWeb?: string;
  logo?: string;
  descripcion?: string;
  configuracion?: {
    periodos_academicos: number;
    escala_calificacion: {
      minima: number;
      maxima: number;
    };
    logros_por_periodo: number;
  };
  periodos_academicos?: Array<{
    numero: number;
    nombre: string;
    fecha_inicio: Date;
    fecha_fin: Date;
    _id: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

class EscuelaService {
  // Obtener todas las escuelas
  async obtenerEscuelas(): Promise<Escuela[]> {
    try {
      const response = await axiosConfig.get("/api/escuelas");
      return response.data.data || [];
    } catch (error) {
      console.error("Error obteniendo escuelas:", error);
      throw error;
    }
  }

  // Obtener escuela por ID
  async obtenerPorId(id: string): Promise<Escuela | null> {
    try {
      const response = await axiosConfig.get(`/api/escuelas/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Error obteniendo escuela por ID:", error);
      return null;
    }
  }

  // Crear nueva escuela
  async crear(escuela: Partial<Escuela>): Promise<Escuela> {
    try {
      const response = await axiosConfig.post("/api/escuelas", escuela);
      return response.data.data;
    } catch (error) {
      console.error("Error creando escuela:", error);
      throw error;
    }
  }

  // Actualizar escuela
  async actualizar(id: string, escuela: Partial<Escuela>): Promise<Escuela> {
    try {
      const response = await axiosConfig.put(`/api/escuelas/${id}`, escuela);
      return response.data.data;
    } catch (error) {
      console.error("Error actualizando escuela:", error);
      throw error;
    }
  }

  // Eliminar escuela
  async eliminar(id: string): Promise<void> {
    try {
      await axiosConfig.delete(`/api/escuelas/${id}`);
    } catch (error) {
      console.error("Error eliminando escuela:", error);
      throw error;
    }
  }

  // Actualizar periodos académicos
  async actualizarPeriodos(id: string, periodos: any[]): Promise<Escuela> {
    try {
      const response = await axiosConfig.put(`/api/escuelas/${id}/periodos`, {
        periodos_academicos: periodos,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error actualizando periodos académicos:", error);
      throw error;
    }
  }

  // Verificar si el sistema tiene escuelas configuradas
  async verificarConfiguracion(): Promise<{
    hayEscuelas: boolean;
    escuelaActiva?: Escuela;
  }> {
    try {
      const escuelas = await this.obtenerEscuelas();
      return {
        hayEscuelas: escuelas.length > 0,
        escuelaActiva: escuelas.length > 0 ? escuelas[0] : undefined,
      };
    } catch (error) {
      console.error("Error verificando configuración:", error);
      return { hayEscuelas: false };
    }
  }
}

export default new EscuelaService();
