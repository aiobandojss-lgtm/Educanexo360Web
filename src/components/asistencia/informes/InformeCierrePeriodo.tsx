import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useEscuela, useCursos } from '../../../hooks/useAppQueries';
import { getResumenPeriodo } from '../../../services/asistenciaInformesService';
import { generarPdfCierrePeriodo } from '../../../utils/pdfGenerators/pdfCierrePeriodo';

const InformeCierrePeriodo: React.FC = () => {
  const [periodoId, setPeriodoId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);
  const { data: escuela } = useEscuela();
  const { data: cursosData } = useCursos();

  const cursos: any[] =
    (cursosData as any)?.data ?? (Array.isArray(cursosData) ? cursosData : []);
  const periodos = escuela?.periodos_academicos ?? [];

  const handleGenerar = async () => {
    if (!periodoId || !cursoId) return;
    setError('');
    setGenerando(true);
    try {
      const estadisticas = await getResumenPeriodo(periodoId, cursoId);
      const curso = cursos.find((c: any) => c._id === cursoId);
      const periodo = periodos.find((p) => p._id === periodoId);
      generarPdfCierrePeriodo(
        {
          estadisticas,
          nombreCurso: curso?.nombre ?? 'Curso',
          grado: curso?.grado ?? '',
          grupo: curso?.grupo ?? '',
          nombrePeriodo: periodo?.nombre ?? 'Período',
        },
        escuela ?? null,
        `${user?.nombre ?? ''} ${user?.apellidos ?? ''}`.trim()
      );
    } catch {
      setError('Error al obtener los datos. Verifique que el período y curso tengan registros de asistencia.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          maxWidth: 560,
        }}
      >
        <Typography variant="h3" sx={{ mb: 3 }}>
          Generar PDF de Cierre de Período
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Período académico"
              select
              size="small"
              fullWidth
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
            >
              {periodos.length === 0 && (
                <MenuItem value="" disabled>
                  Sin períodos configurados
                </MenuItem>
              )}
              {periodos.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Curso"
              select
              size="small"
              fullWidth
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value)}
            >
              {cursos.map((c: any) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombre} {c.grado}-{c.grupo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={
                generando ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <PdfIcon />
                )
              }
              onClick={handleGenerar}
              disabled={!periodoId || !cursoId || generando}
              sx={{ borderRadius: 20, py: 1.2, textTransform: 'none', fontSize: '0.95rem' }}
            >
              {generando ? 'Generando PDF...' : 'Generar y descargar PDF'}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {periodos.length === 0 && escuela && (
          <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
            La institución no tiene períodos académicos configurados. Configúrelos en Ajustes → Escuela.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default InformeCierrePeriodo;
