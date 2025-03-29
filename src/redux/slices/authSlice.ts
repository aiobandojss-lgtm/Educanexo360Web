// src/redux/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isAuthenticated, getCurrentUser } from '../../services/authService';
import { RootState } from '../store';
import { ensureUserHasState } from '../../types/user.types';

// Definir el tipo para el usuario
interface User {
  _id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tipo: string;
  escuelaId: string;
  estado: string;
}

// Definir el tipo para el estado
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Función para obtener el estado inicial incluyendo el check de localStorage
const getInitialState = (): AuthState => {
  const initialAuth = isAuthenticated();
  let initialUser = null;
  
  if (initialAuth) {
    const userData = getCurrentUser();
    if (userData) {
      initialUser = ensureUserHasState(userData);
    }
  }
  
  return {
    isAuthenticated: initialAuth,
    user: initialUser,
    loading: false,
    error: null,
  };
};

// Estado inicial
const initialState: AuthState = getInitialState();

// Crear el slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Nuevas acciones para registro
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Acción para limpiar errores
    clearError: (state) => {
      state.error = null;
    },
    // Marcar la sesión como iniciada (para usar después de refresh token)
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

// Exportar las acciones
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUserProfile,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
  setAuthenticated,
} = authSlice.actions;

// Selectores para facilitar acceso al estado
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectUser = (state: RootState) => state.auth.user;
export const selectUserRole = (state: RootState) => state.auth.user?.tipo;
export const selectIsAdmin = (state: RootState) => state.auth.user?.tipo === 'ADMIN';
export const selectIsDocente = (state: RootState) => state.auth.user?.tipo === 'DOCENTE';
export const selectIsEstudiante = (state: RootState) => state.auth.user?.tipo === 'ESTUDIANTE';
export const selectIsPadre = (state: RootState) => state.auth.user?.tipo === 'PADRE';
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Exportar el reducer
export default authSlice.reducer;