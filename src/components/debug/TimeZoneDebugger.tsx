// src/components/debug/TimeZoneDebugger.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface TimeZoneDebuggerProps {
  eventos?: any[];
  onClose?: () => void;
}

const TimeZoneDebugger: React.FC<TimeZoneDebuggerProps> = ({
  eventos = [],
  onClose,
}) => {
  const [userTimeZone, setUserTimeZone] = useState<string>("");
  const [timeZoneOffset, setTimeZoneOffset] = useState<number>(0);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  useEffect(() => {
    // Obtener información de zona horaria
    setUserTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setTimeZoneOffset(new Date().getTimezoneOffset());

    // Actualizar la hora actual cada segundo
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convertir minutos de offset a formato "+/-HH:MM"
  const formatOffset = (offsetMinutes: number): string => {
    const sign = offsetMinutes <= 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offsetMinutes) / 60);
    const minutes = Math.abs(offsetMinutes) % 60;
    return `${sign}${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, position: "relative" }}>
      <Box sx={{ position: "absolute", top: 8, right: 8 }}>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="h5" gutterBottom color="primary">
        Depurador de Zona Horaria
      </Typography>

      <Typography variant="subtitle1" color="secondary">
        Información del navegador:
      </Typography>

      <Box sx={{ pl: 2, mb: 2 }}>
        <Typography variant="body1">
          Zona horaria: <strong>{userTimeZone}</strong>
        </Typography>
        <Typography variant="body1">
          Offset UTC:{" "}
          <strong>
            {formatOffset(timeZoneOffset)} (UTC{formatOffset(timeZoneOffset)})
          </strong>
        </Typography>
        <Typography variant="body1">
          Fecha y hora actual: <strong>{currentDate.toString()}</strong>
        </Typography>
        <Typography variant="body1">
          ISO String (UTC): <strong>{currentDate.toISOString()}</strong>
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" color="secondary">
        Ejemplo de conversión de fechas:
      </Typography>

      <Box sx={{ pl: 2, mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Fecha ISO "2025-04-02T02:00:00.000Z" (UTC) en hora local:
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          {new Date("2025-04-02T02:00:00.000Z").toString()}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          getDía: {new Date("2025-04-02T02:00:00.000Z").getDate()}
        </Typography>
      </Box>

      {eventos.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" color="secondary">
            Eventos cargados ({eventos.length}):
          </Typography>

          <Box sx={{ pl: 2, mt: 1 }}>
            {eventos.slice(0, 3).map((evento, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 1,
                  bgcolor: "rgba(0,0,0,0.03)",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {evento.titulo}
                </Typography>
                <Typography variant="body2">ID: {evento._id}</Typography>
                <Typography variant="body2">
                  Todo el día: {evento.todoElDia ? "Sí" : "No"}
                </Typography>
                <Typography variant="body2">
                  Fecha inicio (UTC): {evento.fechaInicio}
                </Typography>
                <Typography variant="body2">
                  Fecha fin (UTC): {evento.fechaFin}
                </Typography>
                <Typography variant="body2">
                  Fecha inicio (Local):{" "}
                  {new Date(evento.fechaInicio).toString()}
                </Typography>
                <Typography variant="body2">
                  getDía de inicio: {new Date(evento.fechaInicio).getDate()}
                </Typography>
                <Typography variant="body2">
                  getMes de inicio: {new Date(evento.fechaInicio).getMonth()}
                </Typography>
              </Box>
            ))}

            {eventos.length > 3 && (
              <Typography variant="body2" color="text.secondary">
                ... y {eventos.length - 3} eventos más
              </Typography>
            )}
          </Box>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" color="text.secondary">
        Este componente muestra información de depuración para ayudar a resolver
        problemas de zona horaria. Se recomienda eliminarlo una vez que los
        problemas estén solucionados.
      </Typography>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="outlined" onClick={onClose}>
          Cerrar
        </Button>
      </Box>
    </Paper>
  );
};

export default TimeZoneDebugger;
