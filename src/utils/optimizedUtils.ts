// src/utils/optimizedUtils.ts
import { useCallback, useMemo, useRef, useEffect, useState, DependencyList } from 'react';
import { performanceMonitor } from './performanceUtils';
import { getOptimizationConfig } from '../config/optimizationConfig';
import cacheService from '../services/cacheService';

/**
 * Utilidades optimizadas para componentes y funciones
 */

/**
 * Hook para ejecutar callback con debounce
 * @param callback Función a ejecutar
 * @param delay Tiempo de espera en ms
 * @returns Función con debounce
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Hook para ejecutar callback con throttle
 * @param callback Función a ejecutar
 * @param limit Tiempo mínimo entre ejecuciones en ms
 * @returns Función con throttle
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 200
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      lastArgsRef.current = args;
      
      const execute = () => {
        lastRunRef.current = Date.now();
        callback(...(lastArgsRef.current as Parameters<T>));
      };
      
      if (now - lastRunRef.current >= limit) {
        // Si ha pasado suficiente tiempo, ejecutar inmediatamente
        execute();
      } else if (!timeoutRef.current) {
        // Si no, programar para ejecutar cuando pase el tiempo necesario
        const remaining = limit - (now - lastRunRef.current);
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          execute();
        }, remaining);
      }
    },
    [callback, limit]
  );
}

/**
 * Hook para memoizar valores costosos con métricas de rendimiento
 * @param factory Función para calcular el valor
 * @param deps Dependencias para recalcular
 * @returns Valor memoizado
 */
export function useTrackedMemo<T>(factory: () => T, deps: DependencyList): T {
  const id = useRef<string | null>(null);
  
  return useMemo(() => {
    // Iniciar medición
    id.current = performanceMonitor.startMeasure(`useMemo_${factory.name || 'anonymous'}`);
    
    try {
      const result = factory();
      return result;
    } finally {
      // Finalizar medición
      performanceMonitor.endMeasure(id.current);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Hook para cargar datos con estado de carga, caché y errores
 * @param fetcher Función para cargar datos
 * @param key Clave para la caché
 * @param deps Dependencias para recargar
 * @param options Opciones adicionales
 * @returns [datos, cargando, error, recargar]
 */
export function useDataLoader<T>(
  fetcher: () => Promise<T>,
  key: string,
  deps: DependencyList = [],
  options: {
    ttl?: number;
    useCache?: boolean;
    loadOnMount?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
  } = {}
): [T | null, boolean, any, () => Promise<void>] {
  const {
    ttl = getOptimizationConfig().cache.defaultTtl,
    useCache = getOptimizationConfig().cache.enabled,
    loadOnMount = true,
    onSuccess,
    onError,
  } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(loadOnMount);
  const [error, setError] = useState<any>(null);
  const mountedRef = useRef(true);
  
  const load = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Verificar caché
      if (useCache) {
        const cachedData = cacheService.get<T>(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          if (onSuccess) onSuccess(cachedData);
          return;
        }
      }
      
      // Medir rendimiento
      const perfId = performanceMonitor.startMeasure(`useDataLoader_${key}`);
      
      // Cargar datos
      const result = await fetcher();
      
      // Finalizar medición
      performanceMonitor.endMeasure(perfId);
      
      if (!mountedRef.current) return;
      
      // Guardar en caché
      if (useCache) {
        cacheService.set(key, result, ttl);
      }
      
      setData(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      if (!mountedRef.current) return;
      
      setError(err);
      if (onError) onError(err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, key, useCache, ttl, onSuccess, onError]);
  
  useEffect(() => {
    mountedRef.current = true;
    
    if (loadOnMount) {
      load();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [...deps, load]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return [data, loading, error, load];
}

/**
 * Aplica optimizaciones a una función
 * @param fn Función a optimizar
 * @param options Opciones de optimización
 * @returns Función optimizada con el mismo tipo
 */
export function optimizeFunction<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    name?: string;
    cache?: boolean;
    cacheTtl?: number;
    measure?: boolean;
    onError?: (error: any) => void;
  } = {}
): T {
  const {
    name = fn.name || 'anonymous',
    cache = getOptimizationConfig().cache.enabled,
    cacheTtl = getOptimizationConfig().cache.defaultTtl,
    measure = getOptimizationConfig().performance.enabled,
    onError,
  } = options;
  
  // Función optimizada que mantiene el tipo original
  const optimized = function (this: any, ...args: Parameters<T>): ReturnType<T> {
    try {
      // Generar clave de caché si es necesario
      let cacheKey: string | null = null;
      if (cache) {
        cacheKey = `fn_${name}_${JSON.stringify(args)}`;
        const cachedResult = cacheService.get<ReturnType<T>>(cacheKey);
        if (cachedResult) {
          return cachedResult;
        }
      }
      
      // Medir rendimiento si es necesario
      let perfId: string | null = null;
      if (measure) {
        perfId = performanceMonitor.startMeasure(`fn_${name}`);
      }
      
      try {
        // Ejecutar función
        const result = fn.apply(this, args);
        
        // Almacenar en caché si aplica
        if (cache && cacheKey) {
          if (result instanceof Promise) {
            // Para promesas, esperar a que se resuelvan para guardar en caché
            result.then((resolvedResult) => {
              cacheService.set(cacheKey!, resolvedResult, cacheTtl);
            });
          } else {
            cacheService.set(cacheKey, result, cacheTtl);
          }
        }
        
        return result;
      } finally {
        // Finalizar medición
        if (measure && perfId) {
          performanceMonitor.endMeasure(perfId);
        }
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
      throw error;
    }
  } as T;
  
  // Copiar propiedades estáticas si existen
  Object.getOwnPropertyNames(fn).forEach((prop) => {
    if (prop !== 'prototype' && prop !== 'name' && prop !== 'length') {
      Object.defineProperty(
        optimized,
        prop,
        Object.getOwnPropertyDescriptor(fn, prop) || {}
      );
    }
  });
  
  return optimized;
}

export default {
  useDebounce,
  useThrottle,
  useTrackedMemo,
  useDataLoader,
  optimizeFunction
};