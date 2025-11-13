import { useEffect, useMemo, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
const MIN_CARD_H = 64;

const ESTADO_COLOR = {
  pendiente: "warning",
  confirmada: "info",
  cancelada: "error",
  no_asistio: "default",
  completada: "success",
};

function badgeClassForEstado(estado) {
  const c = ESTADO_COLOR[estado] || "default";
  if (c === "error") return "bg-danger";
  if (c === "default") return "bg-secondary";
  return `bg-${c}`;
}

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
    if (!id) return;
    const item = items.find((it) => it.id === id);
    if (!item) return;
    if (est === "pendiente") {
      setSnack({
        open: true,
        msg: "No está permitido marcar a 'pendiente' desde la interfaz",
        sev: "warning",
      });
      return;
    }
    if (est === "no_asistio") {
      if (!item.end || !item.end.isBefore(dayjs())) {
        setSnack({
          open: true,
          msg: "Sólo se puede marcar 'No asistió' después de la hora de la cita",
          sev: "warning",
        });
        return;
      }
      if (["cancelada", "completada", "no_asistio"].includes(item.estado)) {
        setSnack({
          open: true,
          msg: "No se puede marcar esa cita como 'No asistió'",
          sev: "warning",
        });
        return;
      }
    }
    if (item.estado === est) {
      setSnack({ open: true, msg: "La cita ya tiene ese estado", sev: "info" });
      setSel(null);
      return;
    }

    try {
      await actualizarEstadoCita(id, est);
      setSnack({ open: true, msg: "Actualizado", sev: "success" });
      setSel(null);
      load();
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.message || (e?.mensaje ? e.mensaje : "Error"),
        sev: "error",
      });
    }
  }

  async function eliminar() {
    if (!sel) return;
    try {
      await eliminarCita(sel.id);
      setSnack({ open: true, msg: "Eliminado", sev: "success" });
      setConfirmDel(false);
      setSel(null);
      load();
    } catch (e) {
      setSnack({
        open: true,
        msg: e?.message || (e?.mensaje ? e.mensaje : "Error"),
        sev: "error",
      });
      setConfirmDel(false);
    }
  }

  function Header() {
    return (
      <div className="card border rounded-3 mb-3">
        <div className="card-body">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-6">
              <div className="row align-items-center g-2">
                <div className="col-12 col-sm-auto">
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
                </div>
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2">
                    {[
                      "pendiente",
                      "confirmada",
                      "cancelada",
                      "no_asistio",
                      "completada",
                    ].map((est) => (
                      <span
                        key={est}
                        className={`${badgeClassForEstado(
                          est
                        )} text-white px-2 py-1 rounded`}
                        style={{ cursor: "pointer", fontSize: 13 }}
                        onClick={() => setEstado(est)}
                      >
                        {est === "no_asistio"
                          ? "No asistió"
                          : est.charAt(0).toUpperCase() + est.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 d-flex justify-content-md-end gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setBaseDate(dayjs())}
              >
                <CalendarTodayIcon fontSize="small" />
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setBaseDate((d) => d.subtract(1, "week"))}
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setBaseDate((d) => d.add(1, "week"))}
              >
                <ArrowForwardIosIcon fontSize="small" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function GridHead() {
    return (
      <div
        className="d-grid gap-1 px-2 py-2 border-bottom"
        style={{ gridTemplateColumns: "100px repeat(7, 1fr)" }}
      >
        <div />
        {week.days.map((d) => (
          <div key={d.toString()} className="text-center fw-bold">
            <a
              href="#"
              className="text-warning text-decoration-none"
              onClick={(e) => e.preventDefault()}
            >
              {d.format("dddd, DD")}
            </a>
          </div>
        ))}
      </div>
    );
  }

  function EventCard({ e }) {
    const hora = `${e.start.format("HH:mm")}–${e.end.format("HH:mm")}`;
    const stateBg =
      {
        pendiente: "#fff3cd",
        confirmada: "#d1f0f7",
        cancelada: "#f8d7da",
        no_asistio: "#e9ecef",
        completada: "#d4edda",
      }[e.estado] || "#ffffff";

    const stateBorder =
      {
        pendiente: "#ffecb5",
        confirmada: "#9fd7e6",
        cancelada: "#f1b0b7",
        no_asistio: "#cfcfd1",
        completada: "#a8d5a5",
      }[e.estado] || "#e9ecef";

    return (
      <div
        className="card border rounded-3 px-3 py-2 h-100 d-flex align-items-center justify-content-between"
        role="button"
        onClick={() => setSel(e)}
        style={{
          cursor: "pointer",
          minHeight: MIN_CARD_H,
          backgroundColor: stateBg,
          borderLeft: `4px solid ${stateBorder}`,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
        aria-label={`Cita ${e.barbero_nombre || "barbero"} ${hora}`}
        title="Haz clic para ver detalles"
      >
        <div className="d-flex flex-column">
          <div
            className="fw-bold"
            title={e.barbero_nombre || ""}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {e.barbero_nombre || "Barbero"}
          </div>
          <div
            className="small text-muted text-center"
            style={{ marginTop: 4 }}
          >
            {hora}
          </div>
        </div>
      </div>
    );
  }

  function Cell({ day, hour }) {
    const evs = eventosDelDia(day).filter((e) => e.start.hour() === hour);
    return (
      <div
        style={{
          position: "relative",
          height: ROW_H,
          borderRight: "1px solid #dee2e6",
          paddingLeft: "4px",
          paddingRight: "4px",
        }}
      >
        {evs.map((e) => {
          const top = topFromMinutes(e.start.minute());
          const computedH = Math.round(
            ((e.end.diff(e.start, "minute") || 60) / 60) * ROW_H
          );
          const h = Math.max(MIN_CARD_H, Math.min(ROW_H - 8, computedH - 8));
          return (
            <div
              key={e.id}
              style={{
                position: "absolute",
                top,
                left: "4px",
                right: "4px",
                height: h,
              }}
            >
              <EventCard e={e} />
            </div>
          );
        })}
      </div>
    );
  }

  function GridBody() {
    return (
      <div
        className="overflow-auto"
        style={{
          maxHeight: "75vh",
          backgroundImage: "linear-gradient(#00000008 1px, transparent 1px)",
          backgroundSize: `100% ${ROW_H}px`,
        }}
      >
        {horas().map((h, idx) => (
          <div
            key={h}
            className="d-grid gap-1 border-bottom"
            style={{
              gridTemplateColumns: "100px repeat(7, 1fr)",
              backgroundColor: idx % 2 ? "transparent" : "rgba(0,0,0,.01)",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center pe-2 border-end"
              style={{
                height: ROW_H,
                color: "#6c757d",
                fontSize: "13px",
              }}
            >
              {String(h).padStart(2, "0")}:00
            </div>
            {week.days.map((d) => (
              <Cell key={d.toString() + h} day={d} hour={h} />
            ))}
          </div>
        ))}
      </div>
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
          <div className="space-y-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              <PersonIcon fontSize="small" />
              <span className="fw-bold">{sel.cliente_nombre}</span>
              <Chip
                size="small"
                color={ESTADO_COLOR[sel.estado] || "default"}
                variant="outlined"
                label={String(sel.estado || "")
                  .toUpperCase()
                  .replace("_", " ")}
                style={{ marginLeft: "auto" }}
              />
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <PersonIcon fontSize="small" />
              <span>
                Barbero: <strong>{sel.barbero_nombre}</strong>
              </span>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <AccessTimeIcon fontSize="small" />
              <span>{fecha}</span>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <AccessTimeIcon fontSize="small" />
              <span>
                {hora} • {dur} min
              </span>
            </div>

            <div className="d-flex align-items-center gap-2 mb-3">
              <ContentCutIcon fontSize="small" />
              <span>{sel.servicios_resumen}</span>
            </div>

            <hr />

            <div className="d-flex flex-wrap gap-2">
              <Button
                variant="outlined"
                size="small"
                startIcon={<CheckCircleIcon />}
                onClick={() => mark(sel.id, "confirmada")}
                disabled={["confirmada", "completada", "cancelada"].includes(
                  sel.estado
                )}
              >
                Aceptar
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="warning"
                startIcon={<BlockIcon />}
                onClick={() => mark(sel.id, "cancelada")}
                disabled={["cancelada", "completada"].includes(sel.estado)}
              >
                Anular
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="success"
                startIcon={<DoneAllIcon />}
                onClick={() => mark(sel.id, "completada")}
                disabled={["completada", "cancelada"].includes(sel.estado)}
              >
                Completar
              </Button>

              {/* Botón "No asistió" (solo visible/activo si la cita ya terminó y está en estado marcable) */}
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={() => mark(sel.id, "no_asistio")}
                disabled={
                  !sel ||
                  !sel.end ||
                  !sel.end.isBefore(dayjs()) ||
                  ["cancelada", "completada", "no_asistio"].includes(sel.estado)
                }
              >
                No asistió
              </Button>

              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => setConfirmDel(true)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSel(null)}>Cerrar</Button>
        </DialogActions>

        <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
          <DialogTitle>Confirmar eliminación</DialogTitle>
          <DialogContent dividers>
            <p>
              ¿Eliminar la cita de <strong>{sel.cliente_nombre}</strong> ({hora}
              )?
            </p>
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
    <div>
      <Header />
      <div className="card border rounded-3 overflow-hidden">
        <div className="card-body border-bottom">
          <h5 className="fw-bold text-center">
            {week.start.format("DD")} – {week.end.format("DD")}{" "}
            {week.end.format("MMMM YYYY")}
          </h5>
        </div>
        <GridHead />
        <GridBody />
      </div>

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
    </div>
  );
}
