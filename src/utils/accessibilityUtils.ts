// src/utils/accessibilityUtils.ts

/**
 * Genera props para accesibilidad de campos de formulario
 * @param id ID base del campo
 * @param hasError Si el campo tiene error
 * @param helperText Texto de ayuda opcional
 * @returns Objeto con props de accesibilidad
 */
export const getFieldAccessibilityProps = (
    id: string,
    hasError: boolean = false,
    helperText?: string
  ) => {
    const inputId = `${id}-input`;
    const helperId = `${id}-helper`;
    const errorId = `${id}-error`;
    
    return {
      id: inputId,
      'aria-invalid': hasError,
      'aria-describedby': `${hasError ? errorId : ''} ${helperText ? helperId : ''}`.trim() || undefined,
    };
  };
  
  /**
   * Props para hacer que elementos sean saltables con Tab
   * @param skipText Texto que aparecerá en el enlace para saltar
   * @param targetId ID del elemento al que saltar
   * @returns Props para el elemento de salto
   */
  export const getSkipLinkProps = (skipText: string, targetId: string) => {
    return {
      as: 'a',
      href: `#${targetId}`,
      sx: {
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '1px',
        height: '1px',
        overflow: 'hidden',
        
        '&:focus': {
          left: 0,
          width: 'auto',
          height: 'auto',
          padding: 2,
          backgroundColor: 'common.white',
          color: 'text.primary',
          zIndex: 10000,
          borderRadius: 0,
          boxShadow: 2,
          textDecoration: 'none',
        },
      },
      children: skipText,
    };
  };
  
  /**
   * Props para hacer que un elemento sea el destino de un salto
   * @param id ID del elemento destino
   * @returns Props para el elemento destino
   */
  export const getSkipLinkTargetProps = (id: string) => {
    return {
      id,
      tabIndex: -1,
      sx: {
        outline: 'none',
      },
    };
  };
  
  /**
   * Crea un anuncio para lectores de pantalla
   * @param message Mensaje a anunciar
   * @param politeness Nivel de prioridad ('polite' o 'assertive')
   */
  export const announceToScreenReader = (
    message: string,
    politeness: 'polite' | 'assertive' = 'polite'
  ) => {
    // Busca un elemento de anuncio existente o crea uno nuevo
    let announcer = document.getElementById(`${politeness}-announcer`);
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = `${politeness}-announcer`;
      announcer.setAttribute('aria-live', politeness);
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-atomic', 'true');
      
      // Esconder visualmente pero mantener accesible para lectores de pantalla
      Object.assign(announcer.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
      });
      
      document.body.appendChild(announcer);
    }
    
    // Para asegurar que el lector de pantalla note el cambio,
    // limpiamos primero y luego añadimos el mensaje con un pequeño delay
    announcer.textContent = '';
    
    setTimeout(() => {
      announcer!.textContent = message;
    }, 50);
  };
  
  /**
   * Detecta si se está usando un lector de pantalla
   * (aproximación basada en detección de evento de reducción de movimiento)
   * @returns Booleano que indica si posiblemente se está usando un lector de pantalla
   */
  export const isPossiblyUsingScreenReader = (): boolean => {
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches || 
      document.documentElement.hasAttribute('data-force-accessibility')
    );
  };
  
  /**
   * Añade un atributo de foco visible a un elemento para CSS
   * @param event Evento de teclado o ratón
   */
  export const handleFocusVisibility = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (event.type === 'keydown') {
      document.body.setAttribute('data-keyboard-focus', 'true');
    } else if (event.type === 'mousedown') {
      document.body.removeAttribute('data-keyboard-focus');
    }
  };
  
  /**
   * Mejorar el enfoque de elementos por teclado
   * @param targetSelector Selector CSS para elementos a mejorar
   */
  export const initFocusTrap = (targetSelector: string = 'body') => {
    const root = document.querySelector(targetSelector);
    if (!root) return;
    
    // Escuchar eventos para detectar navegación por teclado vs. ratón
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.setAttribute('data-keyboard-focus', 'true');
      }
    });
    
    document.addEventListener('mousedown', () => {
      document.body.removeAttribute('data-keyboard-focus');
    });
    
    // Estilo global para mejorar visibilidad del foco
    const style = document.createElement('style');
    style.textContent = `
      body[data-keyboard-focus="true"] *:focus {
        outline: 2px solid #5DA9E9 !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
  };