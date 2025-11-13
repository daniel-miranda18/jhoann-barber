import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  IconButton,
  Link as MUILink,
  Snackbar,
  Alert,
  Box,
  Grid,
  InputAdornment,
  Avatar,
  Fab,
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import RoomIcon from "@mui/icons-material/Room";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TheatersIcon from "@mui/icons-material/Theaters";
import MusicNoteIcon from "@mui/icons-material/MusicNote"; // <-- nuevo para TikTok
import PersonIcon from "@mui/icons-material/Person";
import SubjectIcon from "@mui/icons-material/Subject";
import MessageIcon from "@mui/icons-material/Message";
import { obtenerInformacionContacto } from "../services/contactoServicio";
import dayjs from "dayjs";

export default function Contacto() {
  const [contacto, setContacto] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    celular: "",
    asunto: "",
    mensaje: "",
  });
  const [sending, setSending] = useState(false);
  const [alerta, setAlerta] = useState({
    open: false,
    type: "success",
    msg: "",
  });

  useEffect(() => {
    obtenerInformacionContacto()
      .then((data) => setContacto(data?.data || {}))
      .catch(() =>
        setAlerta({
          open: true,
          msg: "No se pudo cargar la información",
          type: "error",
        })
      );
  }, []);

  const valido = useMemo(() => {
    const e = (form.email || "").trim();
    const n = (form.nombre || "").trim();
    const m = (form.mensaje || "").trim();
    return n.length >= 2 && /\S+@\S+\.\S+/.test(e) && m.length >= 5;
  }, [form]);

  const handleChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valido) {
      setAlerta({
        open: true,
        type: "error",
        msg: "Completa los campos requeridos.",
      });
      return;
    }
    try {
      setSending(true);
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setAlerta({
        open: true,
        type: "success",
        msg: "Mensaje enviado. Te responderemos pronto.",
      });
      setForm({ nombre: "", email: "", celular: "", asunto: "", mensaje: "" });
    } catch {
      const mailto = `mailto:${
        contacto?.email || ""
      }?subject=${encodeURIComponent(
        form.asunto || "Consulta desde la web"
      )}&body=${encodeURIComponent(
        `Nombre: ${form.nombre}\nEmail: ${form.email}\nCelular: ${form.celular}\n\n${form.mensaje}`
      )}`;
      window.location.href = mailto;
    } finally {
      setSending(false);
    }
  };

  if (!contacto) return <Typography>Cargando...</Typography>;
  const waLink = (() => {
    const raw = String(contacto?.whatsapp || "").trim();
    if (!raw) return null;
    const digits = raw.replace(/\D/g, "");
    if (!digits) return null;
    if (digits.startsWith("591")) return `https://wa.me/${digits}`;
    if (digits.length === 8) return `https://wa.me/591${digits}`;
    return `https://wa.me/${digits}`;
  })();

  return (
    <Container>
      <Box sx={{ py: 5, textAlign: "center" }}>
        <div className="container">
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
          >
            Contacto
          </Typography>
          <Typography variant="h6" sx={{ color: "#6c757d" }}>
            ¡Estamos aquí para ayudarte! Si tienes alguna pregunta o necesitas más información, no dudes en contactarnos a través de este formulario. Nuestro equipo estará encantado de asistirte con cualquier consulta que tengas.
          </Typography>
        </div>
      </Box>
      <div className="row g-4 align-items-stretch">
        <div className="col-12 col-lg-5">
          <Card elevation={2} className="h-100">
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <RoomIcon />
                  </Avatar>
                  <div>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Ubicación
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {contacto.direccion}
                    </Typography>
                  </div>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <PhoneIphoneIcon />
                  </Avatar>
                  <div>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Teléfono
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <MUILink
                        href={`tel:${contacto.telefono}`}
                        underline="hover"
                      >
                        {contacto.telefono}
                      </MUILink>
                      {waLink && (
                        <Button
                          size="small"
                          startIcon={<WhatsAppIcon />}
                          href={waLink}
                          target="_blank"
                          rel="noopener"
                        >
                          WhatsApp
                        </Button>
                      )}
                    </Stack>
                  </div>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <IconButton
                    component="a"
                    href={contacto.facebook}
                    target="_blank"
                    rel="noopener"
                    aria-label="Facebook"
                  >
                    <FacebookIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href={contacto.instagram}
                    target="_blank"
                    rel="noopener"
                    aria-label="Instagram"
                  >
                    <InstagramIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href={contacto.tiktok}
                    target="_blank"
                    rel="noopener"
                    aria-label="TikTok"
                  >
                    <MusicNoteIcon /> {/* TikTok: icono arreglado */}
                  </IconButton>
                </Stack>

                {/* mapa ocupa espacio flexible para alinear altura con el formulario */}
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 1,
                    flex: 1,
                    minHeight: 300,
                  }}
                >
                  <iframe
                    title="Ubicación"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      contacto.direccion
                    )}&z=16&output=embed`}
                  />
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Última actualización:{" "}
                  {contacto.actualizado_en
                    ? dayjs(contacto.actualizado_en).format("YYYY-MM-DD HH:mm")
                    : "—"}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </div>

        {/* columna derecha: formulario en dos columnas dentro del card */}
        <div className="col-12 col-lg-7">
          <Card elevation={2} className="h-100">
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>
                Escríbenos
              </Typography>

              <form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
              >
                <div className="row g-3" style={{ flex: 1 }}>
                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={form.nombre}
                      onChange={handleChange("nombre")}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      type="email"
                      label="Correo"
                      value={form.email}
                      onChange={handleChange("email")}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      label="Celular"
                      value={form.celular}
                      onChange={handleChange("celular")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphoneIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      label="Asunto"
                      value={form.asunto}
                      onChange={handleChange("asunto")}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </div>

                  <div
                    className="col-12"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <TextField
                      fullWidth
                      label="Mensaje"
                      value={form.mensaje}
                      onChange={handleChange("mensaje")}
                      multiline
                      minRows={6}
                      required
                      sx={{ height: "100%" }}
                    />
                  </div>
                </div>
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-start"
                  sx={{ mt: 2 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    disabled={sending || !valido}
                  >
                    Enviar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setForm({
                        nombre: "",
                        email: "",
                        celular: "",
                        asunto: "",
                        mensaje: "",
                      })
                    }
                  >
                    Limpiar
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {waLink && (
        <Fab
          color="success"
          aria-label="whatsapp"
          href={waLink}
          target="_blank"
          rel="noopener"
          sx={{ position: "fixed", right: 20, bottom: 20 }}
        >
          <WhatsAppIcon />
        </Fab>
      )}

      <Snackbar
        open={alerta.open}
        autoHideDuration={3500}
        onClose={() => setAlerta((a) => ({ ...a, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alerta.type}
          variant="filled"
          onClose={() => setAlerta((a) => ({ ...a, open: false }))}
        >
          {alerta.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
