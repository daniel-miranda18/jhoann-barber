import { useEffect, useMemo, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  TextField,
  Button,
  Chip,
  Autocomplete,
  Snackbar,
  Alert,
  Typography,
  Divider,
  Card,
  CardActionArea,
  Avatar,
  IconButton,
  Box,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import dayjs from "dayjs";
import {
  buscarServicios,
  barberosDisponibles,
  crearCita,
} from "../services/citasServicio";

function Bs(n) {
  return `Bs ${Number(n || 0).toFixed(2)}`;
}

function rangoHoras({ start = "08:00", end = "20:00", stepMin = 30 }) {
  const out = [];
  let t = dayjs(`2020-01-01 ${start}`);
  const to = dayjs(`2020-01-01 ${end}`);
  while (t.isBefore(to) || t.isSame(to)) {
    out.push(t.format("HH:mm"));
    t = t.add(stepMin, "minute");
  }
  return out;
}

export default function Reservar() {
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [servOpc, setServOpc] = useState([]);
  const [servSel, setServSel] = useState([]);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [hora, setHora] = useState("");
  const [horas, setHoras] = useState(rangoHoras({}));
  const duracion = useMemo(
    () =>
      servSel.reduce((a, b) => a + Number(b.duracion_minutos || 0), 0) || 60,
    [servSel]
  );
  const totalEstimado = useMemo(
    () => servSel.reduce((a, b) => a + Number(b.precio || 0), 0),
    [servSel]
  );
  const servicioIds = useMemo(() => servSel.map((s) => s.id), [servSel]);
  const [barberos, setBarberos] = useState([]);
  const [barberoSel, setBarberoSel] = useState(null);
  const [cli, setCli] = useState({
    nombres: "",
    apellidos: "",
    correo_electronico: "",
    telefono: "",
  });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    let cancel = false;
    (async () => {
      const r = await buscarServicios(q);
      if (!cancel) setServOpc(r.data || []);
    })();
    return () => {
      cancel = true;
    };
  }, [q]);

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!fecha || !duracion || !hora || servicioIds.length === 0) {
        setBarberos([]);
        return;
      }
      const r = await barberosDisponibles({
        fecha,
        hora,
        duracion,
        servicios: servicioIds,
      });
      if (!cancel) setBarberos(r.data || []);
    })();
    return () => {
      cancel = true;
    };
  }, [fecha, hora, duracion, servicioIds]);

  useEffect(() => {
    setHoras(rangoHoras({}));
  }, []);

  function next() {
    setStep((s) => Math.min(3, s + 1));
  }
  function prev() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function confirmar() {
    try {
      const payload = {
        cliente: {
          nombres: cli.nombres || null,
          apellidos: cli.apellidos || null,
          correo_electronico: cli.correo_electronico || null,
          telefono: cli.telefono || null,
        },
        barbero_id: barberoSel?.id,
        fecha,
        hora,
        duracion_minutos: duracion,
        servicios: servicioIds,
        notas: null,
      };
      const r = await crearCita(payload);
      setSnack({
        open: true,
        msg: `Reserva creada #${r.data.id}`,
        sev: "success",
      });
      setStep(3);
    } catch (e) {
      setSnack({ open: true, msg: e?.mensaje || "Error", sev: "error" });
    }
  }

  function Resumen() {
    return (
      <Card sx={{ p: 2, borderRadius: 3, position: "sticky", top: 16 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          Resumen
        </Typography>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ContentCutIcon fontSize="small" />
            <Typography>
              {servSel.length
                ? `${servSel.length} servicio(s)`
                : "Sin servicios"}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon fontSize="small" />
            <Typography>{duracion} min</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon fontSize="small" />
            <Typography>
              {barberoSel?.nombre || "Barbero no seleccionado"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={fecha || "Fecha"} />
            <Chip size="small" label={hora || "Hora"} />
          </Stack>
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Stack spacing={0.5}>
          {servSel.map((s) => (
            <Stack key={s.id} direction="row" justifyContent="space-between">
              <Typography variant="body2">{s.nombre}</Typography>
              <Typography variant="body2" color="text.secondary">
                {Bs(s.precio)}
              </Typography>
            </Stack>
          ))}
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" justifyContent="space-between">
            <Typography sx={{ fontWeight: 800 }}>Estimado</Typography>
            <Typography sx={{ fontWeight: 800 }}>
              {Bs(totalEstimado)}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <div className="container py-4">
      <Box sx={{ py: 5, textAlign: "center" }}>
        <div className="container">
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, mb: 1, color: "#212529" }}
          >
            Reservar
          </Typography>
          <Typography variant="h6" sx={{ color: "#6c757d" }}>
            Reserva tu cita online de forma rápida y segura. Elige servicios,
            fecha y barbero.
          </Typography>
        </div>
      </Box>

      <div className="mb-4">
        <Stepper activeStep={step} alternativeLabel>
          {[
            "Servicios",
            "Fecha y hora",
            "Datos del cliente",
            "Confirmación",
          ].map((t) => (
            <Step key={t}>
              <StepLabel>{t}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      <div className="row g-3">
        <div className={step > 0 ? "col-12 col-lg-8" : "col-12"}>
          {step === 0 && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <div className="row g-3">
                <div className="col-12">
                  <Autocomplete
                    multiple
                    options={servOpc}
                    getOptionLabel={(o) => o?.nombre || ""}
                    value={servSel}
                    onChange={(_, v) => {
                      setServSel(v);
                      setBarberoSel(null);
                      setHora("");
                    }}
                    onInputChange={(_, v) => setQ(v)}
                    disableCloseOnSelect
                    clearOnBlur={false}
                    PaperProps={{ elevation: 4, sx: { borderRadius: 2 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Servicios"
                        placeholder="Buscar y seleccionar"
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            borderRadius: 3,
                            boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                          }}
                        >
                          <Box sx={{ pr: 2 }}>
                            <Typography sx={{ fontWeight: 700 }}>
                              {option.nombre}
                            </Typography>
                            {option.descripcion && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {option.descripcion}
                              </Typography>
                            )}
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              whiteSpace: "nowrap",
                              alignSelf: "center",
                            }}
                          >
                            {option.duracion_minutos} min · {Bs(option.precio)}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </div>

                <div className="col-12 d-flex flex-wrap gap-2">
                  <Chip label={`Seleccionados: ${servSel.length}`} />
                  <Chip label={`Duración: ${duracion} min`} />
                  <Chip label={`Estimado: ${Bs(totalEstimado)}`} />
                </div>

                <div className="col-12 d-flex justify-content-end">
                  <Button
                    disabled={!servSel.length}
                    variant="contained"
                    onClick={next}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </Paper>
          )}

          {step === 1 && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <TextField
                    label="Fecha"
                    type="date"
                    fullWidth
                    value={fecha}
                    onChange={(e) => {
                      setFecha(e.target.value);
                      setHora("");
                      setBarberoSel(null);
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </div>
                <div className="col-12">
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Horarios
                  </Typography>
                  <div className="d-flex flex-wrap gap-2">
                    {horas.map((h) => {
                      const active = hora === h;
                      const disabled = servSel.length === 0;
                      return (
                        <Chip
                          key={h}
                          label={h}
                          clickable={!disabled}
                          disabled={disabled}
                          color={active ? "primary" : "default"}
                          variant={active ? "filled" : "outlined"}
                          onClick={() => !disabled && setHora(h)}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="col-12">
                  <Divider className="my-2" />
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Barberos disponibles
                  </Typography>
                  <div className="row g-3">
                    {barberos.map((b) => {
                      const sel = barberoSel?.id === b.id;
                      const initials =
                        (b.nombre || "")
                          .split(" ")
                          .map((x) => x.charAt(0).toUpperCase())
                          .slice(0, 2)
                          .join("") || "B";
                      return (
                        <div className="col-12 col-md-6" key={b.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              borderRadius: 3,
                              borderColor: sel ? "primary.main" : "divider",
                            }}
                          >
                            <CardActionArea
                              onClick={() => setBarberoSel(b)}
                              sx={{ p: 2 }}
                            >
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar>{initials}</Avatar>
                                <div className="d-flex flex-column">
                                  <Typography sx={{ fontWeight: 800 }}>
                                    {b.nombre}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    Apto para {servSel.length} servicio(s)
                                  </Typography>
                                </div>
                                <Chip
                                  label={sel ? "Seleccionado" : "Elegir"}
                                  color={sel ? "primary" : "default"}
                                  variant={sel ? "filled" : "outlined"}
                                  className="ms-auto"
                                />
                              </Stack>
                            </CardActionArea>
                          </Card>
                        </div>
                      );
                    })}
                    {!barberos.length && (
                      <div className="col-12">
                        <Typography color="text.secondary">
                          Selecciona servicios y hora para ver disponibilidad.
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-12 d-flex justify-content-between">
                  <Button onClick={prev}>Atrás</Button>
                  <Button
                    variant="contained"
                    disabled={!hora || !barberoSel || servSel.length === 0}
                    onClick={next}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            </Paper>
          )}

          {step === 2 && (
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <TextField
                    label="Nombres"
                    fullWidth
                    value={cli.nombres}
                    onChange={(e) =>
                      setCli({ ...cli, nombres: e.target.value })
                    }
                  />
                </div>
                <div className="col-12 col-md-6">
                  <TextField
                    label="Apellidos"
                    fullWidth
                    value={cli.apellidos}
                    onChange={(e) =>
                      setCli({ ...cli, apellidos: e.target.value })
                    }
                  />
                </div>
                <div className="col-12 col-md-6">
                  <TextField
                    label="Correo electrónico"
                    type="email"
                    fullWidth
                    value={cli.correo_electronico}
                    onChange={(e) =>
                      setCli({ ...cli, correo_electronico: e.target.value })
                    }
                  />
                </div>
                <div className="col-12 col-md-6">
                  <TextField
                    label="Teléfono"
                    fullWidth
                    value={cli.telefono}
                    onChange={(e) =>
                      setCli({ ...cli, telefono: e.target.value })
                    }
                  />
                </div>

                <div className="col-12 d-flex justify-content-between">
                  <Button onClick={prev}>Atrás</Button>
                  <Button
                    variant="contained"
                    disabled={
                      !barberoSel ||
                      !hora ||
                      servSel.length === 0 ||
                      (!cli.telefono && !cli.correo_electronico)
                    }
                    onClick={confirmar}
                  >
                    Confirmar reserva
                  </Button>
                </div>
              </div>
            </Paper>
          )}

          {step === 3 && (
            <Paper
              variant="outlined"
              sx={{ p: 3, borderRadius: 3, textAlign: "center" }}
            >
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 900 }}>
                Reserva realizada
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Tu cita quedó en estado pendiente. Te enviaremos la
                confirmación.
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                sx={{ mb: 2 }}
              >
                <Chip icon={<AccessTimeIcon />} label={`${fecha} ${hora}`} />
                <Chip icon={<PersonIcon />} label={barberoSel?.nombre || ""} />
                <Chip
                  icon={<ContentCutIcon />}
                  label={`${servSel.length} servicio(s)`}
                />
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="contained" href="/mis-reservas">
                  Ver mis reservas
                </Button>
                <Button variant="outlined" href="/">
                  Volver al inicio
                </Button>
              </Stack>
            </Paper>
          )}
        </div>

        {step > 0 && (
          <div className="col-12 col-lg-4">
            <Resumen />
          </div>
        )}
      </div>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
}
