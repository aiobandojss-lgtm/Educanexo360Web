// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';

// Definición de colores según el documento de diseño
const colors = {
  primary: {
    main: '#003F91', // azul marino
    light: '#1A57A0', // versión más clara
    dark: '#002D6B', // versión más oscura
    contrastText: '#FFFFFF', // texto en contraste
  },
  secondary: {
    main: '#5DA9E9', // azul celeste
    light: '#7DBCF0', // versión más clara
    dark: '#4187C7', // versión más oscura
    contrastText: '#FFFFFF', // texto en contraste
  },
  background: {
    default: '#f8f9fa', // gris muy claro para el fondo
    paper: '#FFFFFF', // blanco para tarjetas y elementos
  },
  text: {
    primary: '#212529', // casi negro para textos principales
    secondary: '#6c757d', // gris oscuro para textos secundarios
  },
  success: {
    main: '#4CAF50', // verde para éxito
    light: '#6FBF73', // versión más clara
    dark: '#357A38', // versión más oscura
    contrastText: '#FFFFFF', // texto en contraste
  },
  warning: {
    main: '#FFC107', // amarillo para alertas
    light: '#FFCD38', // versión más clara
    dark: '#C79100', // versión más oscura
    contrastText: '#212529', // texto en contraste
  },
  error: {
    main: '#F44336', // rojo para errores
    light: '#F6685E', // versión más clara
    dark: '#AA2E25', // versión más oscura
    contrastText: '#FFFFFF', // texto en contraste
  },
  divider: 'rgba(0, 0, 0, 0.1)', // color para divisores, gris muy claro
};

// Crear el tema personalizado
const theme = createTheme(
  {
    palette: {
      mode: 'light',
      ...colors,
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      h1: {
        fontWeight: 700, // Bold
        fontSize: '22px',
        lineHeight: 1.2,
      },
      h2: {
        fontWeight: 700, // Bold
        fontSize: '20px',
        lineHeight: 1.2,
      },
      h3: {
        fontWeight: 700, // Bold
        fontSize: '18px',
        lineHeight: 1.2,
      },
      h4: {
        fontWeight: 700, // Bold
        fontSize: '16px',
        lineHeight: 1.2,
      },
      h5: {
        fontWeight: 700, // Bold
        fontSize: '15px',
        lineHeight: 1.2,
      },
      h6: {
        fontWeight: 700, // Bold
        fontSize: '14px',
        lineHeight: 1.2,
      },
      subtitle1: {
        fontWeight: 500, // Medium
        fontSize: '14px',
      },
      subtitle2: {
        fontWeight: 500, // Medium
        fontSize: '13px',
      },
      body1: {
        fontWeight: 400, // Regular
        fontSize: '14px',
      },
      body2: {
        fontWeight: 400, // Regular
        fontSize: '12px',
      },
      button: {
        fontWeight: 500, // Medium
        textTransform: 'none', // Sin transformación para botones
      },
      caption: {
        fontWeight: 400, // Regular
        fontSize: '12px',
      },
    },
    shape: {
      borderRadius: 4, // Radio de borde base
    },
    components: {
      // Personalización de componentes MUI
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20, // Forma de píldora para botones
            textTransform: 'none', // Sin transformación de texto
            boxShadow: 'none', // Sin sombra por defecto
            '&:hover': {
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Sombra sutil al pasar el ratón
            },
          },
          // Variante contenida (botones principales)
          contained: {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Sombra sutil
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 10, // Bordes redondeados para tarjetas
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', // Sombra sutil
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10, // Bordes redondeados para tarjetas
            boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', // Sombra sutil
            overflow: 'hidden', // Para que los bordes redondeados se apliquen a todos los hijos
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '16px 20px', // Espaciado consistente
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px', // Espaciado consistente
            '&:last-child': {
              paddingBottom: '20px', // Corregir el padding bottom
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8, // Bordes más redondeados para inputs
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Bordes más redondeados para inputs
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16, // Forma de píldora para chips
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Bordes más redondeados para alertas
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 5, // Bordes redondeados para barras de progreso
            height: 8, // Altura estándar
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px', // Espaciado consistente
          },
          head: {
            fontWeight: 700, // Bold para encabezados de tabla
            backgroundColor: 'rgba(0, 0, 0, 0.03)', // Fondo sutil para encabezados
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 0, // Eliminar borde inferior en la última fila
            },
            '&:hover': {
              backgroundColor: 'rgba(93, 169, 233, 0.04)', // Color sutil al pasar el ratón
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8, // Bordes redondeados para elementos de lista
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: 'rgba(0, 0, 0, 0.1)', // Color sutil para divisores
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontSize: '18px',
            fontWeight: 700, // Bold
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '20px',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '12px 20px',
          },
        },
      },
      MuiBreadcrumbs: {
        styleOverrides: {
          root: {
            '& .MuiTypography-root': {
              fontSize: '14px',
            },
          },
        },
      },
    },
  },
  esES // Configuración regional para español
);

export default theme;