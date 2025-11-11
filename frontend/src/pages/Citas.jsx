import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tooltip,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PersonIcon from "@mui/icons-material/Person";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs from "dayjs";
import "dayjs/locale/es";
import {
  citasSemana,
  actualizarEstadoCita,
  eliminarCita,
} from "../services/citasServicio";

dayjs.locale("es");

const H_INICIO = 8;
const H_FIN = 20;
const ROW_H = 76;
const MIN_CARD_H = 40;

const ESTADO_COLOR = {
  pendiente: "warning",
  confirmada: "info",
  cancelada: "error",
  no_asistio: "default",
  completada: "success",
};

function serviciosTexto(s) {
  if (!s || !s.length) return "Sin servicios";
  const names = s.map((x) => x.nombre || x).filter(Boolean);
  if (!names.length) return "Sin servicios";
  const base = names.slice(0, 3).join(", ");
  const rest = names.length - 3;
  return rest > 0 ? `${base} +${rest}` : base;
}

export default function Citas() {
  const [baseDate, setBaseDate] = useState(dayjs());
  const [estado, setEstado] = useState("todas");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [items, setItems] = useState([]);
  const [sel, setSel] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);

  const week = useMemo(() => {
    const start = baseDate.startOf("week").add(1, "day");
    const days = Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
    return { start: days[0], end: days[6], days };
  }, [baseDate]);

  async function load() {
    const r = await citasSemana({
      start: week.start.format("YYYY-MM-DD"),
      end: week.end.format("YYYY-MM-DD"),
    });
    const data = (r.data || []).filter(
      (x) => estado === "todas" || x.estado === estado
    );
    setItems(
      data.map((c) => {
        const start = dayjs(`${c.fecha} ${c.hora}`);
        const end = start.add(Number(c.duracion_minutos || 60), "minute");
        return {
          ...c,
          start,
          end,
          cliente_nombre:
            c.cliente_nombre ||
            `${c.cliente_nombres || ""} ${c.cliente_apellidos || ""}`.trim(),
          barbero_nombre: c.barbero_nombre || c.barbero || "",
          servicios_resumen: serviciosTexto(
            c.servicios || c.servicios_nombres || []
          ),
        };
      })
    );
  }

  useEffect(() => {
    load();
  }, [baseDate, estado]);

  function horas() {
    return Array.from({ length: H_FIN - H_INICIO + 1 }, (_, i) => H_INICIO + i);
  }

  function eventosDelDia(d) {
    const key = d.format("YYYY-MM-DD");
    return items.filter((e) => e.start.format("YYYY-MM-DD") === key);
  }

  function topFromMinutes(min) {
    const frac = min / 60;
    return Math.round(frac * ROW_H);
  }

  async function mark(id, est) {
    await actualizarEstadoCita(id, est);
    setSnack({ open: true, msg: "Actualizado", sev: "success" });
    setSel(null);
    load();
  }

  async function eliminar() {
    if (!sel) return;
    await eliminarCita(sel.id);
    setSnack({ open: true, msg: "Eliminado", sev: "success" });
    setConfirmDel(false);
    setSel(null);
    load();
  }

  function Header() {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap
          useFlexGap
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
              >
                <MenuItem value="todas">Todas</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="confirmada">Confirmada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
                <MenuItem value="no_asistio">No asistió</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={1}>
              <Chip
                size="small"
                label="Pendiente"
                color="warning"
                variant={estado === "pendiente" ? "filled" : "outlined"}
                onClick={() => setEstado("pendiente")}
              />
              <Chip
                size="small"
                label="Confirmada"
                color="info"
                variant={estado === "confirmada" ? "filled" : "outlined"}
                onClick={() => setEstado("confirmada")}
              />
              <Chip
                size="small"
                label="Cancelada"
                color="error"
                variant={estado === "cancelada" ? "filled" : "outlined"}
                onClick={() => setEstado("cancelada")}
              />
              <Chip
                size="small"
                label="No asistió"
                variant={estado === "no_asistio" ? "filled" : "outlined"}
                onClick={() => setEstado("no_asistio")}
              />
              <Chip
                size="small"
                label="Completada"
                color="success"
                variant={estado === "completada" ? "filled" : "outlined"}
                onClick={() => setEstado("completada")}
              />
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => setBaseDate(dayjs())}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <CalendarTodayIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setBaseDate((d) => d.subtract(1, "week"))}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={() => setBaseDate((d) => d.add(1, "week"))}
              sx={{ border: 1, borderColor: "divider" }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>
    );
  }

  function GridHead() {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "100px repeat(7, 1fr)",
          borderBottom: 1,
          borderColor: "divider",
          px: 1,
          py: 1,
        }}
      >
        <Box />
        {week.days.map((d) => (
          <Box key={d.toString()} sx={{ textAlign: "center", fontWeight: 900 }}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ color: "#ffb028ff", textDecoration: "none" }}
            >
              {d.format("dddd, DD")}
            </a>
          </Box>
        ))}
      </Box>
    );
  }

  function EventCard({ e }) {
    const hora = `${e.start.format("HH:mm")}–${e.end.format("HH:mm")}`;
    return (
      <Paper
        elevation={0}
        onClick={() => setSel(e)}
        sx={{
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 999,
          px: 1.25,
          py: 0.5,
          height: "100%",
          minHeight: MIN_CARD_H,
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
        }}
      >
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            bgcolor: "action.hover",
            flex: "0 0 auto",
          }}
        />
        <Tooltip title={e.cliente_nombre || ""}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 13,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 140,
            }}
          >
            {e.cliente_nombre || "Cliente"}
          </Typography>
        </Tooltip>
        <Typography sx={{ ml: "auto", fontSize: 12, color: "text.secondary" }}>
          {hora}
        </Typography>
      </Paper>
    );
  }

  function Cell({ day, hour }) {
    const evs = eventosDelDia(day).filter((e) => e.start.hour() === hour);
    return (
      <Box
        sx={{
          position: "relative",
          height: ROW_H,
          borderRight: 1,
          borderColor: "divider",
          px: 0.5,
        }}
      >
        {evs.map((e) => {
          const top = topFromMinutes(e.start.minute());
          const computedH = Math.round(
            ((e.end.diff(e.start, "minute") || 60) / 60) * ROW_H
          );
          const h = Math.max(MIN_CARD_H, Math.min(ROW_H - 8, computedH - 8));
          return (
            <Box
              key={e.id}
              sx={{ position: "absolute", top, left: 4, right: 4, height: h }}
            >
              <EventCard e={e} />
            </Box>
          );
        })}
      </Box>
    );
  }

  function GridBody() {
    return (
      <Box
        sx={{
          maxHeight: "75vh",
          overflow: "auto",
          backgroundImage: "linear-gradient(#00000008 1px, transparent 1px)",
          backgroundSize: `100% ${ROW_H}px`,
        }}
      >
        {horas().map((h, idx) => (
          <Box
            key={h}
            sx={{
              display: "grid",
              gridTemplateColumns: "100px repeat(7, 1fr)",
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: idx % 2 ? "transparent" : "rgba(0,0,0,.01)",
            }}
          >
            <Box
              sx={{
                height: ROW_H,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pr: 1,
                color: "text.secondary",
                fontSize: 13,
                borderRight: 1,
                borderColor: "divider",
              }}
            >
              {String(h).padStart(2, "0")}:00
            </Box>
            {week.days.map((d) => (
              <Cell key={d.toString() + h} day={d} hour={h} />
            ))}
          </Box>
        ))}
      </Box>
    );
  }

  function DetalleDialog() {
    if (!sel) return null;
    const dur = sel.end.diff(sel.start, "minute");
    const fecha = sel.start.format("dddd, DD [de] MMMM YYYY");
    const hora = `${sel.start.format("HH:mm")} – ${sel.end.format("HH:mm")}`;
    return (
      <Dialog open onClose={() => setSel(null)} fullWidth maxWidth="sm">
        <DialogTitle>Detalle de la cita</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" />
              <Typography fontWeight={700}>{sel.cliente_nombre}</Typography>
              <Chip
                size="small"
                color={ESTADO_COLOR[sel.estado] || "default"}
                variant="outlined"
                label={String(sel.estado || "")
                  .toUpperCase()
                  .replace("_", " ")}
                sx={{ ml: "auto" }}
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <PersonIcon fontSize="small" />
              <Typography>Barbero: {sel.barbero_nombre}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" />
              <Typography>{fecha}</Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTimeIcon fontSize="small" />
              <Typography>
                {hora} • {dur} min
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <ContentCutIcon fontSize="small" />
              <Typography>{sel.servicios_resumen}</Typography>
            </Stack>
            <Divider />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              useFlexGap
              flexWrap
            >
              <Button
                variant="outlined"
                startIcon={<CheckCircleIcon />}
                onClick={() => mark(sel.id, "confirmada")}
              >
                Aceptar
              </Button>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<BlockIcon />}
                onClick={() => mark(sel.id, "cancelada")}
              >
                Anular
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<DoneAllIcon />}
                onClick={() => mark(sel.id, "completada")}
              >
                Completar
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setConfirmDel(true)}
              >
                Eliminar
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSel(null)}>Cerrar</Button>
        </DialogActions>

        <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent dividers>
            <Typography>
              ¿Eliminar la cita de {sel.cliente_nombre} ({hora})?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDel(false)}>Cancelar</Button>
            <Button color="error" variant="contained" onClick={eliminar}>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Dialog>
    );
  }

  return (
    <Box>
      <Header />
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 900, textAlign: "center" }}
          >
            {week.start.format("DD")} – {week.end.format("DD")}{" "}
            {week.end.format("MMMM YYYY")}
          </Typography>
        </Box>
        <GridHead />
        <GridBody />
      </Paper>

      <DetalleDialog />

      <Snackbar
        open={snack.open}
        autoHideDuration={2200}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
