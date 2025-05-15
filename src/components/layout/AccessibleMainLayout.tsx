// src/components/layout/AccessibleMainLayout.tsx
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  CssBaseline,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  ExitToApp as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { logout } from "../../services/authService";
import { RootState } from "../../redux/store";
import NavigationMenu from "./NavigationMenu";
import {
  getSkipLinkProps,
  getSkipLinkTargetProps,
  initFocusTrap,
} from "../../utils/accessibilityUtils";

const drawerWidth = 260;

const AccessibleMainLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Referencias para accesibilidad
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inicializar mejoras de accesibilidad en la aplicación
    initFocusTrap();

    // Añadir atributos de accesibilidad al HTML general
    document.documentElement.lang = "es";
    document.title = "EducaNexo360 - Sistema de Comunicación Escolar";

    // Crear meta descripción si no existe
    if (!document.querySelector('meta[name="description"]')) {
      const metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content =
        "Sistema de comunicación escolar para conectar instituciones educativas, docentes, estudiantes y padres de familia";
      document.head.appendChild(metaDesc);
    }

    // Cerrar drawer al cambiar de tamaño de pantalla
    return () => {
      if (!isMobile && mobileOpen) {
        setMobileOpen(false);
      }
    };
  }, [isMobile, mobileOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const skipToMainProps = getSkipLinkProps(
    "Saltar al contenido principal",
    "main-content"
  );
  const skipToMenuProps = getSkipLinkProps(
    "Saltar al menú de navegación",
    "navigation-menu"
  );
  const mainContentProps = getSkipLinkTargetProps("main-content");
  const navigationMenuProps = getSkipLinkTargetProps("navigation-menu");

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Enlaces de salto para accesibilidad */}
      <Button {...skipToMainProps} />
      <Button {...skipToMenuProps} />

      {/* Barra superior */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "white",
          color: "text.primary",
          boxShadow: 1,
        }}
        aria-label="Barra superior"
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            EducaNexo360
          </Typography>

          <IconButton
            color="inherit"
            aria-label="Notificaciones"
            sx={{ mr: 2 }}
          >
            <NotificationsIcon />
          </IconButton>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleMenuOpen}
            aria-label="Menú de usuario"
            aria-controls="user-menu"
            aria-haspopup="true"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleMenuOpen(e as any);
              }
            }}
          >
            <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}>
              {user?.nombre?.charAt(0) || "U"}
            </Avatar>
            <Typography
              variant="body2"
              sx={{ ml: 1, display: { xs: "none", sm: "block" } }}
            >
              {user?.nombre} {user?.apellidos}
            </Typography>
          </Box>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            sx={{ mt: 1 }}
          >
            <MenuItem
              onClick={handleMenuClose}
              component="a"
              href="/perfil"
              sx={{ gap: 1 }}
            >
              <PersonIcon fontSize="small" />
              Perfil
            </MenuItem>

            <MenuItem
              onClick={handleMenuClose}
              component="a"
              href="/perfil/cambiar-password"
              sx={{ gap: 1 }}
            >
              <SettingsIcon fontSize="small" />
              Cambiar contraseña
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout} sx={{ gap: 1 }}>
              <LogoutIcon fontSize="small" />
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Menú de navegación */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="Menú de navegación"
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Mejor rendimiento en móviles
          }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow: { xs: 3, md: "none" },
            },
          }}
        >
          <Box sx={{ mt: 2, mb: 2, textAlign: "center" }}>
            {/* Reemplazamos el título por el logo */}
            <Box
              component="img"
              src="/EDUCANEXO36002.png"
              alt="EducaNexo360 Logo"
              sx={{
                height: "auto",
                width: "80%",
                maxWidth: 200,
                mb: 1,
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Sistema de Comunicación Escolar
            </Typography>
          </Box>
          <Divider />

          <Box {...navigationMenuProps}>
            <NavigationMenu />
          </Box>
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8, // Espacio para la barra superior
          mb: 2,
        }}
        ref={mainContentRef}
        id="main-content"
        tabIndex={-1}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AccessibleMainLayout;
