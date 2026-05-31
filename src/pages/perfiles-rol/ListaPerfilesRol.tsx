// src/pages/perfiles-rol/ListaPerfilesRol.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { usePerfilesRol, QUERY_KEYS } from '../../hooks/useAppQueries';
import { deletePerfilRol } from '../../services/perfilRolService';
import { PerfilRol, RolBase } from '../../types/user.types';

const ROL_BASE_LABELS: Record<RolBase, string> = {
  DOCENTE: 'Docente',
  COORDINADOR: 'Coordinador',
  RECTOR: 'Rector',
  ADMINISTRATIVO: 'Administrativo',
  ACUDIENTE: 'Acudiente',
  ESTUDIANTE: 'Estudiante',
};

const ROL_BASE_COLORS: Record<RolBase, 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error'> = {
  DOCENTE: 'primary',
  COORDINADOR: 'info',
  RECTOR: 'warning',
  ADMINISTRATIVO: 'secondary',
  ACUDIENTE: 'success',
  ESTUDIANTE: 'error',
};

const ListaPerfilesRol: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: perfiles = [], isLoading, error } = usePerfilesRol();

  const [perfilAEliminar, setPerfilAEliminar] = useState<PerfilRol | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const handleConfirmarEliminar = async () => {
    if (!perfilAEliminar) return;
    try {
      setEliminando(true);
      setErrorEliminar(null);
      await deletePerfilRol(perfilAEliminar._id);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFILES_ROL });
      setPerfilAEliminar(null);
    } catch (err: any) {
      setErrorEliminar(err.response?.data?.message || 'Error al eliminar el perfil');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldIcon sx={{ color: '#059669', fontSize: 32 }} />
          <Typography variant="h1" color="primary.main">
            Perfiles de Rol
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/perfiles-rol/nuevo')}
          sx={{ borderRadius: '20px' }}
        >
          Nuevo Perfil
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Los perfiles de rol permiten crear roles personalizados (ej: Psicólogo, Orientador) que extienden un rol base con permisos específicos.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Error al cargar los perfiles de rol
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress sx={{ color: '#059669' }} />
        </Box>
      ) : perfiles.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 3,
            boxShadow: '0px 4px 4px rgba(0,0,0,0.05)',
            textAlign: 'center',
          }}
        >
          <ShieldIcon sx={{ fontSize: 56, color: '#d1fae5', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay perfiles de rol creados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crea un perfil personalizado para asignar permisos específicos a usuarios.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/perfiles-rol/nuevo')}
            sx={{ borderRadius: '20px' }}
          >
            Crear primer perfil
          </Button>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ borderRadius: 3, boxShadow: '0px 4px 4px rgba(0,0,0,0.05)' }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f0fdf4' }}>
                <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Rol base</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Descripción</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Permisos</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Estado</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perfiles.map((perfil: PerfilRol) => (
                <TableRow
                  key={perfil._id}
                  hover
                  sx={{ '&:last-child td': { border: 0 } }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {perfil.nombre}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ROL_BASE_LABELS[perfil.rolBase] ?? perfil.rolBase}
                      color={ROL_BASE_COLORS[perfil.rolBase] ?? 'default'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {perfil.descripcion || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={perfil.permisos.length}
                      size="small"
                      sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={perfil.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={perfil.activo ? 'success' : 'default'}
                      variant={perfil.activo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar perfil">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/perfiles-rol/editar/${perfil._id}`)}
                        sx={{ color: '#059669' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar perfil">
                      <IconButton
                        size="small"
                        onClick={() => setPerfilAEliminar(perfil)}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={!!perfilAEliminar}
        onClose={() => !eliminando && setPerfilAEliminar(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Eliminar perfil de rol</DialogTitle>
        <DialogContent>
          {errorEliminar && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {errorEliminar}
            </Alert>
          )}
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el perfil{' '}
            <strong>{perfilAEliminar?.nombre}</strong>?
            <br /><br />
            Los usuarios con este perfil serán reasignados automáticamente a su rol base ({perfilAEliminar ? ROL_BASE_LABELS[perfilAEliminar.rolBase] : ''}) sin permisos personalizados.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setPerfilAEliminar(null)}
            disabled={eliminando}
            sx={{ borderRadius: '20px' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            color="error"
            variant="contained"
            disabled={eliminando}
            startIcon={eliminando ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ borderRadius: '20px' }}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaPerfilesRol;
