import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  TextField,
  Button,
  Chip,
  Grid,
  Autocomplete,
  Snackbar,
  Alert,
  Typography,
  Divider,
} from "@mui/material";
import dayjs from "dayjs";
import {
  buscarServicios,
  barberosDisponibles,
  crearCita,
} from "../services/citasServicio";

function Bs(n) {
  return `Bs ${Number(n || 0).toFixed(2)}`;
}

export default function Reservar() {
  const [step, setStep] = useState(0);
  const [q, setQ] = useState("");
  const [servOpc, setServOpc] = useState([]);
  const [servSel, setServSel] = useState([]);
  const [fecha, setFecha] = useState(dayjs().format("YYYY-MM-DD"));
  const [hora, setHora] = useState("09:00");
  const duracion = useMemo(
    () =>
      servSel.reduce((a, b) => a + Number(b.duracion_minutos || 0), 0) || 60,
    [servSel]
  );
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
      if (!fecha || !hora || !duracion) return setBarberos([]);
      const r = await barberosDisponibles({ fecha, hora, duracion });
      if (!cancel) setBarberos(r.data || []);
    })();
    return () => {
      cancel = true;
    };
  }, [fecha, hora, duracion]);
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
        servicios: servSel.map((s) => s.id),
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
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Reservar
      </Typography>
      <Stepper activeStep={step} alternativeLabel sx={{ mb: 3 }}>
        {["Servicios", "Fecha y Hora", "Datos del cliente", "Confirmación"].map(
          (t) => (
            <Step key={t}>
              <StepLabel>{t}</StepLabel>
            </Step>
          )
        )}
      </Stepper>
      {step === 0 && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Autocomplete
              multiple
              options={servOpc}
              getOptionLabel={(o) => o?.nombre || ""}
              value={servSel}
              onChange={(_, v) => setServSel(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Servicios"
                  placeholder="Buscar y seleccionar"
                />
              )}
              onInputChange={(_, v) => setQ(v)}
            />
            <Stack direction="row" spacing={1}>
              <Chip label={`Seleccionados: ${servSel.length}`} />
              <Chip label={`Duración total: ${duracion} min`} />
              <Chip
                label={`Estimado: ${Bs(
                  servSel.reduce((a, b) => a + Number(b.precio || 0), 0)
                )}`}
              />
            </Stack>
            <Stack direction="row" spacing={1} justifyContent="end">
              <Button
                disabled={!servSel.length}
                variant="contained"
                onClick={next}
              >
                Siguiente
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
      {step === 1 && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Hora"
                type="time"
                fullWidth
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={barberos}
                value={barberoSel}
                getOptionLabel={(o) => o?.nombre || ""}
                onChange={(_, v) => setBarberoSel(v)}
                renderInput={(params) => (
                  <TextField {...params} label="Barbero disponible" />
                )}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button onClick={prev}>Atrás</Button>
            <Button variant="contained" disabled={!barberoSel} onClick={next}>
              Siguiente
            </Button>
          </Stack>
        </Paper>
      )}
      {step === 2 && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombres"
                fullWidth
                value={cli.nombres}
                onChange={(e) => setCli({ ...cli, nombres: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Apellidos"
                fullWidth
                value={cli.apellidos}
                onChange={(e) => setCli({ ...cli, apellidos: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Correo electrónico"
                type="email"
                fullWidth
                value={cli.correo_electronico}
                onChange={(e) =>
                  setCli({ ...cli, correo_electronico: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Teléfono"
                fullWidth
                value={cli.telefono}
                onChange={(e) => setCli({ ...cli, telefono: e.target.value })}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button onClick={prev}>Atrás</Button>
            <Button
              variant="contained"
              disabled={!cli.telefono && !cli.correo_electronico}
              onClick={confirmar}
            >
              Confirmar reserva
            </Button>
          </Stack>
        </Paper>
      )}
      {step === 3 && (
        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: 2, textAlign: "center" }}
        >
          <Typography variant="h5" sx={{ mb: 1 }}>
            Reserva realizada
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Te hemos registrado en estado pendiente
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Chip label={`${fecha} ${hora}`} />
            <Chip label={barberoSel?.nombre || ""} />
            <Chip label={`${servSel.length} servicios`} />
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mt: 2 }}
          >
            <Button variant="contained" href="/mis-reservas">
              Ver mis reservas
            </Button>
            <Button variant="outlined" href="/">
              Volver al inicio
            </Button>
          </Stack>
        </Paper>
      )}
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
    </Container>
  );
}
