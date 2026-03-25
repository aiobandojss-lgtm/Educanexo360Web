// src/routes/AppRoutes.tsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, CircularProgress } from "@mui/material";
import { RootState } from "../redux/store";

// Layouts — siempre necesarios, se cargan de forma estática
import MainLayout from "../components/layout/MainLayout";

// Lazy loading de todas las páginas — el navegador descarga cada módulo solo cuando se necesita
const SetupPage = lazy(() => import("../pages/system/SetupPage"));
const NotFoundPage = lazy(() => import("../pages/system/NotFoundPage"));

// Páginas públicas
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// Portal público de registro
const ValidarCodigoInvitacion = lazy(() => import("../pages/RegistroPublico/ValidarCodigoInvitacion"));
const FormularioRegistro = lazy(() => import("../pages/RegistroPublico/FormularioRegistro"));
const ConfirmacionRegistro = lazy(() => import("../pages/RegistroPublico/ConfirmacionRegistro"));

// Administración de invitaciones y solicitudes
const ListaInvitaciones = lazy(() => import("../pages/Admin/Invitaciones/ListaInvitaciones"));
const CrearInvitacion = lazy(() => import("../pages/Admin/Invitaciones/CrearInvitacion"));
const DetalleInvitacion = lazy(() => import("../pages/Admin/Invitaciones/DetalleInvitacion"));
const ListaSolicitudes = lazy(() => import("../pages/Admin/Solicitudes/ListaSolicitudes"));
const DetalleSolicitud = lazy(() => import("../pages/Admin/Solicitudes/DetalleSolicitud"));

// Dashboard
const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));

// Mensajería
const MensajesLayout = lazy(() => import("../pages/mensajes/MensajesLayout"));
const ListaMensajes = lazy(() => import("../pages/mensajes/ListaMensajes"));
const NuevoMensaje = lazy(() => import("../pages/mensajes/NuevoMensaje"));
const DetalleMensaje = lazy(() => import("../pages/mensajes/DetalleMensaje"));
const EditarBorrador = lazy(() => import("../pages/mensajes/EditarBorrador"));

// Usuarios
const ListaUsuarios = lazy(() => import("../pages/usuarios/ListaUsuarios"));
const DetalleUsuario = lazy(() => import("../pages/usuarios/DetalleUsuario"));
const CambiarPassword = lazy(() => import("../pages/usuarios/CambiarPassword"));

// Cursos
const ListaCursos = lazy(() => import("../pages/cursos/ListaCursos"));
const DetalleCurso = lazy(() => import("../pages/cursos/DetalleCurso"));
const FormularioCurso = lazy(() => import("../pages/cursos/FormularioCurso"));
const AgregarEstudianteCurso = lazy(() => import("../pages/cursos/AgregarEstudianteCurso"));
const AgregarAsignaturaCurso = lazy(() => import("../pages/cursos/AgregarAsignaturaCurso"));

// Perfil
const PerfilUsuario = lazy(() => import("../pages/perfil/PerfilUsuario"));
const EditarPerfil = lazy(() => import("../pages/perfil/EditarPerfil"));
const PerfilCambiarPassword = lazy(() => import("../pages/perfil/PerfilCambiarPassword"));

// Escuelas
const ListaEscuelas = lazy(() => import("../pages/escuelas/ListaEscuelas"));
const DetalleEscuela = lazy(() => import("../pages/escuelas/DetalleEscuela"));
const FormularioEscuela = lazy(() => import("../pages/escuelas/FormularioEscuela"));

// Configuración
const ConfiguracionSistema = lazy(() => import("../pages/configuracion/ConfiguracionSistema"));

// Calendario
const CalendarioEscolar = lazy(() => import("../pages/calendario/CalendarioEscolar"));
const FormularioEvento = lazy(() => import("../pages/calendario/FormularioEvento"));
const DirectForm = lazy(() => import("../pages/calendario/DirectForm"));

// Anuncios — importados directamente (no desde barrel) para compatibilidad con lazy
const ListaAnuncios = lazy(() => import("../pages/anuncios/ListaAnuncios"));
const DetalleAnuncio = lazy(() => import("../pages/anuncios/DetalleAnuncio"));
const FormularioAnuncio = lazy(() => import("../pages/anuncios/FormularioAnuncio"));

// Asistencia — importados directamente
const ListaAsistencia = lazy(() => import("../pages/asistencia/ListaAsistencia"));
const RegistroAsistencia = lazy(() => import("../pages/asistencia/RegistroAsistencia"));
const DetalleAsistencia = lazy(() => import("../pages/asistencia/DetalleAsistencia"));

// Tareas
const MisTareas = lazy(() => import("../pages/tareas/MisTareas"));
const ListaTareas = lazy(() => import("../pages/tareas/ListaTareas"));
const DetalleTarea = lazy(() => import("../pages/tareas/DetalleTarea"));
const FormularioTarea = lazy(() => import("../pages/tareas/FormularioTarea"));
const EntregarTarea = lazy(() => import("../pages/tareas/EntregarTarea"));
const CalificarEntrega = lazy(() => import("../pages/tareas/CalificarEntrega"));
const ListaEntregas = lazy(() => import("../pages/tareas/ListaEntregas"));
const TareasWrapper = lazy(() => import("../pages/tareas/TareasWrapper"));

import { ROLES_CON_BORRADORES } from "../types/mensaje.types";

// Fallback de carga para Suspense
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="60vh"
  >
    <CircularProgress sx={{ color: "#059669" }} />
  </Box>
);

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
    <Suspense fallback={<PageLoader />}>
      <Routes>

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Portal público de registro */}
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

          {/* Mensajería */}
          <Route path="mensajes" element={<MensajesLayout />}>
            <Route index element={<Navigate to="recibidos" replace />} />
            <Route path="recibidos" element={<ListaMensajes />} />

            <Route
              path="enviados"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "PADRE", "ACUDIENTE", "ESTUDIANTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}
                >
                  <ListaMensajes />
                </ProtectedRoute>
              }
            />

            <Route
              path="borradores"
              element={
                <ProtectedRoute allowedRoles={ROLES_CON_BORRADORES}>
                  <ListaMensajes />
                </ProtectedRoute>
              }
            />

            <Route
              path="borradores/editar/:id"
              element={
                <ProtectedRoute allowedRoles={ROLES_CON_BORRADORES}>
                  <EditarBorrador />
                </ProtectedRoute>
              }
            />

            <Route
              path="borradores/nuevo"
              element={
                <ProtectedRoute allowedRoles={ROLES_CON_BORRADORES}>
                  <EditarBorrador />
                </ProtectedRoute>
              }
            />

            <Route
              path="archivados"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "ESTUDIANTE", "PADRE", "ACUDIENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}
                >
                  <ListaMensajes />
                </ProtectedRoute>
              }
            />

            <Route path="eliminados" element={<ListaMensajes />} />

            <Route
              path="nuevo"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "PADRE", "ACUDIENTE", "ESTUDIANTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}
                >
                  <NuevoMensaje />
                </ProtectedRoute>
              }
            />

            <Route
              path="responder/:id"
              element={
                <ProtectedRoute
                  allowedRoles={["ADMIN", "DOCENTE", "PADRE", "ACUDIENTE", "ESTUDIANTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}
                >
                  <NuevoMensaje />
                </ProtectedRoute>
              }
            />

            <Route path=":id" element={<DetalleMensaje />} />
          </Route>

          {/* Administración de invitaciones */}
          <Route
            path="admin/invitaciones"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
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

          {/* Administración de solicitudes */}
          <Route
            path="admin/solicitudes"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <ListaSolicitudes />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/solicitudes/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <DetalleSolicitud />
              </ProtectedRoute>
            }
          />

          {/* Usuarios */}
          <Route
            path="usuarios"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <ListaUsuarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios/nuevo"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <DetalleUsuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <DetalleUsuario />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios/:id/cambiar-password"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <CambiarPassword />
              </ProtectedRoute>
            }
          />

          {/* Cursos */}
          <Route
            path="cursos"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <ListaCursos />
              </ProtectedRoute>
            }
          />
          <Route
            path="cursos/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <DetalleCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="cursos/nuevo"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <FormularioCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="cursos/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <FormularioCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="cursos/:id/estudiantes/agregar"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <AgregarEstudianteCurso />
              </ProtectedRoute>
            }
          />
          <Route
            path="cursos/:id/asignaturas/agregar"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <AgregarAsignaturaCurso />
              </ProtectedRoute>
            }
          />

          {/* Perfil */}
          <Route path="perfil" element={<PerfilUsuario />} />
          <Route path="perfil/editar" element={<EditarPerfil />} />
          <Route path="perfil/cambiar-password" element={<PerfilCambiarPassword />} />

          {/* Escuelas */}
          <Route
            path="escuelas"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <ListaEscuelas />
              </ProtectedRoute>
            }
          />
          <Route
            path="escuelas/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
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

          {/* Calendario */}
          <Route path="calendario" element={<CalendarioEscolar />} />
          <Route path="/calendario/nuevo" element={<FormularioEvento />} />
          <Route path="/calendario/editar/:id" element={<FormularioEvento />} />
          <Route
            path="/calendario/test-form"
            element={
              <ProtectedRoute>
                <DirectForm />
              </ProtectedRoute>
            }
          />

          {/* Anuncios */}
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
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <ListaAsistencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="asistencia/registro"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <RegistroAsistencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="asistencia/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <DetalleAsistencia />
              </ProtectedRoute>
            }
          />
          <Route
            path="asistencia/editar/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "COORDINADOR", "RECTOR", "ADMINISTRATIVO"]}>
                <RegistroAsistencia />
              </ProtectedRoute>
            }
          />

          {/* Tareas */}
          <Route path="/tareas">
            <Route
              index
              element={
                <ProtectedRoute allowedRoles={["ESTUDIANTE", "ACUDIENTE", "ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}>
                  <TareasWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="hijo/:estudianteId"
              element={
                <ProtectedRoute allowedRoles={["ACUDIENTE"]}>
                  <MisTareas />
                </ProtectedRoute>
              }
            />
            <Route
              path="docente"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}>
                  <ListaTareas />
                </ProtectedRoute>
              }
            />
            <Route
              path="nuevo"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}>
                  <FormularioTarea />
                </ProtectedRoute>
              }
            />
            <Route
              path="editar/:id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}>
                  <FormularioTarea />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "ESTUDIANTE", "ACUDIENTE", "RECTOR", "COORDINADOR"]}>
                  <DetalleTarea />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/entregar"
              element={
                <ProtectedRoute allowedRoles={["ESTUDIANTE"]}>
                  <EntregarTarea />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/entregas"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}>
                  <ListaEntregas />
                </ProtectedRoute>
              }
            />
            <Route
              path=":id/entregas/:entregaId/calificar"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "DOCENTE", "RECTOR", "COORDINADOR"]}>
                  <CalificarEntrega />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
