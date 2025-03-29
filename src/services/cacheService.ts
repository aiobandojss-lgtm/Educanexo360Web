// src/services/cacheService.ts
interface CacheItem<T> {
    data: T;
    expiresAt: number;
  }
  
  class CacheService {
    private static instance: CacheService;
    private cache: Map<string, CacheItem<any>>;
  
    private constructor() {
      this.cache = new Map();
      
      // Limpiar la caché expirada cada minuto
      setInterval(() => this.cleanExpiredCache(), 60000);
    }
  
    public static getInstance(): CacheService {
      if (!CacheService.instance) {
        CacheService.instance = new CacheService();
      }
      return CacheService.instance;
    }
  
    /**
     * Guarda datos en la caché con una clave y tiempo de expiración
     * @param key Clave para acceder a los datos
     * @param data Datos a almacenar
     * @param ttlMs Tiempo de vida en milisegundos (por defecto 5 minutos)
     */
    public set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
      const expiresAt = Date.now() + ttlMs;
      this.cache.set(key, { data, expiresAt });
    }
  
    /**
     * Obtiene datos de la caché si existen y no han expirado
     * @param key Clave de los datos
     * @returns Los datos si existen y no han expirado, de lo contrario null
     */
    public get<T>(key: string): T | null {
      const item = this.cache.get(key);
      
      // Si no hay datos o han expirado, devolver null
      if (!item || item.expiresAt < Date.now()) {
        if (item) this.cache.delete(key); // Eliminar datos expirados
        return null;
      }
      
      return item.data as T;
    }
  
    /**
     * Verifica si la caché tiene una clave válida (no expirada)
     * @param key Clave a verificar
     * @returns true si la clave existe y no ha expirado
     */
    public has(key: string): boolean {
      const item = this.cache.get(key);
      if (!item || item.expiresAt < Date.now()) {
        return false;
      }
      return true;
    }
  
    /**
     * Elimina una clave de la caché
     * @param key Clave a eliminar
     */
    public delete(key: string): void {
      this.cache.delete(key);
    }
  
    /**
     * Limpia toda la caché
     */
    public clear(): void {
      this.cache.clear();
    }
  
    /**
     * Limpia sólo las entradas expiradas de la caché
     */
    private cleanExpiredCache(): void {
      const now = Date.now();
      Array.from(this.cache.entries()).forEach(([key, item]) => {
        if (item.expiresAt < now) {
          this.cache.delete(key);
        }
      });
    }
  
    /**
     * Elimina las entradas de la caché que coincidan con un patrón
     * @param pattern Patrón para las claves a eliminar
     */
    public deleteByPattern(pattern: string): void {
      const regex = new RegExp(pattern);
      for (const key of Array.from(this.cache.keys())) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }
  
  export default CacheService.getInstance();