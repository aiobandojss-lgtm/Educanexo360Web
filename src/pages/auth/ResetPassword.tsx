// src/pages/auth/ResetPassword.tsx
import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import API_ROUTES from "../../constants/apiRoutes";

// Esquema de validación
const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (
    values: { password: string; confirmPassword: string },
    { setSubmitting }: any
  ) => {
    try {
      setError(null);

      if (!token) {
        setError("Token no válido");
        return;
      }

      // Llamada a la API para restablecer la contraseña
      await axiosInstance.post(API_ROUTES.AUTH.RESET_PASSWORD, {
        token,
        password: values.password,
      });

      setSuccess(true);

      // Redireccionar al login después de 3 segundos
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Contraseña restablecida exitosamente. Ya puedes iniciar sesión.",
          },
        });
      }, 3000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al restablecer la contraseña";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (!token) {
    return (
      <Container component="main" maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error">
            Token no válido. Por favor, solicita un nuevo enlace de
            recuperación.
          </Alert>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => navigate("/forgot-password")}
            sx={{ mt: 3 }}
          >
            Solicitar nuevo enlace
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            EducaNexo360
          </Typography>
          <Typography component="h2" variant="h6" align="center" gutterBottom>
            Establecer Nueva Contraseña
          </Typography>

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Tu contraseña ha sido restablecida exitosamente. Serás
                redirigido a la página de inicio de sesión.
              </Alert>
            </Box>
          ) : (
            <>
              <Typography variant="body1" paragraph align="center">
                Ingresa tu nueva contraseña.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={{ password: "", confirmPassword: "" }}
                validationSchema={ResetPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      fullWidth
                      id="password"
                      name="password"
                      label="Nueva contraseña"
                      type={showPassword ? "text" : "password"}
                      margin="normal"
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleTogglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Field
                      as={TextField}
                      fullWidth
                      id="confirmPassword"
                      name="confirmPassword"
                      label="Confirmar contraseña"
                      type={showConfirmPassword ? "text" : "password"}
                      margin="normal"
                      error={
                        touched.confirmPassword &&
                        Boolean(errors.confirmPassword)
                      }
                      helperText={
                        touched.confirmPassword && errors.confirmPassword
                      }
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleToggleConfirmPasswordVisibility}
                              edge="end"
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{ mt: 3, mb: 2, borderRadius: "20px" }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Guardar nueva contraseña"
                      )}
                    </Button>

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Link href="/login" variant="body2">
                        Volver a Iniciar Sesión
                      </Link>
                    </Box>
                  </Form>
                )}
              </Formik>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPassword;
