// src/Pages/RegistroPublico/ValidarCodigoInvitacion.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import invitacionService from "../../services/invitacionService";

const ValidarCodigoInvitacion: React.FC = () => {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      setError("Por favor, ingrese el código de invitación.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Usar el endpoint público para validar el código
      const resultado = await invitacionService.validarCodigo(codigo);

      // Si el código es válido, redirigir al formulario de registro
      // Asegurarse de incluir el código original para uso futuro
      navigate("/registro/formulario", {
        state: {
          invitacion: {
            ...resultado,
            codigo, // Incluir el código original
          },
        },
      });
    } catch (err: any) {
      console.error("Error al validar código:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(
          "El código ingresado no es válido o ha expirado. Por favor, verifique e intente nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          py: 8,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {/* Logo de la aplicación */}
          <Box
            component="img"
            src="/EDUCANEXO36002.png"
            alt="EducaNexo360 Logo"
            sx={{
              height: "auto",
              width: "80%",
              maxWidth: 220,
              mb: 2,
            }}
          />
          <Typography variant="h4" component="h1" gutterBottom>
            Portal de Registro
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Bienvenido al sistema de registro para acudientes y estudiantes
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            backgroundColor: "white",
          }}
        >
          <Typography variant="h6" gutterBottom>
            Ingrese su código de invitación
          </Typography>

          <Typography variant="body2" paragraph sx={{ mb: 3 }}>
            Introduzca el código proporcionado por la institución educativa para
            registrarse en el sistema.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Código de Invitación"
              variant="outlined"
              fullWidth
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={loading}
              placeholder="Ejemplo: C24-AB123X"
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  fontFamily: "monospace",
                  letterSpacing: "0.5px",
                },
              }}
              autoFocus
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Continuar"
              )}
            </Button>
          </form>
        </Paper>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Si tiene problemas con su código de invitación, comuníquese
            directamente con la institución educativa.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ValidarCodigoInvitacion;
