import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
} from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StarIcon from "@mui/icons-material/Star";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import VerifiedIcon from "@mui/icons-material/Verified";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import Face6Icon from "@mui/icons-material/Face6";
import BrushIcon from "@mui/icons-material/Brush";
import imgHero from "../assets/images/image-1.jpg";

export default function Nosotros() {
  return (
    <>
      <div className="position-relative w-100">
        <img
          src={imgHero}
          alt="Nosotros"
          className="w-100"
          style={{
            height: "420px",
            objectFit: "cover",
            filter: "brightness(.55)",
          }}
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center">
          <div className="container">
            <Typography
              variant="overline"
              sx={{ color: "rgba(255,255,255,.85)", letterSpacing: 2 }}
            >
              Sobre nosotros
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                color: (t) => t.palette.primary.main,
                mb: 1,
              }}
            >
              Tradición y detalle
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "rgba(255,255,255,.95)", maxWidth: 760, mb: 2 }}
            >
              Barbería con enfoque moderno: técnica precisa, higiene rigurosa y
              atención por cita.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button
                component={RouterLink}
                to="/reservar"
                variant="contained"
                color="primary"
              >
                Reservar cita
              </Button>
              <Button
                component={RouterLink}
                to="/servicios"
                variant="outlined"
                color="primary"
              >
                Ver servicios
              </Button>
            </Stack>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row row-cols-1 row-cols-md-2 g-4 align-items-stretch">
          {[
            {
              icon: <FlagIcon color="primary" />,
              title: "Misión",
              text: "Potenciar la imagen de cada cliente con cortes y arreglos de barba de alta precisión en un entorno cómodo, puntual y seguro.",
            },
            {
              icon: <VisibilityIcon color="primary" />,
              title: "Visión",
              text: "Ser la barbería de referencia en El Alto por trato cercano, dominio técnico y acabados impecables.",
            },
          ].map((b, i) => (
            <div className="col" key={i}>
              <Card
                className="h-100"
                sx={{
                  borderRadius: 3,
                  borderTop: (t) => `4px solid ${t.palette.primary.main}`,
                  backgroundColor: (t) => t.palette.background.paper,
                }}
              >
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    {b.icon}
                    <Typography variant="h5" fontWeight={800}>
                      {b.title}
                    </Typography>
                  </Stack>
                  <Typography color="text.secondary">{b.text}</Typography>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center my-5">
          <Typography variant="overline" color="text.secondary">
            Lo que nos define
          </Typography>
          <Typography variant="h4" fontWeight={900}>
            Valores
          </Typography>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 align-items-stretch">
          {[
            {
              icon: <StarIcon color="primary" />,
              title: "Excelencia",
              text: "Cortes pulidos, simetría y acabado profesional.",
            },
            {
              icon: <ScheduleIcon color="primary" />,
              title: "Puntualidad",
              text: "Trabajamos por cita para respetar tu tiempo.",
            },
            {
              icon: <CleanHandsIcon color="primary" />,
              title: "Higiene",
              text: "Protocolos de desinfección y herramientas esterilizadas.",
            },
            {
              icon: <VerifiedIcon color="primary" />,
              title: "Confianza",
              text: "Asesoría honesta y recomendaciones personalizadas.",
            },
          ].map((v, i) => (
            <div className="col" key={i}>
              <Card
                className="h-100"
                sx={{
                  borderRadius: 3,
                  boxShadow: 1,
                  backgroundColor: (t) => t.palette.background.paper,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 1 }}>{v.icon}</Box>
                  <Typography variant="h6" fontWeight={800}>
                    {v.title}
                  </Typography>
                  <Typography color="text.secondary">{v.text}</Typography>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="text-center my-5">
          <Typography variant="overline" color="text.secondary">
            Nuestra propuesta
          </Typography>
          <Typography variant="h4" fontWeight={900}>
            Especialidades
          </Typography>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 align-items-stretch">
          {[
            {
              icon: <ContentCutIcon color="primary" />,
              title: "Cortes de precisión",
              text: "Fade, clásico y modernos, adaptados a tu fisonomía.",
              link: "/servicios#cortes",
            },
            {
              icon: <Face6Icon color="primary" />,
              title: "Barba & contornos",
              text: "Perfilado, modelado y recomendaciones de cuidado.",
              link: "/servicios#barba",
            },
            {
              icon: <BrushIcon color="primary" />,
              title: "Tratamientos faciales",
              text: "Mascarillas e hidratación para piel saludable.",
              link: "/servicios#facial",
            },
          ].map((s, i) => (
            <div className="col" key={i}>
              <Card
                className="h-100"
                sx={{
                  borderRadius: 3,
                  borderTop: (t) => `4px solid ${t.palette.primary.main}`,
                  backgroundColor: (t) => t.palette.background.paper,
                  display: "flex",
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    flexGrow: 1,
                  }}
                >
                  <Box sx={{ mb: 1 }}>{s.icon}</Box>
                  <Typography variant="h6" fontWeight={800}>
                    {s.title}
                  </Typography>
                  <Typography color="text.secondary">{s.text}</Typography>
                  <Box sx={{ mt: "auto" }}>
                    <Button
                      component={RouterLink}
                      to={s.link}
                      size="small"
                      variant="outlined"
                      color="primary"
                    >
                      Ver detalle
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <Paper
          elevation={0}
          className="d-flex flex-wrap align-items-center justify-content-between gap-2 gap-md-3 mt-5"
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            backgroundColor: (t) => t.palette.background.paper,
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<ScheduleIcon />}
              label="Atención por cita"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<CleanHandsIcon />}
              label="Higiene certificada"
              color="primary"
              variant="outlined"
            />
            <Chip
              icon={<VerifiedIcon />}
              label="Garantía de satisfacción"
              color="primary"
              variant="outlined"
            />
          </Stack>
          <Button
            component={RouterLink}
            to="/reservar"
            variant="contained"
            color="primary"
          >
            Reserva ahora
          </Button>
        </Paper>
      </div>
    </>
  );
}
