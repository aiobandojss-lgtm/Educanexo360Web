// src/routes/AppRoutes.tsx (actualizado con todas las rutas, incluyendo usuarios)
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';

// Páginas
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import MainLayout from '../components/layout/MainLayout';

// Mensajería
import MensajesLayout from '../pages/mensajes/MensajesLayout';
import ListaMensajes from '../pages/mensajes/ListaMensajes';
import DetalleMensaje from '../pages/mensajes/DetalleMensaje';
import NuevoMensaje from '../pages/mensajes/NuevoMensaje';

// Calificaciones
import CalificacionesLayout from '../pages/calificaciones/CalificacionesLayout';
import ListaCalificaciones from '../pages/calificaciones/ListaCalificaciones';
import DetalleCalificacion from '../pages/calificaciones/DetalleCalificacion';
import EditarCalificacion from '../pages/calificaciones/EditarCalificacion';
import Boletin from '../pages/calificaciones/Boletin';
import Estadisticas from '../pages/calificaciones/Estadisticas';

// Usuarios (módulo nuevo)
import ListaUsuarios from '../pages/usuarios/ListaUsuarios';
import DetalleUsuario from '../pages/usuarios/DetalleUsuario';
import FormularioUsuario from '../pages/usuarios/FormularioUsuario';
import CambiarPassword from '../pages/usuarios/CambiarPassword';

// Cursos
import {
  ListaCursos,
  DetalleCurso,
  FormularioCurso,
  AgregarEstudianteCurso,
  AgregarAsignaturaCurso
} from '../pages/cursos';

// Perfil
import {
  PerfilUsuario,
  EditarPerfil,
  PerfilCambiarPassword
} from '../pages/perfil';

// Logros
import {
  ListaLogros,
  DetalleLogro,
  FormularioLogro
} from '../pages/logros';

// Otras páginas
import NotFound from '../pages/NotFound';

// Rutas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rutas protegidas */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        
        {/* Rutas de mensajería */}
        <Route path="mensajes" element={<MensajesLayout />}>
          <Route index element={<Navigate to="/mensajes/recibidos" replace />} />
          <Route path="recibidos" element={<ListaMensajes />} />
          <Route path="enviados" element={<ListaMensajes />} />
          <Route path="borradores" element={<ListaMensajes />} />
          <Route path="archivados" element={<ListaMensajes />} />
        </Route>
        <Route path="mensajes/nuevo" element={<NuevoMensaje />} />
        <Route path="mensajes/responder/:id" element={<NuevoMensaje />} />
        <Route path="mensajes/:id" element={<DetalleMensaje />} />
        
        {/* Rutas de calificaciones */}
        <Route path="calificaciones" element={<CalificacionesLayout />}>
          <Route index element={<Navigate to="/calificaciones/lista" replace />} />
          <Route path="lista" element={<ListaCalificaciones />} />
          <Route path="boletin" element={<Boletin />} />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>
        <Route path="calificaciones/:id" element={<DetalleCalificacion />} />
        <Route path="calificaciones/editar/:id" element={<EditarCalificacion />} />
        <Route path="calificaciones/nueva" element={<EditarCalificacion />} />
        
        {/* Rutas de administración de usuarios */}
        <Route path="usuarios" element={<ListaUsuarios />} />
        <Route path="usuarios/nuevo" element={<FormularioUsuario />} />
        <Route path="usuarios/editar/:id" element={<FormularioUsuario />} />
        <Route path="usuarios/:id" element={<DetalleUsuario />} />
        <Route path="usuarios/:id/cambiar-password" element={<CambiarPassword />} />
        
        {/* Rutas de gestión de cursos */}
        <Route path="cursos" element={<ListaCursos />} />
        <Route path="cursos/nuevo" element={<FormularioCurso />} />
        <Route path="cursos/editar/:id" element={<FormularioCurso />} />
        <Route path="cursos/:id" element={<DetalleCurso />} />
        <Route path="cursos/:id/estudiantes/agregar" element={<AgregarEstudianteCurso />} />
        <Route path="cursos/:id/asignaturas/agregar" element={<AgregarAsignaturaCurso />} />
        
        {/* Rutas de perfil de usuario */}
        <Route path="perfil" element={<PerfilUsuario />} />
        <Route path="perfil/editar" element={<EditarPerfil />} />
        <Route path="perfil/cambiar-password" element={<PerfilCambiarPassword />} />
        
        {/* Rutas de gestión de logros académicos */}
        <Route path="logros" element={<ListaLogros />} />
        <Route path="logros/nuevo" element={<FormularioLogro />} />
        <Route path="logros/editar/:id" element={<FormularioLogro />} />
        <Route path="logros/:id" element={<DetalleLogro />} />
        
        {/* Aquí irán más rutas de otros módulos */}
      </Route>
      
      {/* Ruta para página no encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;