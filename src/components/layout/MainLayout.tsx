// src/components/layout/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
  useMediaQuery,
  useTheme,
  Breadcrumbs,
  Link,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import NavigationMenu from './NavigationMenu';
import { logout } from '../../services/authService';
// Este import no se incluía en los archivos proporcionados, se deberá crear
// o ajustar según la implementación específica de manejo de notificaciones
import { fetchNotificaciones, markNotificacionAsRead } from '../../redux/slices/notificacionesSlice';

// Ancho del drawer cuando está abierto
const drawerWidth = 260;

// Mapeo de rutas a breadcrumbs más amigables
const routeNameMap: Record<string, string> = {
  '': 'Dashboard',
  'mensajes': 'Mensajes',
  'calificaciones': 'Calificaciones',
  'usuarios': 'Usuarios',
  'cursos': 'Cursos',
  'perfil': 'Mi Perfil',
  'logros': 'Logros Académicos',
  'boletin': 'Boletín',
  'estadisticas': 'Estadísticas',
  'lista': 'Lista',
  'nuevo': 'Nuevo',
  'editar': 'Editar',
  'recibidos': 'Recibidos',
  'enviados': 'Enviados',
  'borradores': 'Borradores',
  'archivados': 'Archivados',
};

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para el drawer
  const [open, setOpen] = useState(!isSmallScreen);
  
  // Estado para el menú de usuario
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(anchorEl);
  
  // Estado para el menú de notificaciones
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const notificationMenuOpen = Boolean(notificationAnchorEl);
  
  // Estado para alertas/notificaciones
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Ejemplo de notificaciones (en una implementación real se obtendrían de Redux)
  const [notificaciones, setNotificaciones] = useState<Array<{id: string; mensaje: string; leido: boolean}>>([
    { id: '1', mensaje: 'Nuevo mensaje de coordinación', leido: false },
    { id: '2', mensaje: 'Calificación actualizada en Matemáticas', leido: false },
    { id: '3', mensaje: 'Recordatorio: Entrega de trabajos', leido: true },
  ]);
  
  // Efecto para ajustar el drawer en pantallas pequeñas
  useEffect(() => {
    setOpen(!isSmallScreen);
  }, [isSmallScreen]);
  
  // Efecto para cargar notificaciones (simulado)
  useEffect(() => {
    // Aquí se podría dispatch para cargar notificaciones reales
    // dispatch(fetchNotificaciones());
  }, []);
  
  // Generar breadcrumbs basados en la ruta actual
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    // Si no hay segmentos, estamos en la raíz (Dashboard)
    if (pathSegments.length === 0) {
      return (
        <Breadcrumbs aria-label="breadcrumb">
          <Typography color="text.primary">Dashboard</Typography>
        </Breadcrumbs>
      );
    }
    
    return (
      <Breadcrumbs aria-label="breadcrumb">
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{ textDecoration: 'none' }}
        >
          Dashboard
        </Link>
        
        {pathSegments.map((segment, index) => {
          // Ignorar IDs en la ruta para los breadcrumbs
          if (segment.match(/^[0-9a-fA-F]{24}$/)) {
            return null;
          }
          
          const displayName = routeNameMap[segment] || segment;
          const to = '/' + pathSegments.slice(0, index + 1).join('/');
          
          const isLast = index === pathSegments.length - 1 || 
                        (index === pathSegments.length - 2 && 
                        pathSegments[pathSegments.length - 1].match(/^[0-9a-fA-F]{24}$/));
          
          return isLast ? (
            <Typography color="text.primary" key={to}>
              {displayName}
            </Typography>
          ) : (
            <Link
              key={to}
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(to);
              }}
              sx={{ textDecoration: 'none' }}
            >
              {displayName}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  // Handlers
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/perfil');
  };
  
  const handleSettingsClick = () => {
    handleUserMenuClose();
    navigate('/perfil/editar');
  };
  
  const handleNotificationClick = (id: string) => {
    // En una implementación real, se marcaría como leída y navegaría a la ubicación correspondiente
    setNotificaciones(prev => 
      prev.map(n => n.id === id ? {...n, leido: true} : n)
    );
    // dispatch(markNotificacionAsRead(id));
    handleNotificationMenuClose();
    // Aquí se podría navegar a la ruta específica según el tipo de notificación
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const unreadNotificationsCount = notificaciones.filter(n => !n.leido).length;
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme => theme.zIndex.drawer + 1,
          transition: theme => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: drawerWidth,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme => theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{
              marginRight: 2,
            }}
          >
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
          
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold' }}
          >
            EducaNexo360
          </Typography>
          
          {/* Notificaciones */}
          <IconButton 
            color="inherit" 
            onClick={handleNotificationMenuOpen}
            sx={{ mr: 2 }}
          >
            <Badge badgeContent={unreadNotificationsCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          {/* Menú de notificaciones */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={notificationMenuOpen}
            onClose={handleNotificationMenuClose}
            PaperProps={{
              sx: {
                width: 320,
                maxHeight: 400,
                mt: 1.5,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Typography variant="subtitle1" sx={{ p: 2, fontWeight: 'bold', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
              Notificaciones
            </Typography>
            
            {notificaciones.length === 0 ? (
              <MenuItem>
                <Typography variant="body2">No tienes notificaciones</Typography>
              </MenuItem>
            ) : (
              notificaciones.map((notif) => (
                <MenuItem 
                  key={notif.id} 
                  onClick={() => handleNotificationClick(notif.id)}
                  sx={{ 
                    py: 1.5,
                    borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                    bgcolor: notif.leido ? 'transparent' : 'rgba(93, 169, 233, 0.08)',
                  }}
                >
                  <Badge 
                    variant="dot" 
                    color="primary" 
                    invisible={notif.leido}
                    sx={{ '& .MuiBadge-dot': { top: 8, right: 8 } }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: notif.leido ? 'normal' : 'bold' }}>
                      {notif.mensaje}
                    </Typography>
                  </Badge>
                </MenuItem>
              ))
            )}
          </Menu>
          
          {/* Perfil de usuario */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{ p: 0 }}
              aria-controls={userMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
            >
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user?.nombre?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            
            {!isSmallScreen && (
              <Typography variant="subtitle2" sx={{ ml: 1 }}>
                {user?.nombre} {user?.apellidos}
              </Typography>
            )}
          </Box>
          
          {/* Menú de perfil */}
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={userMenuOpen}
            onClose={handleUserMenuClose}
            MenuListProps={{
              'aria-labelledby': 'user-button',
            }}
            PaperProps={{
              sx: {
                width: 200,
                mt: 1.5,
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                borderRadius: 2,
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Cerrar Sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer de navegación */}
      <Drawer
        variant={isSmallScreen ? "temporary" : "permanent"}
        open={open}
        onClose={isSmallScreen ? handleDrawerToggle : undefined}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
            border: 'none',
          },
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
            height: 64,
            bgcolor: 'primary.main',
            color: 'white',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            EducaNexo360
          </Typography>
        </Toolbar>
        <Divider />
        
        {/* Componente de navegación */}
        <NavigationMenu />
      </Drawer>
      
      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
          transition: theme => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: 0,
          ...(open && {
            transition: theme => theme.transitions.create('margin', {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
            marginLeft: 0,
          }),
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          maxHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar /> {/* Espaciador para evitar que el contenido se oculte bajo la AppBar */}
        
        {/* Breadcrumbs */}
        <Box sx={{ mb: 3, mt: 1 }}>
          {generateBreadcrumbs()}
        </Box>
        
        {/* Contenido de la ruta actual */}
        <Outlet />
      </Box>
      
      {/* Snackbar para alertas y notificaciones */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MainLayout;