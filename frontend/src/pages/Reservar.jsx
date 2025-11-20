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
  Typography,
  Divider,
  Card,
  CardActionArea,
  Avatar,
  Box,
  Grid,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
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
  const MySwal = withReactContent(Swal);
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [servOpc, setServOpc] = useState([]);
  const [servSel, setServSel] = useState([]); // unique services array
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
  const servicioIds = useMemo(() => servSel.map((s) => s.id), [servSel]); // unique ids
  const [barberos, setBarberos] = useState([]);
  const [barberoSel, setBarberoSel] = useState(null);
  const [cli, setCli] = useState({
    nombres: "",
    apellidos: "",
    correo_electronico: "",
    telefono: "",
  });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const r = await buscarServicios(q);
        if (!cancel) setServOpc(r.data || []);
      } catch {
        if (!cancel) setServOpc([]);
      }
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
      try {
        // enviamos ids únicos; backend valida cobertura por ids únicos
        const servicioIdsUnicos = Array.from(new Set(servicioIds.map(Number)));
        const r = await barberosDisponibles({
          fecha,
          hora,
          duracion,
          servicios: servicioIdsUnicos,
        });
        if (!cancel) setBarberos(r.data || []);
      } catch {
        if (!cancel) setBarberos([]);
      }
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
      await crearCita(payload);
      await MySwal.fire({
        title: "¡Éxito!",
        text: "Reserva creada exitosamente",
        icon: "success",
        confirmButtonText: "OK",
      });
      setStep(3);
    } catch (e) {
      MySwal.fire({
        title: "Error",
        text: e?.mensaje || e?.message || "Error al crear la reserva",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }

  // helpers
  function isSelected(id) {
    return servSel.some((s) => Number(s.id) === Number(id));
  }

  function addOneUnique(srv) {
    if (isSelected(srv.id)) {
      MySwal.fire({
        icon: "info",
        title: "Servicio ya seleccionado",
        text: "El servicio ya fue agregado. Si quieres más unidades, esa funcionalidad fue desactivada (frontend).",
      });
      return;
    }
    setServSel((p) => [...p, srv]);
    setBarberoSel(null);
    setHora("");
  }

  function removeOne(id) {
    setServSel((p) => p.filter((s) => Number(s.id) !== Number(id)));
  }

  // For Autocomplete: show uniqueSelected (same as servSel)
  const uniqueSelected = servSel;

  function onAutocompleteChange(_, newVal) {
    // newVal is array of service objects (unique)
    setServSel(newVal || []);
    setBarberoSel(null);
    setHora("");
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
                    value={uniqueSelected}
                    onChange={onAutocompleteChange}
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
                            sx={{ whiteSpace: "nowrap", alignSelf: "center" }}
                          >
                            {option.duracion_minutos} min · {Bs(option.precio)}
                          </Typography>
                        </Box>
                      </li>
                    )}
                  />
                </div>

                <div className="col-12">
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Selecciona los servicios (haz clic en la imagen o usa +)
                  </Typography>
                </div>

                <div className="col-12">
                  <Grid container spacing={2}>
                    {servOpc.map((option) => {
                      const selected = isSelected(option.id);
                      return (
                        <Grid item xs={12} sm={6} md={4} key={option.id}>
                          <Card
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 2,
                            }}
                          >
                            <CardActionArea
                              onClick={() => {
                                if (selected) removeOne(option.id);
                                else addOneUnique(option);
                              }}
                              sx={{ cursor: "pointer" }}
                            >
                              <Box
                                sx={{
                                  position: "relative",
                                  height: 160,
                                  overflow: "hidden",
                                }}
                              >
                                <CardMedia
                                  component="img"
                                  image={
                                    option.foto_principal
                                      ? `${import.meta.env.VITE_API_URL}${
                                          option.foto_principal
                                        }`
                                      : "https://via.placeholder.com/800x600?text=Sin+imagen"
                                  }
                                  alt={option.nombre || ""}
                                  sx={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                  }}
                                  loading="lazy"
                                />
                                {selected && (
                                  <Chip
                                    label="Seleccionado"
                                    color="primary"
                                    size="small"
                                    sx={{
                                      position: "absolute",
                                      top: 8,
                                      right: 8,
                                      fontWeight: 700,
                                    }}
                                  />
                                )}
                              </Box>
                            </CardActionArea>

                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 800 }}
                                noWrap
                                title={option.nombre}
                              >
                                {option.nombre}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                              >
                                {option.descripcion || "Servicio de calidad."}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 1 }}
                                alignItems="center"
                              >
                                <Chip
                                  label={`${Number(
                                    option.duracion_minutos || 0
                                  )} min`}
                                  size="small"
                                />
                                <Chip
                                  label={`Bs. ${Number(
                                    option.precio || 0
                                  ).toFixed(2)}`}
                                  size="small"
                                />
                              </Stack>
                            </CardContent>

                            <CardActions
                              sx={{
                                justifyContent: "space-between",
                                px: 2,
                                py: 1,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => removeOne(option.id)}
                                  disabled={!selected}
                                >
                                  <RemoveIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => addOneUnique(option)}
                                  disabled={selected}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Stack>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => removeOne(option.id)}
                                disabled={!selected}
                              >
                                Quitar
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      );
                    })}
                    {!servOpc.length && (
                      <Grid item xs={12}>
                        <Typography color="text.secondary">
                          No hay servicios.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </div>

                <div className="col-12 d-flex flex-wrap gap-2 mt-3">
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
                    inputProps={{
                      min: dayjs().format("YYYY-MM-DD"),
                      max: dayjs().add(14, "days").format("YYYY-MM-DD"),
                    }}
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
            </Paper>
          )}
        </div>

        {step > 0 && (
          <div className="col-12 col-lg-4">
            <Resumen />
          </div>
        )}
      </div>
    </div>
  );
}
