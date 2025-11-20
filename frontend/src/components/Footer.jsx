import { useEffect, useState } from "react";
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
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import RoomIcon from "@mui/icons-material/Room";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import logo from "../assets/logo/logo.png";
import { obtenerInformacionContacto } from "../services/contactoServicio";

export default function Footer() {
  const [contacto, setContacto] = useState(null);

  useEffect(() => {
    obtenerInformacionContacto()
      .then((data) => setContacto(data?.data || {}))
      .catch(() => setContacto({}));
  }, []);

  const waLink = (() => {
    const raw = String(contacto?.whatsapp || "").trim();
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("591")) return `https://wa.me/${digits}`;
    if (digits.length === 8) return `https://wa.me/591${digits}`;
    return `https://wa.me/${digits}`;
  })();

  if (!contacto) return null;

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
                sx={{ height: 60, width: 125 }}
              />
              <Typography variant="body2">
                Barbería de inspiración clásica con enfoque moderno. Atención
                por cita, puntualidad y acabado premium.
              </Typography>
              <Stack direction="row" spacing={1}>
                {contacto?.facebook && (
                  <IconButton
                    component="a"
                    href={contacto.facebook}
                    target="_blank"
                    rel="noopener"
                    size="small"
                    color="primary"
                  >
                    <FacebookIcon />
                  </IconButton>
                )}
                {contacto?.instagram && (
                  <IconButton
                    component="a"
                    href={contacto.instagram}
                    target="_blank"
                    rel="noopener"
                    size="small"
                    color="primary"
                  >
                    <InstagramIcon />
                  </IconButton>
                )}
                {contacto?.youtube && (
                  <IconButton
                    component="a"
                    href={contacto.youtube}
                    target="_blank"
                    rel="noopener"
                    size="small"
                    color="primary"
                  >
                    <YouTubeIcon />
                  </IconButton>
                )}
                {contacto?.tiktok && (
                  <IconButton
                    component="a"
                    href={contacto.tiktok}
                    target="_blank"
                    rel="noopener"
                    size="small"
                    color="primary"
                  >
                    <MusicNoteIcon />
                  </IconButton>
                )}
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
                to="/nuestros-servicios"
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
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Cortes de Cabello
              </MLink>
              <MLink
                component={RouterLink}
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Corte de Barba
              </MLink>
              <MLink
                component={RouterLink}
                underline="none"
                sx={{ color: "inherit", "&:hover": { color: "primary.main" } }}
              >
                Afeitado
              </MLink>
              <MLink
                component={RouterLink}
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
              {contacto?.direccion && (
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <RoomIcon fontSize="small" sx={{ mt: 0.5, flexShrink: 0 }} />
                  <Typography variant="body2">{contacto.direccion}</Typography>
                </Stack>
              )}
              {contacto?.email && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <MailOutlineIcon fontSize="small" />
                  <MLink
                    href={`mailto:${contacto.email}`}
                    underline="none"
                    sx={{
                      color: "inherit",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {contacto.email}
                  </MLink>
                </Stack>
              )}
              {contacto?.telefono && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" />
                  <MLink
                    href={`tel:${contacto.telefono}`}
                    underline="none"
                    sx={{
                      color: "inherit",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {contacto.telefono}
                  </MLink>
                </Stack>
              )}
              {waLink && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <WhatsAppIcon fontSize="small" />
                  <MLink
                    href={waLink}
                    target="_blank"
                    rel="noopener"
                    underline="none"
                    sx={{
                      color: "inherit",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    WhatsApp
                  </MLink>
                </Stack>
              )}
              {contacto?.horarios_atencion && (
                <Typography variant="body2">
                  {contacto.horarios_atencion}
                </Typography>
              )}
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
