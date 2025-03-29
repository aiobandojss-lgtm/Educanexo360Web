// src/utils/performanceUtils.ts
import { useEffect, useRef } from 'react';

/**
 * Clase para medir y registrar el rendimiento de la aplicación
 */
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measures: Map<string, { startTime: number; count: number; totalTime: number }>;
  private isEnabled: boolean;
  
  private constructor() {
    this.measures = new Map();
    this.isEnabled = process.env.NODE_ENV === 'development' || 
                    localStorage.getItem('enablePerformanceMonitoring') === 'true';
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  /**
   * Activa o desactiva el monitoreo de rendimiento
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      localStorage.setItem('enablePerformanceMonitoring', 'true');
    } else {
      localStorage.removeItem('enablePerformanceMonitoring');
    }
  }
  
  /**
   * Verifica si el monitoreo está activado
   */
  public isMonitoringEnabled(): boolean {
    return this.isEnabled;
  }
  
  /**
   * Inicia la medición para una operación
   * @param label Etiqueta identificativa
   * @returns ID de la medición o null si el monitoreo está desactivado
   */
  public startMeasure(label: string): string | null {
    if (!this.isEnabled) return null;
    
    const id = `${label}_${Date.now()}`;
    this.measures.set(id, {
      startTime: performance.now(),
      count: 0,
      totalTime: 0
    });
    
    return id;
  }
  
  /**
   * Finaliza la medición para una operación
   * @param id ID de la medición
   * @returns Duración en ms o null si el monitoreo está desactivado
   */
  public endMeasure(id: string | null): number | null {
    if (!this.isEnabled || !id || !this.measures.has(id)) return null;
    
    const measure = this.measures.get(id)!;
    const endTime = performance.now();
    const duration = endTime - measure.startTime;
    
    // Actualizar datos para estadísticas
    measure.count++;
    measure.totalTime += duration;
    
    // Mostrar en consola si se supera un umbral
    if (duration > 100) {
      console.warn(`[Performance] Operación lenta: ${id.split('_')[0]} - ${duration.toFixed(2)}ms`);
    }
    
    // Eliminar medición completada para no acumular memoria
    this.measures.delete(id);
    
    return duration;
  }
  
  /**
   * Mide el tiempo de ejecución de una función
   * @param fn Función a medir
   * @param label Etiqueta identificativa
   * @returns Resultado de la función
   */
  public measureFunction<T>(fn: () => T, label: string): T {
    if (!this.isEnabled) {
      return fn();
    }
    
    const id = this.startMeasure(label);
    try {
      const result = fn();
      
      // Si es una promesa, medir cuando se resuelva
      if (result instanceof Promise) {
        return result.finally(() => {
          this.endMeasure(id);
        }) as any as T;
      }
      
      this.endMeasure(id);
      return result;
    } catch (error) {
      this.endMeasure(id);
      throw error;
    }
  }
  
  /**
   * Mide el tiempo de ejecución de una función asíncrona
   * @param fn Función asíncrona a medir
   * @param label Etiqueta identificativa
   * @returns Promesa con el resultado de la función
   */
  public async measureAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
    if (!this.isEnabled) {
      return fn();
    }
    
    const id = this.startMeasure(label);
    try {
      const result = await fn();
      this.endMeasure(id);
      return result;
    } catch (error) {
      this.endMeasure(id);
      throw error;
    }
  }
  
  /**
   * Genera un informe de rendimiento para depuración
   */
  public generateReport(): void {
    if (!this.isEnabled) {
      console.log('El monitoreo de rendimiento está desactivado');
      return;
    }
    
    console.group('Informe de Rendimiento');
    console.log(`Mediciones activas: ${this.measures.size}`);
    
    // Mostrar mediciones en curso
    if (this.measures.size > 0) {
      console.log('Mediciones en curso:');
      this.measures.forEach((measure, id) => {
        const label = id.split('_')[0];
        const elapsedTime = performance.now() - measure.startTime;
        console.log(`- ${label}: ${elapsedTime.toFixed(2)}ms (en curso)`);
      });
    }
    
    console.groupEnd();
  }
}

/**
 * Hook para medir el tiempo de renderizado de un componente
 * @param componentName Nombre del componente
 * @param threshold Umbral en ms para mostrar advertencia (por defecto 50ms)
 */
export function useRenderPerformance(componentName: string, threshold: number = 50) {
  const renderTimeRef = useRef<number>(0);
  
  useEffect(() => {
    const performanceMonitor = PerformanceMonitor.getInstance();
    if (!performanceMonitor.isMonitoringEnabled()) return;
    
    const endTime = performance.now();
    const renderTime = endTime - renderTimeRef.current;
    
    if (renderTime > threshold) {
      console.warn(`[Render Performance] ${componentName} tomó ${renderTime.toFixed(2)}ms para renderizar`);
    }
    
    return () => {
      renderTimeRef.current = performance.now();
    };
  });
  
  useEffect(() => {
    renderTimeRef.current = performance.now();
  }, []);
}

// Exportar la instancia singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Exportar decoradores para medición de funciones
export function measurePerformance(label: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureFunction(
        () => originalMethod.apply(this, args),
        `${label || propertyKey}`
      );
    };
    
    return descriptor;
  };
}

export function measureAsyncPerformance(label: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measureAsync(
        () => originalMethod.apply(this, args),
        `${label || propertyKey}`
      );
    };
    
    return descriptor;
  };
}

export default {
  performanceMonitor,
  useRenderPerformance,
  measurePerformance,
  measureAsyncPerformance
};