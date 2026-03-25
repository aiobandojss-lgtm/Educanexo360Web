// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from "@mui/icons-material";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Solo loguear en desarrollo
    if (import.meta.env.MODE === "development") {
      console.error("ErrorBoundary capturó un error:", error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          p={3}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 480,
              textAlign: "center",
              borderRadius: 3,
            }}
          >
            <ErrorIcon sx={{ fontSize: 64, color: "#EF4444", mb: 2 }} />
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Algo salió mal
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Ocurrió un error inesperado en esta sección. Puedes intentar
              recargar la página o volver al inicio.
            </Typography>
            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={this.handleReset}
                sx={{ borderRadius: 2 }}
              >
                Reintentar
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReload}
                sx={{
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #059669, #0D9488)",
                }}
              >
                Recargar página
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
