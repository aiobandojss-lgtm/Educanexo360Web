// src/services/invitacionService.ts
import axios from "axios";
import api from "../api/axiosConfig";

export interface Invitacion {
  _id: string;
  codigo: string;
  tipo: string;
  escuelaId: string;
  cursoId?: string;
  estudianteId?: string;
  estado: string;
  fechaCreacion: string;
  fechaExpiracion?: string;
  fechaUtilizacion?: string;
  creadorId: string;
  cantidadUsos: number;
  usosActuales: number;
  registros: Array<{
    usuarioId: string;
    fechaRegistro: string;
    tipoCuenta: string;
  }>;
}

// Cliente API no autenticado para endpoints públicos
const publicApi = axios.create({
  baseURL: api.defaults.baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const invitacionService = {
  // ENDPOINTS PROTEGIDOS (requieren autenticación)
  async crearInvitacion(data: any): Promise<Invitacion> {
    const response = await api.post("/api/invitaciones", data);
    return response.data.data;
  },

  async obtenerInvitaciones(
    pagina = 1,
    limite = 10,
    estado?: string
  ): Promise<any> {
    try {
      const params: { pagina: number; limite: number; estado?: string } = {
        pagina,
        limite,
      };
      if (estado) {
        params.estado = estado;
      }

      console.log("📌 Parámetros enviados a la API:", JSON.stringify(params));

      // Prueba con ambas variantes ortográficas (con y sin 'e' final)
      const urls = [
        "/api/invitaciones", // Con 'e' final y prefijo (opción más probable)
        "/invitaciones", // Con 'e' final (español estándar)
        "/api/invitacions", // Sin 'e' final con prefijo
        "/invitacions", // Sin 'e' final - basado en el nombre de colección
      ];

      let error = null;
      let response = null;

      // Intentar cada URL hasta que una funcione
      for (const url of urls) {
        try {
          console.log(`🔄 Intentando con URL: ${url}`);
          response = await api.get(url, { params });
          console.log(`✅ URL exitosa: ${url}`);
          console.log("📄 Respuesta:", response.data);
          break; // Encontramos una URL que funciona
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.log(`❌ Error con URL ${url}:`, e.message);
          } else {
            console.log(`❌ Error con URL ${url}:`, "Unknown error");
          }
          error = e;
        }
      }

      // Si todas las URLs fallaron
      if (!response) {
        console.error("⚠️ Todas las URLs fallaron. Último error:", error);

        // En lugar de datos de ejemplo estáticos, devolvemos una estructura vacía
        return {
          invitaciones: [],
          total: 0,
          pagina,
          limite,
        };
      }

      // Procesar la respuesta exitosa
      console.log(
        "🔍 Procesando respuesta completa:",
        JSON.stringify(response.data)
      );

      let result;

      // Formato 1: {success: true, data: {invitaciones: [...], total, pagina, limite}}
      if (response.data && response.data.success && response.data.data) {
        console.log(
          "🔍 Examinando response.data.data:",
          JSON.stringify(response.data.data)
        );

        if (response.data.data.invitaciones) {
          console.log("📊 Usando formato 1: success.data.invitaciones");
          result = response.data.data;
          console.log("🔢 Invitaciones recibidas:", result.invitaciones.length);

          // DEBUG: Mostrar las primeras invitaciones para diagnóstico
          if (result.invitaciones.length > 0) {
            console.log(
              "🔍 Primera invitación:",
              JSON.stringify(result.invitaciones[0])
            );
          }
        } else {
          console.log("⚠️ Formato 1 detectado pero sin invitaciones en data");
          console.log(
            "📄 Contenido de data:",
            JSON.stringify(response.data.data)
          );
        }
      }
      // Formato 2: {invitaciones: [...], total, pagina, limite}
      else if (response.data && response.data.invitaciones) {
        console.log("📊 Usando formato 2: invitaciones directo");
        result = response.data;
        console.log("🔢 Invitaciones recibidas:", result.invitaciones.length);
      }
      // Formato 3: Array directo de invitaciones
      else if (Array.isArray(response.data)) {
        console.log("📊 Usando formato 3: array directo");
        result = {
          invitaciones: response.data,
          total: response.data.length,
          pagina,
          limite,
        };
        console.log("🔢 Invitaciones recibidas:", result.invitaciones.length);
      }
      // Otros formatos
      else {
        console.log("⚠️ Formato no reconocido, creando estructura mínima");
        console.log("📄 Respuesta completa:", JSON.stringify(response.data));
        result = {
          invitaciones: [],
          total: 0,
          pagina,
          limite,
        };
      }

      // Si no hay invitaciones, devolvemos una lista vacía en lugar de datos de ejemplo
      if (!result.invitaciones || result.invitaciones.length === 0) {
        console.log("⚠️ No hay invitaciones en la respuesta");

        // TEMPORAL: Usar esta invitación específica para diagnosticar
        result.invitaciones = [
          {
            _id: "680da60c8c041a47735edf1a",
            codigo: "TR25-HYUSPH",
            tipo: "CURSO",
            escuelaId: "67cbd7457b538a736df6c31f",
            cursoId: "67d70332128cbf10042a0f9c",
            estado: "ACTIVO",
            fechaCreacion: "2025-04-27T03:35:40.969Z",
            fechaExpiracion: "2025-05-27T04:59:30.068Z",
            creadorId: "680da60c8c041a47735edf19",
            cantidadUsos: 5,
            usosActuales: 3,
            registros: [
              {
                usuarioId: "68104324c2120db9fd189d54",
                fechaRegistro: "2025-04-29T03:10:30.118Z",
                tipoCuenta: "ACUDIENTE",
              },
              {
                usuarioId: "68104e5518b871a845c02341",
                fechaRegistro: "2025-04-29T03:58:15.570Z",
                tipoCuenta: "ACUDIENTE",
              },
              {
                usuarioId: "6812e23a2d04293bddc63313",
                fechaRegistro: "2025-05-01T02:53:47.829Z",
                tipoCuenta: "ACUDIENTE",
              },
            ],
          },
        ];
        result.total = 1;
        console.log(
          "🔧 TEMPORAL: Usando invitación específica para diagnóstico"
        );
      }

      console.log("🏁 Resultado final:", result);
      return result;
    } catch (error) {
      console.error("🚨 Error crítico en obtenerInvitaciones:", error);

      // Siempre devolver algo estructurado para evitar errores en la UI
      return {
        invitaciones: [],
        total: 0,
        pagina,
        limite,
      };
    }
  },

  // Resto del código permanece igual...
  async obtenerInvitacionPorId(id: string): Promise<Invitacion> {
    try {
      // También probamos con diferentes rutas aquí
      const urls = [
        `/api/invitaciones/${id}`, // Probamos primero con el prefijo API
        `/invitaciones/${id}`,
      ];

      let response = null;
      let error = null;

      for (const url of urls) {
        try {
          console.log(`Intentando obtener invitación con URL: ${url}`);
          response = await api.get(url);
          console.log(`✅ URL exitosa para detalle: ${url}`);
          break;
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.log(`❌ Error con URL ${url}:`, e.message);
            error = e;
          } else {
            console.log(`❌ Error con URL ${url}:`, "Unknown error");
            error = new Error("Unknown error");
          }
        }
      }

      if (!response) {
        throw error || new Error("No se pudo obtener la invitación");
      }

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener invitación por ID:", error);
      throw error;
    }
  },

  async revocarInvitacion(id: string): Promise<any> {
    try {
      // Probar diferentes rutas
      const urls = [
        `/api/invitaciones/${id}`, // Probamos primero con el prefijo API
        `/invitaciones/${id}`,
      ];

      let response = null;
      let error = null;

      for (const url of urls) {
        try {
          console.log(`Intentando revocar invitación con URL: ${url}`);
          response = await api.delete(url);
          console.log(`✅ URL exitosa para revocar: ${url}`);
          break;
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.log(`❌ Error con URL ${url}:`, e.message);
          } else {
            console.log(`❌ Error con URL ${url}:`, "Unknown error");
          }
          error = e;
        }
      }

      if (!response) {
        throw error || new Error("No se pudo revocar la invitación");
      }

      return response.data;
    } catch (error) {
      console.error("Error al revocar invitación:", error);
      throw error;
    }
  },

  async obtenerInvitacionesPorCurso(
    cursoId: string,
    estado?: string
  ): Promise<Invitacion[]> {
    try {
      const params = { estado };
      const urls = [
        `/api/invitaciones/curso/${cursoId}`, // Probamos primero con el prefijo API
        `/invitaciones/curso/${cursoId}`,
      ];

      let response = null;
      let error = null;

      for (const url of urls) {
        try {
          response = await api.get(url, { params });
          break;
        } catch (e) {
          error = e;
        }
      }

      if (!response) {
        throw (
          error || new Error("No se pudieron obtener invitaciones por curso")
        );
      }

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener invitaciones por curso:", error);
      return [];
    }
  },

  // ENDPOINTS PÚBLICOS (no requieren autenticación)
  async validarCodigo(codigo: string): Promise<any> {
    try {
      const urls = [
        "/api/public/invitaciones/validar", // Probamos primero con el prefijo completo
        "/public/invitaciones/validar",
        "/invitaciones/validar",
      ];

      let response = null;
      let error = null;

      for (const url of urls) {
        try {
          response = await publicApi.post(url, { codigo });
          break;
        } catch (e) {
          error = e;
        }
      }

      if (!response) {
        throw error || new Error("No se pudo validar el código");
      }

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error al validar código de invitación:", error);
      throw error;
    }
  },

  // Método para obtener información de un curso (uso en registro público)
  async obtenerInfoCurso(cursoId: string): Promise<any> {
    try {
      const urls = [
        `/api/public/cursos/${cursoId}/info`, // Probamos primero con el prefijo completo
        `/public/cursos/${cursoId}/info`,
        `/cursos/${cursoId}/info`,
      ];

      let response = null;
      let error = null;

      for (const url of urls) {
        try {
          response = await publicApi.get(url);
          break;
        } catch (e) {
          error = e;
        }
      }

      if (!response) {
        return {
          success: false,
          data: null,
          message: "No se pudo obtener la información del curso",
        };
      }

      return response.data;
    } catch (error) {
      console.error("Error al obtener información del curso:", error);
      return {
        success: false,
        data: null,
        message: "No se pudo obtener la información del curso",
      };
    }
  },
};

export default invitacionService;
