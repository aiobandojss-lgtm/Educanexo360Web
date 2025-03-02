// src/components/calificaciones/BoletinPDF.tsx
import React, { forwardRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { IBoletin } from '../../types/calificacion.types';
import { format } from 'date-fns';

interface BoletinPDFProps {
  boletin: IBoletin;
}

const BoletinPDF = forwardRef<HTMLDivElement, BoletinPDFProps>(({ boletin }, ref) => {
  // Función para obtener color según la calificación
  const getColorByCalificacion = (calificacion: number) => {
    if (calificacion >= 3.5) return '#4CAF50';
    if (calificacion >= 3.0) return '#003F91';
    if (calificacion > 0) return '#F44336';
    return '#757575';
  };

  return (
    <Box ref={ref} sx={{ p: 4, bgcolor: 'white', width: '210mm', margin: '0 auto' }}>
      {/* Encabezado del boletín */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h1" color="primary.main" gutterBottom>
          BOLETÍN DE CALIFICACIONES
        </Typography>
        <Typography variant="h3">
          EducaNexo360
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Información del estudiante */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Estudiante:</strong> {boletin.estudiante.nombre}
          </Typography>
          <Typography variant="body1">
            <strong>Curso:</strong> {boletin.estudiante.curso}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body1">
            <strong>Periodo:</strong> {boletin.periodo}
          </Typography>
          <Typography variant="body1">
            <strong>Año Académico:</strong> {boletin.año_academico}
          </Typography>
          <Typography variant="body1">
            <strong>Fecha de Generación:</strong> {format(new Date(boletin.fecha_generacion), 'dd/MM/yyyy')}
          </Typography>
        </Grid>
      </Grid>

      {/* Resumen de estadísticas */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h3" gutterBottom>Resumen</Typography>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="body1">
              <strong>Asignaturas:</strong> {boletin.estadisticas.asignaturas_total}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">
              <strong>Aprobadas:</strong> {boletin.estadisticas.asignaturas_aprobadas}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">
              <strong>Reprobadas:</strong> {boletin.estadisticas.asignaturas_reprobadas}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <Typography variant="body1">
              <strong>Promedio General:</strong>{' '}
              <span style={{ 
                fontWeight: 'bold', 
                color: getColorByCalificacion(boletin.estadisticas.promedio_general)
              }}>
                {boletin.estadisticas.promedio_general.toFixed(1)}
              </span>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de calificaciones */}
      <Typography variant="h3" gutterBottom>Calificaciones por Asignatura</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Asignatura</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Docente</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Promedio</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Logros Evaluados</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {boletin.asignaturas.map((asignatura) => (
              <TableRow key={asignatura.asignatura._id}>
                <TableCell sx={{ fontWeight: 500 }}>
                  {asignatura.asignatura.nombre}
                </TableCell>
                <TableCell>{asignatura.asignatura.docente}</TableCell>
                <TableCell align="center">
                  <Box sx={{ 
                    display: 'inline-block',
                    width: 35, 
                    height: 35, 
                    borderRadius: '50%', 
                    bgcolor: getColorByCalificacion(asignatura.promedio),
                    color: 'white',
                    fontWeight: 'bold',
                    lineHeight: '35px',
                    textAlign: 'center'
                  }}>
                    {asignatura.promedio.toFixed(1)}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  {asignatura.promedio >= 3.0 ? 
                    <Chip label="Aprobado" size="small" sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', fontWeight: 'bold' }} /> :
                    <Chip label="Reprobado" size="small" sx={{ bgcolor: '#FFEBEE', color: '#C62828', fontWeight: 'bold' }} />
                  }
                </TableCell>
                <TableCell align="center">
                  {asignatura.progreso.logros_calificados}/{asignatura.progreso.total_logros}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Observaciones */}
      {boletin.asignaturas.some(a => a.observaciones) && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h3" gutterBottom>Observaciones</Typography>
          {boletin.asignaturas.filter(a => a.observaciones).map((asignatura) => (
            <Box key={asignatura.asignatura._id} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {asignatura.asignatura.nombre}:
              </Typography>
              <Typography variant="body2" sx={{ pl: 2 }}>
                {asignatura.observaciones}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Firma */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: '40%', borderTop: '1px solid black', pt: 1, mt: 4 }}>
          <Typography variant="body2" align="center">Director de Grupo</Typography>
        </Box>
        <Box sx={{ width: '40%', borderTop: '1px solid black', pt: 1, mt: 4 }}>
          <Typography variant="body2" align="center">Coordinador Académico</Typography>
        </Box>
      </Box>
    </Box>
  );
});

export default BoletinPDF;