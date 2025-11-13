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
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export default function AdminContacto() {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
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
        }
      );
    } catch (err) {
      setSnack({
        open: true,
        msg: err.message || "Error al cargar",
        severity: "error",
      });
    }
  }

  async function save(e) {
    e?.preventDefault();
    try {
      setSaving(true);
      await actualizarInformacionContacto(data);
      setSnack({
        open: true,
        msg: "Guardado correctamente",
        severity: "success",
      });
      await load();
    } catch (err) {
      setSnack({
        open: true,
        msg: err.message || "Error al guardar",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!data) return <div className="container py-4">Cargando...</div>;

  return (
    <div className="container py-4">
      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm h-100 rounded-lg">
            <div className="card-body d-flex flex-column">
              <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                Información de contacto
              </Typography>

              <form className="row g-3 flex-fill" onSubmit={save}>
                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="Teléfono"
                    value={data.telefono || ""}
                    onChange={(e) =>
                      setData({ ...data, telefono: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <PhoneIphoneIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="WhatsApp (URL)"
                    value={data.whatsapp || ""}
                    onChange={(e) =>
                      setData({ ...data, whatsapp: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <WhatsAppIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                </div>

                <div className="col-12">
                  <TextField
                    fullWidth
                    label="Dirección"
                    value={data.direccion || ""}
                    onChange={(e) =>
                      setData({ ...data, direccion: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <LocationOnIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="Horarios de atención"
                    value={data.horarios_atencion || ""}
                    onChange={(e) =>
                      setData({ ...data, horarios_atencion: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <AccessTimeIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                    placeholder="09:00 - 18:00"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="Días de atención"
                    value={data.dias_atencion || ""}
                    onChange={(e) =>
                      setData({ ...data, dias_atencion: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <CalendarTodayIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                    placeholder="Lun-Vie"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="Facebook (URL)"
                    value={data.facebook || ""}
                    onChange={(e) =>
                      setData({ ...data, facebook: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <FacebookIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="Instagram (URL)"
                    value={data.instagram || ""}
                    onChange={(e) =>
                      setData({ ...data, instagram: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InstagramIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="TikTok (URL)"
                    value={data.tiktok || ""}
                    onChange={(e) =>
                      setData({ ...data, tiktok: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <MusicNoteIcon
                          sx={{ mr: 1, color: "text.secondary" }}
                        />
                      ),
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    fullWidth
                    label="YouTube (URL)"
                    value={data.youtube || ""}
                    onChange={(e) =>
                      setData({ ...data, youtube: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <YouTubeIcon sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                    }}
                  />
                </div>

                <div className="col-12 d-flex justify-content-end gap-2 mt-2">
                  <Button
                    variant="outlined"
                    onClick={load}
                    disabled={saving}
                    color="inherit"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* preview */}
        <div className="col-12 col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex flex-column">
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Vista previa
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h5">{data.telefono || "—"}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.horarios_atencion || "—"} · {data.dias_atencion || "—"}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
                {data.whatsapp && (
                  <a
                    className="btn btn-success btn-sm"
                    href={data.whatsapp}
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
            </div>
          </div>
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
