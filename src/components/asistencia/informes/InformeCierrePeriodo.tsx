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
import { PictureAsPdf as PdfIcon, LightbulbOutlined as LightbulbIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import { useEscuela, useCursos } from '../../../hooks/useAppQueries';
import {
  getResumenPeriodo,
  type EstadisticaEstudiantePeriodo,
} from '../../../services/asistenciaInformesService';
import { generarPdfCierrePeriodo } from '../../../utils/pdfGenerators/pdfCierrePeriodo';

interface InterpretacionCierre {
  severity: 'success' | 'warning' | 'error';
  titulo: string;
  mensajes: string[];
  acciones: string[];
}

const computarInterpretacion = (
  estadisticas: EstadisticaEstudiantePeriodo[]
): InterpretacionCierre => {
  const total = estadisticas.length;
  if (total === 0) {
    return {
      severity: 'warning',
      titulo: 'Sin datos suficientes para el diagnóstico',
      mensajes: ['No se encontraron registros de asistencia para este período y curso.'],
      acciones: [],
    };
  }

  const promedio = estadisticas.reduce((s, e) => s + e.porcentajeAsistencia, 0) / total;
  const criticos   = estadisticas.filter((e) => e.porcentajeAsistencia < 70).length;
  const enAlerta   = estadisticas.filter((e) => e.porcentajeAsistencia >= 70 && e.porcentajeAsistencia < 80).length;
  const enRiesgo   = estadisticas.filter((e) => e.porcentajeAsistencia < 80).length;
  const excelentes = estadisticas.filter((e) => e.porcentajeAsistencia >= 90).length;
  const mejor = estadisticas.reduce((a, b) => a.porcentajeAsistencia > b.porcentajeAsistencia ? a : b);
  const peor  = estadisticas.reduce((a, b) => a.porcentajeAsistencia < b.porcentajeAsistencia ? a : b);

  const mensajes: string[] = [];
  const acciones: string[] = [];

  mensajes.push(
    `El curso cerró el período con un promedio de asistencia del ${promedio.toFixed(1)}%. De los ${total} estudiantes evaluados: ${total - enRiesgo} dentro del umbral aceptable (≥80%), ${enAlerta} en zona de alerta y ${criticos} en nivel crítico.`
  );

  if (criticos > 0) {
    mensajes.push(
      `${criticos} estudiante${criticos > 1 ? 's' : ''} ${criticos > 1 ? 'presentaron' : 'presentó'} asistencia inferior al 70% durante el período — nivel de riesgo de reprobación por inasistencia, independientemente de las calificaciones académicas obtenidas.`
    );
    acciones.push('Documentar los casos críticos en el acta de cierre de período.');
    acciones.push('Notificar formalmente a los acudientes antes del inicio del siguiente período.');
    acciones.push('Evaluar si aplica proceso de recuperación o comité de evaluación y promoción según el Manual de Convivencia institucional.');
  }

  if (enAlerta > 0) {
    mensajes.push(
      `${enAlerta} estudiante${enAlerta > 1 ? 's estuvieron' : ' estuvo'} en zona de alerta (entre 70% y 80%). Requieren seguimiento prioritario desde el inicio del siguiente período para evitar que alcancen el nivel crítico.`
    );
    if (criticos === 0) {
      acciones.push('Informar a los acudientes sobre la situación de asistencia antes del inicio del siguiente período.');
    }
  }

  if (enRiesgo > total * 0.25) {
    mensajes.push(
      `Alta concentración: el ${Math.round((enRiesgo / total) * 100)}% del grupo presentó asistencia por debajo del 80%. Esto puede indicar factores externos que afectan al grupo como un todo.`
    );
    acciones.push('Analizar factores que puedan estar incidiendo en el ausentismo colectivo: transporte, distancia, horarios, situaciones socioeconómicas u otras causas institucionales.');
  }

  if (excelentes === total) {
    mensajes.push(`Todos los estudiantes del grupo mantuvieron asistencia superior al 90% durante el período — desempeño sobresaliente en asistencia.`);
    acciones.push('Reconocer el compromiso del grupo en el siguiente período académico como refuerzo positivo.');
  } else if (excelentes > 0) {
    mensajes.push(`${excelentes} estudiante${excelentes > 1 ? 's' : ''} ${excelentes > 1 ? 'lograron' : 'logró'} asistencia superior al 90% — referentes positivos dentro del grupo.`);
  }

  mensajes.push(
    `Mayor asistencia: ${mejor.nombreEstudiante} (${mejor.porcentajeAsistencia.toFixed(1)}%). Menor asistencia: ${peor.nombreEstudiante} (${peor.porcentajeAsistencia.toFixed(1)}%).`
  );

  let severity: 'success' | 'warning' | 'error';
  if (criticos > 0 || promedio < 75) {
    severity = 'error';
  } else if (enRiesgo > 0 || promedio < 85) {
    severity = 'warning';
  } else {
    severity = 'success';
  }

  const titulo =
    severity === 'error' ? 'Cierre de período con alertas críticas de asistencia'
    : severity === 'warning'
      ? enRiesgo > 0
        ? 'Cierre de período con estudiantes en zona de alerta'
        : 'Cierre de período con asistencia aceptable — promedio por mejorar'
    : 'Cierre de período con asistencia favorable';

  return { severity, titulo, mensajes, acciones };
};

const InformeCierrePeriodo: React.FC = () => {
  const [periodoId, setPeriodoId] = useState('');
  const [cursoId, setCursoId] = useState('');
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState('');
  const [interpretacion, setInterpretacion] = useState<InterpretacionCierre | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);
  const { data: escuela } = useEscuela();
  const { data: cursosData } = useCursos();

  const cursos: any[] =
    (cursosData as any)?.data ?? (Array.isArray(cursosData) ? cursosData : []);
  const periodos = escuela?.periodos_academicos ?? [];

  const handleGenerar = async () => {
    if (!periodoId || !cursoId) return;
    setError('');
    setInterpretacion(null);
    setGenerando(true);
    try {
      const estadisticas = await getResumenPeriodo(periodoId, cursoId);
      const curso = cursos.find((c: any) => c._id === cursoId);
      const periodo = periodos.find((p) => p._id === periodoId);
      const interpretacionCalc = computarInterpretacion(estadisticas);
      setInterpretacion(interpretacionCalc);
      generarPdfCierrePeriodo(
        {
          estadisticas,
          nombreCurso: curso?.nombre ?? 'Curso',
          grado: curso?.grado ?? '',
          grupo: curso?.grupo ?? '',
          nombrePeriodo: periodo?.nombre ?? 'Período',
        },
        escuela ?? null,
        `${user?.nombre ?? ''} ${user?.apellidos ?? ''}`.trim(),
        {
          titulo: interpretacionCalc.titulo,
          mensajes: interpretacionCalc.mensajes,
          acciones: interpretacionCalc.acciones,
        }
      );
    } catch {
      setError('Error al obtener los datos. Verifique que el período y curso tengan registros de asistencia finalizados.');
    } finally {
      setGenerando(false);
    }
  };

  const limpiarInterpretacion = () => setInterpretacion(null);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          maxWidth: 560,
          mb: 3,
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
              onChange={(e) => { setPeriodoId(e.target.value); limpiarInterpretacion(); }}
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
              onChange={(e) => { setCursoId(e.target.value); limpiarInterpretacion(); }}
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

      {/* Diagnóstico del período generado */}
      {interpretacion && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            maxWidth: 700,
            borderRadius: 3,
            borderLeft: '4px solid',
            borderColor:
              interpretacion.severity === 'success' ? 'success.main'
              : interpretacion.severity === 'error' ? 'error.main'
              : 'warning.main',
            bgcolor:
              interpretacion.severity === 'success' ? '#f0fdf4'
              : interpretacion.severity === 'error' ? '#fff5f5'
              : '#fffbeb',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <LightbulbIcon
              fontSize="small"
              sx={{
                color:
                  interpretacion.severity === 'success' ? 'success.main'
                  : interpretacion.severity === 'error' ? 'error.main'
                  : 'warning.main',
              }}
            />
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={
                interpretacion.severity === 'success' ? 'success.dark'
                : interpretacion.severity === 'error' ? 'error.dark'
                : 'warning.dark'
              }
            >
              {interpretacion.titulo}
            </Typography>
          </Box>
          {interpretacion.mensajes.map((msg, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 0.75, color: 'text.primary', lineHeight: 1.6 }}>
              • {msg}
            </Typography>
          ))}
          {interpretacion.acciones.length > 0 && (
            <>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5, mb: 0.75, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                Acciones recomendadas
              </Typography>
              {interpretacion.acciones.map((acc, i) => (
                <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 0.5, lineHeight: 1.5 }}>
                  {i + 1}. {acc}
                </Typography>
              ))}
            </>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default InformeCierrePeriodo;
