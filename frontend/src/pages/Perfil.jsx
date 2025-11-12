import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  Tooltip,
  Button,
  Dialog,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import LockIcon from "@mui/icons-material/Lock";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";
import { obtenerPerfil, cambiarPin } from "../services/perfilServicio";

dayjs.extend(relativeTime);
dayjs.locale("es");

const accionesMap = {
  POST: { label: "Crear", color: "success" },
  PUT: { label: "Actualizar", color: "info" },
  PATCH: { label: "Modificar", color: "warning" },
  DELETE: { label: "Eliminar", color: "error" },
  GET: { label: "Ver", color: "default" },
};

export default function Perfil() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [pinActual, setPinActual] = useState("");
  const [pinNuevo, setPinNuevo] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [loadingPin, setLoadingPin] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    (async () => {
      try {
        const r = await obtenerPerfil();
        setData(r || null);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAbrirDialog = () => {
    setPinActual("");
    setPinNuevo("");
    setPinConfirm("");
    setOpenDialog(true);
  };

  const handleCerrarDialog = () => {
    setOpenDialog(false);
    setPinActual("");
    setPinNuevo("");
    setPinConfirm("");
  };

  const validarPin = () => {
    if (!pinActual) {
      setSnackbar({
        open: true,
        message: "Debes ingresar tu PIN actual",
        type: "error",
      });
      return false;
    }
    if (pinNuevo.length < 6) {
      setSnackbar({
        open: true,
        message: "El PIN nuevo debe tener al menos 6 caracteres",
        type: "error",
      });
      return false;
    }
    if (pinNuevo !== pinConfirm) {
      setSnackbar({
        open: true,
        message: "Los PINs nuevos no coinciden",
        type: "error",
      });
      return false;
    }
    return true;
  };

  const handleCambiarPin = async () => {
    if (!validarPin()) return;

    setLoadingPin(true);
    try {
      await cambiarPin(pinNuevo);
      setSnackbar({
        open: true,
        message: "PIN actualizado correctamente",
        type: "success",
      });
      handleCerrarDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Error al cambiar PIN",
        type: "error",
      });
    } finally {
      setLoadingPin(false);
    }
  };

  if (loading) {
    return (
      <Card variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <LinearProgress />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6">No se pudo cargar el perfil</Typography>
      </Card>
    );
  }

  const u = data.usuario;
  const rol = data.rol;
  const permisos = data.permisos || [];
  const sesiones = data.sesiones || [];
  const auditoria = data.auditoria || [];

  const initials = (() => {
    const name = `${u?.nombres || ""} ${u?.apellidos || ""}`.trim();
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  })();

  const permisosOrdenados = [...permisos].sort((a, b) =>
    String(a.descripcion || a.clave).localeCompare(
      String(b.descripcion || b.clave)
    )
  );

  return (
    <div className="container-fluid mt-4">
      <div className="row g-4">
        <div className="col-md-4">
          <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    {u?.nombres || ""} {u?.apellidos || ""}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {u?.correo}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Información">
                  <IconButton size="small">
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body2">{u?.telefono || "—"}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Estado
                  </Typography>
                  <Box mt={0.5}>
                    <Chip
                      size="small"
                      color={u?.esta_activo ? "success" : "default"}
                      label={u?.esta_activo ? "Activo" : "Inactivo"}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Desde
                  </Typography>
                  <Typography variant="body2">
                    {u?.creado_en
                      ? dayjs(u.creado_en).format("YYYY-MM-DD HH:mm")
                      : "—"}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rol
                  </Typography>
                  <Typography variant="body2">{rol?.nombre || "—"}</Typography>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={handleAbrirDialog}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Cambiar PIN
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </div>

        <div className="col-md-8">
          <div className="row g-3">
            <div className="col-md-12">
              <Card variant="outlined" sx={{ borderRadius: 3, height: 400 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" mb={2}>
                    Permisos
                  </Typography>
                  {permisosOrdenados.length ? (
                    <List
                      dense
                      sx={{
                        flex: 1,
                        overflow: "auto",
                        p: 0,
                      }}
                    >
                      {permisosOrdenados.map((p) => (
                        <ListItem key={p.id} disableGutters sx={{ py: 0.75 }}>
                          <Typography variant="body2">
                            {p.descripcion
                              ? String(p.descripcion)
                              : String(p.clave).replace(/_/g, " ")}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin permisos
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="col-md-6">
              <Card variant="outlined" sx={{ borderRadius: 3, height: 400 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" mb={2}>
                    Sesiones
                  </Typography>
                  {sesiones.length ? (
                    <List
                      dense
                      disablePadding
                      sx={{
                        flex: 1,
                        overflow: "auto",
                        p: 0,
                      }}
                    >
                      {sesiones.map((s, idx) => (
                        <Box key={s.id}>
                          <ListItem
                            alignItems="flex-start"
                            disableGutters
                            sx={{ py: 1 }}
                          >
                            <Stack sx={{ width: "100%" }} spacing={0.5}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <LoginIcon
                                  fontSize="small"
                                  color="success"
                                  sx={{ flexShrink: 0 }}
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  Inicio:{" "}
                                  {dayjs(s.inicio_en).format("DD MMM HH:mm")}
                                </Typography>
                              </Stack>
                              {s.fin_en && (
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <LogoutIcon
                                    fontSize="small"
                                    color="error"
                                    sx={{ flexShrink: 0 }}
                                  />
                                  <Typography variant="body2" fontWeight={600}>
                                    Cierre:{" "}
                                    {dayjs(s.fin_en).format("DD MMM HH:mm")}
                                  </Typography>
                                </Stack>
                              )}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                IP: {s.ip || "—"}
                              </Typography>
                            </Stack>
                          </ListItem>
                          {idx < sesiones.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin sesiones
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="col-md-6">
              <Card variant="outlined" sx={{ borderRadius: 3, height: 400 }}>
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography variant="h6" mb={2}>
                    Eventos Recientes
                  </Typography>
                  {auditoria.length ? (
                    <List
                      dense
                      disablePadding
                      sx={{
                        flex: 1,
                        overflow: "auto",
                        p: 0,
                      }}
                    >
                      {auditoria.map((a, idx) => {
                        const accion = accionesMap[a.metodo] || {
                          label: a.metodo,
                          color: "default",
                        };
                        return (
                          <Box key={a.id}>
                            <ListItem
                              alignItems="flex-start"
                              disableGutters
                              sx={{ py: 1 }}
                            >
                              <Stack sx={{ width: "100%" }} spacing={0.5}>
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                >
                                  <Chip
                                    label={accion.label}
                                    size="small"
                                    color={accion.color}
                                    variant="outlined"
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{ flex: 1, wordBreak: "break-word" }}
                                  >
                                    {a.ruta}
                                  </Typography>
                                </Stack>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {a.accion && `Acción: ${a.accion} • `}
                                  {dayjs(a.creado_en).format("DD MMM HH:mm")}
                                </Typography>
                              </Stack>
                            </ListItem>
                            {idx < auditoria.length - 1 && <Divider />}
                          </Box>
                        );
                      })}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Sin eventos
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={openDialog}
        onClose={handleCerrarDialog}
        maxWidth="sm"
        fullWidth
      >
        <CardContent sx={{ pt: 3 }}>
          <Typography variant="h6" mb={2}>
            Cambiar PIN
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="PIN Actual"
              type="password"
              fullWidth
              value={pinActual}
              onChange={(e) => setPinActual(e.target.value)}
              disabled={loadingPin}
              placeholder="Ingresa tu PIN actual"
            />
            <Divider />
            <TextField
              label="PIN Nuevo"
              type="password"
              fullWidth
              value={pinNuevo}
              onChange={(e) => setPinNuevo(e.target.value)}
              disabled={loadingPin}
              placeholder="Mínimo 6 caracteres"
            />
            <TextField
              label="Confirmar PIN Nuevo"
              type="password"
              fullWidth
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value)}
              disabled={loadingPin}
              placeholder="Confirma tu nuevo PIN"
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={handleCerrarDialog} disabled={loadingPin}>
                Cancelar
              </Button>
              <Button
                variant="contained"
                onClick={handleCambiarPin}
                disabled={loadingPin}
              >
                Guardar
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
