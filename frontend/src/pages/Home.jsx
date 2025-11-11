import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  TextField,
  Paper,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import Face6Icon from "@mui/icons-material/Face6";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import img1 from "../assets/images/slide1.jpg";
import img2 from "../assets/images/slide2.jpg";
import img3 from "../assets/images/slide3.jpg";
import headingLine from "../assets/images/heading-line.png";

export default function Home() {
  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: "100vw",
          ml: "calc(50% - 50vw)",
          mr: "calc(50% - 50vw)",
          color: "#fff",
          overflow: "hidden",
          "& .carousel-inner": {
            height: { xs: "60vh", md: "72vh" },
            minHeight: 380,
          },
          "& .carousel-item": { height: "100%" },
          "& .carousel-item img": {
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6)",
          },
          "& .carousel-indicators [data-bs-target]": {
            width: 10,
            height: 10,
            borderRadius: "50%",
          },
        }}
      >
        <div
          id="hb-hero"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="5000"
          data-bs-pause="false"
          data-bs-touch="true"
        >
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#hb-hero"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="1"
            />
            <button
              type="button"
              data-bs-target="#hb-hero"
              data-bs-slide-to="1"
              aria-label="2"
            />
            <button
              type="button"
              data-bs-target="#hb-hero"
              data-bs-slide-to="2"
              aria-label="3"
            />
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img src={img1} alt="Slide 1" />
            </div>
            <div className="carousel-item">
              <img src={img2} alt="Slide 2" />
            </div>
            <div className="carousel-item">
              <img src={img3} alt="Slide 3" />
            </div>
          </div>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Container>
              <Box sx={{ maxWidth: 760 }}>
                <Typography variant="overline">Jhoann Barber</Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 900,
                    lineHeight: 1.05,
                    color: (t) => t.palette.primary.main,
                    mb: 2,
                    fontSize: { xs: "2rem", md: "3.4rem" },
                  }}
                >
                  Estilo y Comodidad en un Solo Lugar
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, color: "rgba(255,255,255,.95)", maxWidth: 640 }}
                >
                  En nuestra barbería, tu estilo y comodidad son nuestra
                  prioridad. Vive una experiencia única donde cuidamos de ti con
                  pasión y excelencia.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/reservar"
                    variant="contained"
                    color="primary"
                  >
                    Reservar
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
              </Box>
            </Container>
          </Box>
        </div>
      </Box>

      <Box
        sx={{
          backgroundImage: `url(${headingLine})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: 10,
          my: 5,
        }}
      />

      <Container sx={{ pb: { xs: 2, md: 8 } }}>
        <Stack spacing={1} alignItems="center">
          <Typography variant="overline" color="text.secondary">
            Estamos para ti
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, textAlign: "center" }}
            color="text.primary"
          >
            Somos tu Barbería de Confianza
          </Typography>
          <Typography
            align="center"
            sx={{ maxWidth: 720 }}
            color="text.secondary"
          >
            Analizamos tu fisonomía para recomendar el corte que mejor te
            favorezca, respetando tu criterio y preferencias.
          </Typography>
          <Button
            component={RouterLink}
            to="/nosotros"
            variant="outlined"
            color="primary"
          >
            Más acerca de nosotros
          </Button>
        </Stack>
      </Container>

      <Box
        sx={{
          backgroundImage: `url(${headingLine})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: 10,
          my: 2,
        }}
      />

      <Box sx={{ pb: 6 }}>
        <div className="container">
          <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <Typography
              variant="overline"
              sx={{ color: (t) => t.palette.primary.dark }}
            >
              Somos tu Barbería
            </Typography>
            <Typography
              variant="h4"
              sx={{ fontWeight: 900 }}
              color="text.primary"
            >
              Nuestros Servicios
            </Typography>
          </Stack>

          <div className="row row-cols-1 row-cols-md-3 g-4 align-items-stretch">
            {[
              {
                icon: <ContentCutIcon fontSize="large" color="primary" />,
                title: "Cortes de Cabello",
                text: "Cortes adaptados a tu fisonomía para resaltar rasgos.",
              },
              {
                icon: <Face6Icon fontSize="large" color="primary" />,
                title: "Corte de Barba",
                text: "Modelado según tu barba con recomendación personalizada.",
              },
              {
                icon: <CleanHandsIcon fontSize="large" color="primary" />,
                title: "Afeitado Suave",
                text: "Cremas y bálsamos para un afeitado cómodo y cuidado.",
              },
            ].map((s, i) => (
              <div className="col" key={i}>
                <Card
                  className="h-100"
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    backgroundColor: (t) => t.palette.background.paper,
                    borderTop: (t) => `4px solid ${t.palette.primary.main}`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "center",
                      gap: 1,
                      flexGrow: 1,
                    }}
                  >
                    <Box>{s.icon}</Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                      color="text.primary"
                    >
                      {s.title}
                    </Typography>
                    <Typography color="text.secondary">{s.text}</Typography>
                    <Box sx={{ mt: "auto", pt: 2 }}>
                      <Button
                        size="small"
                        component={RouterLink}
                        to="/servicios"
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
        </div>
      </Box>

      <Box
        sx={{
          backgroundImage: `url(${headingLine})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: 10,
          my: 5,
        }}
      />

      <Container sx={{ pb: { xs: 6, md: 10 } }}>
        <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900 }}
            color="text.primary"
          >
            Contáctanos
          </Typography>
          <Typography color="text.secondary" textAlign="center">
            Escríbenos y te respondemos a la brevedad.
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            borderRadius: 3,
            border: 1,
            borderColor: "divider",
            backgroundColor: (t) => t.palette.background.paper,
          }}
        >
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row g-3 align-items-stretch">
              <div className="col-12 col-md-3">
                <TextField label="Nombre" fullWidth />
              </div>
              <div className="col-12 col-md-3">
                <TextField label="Correo Electrónico" type="email" fullWidth />
              </div>
              <div className="col-12 col-md-3">
                <TextField label="Teléfono" fullWidth />
              </div>
              <div className="col-12 col-md-3">
                <TextField label="Asunto" fullWidth />
              </div>
              <div className="col-12">
                <TextField label="Mensaje" multiline minRows={4} fullWidth />
              </div>
              <div className="col-12 d-flex justify-content-end gap-2">
                <Button type="reset" variant="outlined" color="primary">
                  Limpiar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Enviar
                </Button>
              </div>
            </div>
          </form>
        </Paper>
      </Container>
    </>
  );
}
