// src/components/layout/MainLayout.tsx
import React, { useState, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  Divider,
  Container,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import NavigationMenu from "./NavigationMenu";
import { logout } from "../../redux/slices/authSlice";
import { logout as authLogout } from "../../services/authService";
import { RootState } from "../../redux/store";
import { usePerfilesRol } from "../../hooks/useAppQueries";
import { PerfilRol } from "../../types/user.types";

// Función para obtener la etiqueta correcta del rol de usuario
const getRoleLabel = (role?: string): string => {
  if (!role) return "Usuario";

  switch (role) {
    case "ADMIN":
      return "Administrador";
    case "COORDINADOR":
      return "Coordinador";
    case "RECTOR":
      return "Rector";
    case "ASISTENTE":
      return "Asistente";
    case "ESTUDIANTE":
      return "Estudiante";
    case "ACUDIENTE":
      return "Acudiente";
    case "PADRE":
      return "Padre";
    case "DOCENTE":
      return "Docente";
    case "ADMINISTRATIVO":
      return "Administrativo";
    default:
      return role;
  }
};

const drawerWidth = 260;

const MainLayout: React.FC = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const { user } = useSelector((state: RootState) => state.auth);

  // Solo los roles que pueden consultar /api/perfiles-rol
  const puedeVerPerfiles = ['ADMIN', 'RECTOR', 'COORDINADOR'].includes(user?.tipo || '');
  const { data: perfiles = [] } = usePerfilesRol(puedeVerPerfiles);

  // Nombre del perfil personalizado del usuario logueado (si tiene uno)
  const perfilNombre = useMemo(() => {
    if (!user?.perfilRolId) return null;
    if (puedeVerPerfiles) {
      const encontrado = (perfiles as PerfilRol[]).find(p => p._id === user.perfilRolId);
      return encontrado?.nombre ?? null;
    }
    // Para roles que no pueden consultar la lista, indicamos que tiene perfil personalizado
    return 'Perfil personalizado';
  }, [user?.perfilRolId, perfiles, puedeVerPerfiles]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openUserMenu = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCloseDrawer = () => {
    if (isSmallScreen) {
      setMobileOpen(false);
    }
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    authLogout(); // Limpia localStorage (tokens, userProfile)
    qc.clear();   // Limpia caché de react-query para evitar filtración entre sesiones
    dispatch(logout()); // Limpia Redux state
    navigate("/login");
  };

  const handleViewProfile = () => {
    handleUserMenuClose();
    navigate("/perfil");
  };

  const handleViewSettings = () => {
    handleUserMenuClose();
    if (user?.tipo === "ADMIN") {
      navigate("/configuracion");
    } else {
      navigate("/perfil");
    }
  };

  const drawer = (
    <Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 3,
          bgcolor: "primary.main",
          color: "white",
        }}
      >
        {/* Reemplazamos el título por el logo */}
        <Box
          component="img"
          src="/EDUCANEXO36002.png"
          alt="EducaNexo360 Logo"
          sx={{
            height: "auto",
            width: "80%",
            maxWidth: 220,
            mb: 1,
          }}
        />
        <Typography variant="subtitle2" sx={{ mt: 1 }}>
          {getRoleLabel(user?.tipo)}
          {perfilNombre && (
            <Box
              component="span"
              sx={{
                display: 'block',
                fontSize: '0.7rem',
                fontWeight: 600,
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: '10px',
                px: 1,
                py: 0.25,
                mt: 0.5,
                letterSpacing: 0.3,
              }}
            >
              {perfilNombre}
            </Box>
          )}
        </Typography>
      </Box>
      <Box sx={{ mt: 1 }} onClick={handleCloseDrawer}>
        <NavigationMenu />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
          bgcolor: "white",
          color: "text.primary",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center" }}
          >
            <ArrowBackIcon
              sx={{ cursor: "pointer", mr: 1 }}
              onClick={() => navigate(-1)}
            />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={handleUserMenuClick}
              sx={{
                padding: 0.5,
                border: "2px solid",
                borderColor: "primary.main",
              }}
            >
              <Avatar
                sx={{ bgcolor: "primary.main", width: 32, height: 32 }}
                alt={`${user?.nombre} ${user?.apellidos}`}
              >
                {user?.nombre?.[0] || "U"}
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              boxShadow: "2px 0px 10px rgba(0, 0, 0, 0.05)",
              border: "none",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ pb: 4 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Menú de Usuario */}
      <Menu
        anchorEl={anchorEl}
        open={openUserMenu}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 180,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {user?.nombre} {user?.apellidos}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={handleViewProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Perfil
        </MenuItem>

        <MenuItem onClick={handleViewSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Configuración
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>

    </Box>
  );
};

export default MainLayout;
