// src/components/memoization/MemoizedComponents.tsx
import React, { memo, useMemo, useCallback } from 'react';

// Ejemplos de componentes memoizados que pueden utilizarse en la aplicación

/**
 * Tarjeta de usuario memoizada para listas grandes
 */
interface UserCardProps {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  onSelect?: (id: string) => void;
}

export const MemoizedUserCard = memo(({ id, nombre, apellidos, email, tipo, onSelect }: UserCardProps) => {
  // useCallback para prevenir re-renders innecesarios
  const handleClick = useCallback(() => {
    if (onSelect) {
      onSelect(id);
    }
  }, [id, onSelect]);

  // Calculamos el nombre completo usando useMemo
  const nombreCompleto = useMemo(() => `${nombre} ${apellidos}`, [nombre, apellidos]);

  console.log(`Renderizando UserCard para ${nombreCompleto}`); // Para pruebas

  return (
    <div 
      style={{ 
        padding: '15px',
        margin: '10px 0',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        cursor: onSelect ? 'pointer' : 'default'
      }} 
      onClick={handleClick}
    >
      <h3>{nombreCompleto}</h3>
      <p>{email}</p>
      <small>{tipo}</small>
    </div>
  );
}, (prevProps, nextProps) => {
  // Función de comparación personalizada para refinamiento adicional
  // Solo re-renderizar si alguno de estos props cambia
  return (
    prevProps.id === nextProps.id &&
    prevProps.nombre === nextProps.nombre &&
    prevProps.apellidos === nextProps.apellidos &&
    prevProps.email === nextProps.email &&
    prevProps.tipo === nextProps.tipo &&
    prevProps.onSelect === nextProps.onSelect
  );
});

/**
 * Componente de lista memoizado para evitar re-renderizados de elementos individuales
 */
interface ListaVirtualizadaProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  height?: number;
  itemHeight?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function ListaVirtualizada<T>({
  items,
  renderItem,
  keyExtractor,
  height = 400,
  itemHeight = 50,
  onEndReached,
  endReachedThreshold = 200,
}: ListaVirtualizadaProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  // Calcular elementos visibles basado en scroll
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      Math.ceil((scrollTop + height) / itemHeight),
      items.length
    );
    
    // Añadir buffer para scroll suave
    const buffer = 3;
    const bufferedStartIndex = Math.max(0, startIndex - buffer);
    const bufferedEndIndex = Math.min(items.length, endIndex + buffer);
    
    return items.slice(bufferedStartIndex, bufferedEndIndex).map((item, index) => ({
      item,
      index: bufferedStartIndex + index,
    }));
  }, [scrollTop, height, itemHeight, items]);
  
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    
    // Detectar cuando se llega al final
    if (
      onEndReached &&
      e.currentTarget.scrollHeight - scrollTop - e.currentTarget.clientHeight < endReachedThreshold
    ) {
      onEndReached();
    }
  }, [onEndReached, endReachedThreshold]);
  
  return (
    <div
      style={{
        height,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index }) => (
          <div
            key={keyExtractor(item)}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              width: '100%',
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente memoizado para mostrar calificaciones (usado en múltiples lugares)
interface CalificacionIndicadorProps {
  valor: number;
  tamano?: 'small' | 'medium' | 'large';
  mostrarEtiqueta?: boolean;
}

export const CalificacionIndicador = memo(({ 
  valor, 
  tamano = 'medium', 
  mostrarEtiqueta = true 
}: CalificacionIndicadorProps) => {
  // Determinar color basado en valor
  const color = useMemo(() => {
    if (valor >= 3.5) return '#4CAF50'; // Verde para aprobado con buen margen
    if (valor >= 3.0) return '#5DA9E9'; // Azul para aprobado justo
    return '#F44336'; // Rojo para reprobado
  }, [valor]);
  
  // Determinar tamaño del círculo
  const size = useMemo(() => {
    switch (tamano) {
      case 'small': return 30;
      case 'large': return 60;
      default: return 45; // medium
    }
  }, [tamano]);
  
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: tamano === 'small' ? 14 : tamano === 'large' ? 22 : 18,
        }}
      >
        {valor.toFixed(1)}
      </div>
      {mostrarEtiqueta && (
        <span style={{ fontSize: 12, marginTop: 4 }}>
          {valor >= 3.0 ? 'Aprobado' : 'Reprobado'}
        </span>
      )}
    </div>
  );
});

// Exportar comunes
export const MemoizedComponents = {
  UserCard: MemoizedUserCard,
  ListaVirtualizada,
  CalificacionIndicador,
};

export default MemoizedComponents;