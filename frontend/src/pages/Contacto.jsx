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
  InputAdornment,
  Avatar,
  Fab,
  Skeleton,
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import RoomIcon from "@mui/icons-material/Room";
import SendIcon from "@mui/icons-material/Send";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PersonIcon from "@mui/icons-material/Person";
import SubjectIcon from "@mui/icons-material/Subject";
import {
  obtenerInformacionContacto,
  enviarMensajeContacto,
} from "../services/contactoServicio";
import dayjs from "dayjs";

function ContactoSkeleton() {
  return (
    <div className="row g-4 align-items-stretch">
      <div className="col-12 col-lg-5">
        <Card elevation={2} className="h-100">
          <CardContent
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <div style={{ width: "100%" }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Skeleton variant="circular" width={40} height={40} />
                <div style={{ width: "100%" }}>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </div>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="circular" width={40} height={40} />
              </Stack>
              <Box
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  flex: 1,
                  minHeight: 300,
                }}
              >
                <Skeleton variant="rectangular" width="100%" height="100%" />
              </Box>
              <Skeleton variant="text" width="50%" />
            </Stack>
          </CardContent>
        </Card>
      </div>

      <div className="col-12 col-lg-7">
        <Card elevation={2} className="h-100">
          <CardContent
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
            <div className="row g-3" style={{ flex: 1 }}>
              <div className="col-12 col-md-6">
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1 }}
                />
              </div>
              <div className="col-12 col-md-6">
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1 }}
                />
              </div>
              <div className="col-12 col-md-6">
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1 }}
                />
              </div>
              <div className="col-12 col-md-6">
                <Skeleton
                  variant="rectangular"
                  height={56}
                  sx={{ borderRadius: 1 }}
                />
              </div>
              <div className="col-12">
                <Skeleton
                  variant="rectangular"
                  height={180}
                  sx={{ borderRadius: 1 }}
                />
              </div>
            </div>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Skeleton
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 1 }}
              />
              <Skeleton
                variant="rectangular"
                width={120}
                height={40}
                sx={{ borderRadius: 1 }}
              />
            </Stack>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  const [touched, setTouched] = useState({});

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

  const validators = {
    nombre: (v) => {
      const s = String(v || "").trim();
      if (s.length < 2) return "Nombre muy corto";
      const re = /^[A-Za-zÀ-ÖØ-öø-ÿ'´` \-]+$/;
      if (!re.test(s)) return "Nombre inválido";
      return null;
    },
    email: (v) => {
      const s = String(v || "").trim();
      const re = /^\S+@\S+\.\S+$/;
      if (!re.test(s)) return "Correo inválido";
      return null;
    },
    celular: (v) => {
      const s = String(v || "").trim();
      if (!s) return null;
      const digits = s.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) return "Número inválido";
      return null;
    },
    mensaje: (v) => {
      const s = String(v || "").trim();
      if (s.length < 5) return "Mensaje muy corto";
      return null;
    },
  };

  const errors = useMemo(() => {
    return {
      nombre: validators.nombre(form.nombre),
      email: validators.email(form.email),
      celular: validators.celular(form.celular),
      mensaje: validators.mensaje(form.mensaje),
    };
  }, [form]);

  const valido = useMemo(() => {
    return !errors.nombre && !errors.email && !errors.mensaje && !sending;
  }, [errors, sending]);

  const handleChange = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleBlur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nombre: true, email: true, celular: true, mensaje: true });
    if (!valido) {
      setAlerta({
        open: true,
        type: "error",
        msg: "Completa los campos requeridos correctamente.",
      });
      return;
    }
    try {
      setSending(true);
      await enviarMensajeContacto(form);
      setAlerta({
        open: true,
        type: "success",
        msg: "Mensaje enviado. Te responderemos pronto.",
      });
      setForm({ nombre: "", email: "", celular: "", asunto: "", mensaje: "" });
      setTouched({});
    } catch {
      setAlerta({
        open: true,
        type: "error",
        msg: "No se pudo enviar el mensaje.",
      });
    } finally {
      setSending(false);
    }
  };

  if (!contacto) {
    return (
      <Container>
        <Box sx={{ py: 5, textAlign: "center" }}>
          <div className="container">
            <Skeleton
              variant="text"
              width="30%"
              height={50}
              sx={{ mx: "auto", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={30}
              sx={{ mx: "auto" }}
            />
          </div>
        </Box>
        <ContactoSkeleton />
      </Container>
    );
  }

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
            ¡Estamos aquí para ayudarte! Si tienes alguna pregunta o necesitas
            más información, no dudes en contactarnos a través de este
            formulario. Nuestro equipo estará encantado de asistirte con
            cualquier consulta que tengas.
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
                    <MusicNoteIcon />
                  </IconButton>
                </Stack>

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
                      onBlur={handleBlur("nombre")}
                      required
                      error={Boolean(touched.nombre && errors.nombre)}
                      helperText={
                        touched.nombre && errors.nombre ? errors.nombre : ""
                      }
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
                      onBlur={handleBlur("email")}
                      required
                      error={Boolean(touched.email && errors.email)}
                      helperText={
                        touched.email && errors.email ? errors.email : ""
                      }
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
                      onBlur={handleBlur("celular")}
                      error={Boolean(touched.celular && errors.celular)}
                      helperText={
                        touched.celular && errors.celular ? errors.celular : ""
                      }
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
                      onBlur={handleBlur("mensaje")}
                      multiline
                      minRows={6}
                      required
                      error={Boolean(touched.mensaje && errors.mensaje)}
                      helperText={
                        touched.mensaje && errors.mensaje ? errors.mensaje : ""
                      }
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
                    disabled={!valido}
                  >
                    {sending ? "Enviando..." : "Enviar"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setForm({
                        nombre: "",
                        email: "",
                        celular: "",
                        asunto: "",
                        mensaje: "",
                      });
                      setTouched({});
                    }}
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
