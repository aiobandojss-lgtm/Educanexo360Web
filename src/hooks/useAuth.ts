// src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectUserRole,
  selectIsAdmin,
  selectIsDocente,
  selectIsEstudiante,
  selectIsPadre,
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  registerStart,
  registerSuccess,
  registerFailure
} from '../redux/slices/authSlice';
import { 
  login as loginService, 
  logout as logoutService,
  register as registerService,
  hasPermission as checkPermission,
} from '../services/authService';
import { ensureUserHasState } from '../types/user.types';
import { RootState } from '../redux/store';

/**
 * Hook personalizado para manejar la autenticación
 * Proporciona acceso centralizado a toda la funcionalidad relacionada con autenticación
 */
const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Seleccionar el estado de autenticación del Redux store
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const role = useSelector(selectUserRole);
  const isAdmin = useSelector(selectIsAdmin);
  const isDocente = useSelector(selectIsDocente);
  const isEstudiante = useSelector(selectIsEstudiante);
  const isPadre = useSelector(selectIsPadre);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const error = useSelector((state: RootState) => state.auth.error);
  
  /**
   * Iniciar sesión
   */
  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const { user } = await loginService(email, password);
      dispatch(loginSuccess(ensureUserHasState(user)));
      navigate('/');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al iniciar sesión';
      dispatch(loginFailure(errorMessage));
      return false;
    }
  };
  
  /**
   * Cerrar sesión
   */
  const logout = () => {
    logoutService();
    dispatch(logoutAction());
    navigate('/login');
  };
  
  /**
   * Registrar nuevo usuario
   */
  const register = async (userData: any) => {
    try {
      dispatch(registerStart());
      const { user } = await registerService(userData);
      dispatch(registerSuccess(ensureUserHasState(user)));
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error al registrarse';
      dispatch(registerFailure(errorMessage));
      return false;
    }
  };
  
  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return user?.tipo === role;
  };
  
  /**
   * Verificar si el usuario tiene permiso basado en roles requeridos
   */
  const hasPermission = (requiredRoles: string[]): boolean => {
    return checkPermission(requiredRoles, user?.tipo);
  };
  
  return {
    user,
    isAuthenticated,
    role,
    isAdmin,
    isDocente,
    isEstudiante,
    isPadre,
    loading,
    error,
    login,
    logout,
    register,
    hasRole,
    hasPermission
  };
};

export default useAuth;