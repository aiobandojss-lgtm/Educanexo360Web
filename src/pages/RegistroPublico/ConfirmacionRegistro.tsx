// src/Pages/RegistroPublico/ConfirmacionRegistro.tsx
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  CheckCircleOutline,
  Email,
  School,
  HourglassEmpty,
} from "@mui/icons-material";

const ConfirmacionRegistro: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          ¡Solicitud Enviada Exitosamente!
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CheckCircleOutline color="success" sx={{ fontSize: 64 }} />
        </Box>

        <Typography variant="h6" align="center" gutterBottom>
          Gracias por registrarse en EducaNexo360
        </Typography>

        <Typography variant="body1" paragraph align="center">
          Su solicitud de registro ha sido recibida y será revisada por el
          personal administrativo de la institución educativa.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Próximos pasos:
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <HourglassEmpty color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Su solicitud será revisada por la institución"
              secondary="Este proceso puede tomar 1-2 días hábiles"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <Email color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Recibirá un correo electrónico con la confirmación"
              secondary="En caso de aprobación, recibirá las credenciales de acceso para usted y sus estudiantes"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <School color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Podrá acceder a la plataforma EducaNexo360"
              secondary="Utilice las credenciales proporcionadas para acceder al sistema"
            />
          </ListItem>
        </List>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" paragraph>
          Si tiene alguna pregunta o no recibe respuesta en el tiempo estimado,
          por favor contacte directamente a la institución educativa.
        </Typography>

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            component={RouterLink}
            to="/registro"
            variant="contained"
            color="primary"
          >
            Volver al Inicio
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ConfirmacionRegistro;
