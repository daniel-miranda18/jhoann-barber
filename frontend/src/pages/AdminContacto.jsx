import React, { useEffect, useState } from "react";
import {
  obtenerInformacionContactoAdmin,
  actualizarInformacionContacto,
} from "../services/contactoServicio";
import {
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export default function AdminContacto() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await obtenerInformacionContactoAdmin();
      setData(
        res.data || {
          telefono: "",
          direccion: "",
          facebook: "",
          instagram: "",
          tiktok: "",
          youtube: "",
          whatsapp: "",
          horarios_atencion: "",
          dias_atencion: "",
          email: "",
        }
      );
      setErrors({});
    } catch (err) {
      setSnack({
        open: true,
        msg: err.message || "Error al cargar",
        severity: "error",
      });
    }
  }

  function validar() {
    const newErrors = {};

    if (!data.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido";
    } else if (!/^\d+$/.test(data.telefono.replace(/[\s\-()]/g, ""))) {
      newErrors.telefono = "Solo números válidos";
    }

    if (!data.direccion?.trim()) {
      newErrors.direccion = "La dirección es requerida";
    }

    if (!data.horarios_atencion?.trim()) {
      newErrors.horarios_atencion = "Los horarios son requeridos";
    }

    if (!data.dias_atencion?.trim()) {
      newErrors.dias_atencion = "Los días de atención son requeridos";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.email = "Correo inválido";
    }

    // Validar WhatsApp: solo números, sin caracteres especiales
    if (data.whatsapp?.trim()) {
      const cleanWhatsApp = data.whatsapp.replace(/[\s\-()]/g, "");
      if (!/^\d+$/.test(cleanWhatsApp)) {
        newErrors.whatsapp =
          "Solo números válidos (ej: 70123456 o 59170123456)";
      } else if (cleanWhatsApp.length < 8) {
        newErrors.whatsapp = "El número debe tener al menos 8 dígitos";
      }
    }

    if (data.facebook && !/^https?:\/\/.+/.test(data.facebook)) {
      newErrors.facebook =
        "URL inválida (debe comenzar con http:// o https://)";
    }

    if (data.instagram && !/^https?:\/\/.+/.test(data.instagram)) {
      newErrors.instagram =
        "URL inválida (debe comenzar con http:// o https://)";
    }

    if (data.youtube && !/^https?:\/\/.+/.test(data.youtube)) {
      newErrors.youtube = "URL inválida (debe comenzar con http:// o https://)";
    }

    if (data.tiktok && !/^https?:\/\/.+/.test(data.tiktok)) {
      newErrors.tiktok = "URL inválida (debe comenzar con http:// o https://)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function save(e) {
    e?.preventDefault();

    if (!validar()) {
      setSnack({
        open: true,
        msg: "Por favor completa los campos requeridos correctamente",
        severity: "warning",
      });
      return;
    }

    try {
      setSaving(true);
      await actualizarInformacionContacto(data);
      setSnack({
        open: true,
        msg: "Guardado correctamente",
        severity: "success",
      });
      setErrors({});
      await load();
    } catch (err) {
      const errorMsg =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        err.message ||
        "Error al guardar";
      setSnack({
        open: true,
        msg: errorMsg,
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const generateWhatsAppLink = (number) => {
    if (!number) return null;
    const cleanNumber = number.replace(/[\s\-()]/g, "");
    if (!/^\d+$/.test(cleanNumber)) return null;
    const finalNumber = cleanNumber.startsWith("591")
      ? cleanNumber
      : `591${cleanNumber}`;
    return `https://wa.me/${finalNumber}`;
  };

  const whatsappLink = generateWhatsAppLink(data.whatsapp);

  return (
    <div className="container py-4">
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-7">
          <Card sx={{ boxShadow: 1, borderRadius: 2, height: "100%" }}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <div className="container">
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
                >
                  Información de Contacto
                </Typography>
              </div>
              <Divider sx={{ my: 2 }} />

              <form className="row g-3 flex-fill" onSubmit={save}>
                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="Teléfono"
                    value={data.telefono || ""}
                    onChange={(e) =>
                      setData({ ...data, telefono: e.target.value })
                    }
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                    placeholder="70123456 o 591-70-123456"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="WhatsApp (Número de Celular)"
                    value={data.whatsapp || ""}
                    onChange={(e) =>
                      setData({ ...data, whatsapp: e.target.value })
                    }
                    error={!!errors.whatsapp}
                    helperText={
                      errors.whatsapp || "ej: 70123456 o 591-70-123456"
                    }
                  />
                </div>

                <div className="col-12">
                  <TextField
                    fullWidth
                    size="small"
                    label="Dirección"
                    value={data.direccion || ""}
                    onChange={(e) =>
                      setData({ ...data, direccion: e.target.value })
                    }
                    error={!!errors.direccion}
                    helperText={errors.direccion}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="Horarios de atención"
                    value={data.horarios_atencion || ""}
                    onChange={(e) =>
                      setData({ ...data, horarios_atencion: e.target.value })
                    }
                    error={!!errors.horarios_atencion}
                    helperText={errors.horarios_atencion}
                    placeholder="09:00 - 18:00"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="Días de atención"
                    value={data.dias_atencion || ""}
                    onChange={(e) =>
                      setData({ ...data, dias_atencion: e.target.value })
                    }
                    error={!!errors.dias_atencion}
                    helperText={errors.dias_atencion}
                    placeholder="Lun-Vie"
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    type="email"
                    value={data.email || ""}
                    onChange={(e) =>
                      setData({ ...data, email: e.target.value })
                    }
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="Facebook (URL)"
                    value={data.facebook || ""}
                    onChange={(e) =>
                      setData({ ...data, facebook: e.target.value })
                    }
                    error={!!errors.facebook}
                    helperText={errors.facebook}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="Instagram (URL)"
                    value={data.instagram || ""}
                    onChange={(e) =>
                      setData({ ...data, instagram: e.target.value })
                    }
                    error={!!errors.instagram}
                    helperText={errors.instagram}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="TikTok (URL)"
                    value={data.tiktok || ""}
                    onChange={(e) =>
                      setData({ ...data, tiktok: e.target.value })
                    }
                    error={!!errors.tiktok}
                    helperText={errors.tiktok}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    size="small"
                    label="YouTube (URL)"
                    value={data.youtube || ""}
                    onChange={(e) =>
                      setData({ ...data, youtube: e.target.value })
                    }
                    error={!!errors.youtube}
                    helperText={errors.youtube}
                  />
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                  <Button variant="outlined" onClick={load} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button variant="contained" type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="col-12 col-lg-5">
          <Card sx={{ boxShadow: 1, borderRadius: 2, height: "100%" }}>
            <CardContent
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography
                variant="subtitle1"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                Vista previa
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {data.telefono || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.horarios_atencion || "—"} · {data.dias_atencion || "—"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Dirección
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.direccion || "—"}
                </Typography>
              </Box>

              <div className="mb-3 d-flex flex-wrap gap-2">
                {data.facebook && (
                  <a
                    className="btn btn-outline-primary btn-sm"
                    href={data.facebook}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FacebookIcon sx={{ fontSize: 16, mr: 1 }} /> Facebook
                  </a>
                )}
                {data.instagram && (
                  <a
                    className="btn btn-outline-danger btn-sm"
                    href={data.instagram}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <InstagramIcon sx={{ fontSize: 16, mr: 1 }} /> Instagram
                  </a>
                )}
                {whatsappLink && (
                  <a
                    className="btn btn-success btn-sm"
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon sx={{ fontSize: 16, mr: 1 }} /> WhatsApp
                  </a>
                )}
                {data.youtube && (
                  <a
                    className="btn btn-outline-danger btn-sm"
                    href={data.youtube}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <YouTubeIcon sx={{ fontSize: 16, mr: 1 }} /> YouTube
                  </a>
                )}
                {data.tiktok && (
                  <a
                    className="btn btn-outline-dark btn-sm"
                    href={data.tiktok}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MusicNoteIcon sx={{ fontSize: 16, mr: 1 }} /> TikTok
                  </a>
                )}
              </div>

              <div className="flex-fill mt-2" style={{ minHeight: 220 }}>
                <iframe
                  title="Mapa"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    data.direccion || ""
                  )}&z=16&output=embed`}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: 0,
                    borderRadius: 8,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
