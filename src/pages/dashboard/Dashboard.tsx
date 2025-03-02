// src/pages/dashboard/Dashboard.tsx (actualizado)
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import { RootState } from '../../redux/store';
import axiosInstance from '../../api/axiosConfig';

interface DashboardData {
  mensajesNoLeidos: number;
  notificacionesPendientes: number;
  cursos?: number;
  estudiantes?: number;
  asignaturas?: number;
  ultimasMensajes: Array<{_id: string; asunto: string; fecha: string;}>;
  ultimasCalificaciones?: Array<{asignatura: string; calificacion: number; fecha: string;}>;
}

const Dashboard = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData>({
    mensajesNoLeidos: 0,
    notificacionesPendientes: 0,
    ultimasMensajes: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // En un caso real, harías una llamada API específica para los datos del dashboard
        // Aquí simulamos los datos para el ejemplo
        
        // Obtener mensajes no leídos
        const mensajesResponse = await axiosInstance.get('/mensajes?bandeja=recibidos&leido=false');
        
        // Obtener notificaciones pendientes
        const notificacionesResponse = await axiosInstance.get('/notificaciones?estado=PENDIENTE');
        
        const dashboardData: DashboardData = {
          mensajesNoLeidos: mensajesResponse.data.meta?.total || 0,
          notificacionesPendientes: notificacionesResponse.data.meta?.pendientes || 0,
          ultimasMensajes: mensajesResponse.data.data.slice(0, 5).map((m: any) => ({
            _id: m._id,
            asunto: m.asunto,
            fecha: new Date(m.createdAt).toLocaleDateString()
          }))
        };
        
        // Si es admin o docente, obtener datos adicionales
        if (['ADMIN', 'DOCENTE'].includes(user?.tipo || '')) {
          // Obtener datos de cursos, estudiantes, etc.
          dashboardData.cursos = 5; // Simulado
          dashboardData.estudiantes = 120; // Simulado
          dashboardData.asignaturas = 12; // Simulado
        }
        
        // Si es estudiante o padre, obtener calificaciones recientes
        if (['ESTUDIANTE', 'PADRE'].includes(user?.tipo || '')) {
          dashboardData.ultimasCalificaciones = [
            { asignatura: 'Matemáticas', calificacion: 4.5, fecha: '15/02/2023' },
            { asignatura: 'Lenguaje', calificacion: 4.2, fecha: '12/02/2023' },
            { asignatura: 'Ciencias', calificacion: 3.8, fecha: '10/02/2023' },
          ];
        }
        
        setData(dashboardData);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h1" color="primary.main" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="h3" color="text.secondary" gutterBottom>
        Bienvenido, {user?.nombre} {user?.apellidos}
      </Typography>
      
      <Grid container spacing={3} mt={1}>
        {/* Tarjetas de Resumen */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h3" color="text.secondary" gutterBottom>Mensajes sin leer</Typography>
            <Typography variant="h1" color="primary.main" sx={{ fontSize: 46 }}>{data.mensajesNoLeidos}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h3" color="text.secondary" gutterBottom>Notificaciones Pendientes</Typography>
            <Typography variant="h1" color="secondary.main" sx={{ fontSize: 46 }}>{data.notificacionesPendientes}</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)' }}>
            <Typography variant="h3" color="text.secondary" gutterBottom>
              {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') ? 'Total Cursos' : 'Promedio General'}
            </Typography>
            <Typography variant="h1" color="success.main" sx={{ fontSize: 46 }}>
              {['ADMIN', 'DOCENTE'].includes(user?.tipo || '') ? data.cursos : '4.2'}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Lista de últimos mensajes */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
            <CardHeader title="Últimos Mensajes" sx={{ bgcolor: 'primary.main', color: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
            <Divider />
            <CardContent>
              <List>
                {data.ultimasMensajes.length > 0 ? (
                  data.ultimasMensajes.map((mensaje) => (
                    <ListItem key={mensaje._id} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)', py: 1.5 }}>
                      <ListItemText 
                        primary={mensaje.asunto} 
                        secondary={`Recibido: ${mensaje.fecha}`} 
                        primaryTypographyProps={{ fontWeight: 500, color: 'primary.main' }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No hay mensajes recientes" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Calificaciones o Estadísticas */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', borderRadius: 3 }}>
            <CardHeader 
              title={
                ['ESTUDIANTE', 'PADRE'].includes(user?.tipo || '') 
                  ? "Últimas Calificaciones" 
                  : "Estadísticas"
              } 
              sx={{ bgcolor: 'secondary.main', color: 'white', borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
            />
            <Divider />
            <CardContent>
              {['ESTUDIANTE', 'PADRE'].includes(user?.tipo || '') ? (
                <List>
                  {data.ultimasCalificaciones?.map((cal, index) => (
                    <ListItem key={index} sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)', py: 1.5 }}>
                      <ListItemText 
                        primary={cal.asignatura} 
                        secondary={`Fecha: ${cal.fecha}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Box sx={{ ml: 2, textAlign: 'center', width: 60 }}>
                        <Box sx={{ 
                          width: 50, 
                          height: 50, 
                          borderRadius: '50%', 
                          bgcolor: cal.calificacion >= 3.5 ? 'success.main' : (cal.calificacion >= 3 ? 'secondary.main' : 'error.main'),
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {cal.calificacion.toFixed(1)}
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ mb: 2 }}>
                    <Typography variant="h3" gutterBottom>Total Estudiantes</Typography>
                    <Typography variant="h2" color="primary.main" gutterBottom>{data.estudiantes}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={70} 
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)' }} 
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h3" gutterBottom>Total Asignaturas</Typography>
                    <Typography variant="h2" color="secondary.main" gutterBottom>{data.asignaturas}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={90} 
                      sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.05)' }}
                      color="secondary" 
                    />
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;