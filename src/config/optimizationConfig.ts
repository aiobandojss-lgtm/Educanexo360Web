// src/config/optimizationConfig.ts
import { performanceMonitor } from '../utils/performanceUtils';
import cacheService from '../services/cacheService';

/**
 * Configuración global para optimizaciones de la aplicación
 */
export interface OptimizationConfig {
  /**
   * Configuración de caché
   */
  cache: {
    /** Habilitar/deshabilitar caché global */
    enabled: boolean;
    /** Tiempo de vida predeterminado para caché (ms) */
    defaultTtl: number;
    /** Rutas que no deben ser cacheadas */
    excludedPaths: string[];
    /** Tamaño máximo de caché (elementos) */
    maxItems: number;
    /** Si se debe limpiar la caché al cerrar sesión */
    clearOnLogout: boolean;
  };
  
  /**
   * Monitoreo de rendimiento
   */
  performance: {
    /** Habilitar/deshabilitar monitoreo */
    enabled: boolean;
    /** Umbral (ms) para considerar una operación lenta */
    slowThreshold: number;
    /** Si se debe registrar en consola */
    consoleLog: boolean;
    /** Si se deben mostrar advertencias de rendimiento */
    showWarnings: boolean;
  };
  
  /**
   * Lazy loading
   */
  lazyLoading: {
    /** Habilitar/deshabilitar lazy loading */
    enabled: boolean;
    /** Tiempo mínimo para mostrar spinner (ms) */
    minimumLoadingTime: number;
    /** Componentes excluidos de lazy loading */
    excludedComponents: string[];
  };
  
  /**
   * Accesibilidad
   */
  accessibility: {
    /** Nivel de conformidad objetivo (A, AA, AAA) */
    complianceLevel: 'A' | 'AA' | 'AAA';
    /** Si se debe usar alto contraste */
    highContrast: boolean;
    /** Si se debe reducir movimiento */
    reduceMotion: boolean;
    /** Tiempo de lectura para mensajes en lectores de pantalla (ms) */
    screenReaderMessageTime: number;
  };
}

/**
 * Configuración por defecto de optimizaciones
 */
export const defaultOptimizationConfig: OptimizationConfig = {
  cache: {
    enabled: true,
    defaultTtl: 5 * 60 * 1000, // 5 minutos
    excludedPaths: [
      '/api/auth',
      '/api/mensajes/nuevo',
      '/api/calificaciones/nueva',
    ],
    maxItems: 100,
    clearOnLogout: true,
  },
  
  performance: {
    enabled: process.env.NODE_ENV === 'development',
    slowThreshold: 300, // ms
    consoleLog: process.env.NODE_ENV === 'development',
    showWarnings: process.env.NODE_ENV === 'development',
  },
  
  lazyLoading: {
    enabled: true,
    minimumLoadingTime: 300, // ms
    excludedComponents: [
      'Login',
      'Register',
      'Dashboard',
    ],
  },
  
  accessibility: {
    complianceLevel: 'AA',
    highContrast: false,
    reduceMotion: false,
    screenReaderMessageTime: 5000, // 5 segundos
  },
};

/**
 * Configuración actual de optimizaciones
 */
let currentConfig: OptimizationConfig = { ...defaultOptimizationConfig };

/**
 * Obtiene la configuración actual de optimizaciones
 */
export const getOptimizationConfig = (): OptimizationConfig => {
  return { ...currentConfig };
};

/**
 * Actualiza la configuración de optimizaciones
 * @param newConfig Nueva configuración o parte de ella
 */
export const updateOptimizationConfig = (newConfig: Partial<OptimizationConfig>): void => {
  // Actualizar configuración
  currentConfig = {
    ...currentConfig,
    ...newConfig,
    // Mantener subobjetos si no se proporcionan
    cache: {
      ...currentConfig.cache,
      ...(newConfig.cache || {}),
    },
    performance: {
      ...currentConfig.performance,
      ...(newConfig.performance || {}),
    },
    lazyLoading: {
      ...currentConfig.lazyLoading,
      ...(newConfig.lazyLoading || {}),
    },
    accessibility: {
      ...currentConfig.accessibility,
      ...(newConfig.accessibility || {}),
    },
  };
  
  // Aplicar configuración a los servicios correspondientes
  
  // Caché
  if (newConfig.cache?.enabled !== undefined && !newConfig.cache.enabled) {
    cacheService.clear();
  }
  
  // Rendimiento
  if (newConfig.performance?.enabled !== undefined) {
    performanceMonitor.setEnabled(newConfig.performance.enabled);
  }
  
  // Accesibilidad
  if (newConfig.accessibility?.reduceMotion !== undefined) {
    if (newConfig.accessibility.reduceMotion) {
      document.documentElement.setAttribute('data-reduce-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduce-motion');
    }
  }
  
  if (newConfig.accessibility?.highContrast !== undefined) {
    if (newConfig.accessibility.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }
  
  // Guardar en localStorage para persistencia
  localStorage.setItem('optimization-config', JSON.stringify(currentConfig));
};

/**
 * Carga la configuración guardada del localStorage
 */
export const loadSavedOptimizationConfig = (): void => {
  try {
    const saved = localStorage.getItem('optimization-config');
    if (saved) {
      const parsedConfig = JSON.parse(saved);
      updateOptimizationConfig(parsedConfig);
    }
  } catch (error) {
    console.error('Error loading saved optimization config:', error);
  }
};

/**
 * Resetea la configuración a los valores por defecto
 */
export const resetOptimizationConfig = (): void => {
  updateOptimizationConfig(defaultOptimizationConfig);
  localStorage.removeItem('optimization-config');
};

export default {
  getOptimizationConfig,
  updateOptimizationConfig,
  loadSavedOptimizationConfig,
  resetOptimizationConfig,
  defaultOptimizationConfig,
};