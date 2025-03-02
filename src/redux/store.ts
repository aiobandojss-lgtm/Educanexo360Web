// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificacionesReducer from './slices/notificacionesSlice';
// Importar otros reducers aquí

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notificaciones: notificacionesReducer,
    // Añadir otros reducers aquí
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Inferir tipos del store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;