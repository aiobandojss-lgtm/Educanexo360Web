// src/components/common/AccessibleButton.tsx
import React from 'react';
import { Button, ButtonProps, Tooltip, CircularProgress } from '@mui/material';

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  tooltip?: string;
  loading?: boolean;
  loadingText?: string;
}

/**
 * Botón accesible con mejoras para lectores de pantalla y estados de carga
 */
const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  ariaLabel,
  tooltip,
  loading = false,
  loadingText = 'Cargando...',
  disabled,
  children,
  startIcon,
  endIcon,
  onClick,
  ...props
}) => {
  // Props específicos para accesibilidad
  const accessibilityProps = {
    // Usar ariaLabel si está disponible, de lo contrario usar children como string si es posible
    'aria-label': ariaLabel || (typeof children === 'string' ? children : undefined),
    
    // Si está cargando o deshabilitado, indicarlo para lectores de pantalla
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    
    // Si está cargando, proporcionar un texto descriptivo
    'aria-live': loading ? ('polite' as 'polite') : undefined,
  };

  // Evento de clic controlado para evitar múltiples clics durante carga
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    
    if (onClick) {
      onClick(event);
    }
  };

  // El botón real que será renderizado
  const buttonElement = (
    <Button
      component="button"
      {...props}
      {...accessibilityProps}
      onClick={handleClick}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : startIcon}
      endIcon={endIcon}
      sx={{
        // Mejorar la visibilidad del foco del teclado
        '&:focus-visible': {
          outline: '2px solid #5DA9E9',
          outlineOffset: '2px',
        },
        // Asegurar contraste suficiente en estados deshabilitados
        '&.Mui-disabled': {
          opacity: 0.7,
        },
        ...(props.sx || {}),
      }}
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );

  // Si hay tooltip, envolver el botón en un Tooltip
  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
};

export default AccessibleButton;