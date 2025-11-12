import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { login } from "../../services/autenticacionServicio";
import hero from "../../assets/images/slide3.jpg";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [pin, setPin] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ correo_electronico: correo, pin });
      localStorage.setItem("jb_user", JSON.stringify(data?.usuario || {}));
      nav("/dashboard", { replace: true });
    } catch (err) {
      const m = err?.response?.data?.mensaje || "No se pudo iniciar sesión";
      setError(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: (t) => t.palette.background.default,
        p: 2,
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 960,
          borderRadius: 3,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        }}
      >
        <Box
          sx={{ display: { xs: "none", md: "block" }, position: "relative" }}
        >
          <Box
            component="img"
            src={hero}
            alt=""
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "brightness(.55)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: (t) => t.palette.primary.main,
                lineHeight: 1,
              }}
            >
              Jhoann Barber
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,.9)" }}>
              Acceso para personal
            </Typography>
          </Box>
        </Box>
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.2}>
              <Typography variant="h5" fontWeight={800}>
                Iniciar sesión
              </Typography>
              {error ? <Alert severity="error">{error}</Alert> : null}
              <TextField
                label="Correo electrónico"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="PIN"
                type={show ? "text" : "password"}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShow((s) => !s)} edge="end">
                        {show ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? "Ingresando…" : "Entrar"}
              </Button>
              <Button component={RouterLink} to="/" color="primary">
                Volver al inicio
              </Button>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
