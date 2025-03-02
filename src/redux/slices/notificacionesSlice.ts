// src/redux/slices/notificacionesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosConfig';

// Definir el tipo de una notificación
export interface Notificacion {
  _id: string;
  mensaje: string;
  tipo: string;
  referencia?: {
    tipo: string;
    id: string;
  };
  fecha: string;
  leido: boolean;
  usuario: string;
}

// Definir el estado inicial
interface NotificacionesState {
  notificaciones: Notificacion[];
  loading: boolean;
  error: string | null;
  noLeidas: number;
}

const initialState: NotificacionesState = {
  notificaciones: [],
  loading: false,
  error: null,
  noLeidas: 0
};

// Thunk para cargar notificaciones
export const fetchNotificaciones = createAsyncThunk(
  'notificaciones/fetchNotificaciones',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/notificaciones');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar notificaciones');
    }
  }
);

// Thunk para marcar una notificación como leída
export const markNotificacionAsRead = createAsyncThunk(
  'notificaciones/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/notificaciones/${id}`, {
        leido: true
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar notificación');
    }
  }
);

// Crear el slice
const notificacionesSlice = createSlice({
  name: 'notificaciones',
  initialState,
  reducers: {
    // Reducers sincronizados
    resetNotificaciones: (state) => {
      state.notificaciones = [];
      state.loading = false;
      state.error = null;
      state.noLeidas = 0;
    },
    addNotificacion: (state, action: PayloadAction<Notificacion>) => {
      state.notificaciones.unshift(action.payload);
      if (!action.payload.leido) {
        state.noLeidas += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // Casos para fetchNotificaciones
    builder
      .addCase(fetchNotificaciones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotificaciones.fulfilled, (state, action: PayloadAction<Notificacion[]>) => {
        state.notificaciones = action.payload;
        state.loading = false;
        state.noLeidas = action.payload.filter(notif => !notif.leido).length;
      })
      .addCase(fetchNotificaciones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error desconocido';
      });
    
    // Casos para markNotificacionAsRead
    builder
      .addCase(markNotificacionAsRead.fulfilled, (state, action: PayloadAction<Notificacion>) => {
        const index = state.notificaciones.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          const wasUnread = !state.notificaciones[index].leido;
          state.notificaciones[index] = action.payload;
          
          // Si la notificación estaba sin leer y ahora está leída, decrementar el contador
          if (wasUnread && action.payload.leido) {
            state.noLeidas -= 1;
          }
        }
      });
  },
});

// Exportar acciones y reducer
export const { resetNotificaciones, addNotificacion } = notificacionesSlice.actions;
export default notificacionesSlice.reducer;