// src/pages/auth/ForgotPassword.tsx
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
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosConfig";
import API_ROUTES from "../../constants/apiRoutes";

// Esquema de validación
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Email inválido").required("El email es requerido"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    values: { email: string },
    { setSubmitting }: any
  ) => {
    try {
      setError(null);

      // Llamada a la API para solicitar recuperación de contraseña
      await axiosInstance.post(API_ROUTES.AUTH.FORGOT_PASSWORD, {
        email: values.email,
      });

      setSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Error al procesar la solicitud";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

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
            Recuperar Contraseña
          </Typography>

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Si el correo electrónico existe en nuestro sistema, recibirás un
                enlace para recuperar tu contraseña.
              </Alert>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => navigate("/login")}
                sx={{ mt: 3, borderRadius: "20px" }}
              >
                Volver a Iniciar Sesión
              </Button>
            </Box>
          ) : (
            <>
              <Typography variant="body1" paragraph align="center">
                Ingresa tu correo electrónico y te enviaremos instrucciones para
                recuperar tu contraseña.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={{ email: "" }}
                validationSchema={ForgotPasswordSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form>
                    <Field
                      as={TextField}
                      fullWidth
                      id="email"
                      name="email"
                      label="Correo electrónico"
                      margin="normal"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
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
                        "Enviar instrucciones"
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

export default ForgotPassword;
