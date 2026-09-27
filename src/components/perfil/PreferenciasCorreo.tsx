// src/components/perfil/PreferenciasCorreo.tsx
// Preferencia de correo del usuario (Fase 4 del backend: GET/PUT /usuarios/me/preferencias).
// Si el backend aún no tiene el endpoint (404), la tarjeta no se muestra.
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import axiosInstance from '../../api/axiosConfig';

type PreferenciaEmail = 'inmediato' | 'resumen' | 'ninguno';

const OPCIONES: Array<{ valor: PreferenciaEmail; titulo: string; descripcion: string }> = [
  {
    valor: 'inmediato',
    titulo: 'Al instante',
    descripcion: 'Un correo por cada mensaje que recibas.',
  },
  {
    valor: 'resumen',
    titulo: 'Resumen diario',
    // La hora la define el servidor (RESUMEN_HORA, 18 por defecto)
    descripcion: 'Un solo correo a las 6 p. m. con los mensajes que aún no hayas leído.',
  },
  {
    valor: 'ninguno',
    titulo: 'Ninguno',
    descripcion: 'Solo las notificaciones dentro de la plataforma y en el celular.',
  },
];

const RUTA = '/usuarios/me/preferencias';

const PreferenciasCorreo: React.FC = () => {
  const [valor, setValor] = useState<PreferenciaEmail | null>(null);
  const [cargando, setCargando] = useState(true);
  const [oculto, setOculto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await axiosInstance.get(RUTA);
      setValor(response.data?.data?.email ?? null);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setOculto(true);
      } else {
        setError('No se pudo cargar tu preferencia de correo.');
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const elegir = async (nuevo: PreferenciaEmail) => {
    if (guardando || nuevo === valor) return;
    const anterior = valor;
    setValor(nuevo);
    setGuardando(true);
    setError(null);
    setExito(false);
    try {
      const response = await axiosInstance.put(RUTA, { email: nuevo });
      setValor(response.data?.data?.email ?? nuevo);
      setExito(true);
    } catch (err: any) {
      // Se revierte la selección si el servidor no la guardó
      setValor(anterior);
      setError(err?.response?.data?.message || 'No se pudo guardar tu preferencia. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  if (oculto) return null;

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.05)', mt: 3 }}
    >
      <CardContent>
        <Typography variant="h3" gutterBottom>
          Correos de EducaNexo
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {cargando ? (
          <Box display="flex" justifyContent="center" py={2}>
            <CircularProgress size={24} />
          </Box>
        ) : valor === null && error ? (
          <Box>
            <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
            <Button size="small" onClick={cargar}>Reintentar</Button>
          </Box>
        ) : (
          <>
            <RadioGroup
              value={valor ?? ''}
              onChange={(e) => elegir(e.target.value as PreferenciaEmail)}
              aria-label="Cómo quieres recibir los correos de EducaNexo"
            >
              {OPCIONES.map((opcion) => (
                <FormControlLabel
                  key={opcion.valor}
                  value={opcion.valor}
                  disabled={guardando}
                  control={<Radio />}
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                  label={
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="body1" fontWeight={600}>
                        {opcion.titulo}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opcion.descripcion}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Los mensajes urgentes, las alertas de asistencia y los correos de tu cuenta (como
              recuperar la contraseña) siempre te llegan.
            </Typography>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {exito && !error && (
              <Alert severity="success" sx={{ mt: 2 }} onClose={() => setExito(false)}>
                Preferencia guardada
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferenciasCorreo;
