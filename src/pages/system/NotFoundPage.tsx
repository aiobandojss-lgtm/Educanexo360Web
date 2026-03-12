import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" mt={10}>
      <Typography variant="h3">404</Typography>
      <Typography variant="h6">La página que intentas abrir no existe</Typography>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => navigate("/login")}
      >
        Ir al login
      </Button>
    </Box>
  );
}