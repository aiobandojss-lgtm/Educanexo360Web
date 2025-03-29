// src/components/common/AccessibleTextField.tsx
import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  FormHelperText, 
  InputAdornment,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface AccessibleTextFieldProps extends Omit<TextFieldProps, 'variant'> {
  id: string;
  label: string;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  hidePasswordToggle?: boolean;
  showCharacterCount?: boolean;
  maxLength?: number;
}

/**
 * Campo de texto accesible con funciones mejoradas para accesibilidad
 */
const AccessibleTextField: React.FC<AccessibleTextFieldProps> = ({
  id,
  label,
  errorMessage,
  helperText,
  required = false,
  type = 'text',
  value = '',
  hidePasswordToggle = false,
  showCharacterCount = false,
  maxLength,
  InputProps,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputId = `${id}-input`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  
  const hasError = Boolean(errorMessage);
  const currentType = type === 'password' && showPassword ? 'text' : type;
  
  const characterCount = typeof value === 'string' ? value.length : 0;
  const remainingCount = maxLength ? maxLength - characterCount : undefined;
  
  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  // Configurar adornos de entrada
  const combinedInputProps = {
    ...InputProps,
    endAdornment: (
      <>
        {type === 'password' && !hidePasswordToggle && (
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={handleTogglePasswordVisibility}
              edge="end"
              size="small"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        )}
        {InputProps?.endAdornment}
      </>
    ),
  };
  
  return (
    <Box>
      <TextField
        id={inputId}
        label={label + (required ? ' *' : '')}
        type={currentType}
        error={hasError}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={`${hasError ? errorId : ''} ${helperText ? helperId : ''}`}
        value={value}
        InputProps={combinedInputProps}
        inputProps={{
          maxLength: maxLength,
          'aria-labelledby': `${id}-label`,
          ...props.inputProps,
        }}
        variant="outlined"
        fullWidth
        {...props}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
          '& .MuiInputLabel-asterisk': {
            color: 'error.main',
          },
          ...(props.sx || {}),
        }}
      />
      
      {/* Campo de error con atributos ARIA */}
      {hasError && (
        <FormHelperText 
          id={errorId}
          error
          sx={{ fontWeight: 500 }}
        >
          {errorMessage}
        </FormHelperText>
      )}
      
      {/* Texto de ayuda con atributos ARIA */}
      {helperText && !hasError && (
        <FormHelperText id={helperId}>
          {helperText}
        </FormHelperText>
      )}
      
      {/* Contador de caracteres */}
      {showCharacterCount && maxLength && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
          <Typography 
            variant="caption" 
            color={remainingCount && remainingCount < 10 ? "error" : "text.secondary"}
            aria-live="polite"
          >
            {characterCount}/{maxLength} caracteres
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default AccessibleTextField;