// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

interface ProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  children, 
  redirectPath = '/mensajes/recibidos'
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user) {
    // Si no hay usuario, redirigir a login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.tipo)) {
    // Si el rol del usuario no está permitido, redirigir a la ruta especificada
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;