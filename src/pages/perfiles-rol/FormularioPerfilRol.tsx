// src/pages/perfiles-rol/FormularioPerfilRol.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import axiosInstance from '../../api/axiosConfig';
import { QUERY_KEYS } from '../../hooks/useAppQueries';
import {
  createPerfilRol,
  updatePerfilRol,
  getPerfilRol,
  getPermisosSugeridos,
} from '../../services/perfilRolService';
import { RolBase } from '../../types/user.types';

// ─── Catálogo estático de permisos agrupados por módulo ───────────────────────
// Se usa como fuente de verdad visual. El backend valida los strings exactos.
const MODULOS_PERMISOS: { modulo: string; label: string; permisos: { key: string; label: string }[] }[] = [
  {
    modulo: 'calificaciones',
    label: 'Calificaciones',
    permisos: [
      { key: 'calificaciones.ver', label: 'Ver' },
      { key: 'calificaciones.crear', label: 'Crear' },
      { key: 'calificaciones.editar', label: 'Editar' },
      { key: 'calificaciones.eliminar', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'asistencia',
    label: 'Asistencia',
    permisos: [
      { key: 'asistencia.ver', label: 'Ver' },
      { key: 'asistencia.registrar', label: 'Registrar' },
    ],
  },
  {
    modulo: 'anuncios',
    label: 'Anuncios',
    permisos: [
      { key: 'anuncios.ver', label: 'Ver' },
      { key: 'anuncios.crear', label: 'Crear' },
      { key: 'anuncios.editar', label: 'Editar' },
      { key: 'anuncios.eliminar', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'tareas',
    label: 'Tareas',
    permisos: [
      { key: 'tareas.ver', label: 'Ver' },
      { key: 'tareas.crear', label: 'Crear' },
      { key: 'tareas.editar', label: 'Editar' },
      { key: 'tareas.eliminar', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'calendario',
    label: 'Calendario',
    permisos: [
      { key: 'calendario.ver', label: 'Ver' },
      { key: 'calendario.crear', label: 'Crear' },
      { key: 'calendario.editar', label: 'Editar' },
    ],
  },
  {
    modulo: 'mensajes',
    label: 'Mensajes',
    permisos: [
      { key: 'mensajes.ver', label: 'Ver' },
      { key: 'mensajes.enviar', label: 'Enviar' },
    ],
  },
  {
    modulo: 'logros',
    label: 'Logros',
    permisos: [
      { key: 'logros.ver', label: 'Ver' },
      { key: 'logros.crear', label: 'Crear' },
      { key: 'logros.editar', label: 'Editar' },
      { key: 'logros.eliminar', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'usuarios',
    label: 'Usuarios',
    permisos: [
      { key: 'usuarios.ver', label: 'Ver' },
      { key: 'usuarios.crear', label: 'Crear' },
      { key: 'usuarios.editar', label: 'Editar' },
      { key: 'usuarios.eliminar', label: 'Eliminar' },
    ],
  },
  {
    modulo: 'cursos',
    label: 'Cursos',
    permisos: [
      { key: 'cursos.ver', label: 'Ver' },
      { key: 'cursos.crear', label: 'Crear' },
      { key: 'cursos.editar', label: 'Editar' },
    ],
  },
  {
    modulo: 'asignaturas',
    label: 'Asignaturas',
    permisos: [
      { key: 'asignaturas.ver', label: 'Ver' },
      { key: 'asignaturas.crear', label: 'Crear' },
      { key: 'asignaturas.editar', label: 'Editar' },
    ],
  },
  {
    modulo: 'reportes',
    label: 'Reportes',
    permisos: [{ key: 'reportes.ver', label: 'Ver' }],
  },
  {
    modulo: 'dashboard',
    label: 'Dashboard',
    permisos: [{ key: 'dashboard.ver', label: 'Ver' }],
  },
  {
    modulo: 'perfiles_rol',
    label: 'Perfiles de Rol',
    permisos: [{ key: 'perfiles_rol.gestionar', label: 'Gestionar' }],
  },
];

const ROLES_BASE: { value: RolBase; label: string }[] = [
  { value: 'DOCENTE', label: 'Docente' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'RECTOR', label: 'Rector' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'ACUDIENTE', label: 'Acudiente' },
  { value: 'ESTUDIANTE', label: 'Estudiante' },
];

const FormularioPerfilRol: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rolBase, setRolBase] = useState<RolBase | ''>('');
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargandoSugeridos, setCargandoSugeridos] = useState(false);

  // Carga el perfil cuando es edición
  useEffect(() => {
    if (!isEdit) return;
    const cargar = async () => {
      try {
        setLoading(true);
        const perfil = await getPerfilRol(id);
        setNombre(perfil.nombre);
        setDescripcion(perfil.descripcion || '');
        setRolBase(perfil.rolBase);
        setPermisosSeleccionados(new Set(perfil.permisos));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id, isEdit]);

  // Carga permisos sugeridos al cambiar el rol base (solo en modo creación)
  const handleRolBaseChange = useCallback(async (nuevoRol: RolBase) => {
    setRolBase(nuevoRol);
    if (isEdit) return; // En edición no sobreescribimos permisos existentes
    try {
      setCargandoSugeridos(true);
      const sugeridos = await getPermisosSugeridos(nuevoRol);
      setPermisosSeleccionados(new Set(sugeridos));
    } catch {
      // Si falla, simplemente no pre-seleccionamos nada
      setPermisosSeleccionados(new Set());
    } finally {
      setCargandoSugeridos(false);
    }
  }, [isEdit]);

  const togglePermiso = (permiso: string) => {
    setPermisosSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(permiso)) {
        next.delete(permiso);
      } else {
        next.add(permiso);
      }
      return next;
    });
  };

  const toggleModulo = (permisosDelModulo: string[]) => {
    const todosActivos = permisosDelModulo.every(p => permisosSeleccionados.has(p));
    setPermisosSeleccionados(prev => {
      const next = new Set(prev);
      permisosDelModulo.forEach(p => {
        if (todosActivos) {
          next.delete(p);
        } else {
          next.add(p);
        }
      });
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rolBase) {
      setError('Debes seleccionar un rol base');
      return;
    }
    if (!nombre.trim()) {
      setError('El nombre del perfil es requerido');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const permisos = Array.from(permisosSeleccionados);
      if (isEdit) {
        await updatePerfilRol(id, { nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, permisos });
      } else {
        await createPerfilRol({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, rolBase, permisos });
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERFILES_ROL });
      navigate('/perfiles-rol');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: '#059669' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <ShieldIcon sx={{ color: '#059669', fontSize: 32 }} />
        <Typography variant="h1" color="primary.main">
          {isEdit ? 'Editar Perfil de Rol' : 'Nuevo Perfil de Rol'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{ p: 3, borderRadius: 3, boxShadow: '0px 4px 4px rgba(0,0,0,0.05)', mb: 3 }}
      >
        <form onSubmit={handleSubmit}>
          {/* ── Datos básicos ── */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del perfil"
                placeholder="Ej: Psicólogo, Orientador"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                disabled={saving}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={saving || isEdit}>
                <InputLabel id="rol-base-label">Rol base</InputLabel>
                <Select
                  labelId="rol-base-label"
                  value={rolBase}
                  label="Rol base"
                  onChange={e => handleRolBaseChange(e.target.value as RolBase)}
                >
                  {ROLES_BASE.map(r => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </Select>
                {isEdit && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, px: 1.5 }}>
                    El rol base no puede modificarse después de crear el perfil
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción (opcional)"
                placeholder="Describe para qué sirve este perfil"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                multiline
                rows={2}
                disabled={saving}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* ── Permisos ── */}
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" color="text.primary">
              Permisos
            </Typography>
            {cargandoSugeridos && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: '#059669' }} />
                <Typography variant="caption" color="text.secondary">
                  Cargando permisos sugeridos...
                </Typography>
              </Box>
            )}
            <Chip
              label={`${permisosSeleccionados.size} seleccionados`}
              size="small"
              sx={{ bgcolor: '#d1fae5', color: '#065f46', fontWeight: 600, ml: 'auto' }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Selecciona los permisos que tendrá este perfil. Haz clic en el nombre del módulo para seleccionar/deseleccionar todos sus permisos.
          </Typography>

          <Grid container spacing={2}>
            {MODULOS_PERMISOS.map(({ modulo, label, permisos }) => {
              const keysDelModulo = permisos.map(p => p.key);
              const todosActivos = keysDelModulo.every(k => permisosSeleccionados.has(k));
              const algunoActivo = keysDelModulo.some(k => permisosSeleccionados.has(k));

              return (
                <Grid item xs={12} sm={6} md={4} key={modulo}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: algunoActivo ? '#059669' : '#e5e7eb',
                      bgcolor: algunoActivo ? '#f0fdf4' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={todosActivos}
                          indeterminate={algunoActivo && !todosActivos}
                          onChange={() => toggleModulo(keysDelModulo)}
                          sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
                          disabled={saving || cargandoSugeridos}
                        />
                      }
                      label={
                        <Typography variant="subtitle2" fontWeight={600}>
                          {label}
                        </Typography>
                      }
                    />
                    <FormGroup sx={{ pl: 2 }}>
                      {permisos.map(p => (
                        <FormControlLabel
                          key={p.key}
                          control={
                            <Checkbox
                              size="small"
                              checked={permisosSeleccionados.has(p.key)}
                              onChange={() => togglePermiso(p.key)}
                              sx={{ color: '#059669', '&.Mui-checked': { color: '#059669' } }}
                              disabled={saving || cargandoSugeridos}
                            />
                          }
                          label={<Typography variant="body2">{p.label}</Typography>}
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/perfiles-rol')}
              disabled={saving}
              sx={{ borderRadius: '20px' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving || cargandoSugeridos}
              sx={{ borderRadius: '20px' }}
            >
              {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear perfil'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default FormularioPerfilRol;
