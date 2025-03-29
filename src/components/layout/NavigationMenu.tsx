// src/components/layout/NavigationMenu.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Group as UsersIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  MenuBook as CursosIcon,
  ExpandLess,
  ExpandMore,
  CalendarMonth as CalendarIcon,
  HowToReg as AsistenciaIcon,
  Delete as DeleteIcon, // Ícono para mensajes eliminados
  Send as SendIcon, // Ícono para mensajes enviados
  Inbox as InboxIcon, // Ícono para mensajes recibidos
  Create as CreateIcon, // Ícono para nuevo mensaje
  Edit as EditIcon, // Ícono para mensajes borradores
  Announcement as AnnouncementIcon,
} from '@mui/icons-material';
import { RootState } from '../../redux/store';
import { Archive as ArchiveIcon } from '@mui/icons-material';

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  allowedRoles: string[];
  children?: NavigationItem[];
}

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const handleClick = (path: string) => {
    navigate(path);
  };

  const handleToggle = (title: string, event: React.MouseEvent) => {
    // Detener la propagación para evitar que el evento llegue al ListItemButton
    event.stopPropagation();
    
    setOpen((prevOpen) => ({
      ...prevOpen,
      [title]: !prevOpen[title],
    }));
  };

  // Configuración del menú
  const menuItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
    },
    {
      title: 'Mensajería',
      icon: <MessageIcon />,
      path: '/mensajes',
      allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
      children: [
        {
          title: 'Recibidos',
          icon: <InboxIcon />,
          path: '/mensajes/recibidos',
          allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
        {
          title: 'Enviados',
          icon: <SendIcon />,
          path: '/mensajes/enviados',
          // Excluimos ESTUDIANTE de los roles que pueden ver "Enviados"
          allowedRoles: ['ADMIN', 'DOCENTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
        {
          title: 'Borradores',
          icon: <EditIcon />,
          path: '/mensajes/borradores',
          // Solo los roles con permiso para usar borradores
          allowedRoles: ['ADMIN', 'DOCENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
        {
          title: 'Archivados',
          icon: <ArchiveIcon />, // Asegúrate de importar ArchiveIcon
          path: '/mensajes/archivados',
          // Incluimos ESTUDIANTE en los roles que pueden ver "Archivados"
          allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
        {
          title: 'Nuevo Mensaje',
          icon: <CreateIcon />,
          path: '/mensajes/nuevo',
          // Excluimos ESTUDIANTE de los roles que pueden crear "Nuevo Mensaje"
          allowedRoles: ['ADMIN', 'DOCENTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
        {
          title: 'Eliminados',
          icon: <DeleteIcon />,
          path: '/mensajes/eliminados',
          allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
      ],
    },
    {
      title: 'Usuarios',
      icon: <UsersIcon />,
      path: '/usuarios',
      // Eliminamos 'ADMINISTRATIVO' de los roles permitidos para ver Usuarios
      allowedRoles: ['ADMIN', 'COORDINADOR', 'RECTOR'],
    },
    {
      title: 'Cursos',
      icon: <CursosIcon />,
      path: '/cursos',
      allowedRoles: ['ADMIN', 'DOCENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
    },
    // Nuevo ítem de menú para Asistencia
    {
      title: 'Asistencia',
      icon: <AsistenciaIcon />,
      path: '/asistencia',
      allowedRoles: ['ADMIN', 'DOCENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
      children: [
        {
          title: 'Lista de Registros',
          icon: <AsistenciaIcon />,
          path: '/asistencia',
          allowedRoles: ['ADMIN', 'DOCENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
        {
          title: 'Nuevo Registro',
          icon: <AsistenciaIcon />,
          path: '/asistencia/registro',
          allowedRoles: ['ADMIN', 'DOCENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
        },
      ],
    },
    {
      title: 'Calendario Escolar',
      icon: <CalendarIcon />,
      path: '/calendario',
      allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
    },
    {
      title: 'Tablero de Anuncios',
      icon: <AnnouncementIcon />,
      path: '/anuncios',
      allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
    },
    {
      title: 'Perfil',
      icon: <PersonIcon />,
      path: '/perfil',
      allowedRoles: ['ADMIN', 'DOCENTE', 'ESTUDIANTE', 'PADRE', 'ACUDIENTE', 'COORDINADOR', 'RECTOR', 'ADMINISTRATIVO'],
    },
    //{
     // title: 'Configuración',
     // icon: <SettingsIcon />,
     // path: '/configuracion',
      //allowedRoles: ['ADMIN', 'COORDINADOR', 'RECTOR'],
    //},
  ];

  // Filtrar menú por rol de usuario - usando useMemo para evitar recalcular en cada render
  const userRole = user?.tipo || '';
  const filteredMenu = useMemo(() => {
    return menuItems.filter((item) => item.allowedRoles.includes(userRole));
  }, [userRole]);

  // Actualizamos el estado de expansión cuando cambia la ruta
  useEffect(() => {
    // Solo necesitamos ejecutar esto cuando cambia la ruta o el menú filtrado
    const newOpenState: { [key: string]: boolean } = {...open};
    let didChange = false;
    
    filteredMenu.forEach(item => {
      if (item.children) {
        const shouldBeOpen = item.children.some(child => 
          location.pathname === child.path || location.pathname.startsWith(child.path)
        );
        
        if (shouldBeOpen && !newOpenState[item.title]) {
          newOpenState[item.title] = true;
          didChange = true;
        }
      }
    });
    
    // Solo actualizar el estado si hubo un cambio real
    if (didChange) {
      setOpen(newOpenState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, filteredMenu]); // Eliminamos 'open' de las dependencias

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
      <List component="nav" sx={{ p: 1 }}>
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path || 
                          (item.children && location.pathname.startsWith(item.path));
          
          if (item.children) {
            return (
              <React.Fragment key={item.title}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => handleClick(item.path)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      bgcolor: isActive ? 'rgba(93, 169, 233, 0.1)' : 'transparent',
                      '&:hover': {
                        bgcolor: isActive ? 'rgba(93, 169, 233, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: isActive ? 600 : 400, 
                            color: isActive ? 'primary.main' : 'inherit' 
                          }}
                        >
                          {item.title}
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleToggle(item.title, e)}
                      sx={{ ml: 1 }}
                    >
                      {open[item.title] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </ListItemButton>
                </ListItem>
                <Collapse in={open[item.title]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children
                      .filter(child => child.allowedRoles.includes(userRole))
                      .map((child) => {
                        const isChildActive = location.pathname === child.path ||
                                            location.pathname.startsWith(child.path);
                        return (
                          <ListItem key={child.title} disablePadding>
                            <ListItemButton
                              onClick={() => handleClick(child.path)}
                              sx={{
                                pl: 4,
                                borderRadius: 2,
                                mb: 0.5,
                                bgcolor: isChildActive ? 'rgba(93, 169, 233, 0.1)' : 'transparent',
                                '&:hover': {
                                  bgcolor: isChildActive ? 'rgba(93, 169, 233, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ color: isChildActive ? 'primary.main' : 'inherit' }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      fontWeight: isChildActive ? 600 : 400, 
                                      color: isChildActive ? 'primary.main' : 'inherit' 
                                    }}
                                  >
                                    {child.title}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          
          return (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                onClick={() => handleClick(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? 'rgba(93, 169, 233, 0.1)' : 'transparent',
                  '&:hover': {
                    bgcolor: isActive ? 'rgba(93, 169, 233, 0.2)' : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: isActive ? 600 : 400, 
                        color: isActive ? 'primary.main' : 'inherit' 
                      }}
                    >
                      {item.title}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary" align="center">
          EducaNexo360 © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
};

export default NavigationMenu;