// src/pages/logros/ListaLogros.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  LinearProgress,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
  Edit,
  Delete,
  FilterList,
  Assignment,
  School,
  MenuBook,
  CalendarToday,
} from '@mui/icons-material';
import logroService, { Logro } from '../../services/logroService';
import axiosInstance from '../../api/axiosConfig';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

// Interfaces for selection options
interface CursoOption {
  _id: string;
  nombre: string;
  grado: string;
  grupo: string;
}

interface AsignaturaOption {
  _id: string;
  nombre: string;
  codigo: string;
}

const ListaLogros = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [logros, setLogros] = useState<Logro[]>([]);
  const [cursos, setCursos] = useState<CursoOption[]>([]);
  const [asignaturas, setAsignaturas] = useState<AsignaturaOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cursoId, setCursoId] = useState<string>('');
  const [asignaturaId, setAsignaturaId] = useState<string>('');
  const [periodo, setPeriodo] = useState<number>(0);
  const [año, setAño] = useState<string>(new Date().getFullYear().toString());
  const [pagina, setPagina] = useState<number>(0);
  const [filasPorPagina, setFilasPorPagina] = useState<number>(10);
  const [totalLogros, setTotalLogros] = useState<number>(0);
  const [filtrosExpandidos, setFiltrosExpandidos] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; logroId: string | null }>({
    open: false,
    logroId: null,
  });

  const añosAcademicos = Array.from(
    { length: 5 },
    (_, i) => (new Date().getFullYear() - 2 + i).toString()
  );

  const periodos = [1, 2, 3, 4];

  useEffect(() => {
    cargarCursos();
    cargarAsignaturas();
  }, []);

  useEffect(() => {
    cargarLogros();
  }, [cursoId, asignaturaId, periodo, año, pagina, filasPorPagina]);

  const cargarCursos = async () => {
    try {
      const response = await axiosInstance.get('/cursos');
      if (response.data?.success) {
        setCursos(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    }
  };

  const cargarAsignaturas = async () => {
    try {
      const response = await axiosInstance.get('/asignaturas');
      if (response.data?.success) {
        setAsignaturas(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading subjects:', err);
    }
  };

  const cargarLogros = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build search parameters
      const params: any = {
        page: pagina + 1,
        limit: filasPorPagina,
      };

      if (cursoId) params.cursoId = cursoId;
      if (asignaturaId) params.asignaturaId = asignaturaId;
      if (periodo > 0) params.periodo = periodo;
      if (año) params.año_academico = año;
      if (searchTerm) params.q = searchTerm;

      const response = await logroService.obtenerLogros(params);
      
      if (response.success) {
        setLogros(response.data || []);
        setTotalLogros(response.meta?.total || response.data?.length || 0);
      } else {
        throw new Error('Error loading achievements');
      }
    } catch (err: any) {
      console.error('Error loading achievements:', err);
      setError(err.response?.data?.message || 'Could not load academic achievements');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    setPagina(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilasPorPagina(parseInt(event.target.value, 10));
    setPagina(0);
  };

  const handleCursoChange = (event: SelectChangeEvent) => {
    setCursoId(event.target.value);
  };

  const handleAsignaturaChange = (event: SelectChangeEvent) => {
    setAsignaturaId(event.target.value);
  };

  const handlePeriodoChange = (event: SelectChangeEvent) => {
    setPeriodo(parseInt(event.target.value));
  };

  const handleAñoChange = (event: SelectChangeEvent) => {
    setAño(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    cargarLogros();
  };

  const handleRefresh = () => {
    cargarLogros();
  };

  const handleToggleFiltros = () => {
    setFiltrosExpandidos(!filtrosExpandidos);
  };

  const handleNuevoLogro = () => {
    navigate('/logros/nuevo', { 
      state: { 
        cursoId, 
        asignaturaId, 
        periodo: periodo > 0 ? periodo : undefined,
        año_academico: año 
      } 
    });
  };

  const handleEditLogro = (id: string) => {
    navigate(`/logros/editar/${id}`);
  };

  const handleDeleteClick = (logroId: string) => {
    setDeleteDialog({ open: true, logroId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.logroId) return;
    
    try {
      setLoading(true);
      const response = await logroService.eliminarLogro(deleteDialog.logroId);
      
      if (response.success) {
        // Update achievement list
        setLogros(logros.filter(logro => logro._id !== deleteDialog.logroId));
        setTotalLogros(totalLogros - 1);
      }
    } catch (err: any) {
      console.error('Error deleting achievement:', err);
      setError(err.response?.data?.message || 'Could not delete achievement');
    } finally {
      setLoading(false);
      setDeleteDialog({ open: false, logroId: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, logroId: null });
  };

  // Get label for achievement status
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'Active';
      case 'INACTIVO': return 'Inactive';
      case 'COMPLETADO': return 'Completed';
      default: return estado;
    }
  };

  // Get color for status chip
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'ACTIVO': return 'success';
      case 'INACTIVO': return 'error';
      case 'COMPLETADO': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Academic Achievement Management
      </Typography>

      {/* Action and search bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex' }}>
              <TextField
                variant="outlined"
                size="small"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mr: 1, flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2 }
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ 
                  borderRadius: 20,
                  px: 3,
                  fontWeight: 500,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                Search
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleToggleFiltros}
              sx={{ 
                borderRadius: 20,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.secondary'
              }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              sx={{ 
                borderRadius: 20,
                borderColor: 'rgba(0, 0, 0, 0.12)',
                color: 'text.secondary'
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Add />}
              onClick={handleNuevoLogro}
              sx={{ 
                borderRadius: 20,
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              New Achievement
            </Button>
          </Grid>

          {/* Expandable filters */}
          {filtrosExpandidos && (
            <Grid item xs={12}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Typography variant="h3" gutterBottom>Filters</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="curso-label">Course</InputLabel>
                      <Select
                        labelId="curso-label"
                        value={cursoId}
                        onChange={handleCursoChange}
                        label="Course"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All courses</MenuItem>
                        {cursos.map((curso) => (
                          <MenuItem key={curso._id} value={curso._id}>
                            {curso.nombre} ({curso.grado}° {curso.grupo})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="asignatura-label">Subject</InputLabel>
                      <Select
                        labelId="asignatura-label"
                        value={asignaturaId}
                        onChange={handleAsignaturaChange}
                        label="Subject"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All subjects</MenuItem>
                        {asignaturas.map((asignatura) => (
                          <MenuItem key={asignatura._id} value={asignatura._id}>
                            {asignatura.nombre} ({asignatura.codigo})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="periodo-label">Period</InputLabel>
                      <Select
                        labelId="periodo-label"
                        value={periodo.toString()}
                        onChange={handlePeriodoChange}
                        label="Period"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value={0}>All periods</MenuItem>
                        {periodos.map((p) => (
                          <MenuItem key={p} value={p.toString()}>
                            Period {p}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="año-label">Academic Year</InputLabel>
                      <Select
                        labelId="año-label"
                        value={año}
                        onChange={handleAñoChange}
                        label="Academic Year"
                        sx={{ borderRadius: 2 }}
                      >
                        {añosAcademicos.map((a) => (
                          <MenuItem key={a} value={a}>
                            {a}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Achievements table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)',
        }}
      >
        {loading && <LinearProgress />}
        
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Course</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Subject</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Period</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Weight</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && logros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ height: 200 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        m: 2,
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                          fontWeight: 500
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </TableCell>
                </TableRow>
              ) : logros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No academic achievements found.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={handleNuevoLogro}
                      sx={{ 
                        mt: 2,
                        borderRadius: 20,
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      Create New Achievement
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                logros.map((logro) => (
                  <TableRow 
                    key={logro._id}
                    sx={{ 
                      '&:hover': { bgcolor: 'rgba(93, 169, 233, 0.08)' },
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/logros/${logro._id}`)}
                  >
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Tooltip title={logro.descripcion} placement="top-start">
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            fontWeight: 500,
                            color: 'primary.main'
                          }}
                        >
                          {logro.descripcion}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {typeof logro.cursoId === 'object' && logro.cursoId ? 
                        `${logro.cursoId.nombre || ''} (${logro.cursoId.grado || ''}° ${logro.cursoId.grupo || ''})` : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      {typeof logro.asignaturaId === 'object' && logro.asignaturaId ? 
                        `${logro.asignaturaId.nombre || ''} (${logro.asignaturaId.codigo || ''})` : 
                        'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          Period {logro.periodo} - {logro.año_academico}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${logro.peso}%`} 
                        size="small" 
                        color="primary" 
                        sx={{ fontWeight: 'bold', borderRadius: 8 }} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getEstadoLabel(logro.estado)}
                        color={getEstadoColor(logro.estado) as any}
                        size="small"
                        sx={{ fontWeight: 'bold', borderRadius: 8 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditLogro(logro._id);
                            }}
                            sx={{ 
                              bgcolor: 'rgba(0, 63, 145, 0.1)',
                              '&:hover': { bgcolor: 'rgba(0, 63, 145, 0.2)' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(logro._id);
                            }}
                            sx={{ 
                              bgcolor: 'rgba(244, 67, 54, 0.1)',
                              '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalLogros}
          page={pagina}
          onPageChange={handlePageChange}
          rowsPerPage={filasPorPagina}
          onRowsPerPageChange={handleRowsPerPageChange}
          labelRowsPerPage="Rows per page"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Confirmation dialog for deleting achievement */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this academic achievement? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleDeleteCancel} 
            color="inherit"
            sx={{ 
              borderRadius: 20,
              px: 3
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 20,
              px: 3,
              boxShadow: 'none'
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListaLogros;