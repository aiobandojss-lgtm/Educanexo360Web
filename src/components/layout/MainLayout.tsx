// src/components/layout/MainLayout.tsx
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
  Badge,
  Container,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import NavigationMenu from "./NavigationMenu";
import { logout } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";

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
  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    useState<null | HTMLElement>(null);

  const openUserMenu = Boolean(anchorEl);
  const openNotificationsMenu = Boolean(notificationsAnchorEl);

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

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    dispatch(logout());
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
              color="inherit"
              onClick={handleNotificationsClick}
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={2} color="primary">
                <NotificationsIcon />
              </Badge>
            </IconButton>

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

      {/* Menú de Notificaciones */}
      <Menu
        anchorEl={notificationsAnchorEl}
        open={openNotificationsMenu}
        onClose={handleNotificationsClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 2,
          sx: {
            mt: 1.5,
            borderRadius: 2,
            minWidth: 300,
            maxHeight: 400,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Notificaciones
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
          <MenuItem
            onClick={() => {
              handleNotificationsClose();
              navigate("/mensajes");
            }}
          >
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Nuevo mensaje recibido
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hace 5 minutos
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleNotificationsClose();
              navigate("/calificaciones");
            }}
          >
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Nueva calificación registrada
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hace 2 horas
              </Typography>
            </Box>
          </MenuItem>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            handleNotificationsClose();
            navigate("/notificaciones");
          }}
        >
          <Typography
            variant="body2"
            align="center"
            color="primary"
            sx={{ width: "100%" }}
          >
            Ver todas las notificaciones
          </Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MainLayout;
