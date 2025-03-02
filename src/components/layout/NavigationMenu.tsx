// src/components/layout/NavigationMenu.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  Box,
  Typography,
  Badge,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  MessageOutlined as MessageIcon,
  Grading as GradingIcon,
  Book as BookIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  ExpandLess,
  ExpandMore,
  Inbox as InboxIcon,
  Send as SendIcon,
  Drafts as DraftsIcon,
  Archive as ArchiveIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { RootState } from '../../redux/store';

const NavigationMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Estados para los menús desplegables
  const [openMensajes, setOpenMensajes] = useState(location.pathname.includes('/mensajes'));
  const [openCalificaciones, setOpenCalificaciones] = useState(location.pathname.includes('/calificaciones'));
  const [openCursos, setOpenCursos] = useState(location.pathname.includes('/cursos'));
  const [openUsuarios, setOpenUsuarios] = useState(location.pathname.includes('/usuarios'));

  // Funciones para manejar la navegación
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // Funciones para alternar los menús desplegables
  const handleToggleMensajes = () => {
    setOpenMensajes(!openMensajes);
  };

  const handleToggleCalificaciones = () => {
    setOpenCalificaciones(!openCalificaciones);
  };

  const handleToggleCursos = () => {
    setOpenCursos(!openCursos);
  };

  const handleToggleUsuarios = () => {
    setOpenUsuarios(!openUsuarios);
  };

  // Función para determinar si un elemento está activo
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Renderización condicional basada en el tipo de usuario
  const isAdmin = user?.tipo === 'ADMIN';
  const isDocente = user?.tipo === 'DOCENTE';
  const isPadre = user?.tipo === 'PADRE';
  const isEstudiante = user?.tipo === 'ESTUDIANTE';

  // Mensajes no leídos (simulado)
  const unreadMessages = 5;

  return (
    <Box sx={{ overflowY: 'auto', height: '100%' }}>
      <List component="nav" sx={{ px: 1 }}>
        {/* Dashboard - para todos los usuarios */}
        <ListItemButton
          onClick={() => handleNavigate('/')}
          selected={isActive('/')}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'rgba(93, 169, 233, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(93, 169, 233, 0.20)',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
              '& .MuiListItemText-primary': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        {/* Mensajes - para todos los usuarios */}
        <ListItemButton
          onClick={handleToggleMensajes}
          selected={isActive('/mensajes')}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'rgba(93, 169, 233, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(93, 169, 233, 0.20)',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
              '& .MuiListItemText-primary': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={unreadMessages} color="error">
              <MessageIcon />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Mensajes" />
          {openMensajes ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openMensajes} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/mensajes/recibidos')}
              selected={isActive('/mensajes/recibidos')}
              sx={{
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.16)',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemIcon>
                <InboxIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Recibidos</Typography>
                    <Badge badgeContent={unreadMessages} color="error" sx={{ ml: 1 }} />
                  </Box>
                } 
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate('/mensajes/enviados')}
              selected={isActive('/mensajes/enviados')}
              sx={{
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.16)',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemIcon>
                <SendIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Enviados" />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate('/mensajes/borradores')}
              selected={isActive('/mensajes/borradores')}
              sx={{
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.16)',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemIcon>
                <DraftsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Borradores" />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate('/mensajes/archivados')}
              selected={isActive('/mensajes/archivados')}
              sx={{
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.16)',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemIcon>
                <ArchiveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Archivados" />
            </ListItemButton>
          </List>
        </Collapse>

        {/* Calificaciones - Visible para todos los usuarios */}
        <ListItemButton
          onClick={handleToggleCalificaciones}
          selected={isActive('/calificaciones')}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'rgba(93, 169, 233, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(93, 169, 233, 0.20)',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
              '& .MuiListItemText-primary': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <GradingIcon />
          </ListItemIcon>
          <ListItemText primary="Calificaciones" />
          {openCalificaciones ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openCalificaciones} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton
              onClick={() => handleNavigate('/calificaciones/lista')}
              selected={isActive('/calificaciones/lista')}
              sx={{
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.16)',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemText primary="Lista de Calificaciones" />
            </ListItemButton>

            <ListItemButton
              onClick={() => handleNavigate('/calificaciones/boletin')}
              selected={isActive('/calificaciones/boletin')}
              sx={{
                pl: 4,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.16)',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
              }}
            >
              <ListItemText primary="Boletín" />
            </ListItemButton>

            {(isAdmin || isDocente) && (
              <ListItemButton
                onClick={() => handleNavigate('/calificaciones/estadisticas')}
                selected={isActive('/calificaciones/estadisticas')}
                sx={{
                  pl: 4,
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(93, 169, 233, 0.08)',
                    '&:hover': {
                      backgroundColor: 'rgba(93, 169, 233, 0.16)',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 'bold',
                    },
                  },
                }}
              >
                <ListItemText primary="Estadísticas" />
              </ListItemButton>
            )}
          </List>
        </Collapse>

        {/* Usuarios - Solo para administradores */}
        {isAdmin && (
          <>
            <ListItemButton
              onClick={handleToggleUsuarios}
              selected={isActive('/usuarios')}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.20)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon>
                <GroupIcon />
              </ListItemIcon>
              <ListItemText primary="Usuarios" />
              {openUsuarios ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openUsuarios} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/usuarios')}
                  selected={location.pathname === '/usuarios'}
                  sx={{
                    pl: 4,
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(93, 169, 233, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(93, 169, 233, 0.16)',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      },
                    },
                  }}
                >
                  <ListItemText primary="Lista de Usuarios" />
                </ListItemButton>

                <ListItemButton
                  onClick={() => handleNavigate('/usuarios/nuevo')}
                  selected={isActive('/usuarios/nuevo')}
                  sx={{
                    pl: 4,
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(93, 169, 233, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(93, 169, 233, 0.16)',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      },
                    },
                  }}
                >
                  <ListItemText primary="Nuevo Usuario" />
                </ListItemButton>
              </List>
            </Collapse>
          </>
        )}

        {/* Cursos - Para administradores y docentes */}
        {(isAdmin || isDocente) && (
          <>
            <ListItemButton
              onClick={handleToggleCursos}
              selected={isActive('/cursos')}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(93, 169, 233, 0.12)',
                  '&:hover': {
                    backgroundColor: 'rgba(93, 169, 233, 0.20)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '& .MuiListItemText-primary': {
                    color: 'primary.main',
                    fontWeight: 'bold',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText primary="Cursos" />
              {openCursos ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>

            <Collapse in={openCursos} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate('/cursos')}
                  selected={location.pathname === '/cursos'}
                  sx={{
                    pl: 4,
                    borderRadius: 2,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(93, 169, 233, 0.08)',
                      '&:hover': {
                        backgroundColor: 'rgba(93, 169, 233, 0.16)',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'primary.main',
                        fontWeight: 'bold',
                      },
                    },
                  }}
                >
                  <ListItemText primary="Lista de Cursos" />
                </ListItemButton>

                {isAdmin && (
                  <ListItemButton
                    onClick={() => handleNavigate('/cursos/nuevo')}
                    selected={isActive('/cursos/nuevo')}
                    sx={{
                      pl: 4,
                      borderRadius: 2,
                      mb: 0.5,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(93, 169, 233, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(93, 169, 233, 0.16)',
                        },
                        '& .MuiListItemText-primary': {
                          color: 'primary.main',
                          fontWeight: 'bold',
                        },
                      },
                    }}
                  >
                    <ListItemText primary="Nuevo Curso" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
          </>
        )}

        {/* Logros - Para administradores y docentes */}
        {(isAdmin || isDocente) && (
          <ListItemButton
            onClick={() => handleNavigate('/logros')}
            selected={isActive('/logros')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(93, 169, 233, 0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(93, 169, 233, 0.20)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon>
              <StarIcon />
            </ListItemIcon>
            <ListItemText primary="Logros Académicos" />
          </ListItemButton>
        )}

        {/* Perfil - Para todos los usuarios */}
        <ListItemButton
          onClick={() => handleNavigate('/perfil')}
          selected={isActive('/perfil')}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'rgba(93, 169, 233, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(93, 169, 233, 0.20)',
              },
              '& .MuiListItemIcon-root': {
                color: 'primary.main',
              },
              '& .MuiListItemText-primary': {
                color: 'primary.main',
                fontWeight: 'bold',
              },
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Mi Perfil" />
        </ListItemButton>

        {/* Configuración - Solo para administradores */}
        {isAdmin && (
          <ListItemButton
            onClick={() => handleNavigate('/configuracion')}
            selected={isActive('/configuracion')}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(93, 169, 233, 0.12)',
                '&:hover': {
                  backgroundColor: 'rgba(93, 169, 233, 0.20)',
                },
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
          </ListItemButton>
        )}
      </List>

      {/* Información de la versión */}
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary">
          EducaNexo360 v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default NavigationMenu;