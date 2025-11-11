import {
  Box,
  Typography,
  Link as MLink,
  IconButton,
  Stack,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import RoomIcon from "@mui/icons-material/Room";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import logo from "../assets/logo/logo.png";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        bgcolor: (t) => t.palette.grey[900],
        color: (t) => t.palette.grey[300],
        borderTop: (t) => `3px solid ${t.palette.primary.main}`,
      }}
    >
      <div className="container py-4 py-md-5">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4">
          <div className="col">
            <Stack spacing={2}>
              <Box
                component="img"
                src={logo}
                alt="Jhoann Barber"
                sx={{ height: 64, width: 125 }}
              />
              <Typography variant="body2">
                Barbería de inspiración clásica con enfoque moderno. Atención
                por cita, puntualidad y acabado premium.
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small" color="primary">
                  <FacebookIcon />
                </IconButton>
                <IconButton size="small" color="primary">
                  <InstagramIcon />
                </IconButton>
              </Stack>
            </Stack>
          </div>

          <div className="col">
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
              color="common.white"
            >
              Secciones
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1 }}>
              <MLink
                component={RouterLink}
                to="/"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Inicio
              </MLink>
              <MLink
                component={RouterLink}
                to="/nosotros"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Nosotros
              </MLink>
              <MLink
                component={RouterLink}
                to="/servicios"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Servicios
              </MLink>
              <MLink
                component={RouterLink}
                to="/reservar"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Reserva
              </MLink>
              <MLink
                component={RouterLink}
                to="/contacto"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Contacto
              </MLink>
            </Stack>
          </div>

          <div className="col">
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
              color="common.white"
            >
              Servicios
            </Typography>
            <Stack spacing={0.8} sx={{ mt: 1 }}>
              <MLink
                component={RouterLink}
                to="/servicios#cortes"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Cortes de Cabello
              </MLink>
              <MLink
                component={RouterLink}
                to="/servicios#barba"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Corte de Barba
              </MLink>
              <MLink
                component={RouterLink}
                to="/servicios#afeitado"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Afeitado
              </MLink>
              <MLink
                component={RouterLink}
                to="/servicios#facial"
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Mascarilla Facial
              </MLink>
            </Stack>
          </div>

          <div className="col">
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
              color="common.white"
            >
              Contacto
            </Typography>
            <Stack spacing={1.2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <RoomIcon fontSize="small" />
                <Typography variant="body2">El Alto, Bolivia</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <MailOutlineIcon fontSize="small" />
                <MLink
                  href="mailto:jhoann@barbershop.com"
                  underline="none"
                  sx={{
                    color: "inherit",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  jhoann@barbershop.com
                </MLink>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" />
                <MLink
                  href="tel:+59173565035"
                  underline="none"
                  sx={{
                    color: "inherit",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  +591 73565035
                </MLink>
              </Stack>
              <Typography variant="body2">Lun–Sáb 09:00–20:00</Typography>
            </Stack>
          </div>
        </div>
      </div>

      <Box
        sx={{
          bgcolor: (t) => t.palette.grey[900],
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <div className="container py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <Typography
            variant="caption"
            sx={{ color: (t) => t.palette.grey[400] }}
          >
            © {new Date().getFullYear()} Jhoann Barber. Todos los derechos
            reservados.
          </Typography>
          <div className="d-flex align-items-center gap-3">
            <MLink
              component={RouterLink}
              to="/terminos"
              underline="none"
              variant="caption"
              sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
            >
              Términos
            </MLink>
            <MLink
              component={RouterLink}
              to="/privacidad"
              underline="none"
              variant="caption"
              sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
            >
              Privacidad
            </MLink>
            <MLink
              component={RouterLink}
              to="/login"
              underline="none"
              variant="caption"
              sx={{
                color: "inherit",
                "&:hover": { color: "primary.main" },
                fontWeight: 700,
              }}
            >
              Enlace para personal de la barbería
            </MLink>
          </div>
        </div>
      </Box>
    </Box>
  );
}
