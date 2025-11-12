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
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import RoomIcon from "@mui/icons-material/Room";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TheatersIcon from "@mui/icons-material/Theaters";
import { obtenerInformacionContacto } from "../services/contactoServicio";

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
      .then((data) => setContacto(data.data))
      .catch(() =>
        setAlerta({
          open: true,
          msg: "No se pudo cargar la información",
          sev: "error",
        })
      );
  }, []);

  const valido = useMemo(() => {
    const e = form.email.trim();
    const n = form.nombre.trim();
    const m = form.mensaje.trim();
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
      const mailto = `mailto:${contacto.email}?subject=${encodeURIComponent(
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

  return (
    <Container sx={{ py: 6 }}>
      <div className="row gy-4">
        <div className="col-12 col-lg-5">
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <RoomIcon />
                  <Typography variant="subtitle1">
                    {contacto.direccion}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PhoneIphoneIcon />
                  <MUILink href={`tel:${contacto.telefono}`} underline="hover">
                    {contacto.telefono}
                  </MUILink>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<WhatsAppIcon />}
                    href={contacto.whatsapp}
                    target="_blank"
                    rel="noopener"
                    sx={{ ml: 1 }}
                  >
                    WhatsApp
                  </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MUILink href={`mailto:${contacto.email}`} underline="hover">
                    {contacto.email}
                  </MUILink>
                </Stack>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
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
                    <TheatersIcon />
                  </IconButton>
                </Stack>

                <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <iframe
                    title="Ubicación"
                    width="100%"
                    height="260"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      contacto.direccion
                    )}&z=16&output=embed`}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </div>

        <div className="col-12 col-lg-7">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Escríbenos
              </Typography>
              <form onSubmit={handleSubmit} noValidate>
                <div className="row gy-3">
                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      label="Nombre"
                      value={form.nombre}
                      onChange={handleChange("nombre")}
                      required
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
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      label="Celular"
                      value={form.celular}
                      onChange={handleChange("celular")}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <TextField
                      fullWidth
                      label="Asunto"
                      value={form.asunto}
                      onChange={handleChange("asunto")}
                    />
                  </div>
                  <div className="col-12">
                    <TextField
                      fullWidth
                      label="Mensaje"
                      value={form.mensaje}
                      onChange={handleChange("mensaje")}
                      multiline
                      minRows={5}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<SendIcon />}
                      disabled={sending || !valido}
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

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
