// src/routes/AppRoutes.tsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

// Layouts
import MainLayout from "../components/layout/MainLayout";

// Página de configuración inicial
import SetupPage from "../pages/system/SetupPage";

// Páginas públicas
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Portal público de registro
import ValidarCodigoInvitacion from "../pages/RegistroPublico/ValidarCodigoInvitacion";
import FormularioRegistro from "../pages/RegistroPublico/FormularioRegistro";
import ConfirmacionRegistro from "../pages/RegistroPublico/ConfirmacionRegistro";

// Componentes de administración de invitaciones y solicitudes
import ListaInvitaciones from "../pages/Admin/Invitaciones/ListaInvitaciones";
import CrearInvitacion from "../pages/Admin/Invitaciones/CrearInvitacion";
import DetalleInvitacion from "../pages/Admin/Invitaciones/DetalleInvitacion";
import ListaSolicitudes from "../pages/Admin/Solicitudes/ListaSolicitudes";
import DetalleSolicitud from "../pages/Admin/Solicitudes/DetalleSolicitud";

// Páginas protegidas
import Dashboard from "../pages/dashboard/Dashboard";
import MensajesLayout from "../pages/mensajes/MensajesLayout";
import ListaMensajes from "../pages/mensajes/ListaMensajes";
import NuevoMensaje from "../pages/mensajes/NuevoMensaje";
import DetalleMensaje from "../pages/mensajes/DetalleMensaje";
import EditarBorrador from "../pages/mensajes/EditarBorrador";
import ListaUsuarios from "../pages/usuarios/ListaUsuarios";
import DetalleUsuario from "../pages/usuarios/DetalleUsuario";
import CambiarPassword from "../pages/usuarios/CambiarPassword";
import ListaCursos from "../pages/cursos/ListaCursos";
import DetalleCurso from "../pages/cursos/DetalleCurso";
import FormularioCurso from "../pages/cursos/FormularioCurso";
import PerfilUsuario from "../pages/perfil/PerfilUsuario";
import EditarPerfil from "../pages/perfil/EditarPerfil";
import PerfilCambiarPassword from "../pages/perfil/PerfilCambiarPassword";
import ListaEscuelas from "../pages/escuelas/ListaEscuelas";
import DetalleEscuela from "../pages/escuelas/DetalleEscuela";
import FormularioEscuela from "../pages/escuelas/FormularioEscuela";
import ConfiguracionSistema from "../pages/configuracion/ConfiguracionSistema";
import CalendarioEscolar from "../pages/calendario/CalendarioEscolar";
import AgregarEstudianteCurso from "../pages/cursos/AgregarEstudianteCurso";
import AgregarAsignaturaCurso from "../pages/cursos/AgregarAsignaturaCurso";

import {
  ListaAsistencia,
  RegistroAsistencia,
  DetalleAsistencia,
} from "../pages/asistencia";

import { ROLES_CON_BORRADORES } from "../types/mensaje.types";
//import { ListaAnuncios, DetalleAnuncio, FormularioAnuncio } from '../pages/anuncios';
//import { FormularioEvento } from '../pages/calendario';
import FormularioEvento from "../pages/calendario/FormularioEvento";
import DirectForm from "../pages/calendario/DirectForm";

import {
  ListaAnuncios,
  DetalleAnuncio,
  FormularioAnuncio,
} from "../pages/anuncios";

import MisTareas from "../pages/tareas/MisTareas";
import ListaTareas from "../pages/tareas/ListaTareas";
import DetalleTarea from "../pages/tareas/DetalleTarea";
import FormularioTarea from "../pages/tareas/FormularioTarea";
import EntregarTarea from "../pages/tareas/EntregarTarea";
import CalificarEntrega from "../pages/tareas/CalificarEntrega";
import ListaEntregas from "../pages/tareas/ListaEntregas";
import TareasWrapper from "../pages/tareas/TareasWrapper";
// Componente para rutas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
}) => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const location = useLocation();

  if (!isAuthenticated) {
    // Guardar la ruta actual como parámetro de consulta para redirección post-login
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.tipo || "")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta de configuración inicial */}
      <Route path="/setup" element={<SetupPage />} />

      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas de recuperación de contraseña */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Rutas para el portal público de registro */}
      <Route path="/registro" element={<ValidarCodigoInvitacion />} />
      <Route path="/registro/formulario" element={<FormularioRegistro />} />
      <Route path="/registro/confirmacion" element={<ConfirmacionRegistro />} />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Rutas de mensajería con estados independientes */}
        <Route path="mensajes" element={<MensajesLayout />}>
          <Route index element={<Navigate to="recibidos" replace />} />
          <Route path="recibidos" element={<ListaMensajes />} />

          {/* Restringir enviados para estudiantes */}
          <Route
            path="enviados"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMIN",
                  "DOCENTE",
                  "PADRE",
                  "ACUDIENTE",
                  "ESTUDIANTE",
                  "COORDINADOR",
                  "RECTOR",
                  "ADMINISTRATIVO",
                ]}
              >
                <ListaMensajes />
              </ProtectedRoute>
            }
          />

          {/* Restringir borradores para roles específicos */}
          <Route
            path="borradores"
            element={
              <ProtectedRoute allowedRoles={ROLES_CON_BORRADORES}>
                <ListaMensajes />
              </ProtectedRoute>
            }
          />

          {/* Edición de borradores */}
          <Route
            path="borradores/editar/:id"
            element={
              <ProtectedRoute allowedRoles={ROLES_CON_BORRADORES}>
                <EditarBorrador />
              </ProtectedRoute>
            }
          />

          {/* Nuevo borrador */}
          <Route
            path="borradores/nuevo"
            element={
              <ProtectedRoute allowedRoles={ROLES_CON_BORRADORES}>
                <EditarBorrador />
              </ProtectedRoute>
            }
          />

          {/* Archivados */}
          <Route
            path="archivados"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMIN",
                  "DOCENTE",
                  "ESTUDIANTE",
                  "PADRE",
                  "ACUDIENTE",
                  "COORDINADOR",
                  "RECTOR",
                  "ADMINISTRATIVO",
                ]}
              >
                <ListaMensajes />
              </ProtectedRoute>
            }
          />

          {/* Eliminados (accesible para todos) */}
          <Route path="eliminados" element={<ListaMensajes />} />

          {/* Restringir nuevo mensaje para estudiantes */}
          <Route
            path="nuevo"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMIN",
                  "DOCENTE",
                  "PADRE",
                  "ACUDIENTE",
                  "ESTUDIANTE",
                  "COORDINADOR",
                  "RECTOR",
                  "ADMINISTRATIVO",
                ]}
              >
                <NuevoMensaje />
              </ProtectedRoute>
            }
          />

          {/* Restringir responder mensaje para estudiantes */}
          <Route
            path="responder/:id"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "ADMIN",
                  "DOCENTE",
                  "PADRE",
                  "ACUDIENTE",
                  "ESTUDIANTE",
                  "COORDINADOR",
                  "RECTOR",
                  "ADMINISTRATIVO",
                ]}
              >
                <NuevoMensaje />
              </ProtectedRoute>
            }
          />

          <Route path=":id" element={<DetalleMensaje />} />
        </Route>

        {/* Rutas de administración de invitaciones */}
        <Route
          path="admin/invitaciones"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <ListaInvitaciones />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/invitaciones/crear"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR"]}>
              <CrearInvitacion />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/invitaciones/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR"]}>
              <DetalleInvitacion />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administración de solicitudes */}
        <Route
          path="admin/solicitudes"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <ListaSolicitudes />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/solicitudes/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <DetalleSolicitud />
            </ProtectedRoute>
          }
        />

        {/* Resto de rutas existentes */}
        <Route
          path="usuarios"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <ListaUsuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="usuarios/nuevo"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <DetalleUsuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <DetalleUsuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="usuarios/:id/cambiar-password"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <CambiarPassword />
            </ProtectedRoute>
          }
        />

        {/* Rutas de cursos */}
        <Route
          path="cursos"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <ListaCursos />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <DetalleCurso />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos/nuevo"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <FormularioCurso />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos/editar/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <FormularioCurso />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos/:id/estudiantes/agregar"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <AgregarEstudianteCurso />
            </ProtectedRoute>
          }
        />
        <Route
          path="cursos/:id/asignaturas/agregar"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <AgregarAsignaturaCurso />
            </ProtectedRoute>
          }
        />

        {/* Rutas de perfil */}
        <Route path="perfil" element={<PerfilUsuario />} />
        <Route path="perfil/editar" element={<EditarPerfil />} />
        <Route
          path="perfil/cambiar-password"
          element={<PerfilCambiarPassword />}
        />

        {/* Rutas de escuelas (solo admin y roles administrativos) */}
        <Route
          path="escuelas"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <ListaEscuelas />
            </ProtectedRoute>
          }
        />
        <Route
          path="escuelas/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <DetalleEscuela />
            </ProtectedRoute>
          }
        />
        <Route
          path="escuelas/nueva"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR"]}>
              <FormularioEscuela />
            </ProtectedRoute>
          }
        />
        <Route
          path="escuelas/editar/:id"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR"]}>
              <FormularioEscuela />
            </ProtectedRoute>
          }
        />

        {/* Calendario escolar */}
        <Route path="calendario" element={<CalendarioEscolar />} />
        <Route path="/calendario/nuevo" element={<FormularioEvento />} />
        <Route path="/calendario/editar/:id" element={<FormularioEvento />} />
        {/* <Route path="/calendario/:id" element={<DetalleEvento />} /> */}

        <Route path="/anuncios" element={<ListaAnuncios />} />
        <Route path="/anuncios/:id" element={<DetalleAnuncio />} />
        <Route path="/anuncios/nuevo" element={<FormularioAnuncio />} />
        <Route path="/anuncios/editar/:id" element={<FormularioAnuncio />} />

        {/* Configuración */}
        <Route
          path="configuracion"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR"]}>
              <ConfiguracionSistema />
            </ProtectedRoute>
          }
        />

        {/* Asistencia */}
        <Route
          path="asistencia"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <ListaAsistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="asistencia/registro"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <RegistroAsistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="asistencia/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <DetalleAsistencia />
            </ProtectedRoute>
          }
        />
        <Route
          path="asistencia/editar/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "DOCENTE",
                "COORDINADOR",
                "RECTOR",
                "ADMINISTRATIVO",
              ]}
            >
              <RegistroAsistencia />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendario/test-form"
          element={
            <ProtectedRoute>
              <DirectForm />
            </ProtectedRoute>
          }
        />

        <Route path="/anuncios" element={<ListaAnuncios />} />
        <Route path="/anuncios/:id" element={<DetalleAnuncio />} />
        <Route path="/anuncios/nuevo" element={<FormularioAnuncio />} />
        <Route path="/anuncios/editar/:id" element={<FormularioAnuncio />} />
         {/* Rutas de Tareas */}
          <Route path="/tareas">
            {/* Ruta principal - Usa TareasWrapper para decidir qué mostrar */}
            <Route
              index
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ESTUDIANTE",
                    "ACUDIENTE",
                    "ADMIN",
                    "DOCENTE",
                    "RECTOR",
                    "COORDINADOR",
                  ]}
                >
                  <TareasWrapper />
                </ProtectedRoute>
              }
            />

            {/* ✅ NUEVA RUTA: Vista de acudiente para ver tareas de un hijo específico */}
            <Route
              path="hijo/:estudianteId"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <MisTareas />
                </ProtectedRoute>
              }
            />

            {/* Gestión de tareas - Docentes/Admin (ruta alternativa) */}
            <Route
              path="docente"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}
                >
                  <ListaTareas />
                </ProtectedRoute>
              }
            />

            {/* Nueva tarea - Docentes/Admin */}
            <Route
              path="nuevo"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}
                >
                  <FormularioTarea />
                </ProtectedRoute>
              }
            />

            {/* Editar tarea - Docentes/Admin */}
            <Route
              path="editar/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}
                >
                  <FormularioTarea />
                </ProtectedRoute>
              }
            />

            {/* Ver detalle de tarea - Todos los roles */}
            <Route
              path=":id"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "ADMIN",
                    "DOCENTE",
                    "ESTUDIANTE",
                    "ACUDIENTE",
                    "RECTOR",
                    "COORDINADOR",
                  ]}
                >
                  <DetalleTarea />
                </ProtectedRoute>
              }
            />

            {/* Entregar tarea - Solo estudiantes */}
            <Route
              path=":id/entregar"
              element={
                <ProtectedRoute allowedRoles={["ESTUDIANTE"]}>
                  <EntregarTarea />
                </ProtectedRoute>
              }
            />

            {/* Ver lista de entregas - Docentes/Admin */}
            <Route
              path=":id/entregas"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}
                >
                  <ListaEntregas />
                </ProtectedRoute>
              }
            />

            {/* Calificar entrega - Docentes/Admin */}
            <Route
              path=":id/entregas/:entregaId/calificar"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}
                >
                  <CalificarEntrega />
                </ProtectedRoute>
              }
            />
          </Route>
        {/* Ruta para redireccionar a 404 o al dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
