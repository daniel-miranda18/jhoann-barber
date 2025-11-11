import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  TextField,
  InputAdornment,
  Button,
  Snackbar,
  Alert,
  Chip,
  Card,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Stack,
  Tabs,
  Tab,
  Autocomplete,
  Switch,
  MenuItem,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplayIcon from "@mui/icons-material/Replay";
import BoltIcon from "@mui/icons-material/Bolt";
import {
  listarBarberos,
  listarServiciosBarbero,
  guardarServiciosBarbero,
  listarHorariosBarbero,
  guardarHorariosBarbero,
} from "../services/barberosServicio";
import { listarServicios } from "../services/serviciosServicio";

const DIAS = [
  { v: 1, t: "Lunes" },
  { v: 2, t: "Martes" },
  { v: 3, t: "Miércoles" },
  { v: 4, t: "Jueves" },
  { v: 5, t: "Viernes" },
  { v: 6, t: "Sábado" },
  { v: 7, t: "Domingo" },
];

function useDebounced(v, ms = 350) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const id = setTimeout(() => setX(v), ms);
    return () => clearTimeout(id);
  }, [v, ms]);
  return x;
}
function t2m(s) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || ""));
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
function m2t(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function buildSlots(ti, tf, step) {
  const a = [];
  for (let m = ti; m < tf; m += step) a.push(m2t(m));
  return a;
}
function emptySlotsMap() {
  return {
    1: new Set(),
    2: new Set(),
    3: new Set(),
    4: new Set(),
    5: new Set(),
    6: new Set(),
    7: new Set(),
  };
}
export default function Barberos() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const qd = useDebounced(q, 350);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [sel, setSel] = useState(null);
  const [tab, setTab] = useState(0);

  const [serviciosAll, setServiciosAll] = useState([]);
  const [servSel, setServSel] = useState([]);

  const [diasAct, setDiasAct] = useState([1, 2, 3, 4, 5]);
  const [multiDia, setMultiDia] = useState(true);

  const [startStr, setStartStr] = useState("08:00");
  const [endStr, setEndStr] = useState("20:00");
  const [step, setStep] = useState(60);

  const startMin = useMemo(() => t2m(startStr) ?? 480, [startStr]);
  const endMin = useMemo(() => t2m(endStr) ?? 1200, [endStr]);
  const slots = useMemo(
    () => buildSlots(startMin, endMin, step),
    [startMin, endMin, step]
  );

  const [slotsSel, setSlotsSel] = useState(() => emptySlotsMap());
  const [copiarDesde, setCopiarDesde] = useState(1);

  function notify(msg, sev = "success") {
    setSnack({ open: true, msg, sev });
  }

  async function fetchBarberos() {
    try {
      const r = await listarBarberos({
        page: 1,
        per_page: 50,
        q: qd || undefined,
      });
      setRows(r.data || []);
    } catch {
      setRows([]);
    }
  }
  useEffect(() => {
    fetchBarberos();
  }, []);
  useEffect(() => {
    fetchBarberos();
  }, [qd]);

  function rangesToSlotsMap(hor) {
    const map = emptySlotsMap();
    const indexMinutes = slots.map(t2m);
    for (const x of hor) {
      const d = Number(x.dia_semana);
      const hi = t2m(x.hora_inicio);
      const hf = t2m(x.hora_fin);
      for (let i = 0; i < indexMinutes.length; i++) {
        const sm = indexMinutes[i];
        if (sm >= hi && sm < hf) map[d].add(i);
      }
    }
    return map;
  }

  function slotsMapToRanges(map) {
    const out = [];
    for (const d of [1, 2, 3, 4, 5, 6, 7]) {
      const arr = Array.from(map[d] || []).sort((a, b) => a - b);
      if (!arr.length) continue;
      let startIdx = arr[0];
      let prev = arr[0];
      for (let i = 1; i <= arr.length; i++) {
        const cur = arr[i];
        if (i === arr.length || cur !== prev + 1) {
          const hi = slots[startIdx];
          const endMinLocal = (t2m(slots[prev]) ?? 0) + step;
          const hf = m2t(endMinLocal);
          out.push({ dia_semana: d, hora_inicio: hi, hora_fin: hf });
          startIdx = cur;
        }
        prev = cur;
      }
    }
    return out;
  }

  async function openBarbero(b) {
    setSel(b);
    setTab(0);
    try {
      const [srv, hor, all] = await Promise.all([
        listarServiciosBarbero(b.id).catch(() => ({ data: [] })),
        listarHorariosBarbero(b.id).catch(() => ({ data: [] })),
        listarServicios({ solo_activos: 1 }).catch(() => ({ data: [] })),
      ]);
      setServiciosAll(all.data || []);
      setServSel((srv.data || []).map((s) => s.id));
      const map = rangesToSlotsMap(hor.data || []);
      setSlotsSel(map);
    } catch (e) {
      setServiciosAll([]);
      setServSel([]);
      setSlotsSel(emptySlotsMap());
    }
  }

  function toggleCell(day, idx) {
    const targets = multiDia ? diasAct : [day];
    setSlotsSel((prev) => {
      const next = { ...prev };
      for (const d of targets) {
        const s = new Set(prev[d] || []);
        if (s.has(idx)) s.delete(idx);
        else s.add(idx);
        next[d] = s;
      }
      return next;
    });
  }

  function clickCellKeyboard(e, day, idx) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleCell(day, idx);
    }
  }

  function copiarDia() {
    const base = slotsSel[copiarDesde] || new Set();
    if (!base.size) {
      notify("Nada que copiar", "warning");
      return;
    }
    setSlotsSel((prev) => {
      const next = { ...prev };
      for (const d of diasAct) {
        if (d === copiarDesde) continue;
        const s = new Set(next[d] || []);
        base.forEach((i) => s.add(i));
        next[d] = s;
      }
      return next;
    });
    notify("Copiado");
  }

  function borrarDia(d) {
    setSlotsSel((prev) => ({ ...prev, [d]: new Set() }));
  }

  function selectAllDia(d) {
    setSlotsSel((prev) => {
      const s = new Set();
      for (let i = 0; i < slots.length; i++) s.add(i);
      return { ...prev, [d]: s };
    });
  }

  function presetLV_ManianaTarde() {
    const mins = slots.map(t2m);
    const i0812 = [];
    const i1419 = [];
    for (let i = 0; i < mins.length; i++) {
      if (mins[i] >= 480 && mins[i] < 720) i0812.push(i);
      if (mins[i] >= 840 && mins[i] < 1140) i1419.push(i);
    }
    setSlotsSel(() => {
      const map = emptySlotsMap();
      [1, 2, 3, 4, 5].forEach((d) => {
        map[d] = new Set([...i0812, ...i1419]);
      });
      return map;
    });
    setDiasAct([1, 2, 3, 4, 5]);
  }

  function presetSabadoManiana() {
    const mins = slots.map(t2m);
    const s = new Set();
    for (let i = 0; i < mins.length; i++)
      if (mins[i] >= 540 && mins[i] < 780) s.add(i);
    setSlotsSel((prev) => ({ ...prev, 6: s }));
    if (!diasAct.includes(6)) setDiasAct([...diasAct, 6]);
  }

  async function saveServicios() {
    if (!sel) return;
    try {
      await guardarServiciosBarbero(sel.id, servSel);
      notify("Servicios guardados");
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  async function saveHorario() {
    if (!sel) return;
    if (startMin >= endMin) {
      notify("Rango de vista inválido", "error");
      return;
    }
    const lista = slotsMapToRanges(slotsSel);
    try {
      await guardarHorariosBarbero(sel.id, lista);
      notify("Horario guardado");
    } catch (e) {
      notify(e?.response?.data?.mensaje || "Error", "error");
    }
  }

  return (
    <Paper
      className="container-fluid"
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
      }}
    >
      {!sel && (
        <>
          <div className="row g-2 align-items-center mb-2">
            <div className="col-12 col-md-6">
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar barbero"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </div>
          </div>
          <div className="row g-3">
            {rows.map((b) => (
              <div className="col-12 col-sm-6 col-lg-4" key={b.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" noWrap>
                      {b.nombres || b.correo_electronico}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.apellidos || " "}
                    </Typography>
                    <Chip
                      size="small"
                      label={b.esta_activo ? "Activo" : "Inactivo"}
                      color={b.esta_activo ? "success" : "default"}
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" onClick={() => openBarbero(b)}>
                      Configurar
                    </Button>
                  </CardActions>
                </Card>
              </div>
            ))}
            {!rows.length && (
              <div className="col-12">
                <Typography align="center" color="text.secondary">
                  Sin resultados
                </Typography>
              </div>
            )}
          </div>
        </>
      )}
      {sel && (
        <>
          <div className="row mb-2">
            <div className="col-12 d-flex align-items-center justify-content-between">
              <Typography variant="h6">
                {sel.nombres || sel.correo_electronico}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setSel(null);
                  setSlotsSel(emptySlotsMap());
                }}
              >
                Volver
              </Button>
            </div>
          </div>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Servicios" />
            <Tab label="Horario" />
          </Tabs>
          {tab === 0 && (
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <Autocomplete
                  multiple
                  options={serviciosAll}
                  getOptionLabel={(o) => o.nombre}
                  value={serviciosAll.filter((s) => servSel.includes(s.id))}
                  onChange={(_, vals) => setServSel(vals.map((v) => v.id))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Servicios"
                      placeholder="Selecciona servicios"
                    />
                  )}
                />
              </div>
              <div className="col-12">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={saveServicios}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
          {tab === 1 && (
            <div className="row g-3">
              <div className="col-12 col-xxl-3">
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">
                      Configuración de vista
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
                      <TextField
                        size="small"
                        type="time"
                        label="Desde"
                        value={startStr}
                        onChange={(e) => setStartStr(e.target.value)}
                      />
                      <TextField
                        size="small"
                        type="time"
                        label="Hasta"
                        value={endStr}
                        onChange={(e) => setEndStr(e.target.value)}
                      />
                      <TextField
                        size="small"
                        select
                        label="Paso"
                        value={step}
                        onChange={(e) => setStep(Number(e.target.value))}
                        sx={{ minWidth: 100 }}
                      >
                        <MenuItem value={60}>60 min</MenuItem>
                        <MenuItem value={30}>30 min</MenuItem>
                      </TextField>
                    </Stack>
                    <Typography variant="subtitle2">Días activos</Typography>
                    <Autocomplete
                      multiple
                      options={DIAS}
                      disableCloseOnSelect
                      getOptionLabel={(o) => o.t}
                      value={DIAS.filter((d) => diasAct.includes(d.v))}
                      onChange={(_, vals) => setDiasAct(vals.map((v) => v.v))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            {...getTagProps({ index })}
                            key={option.v}
                            label={option.t}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Selecciona días" />
                      )}
                      sx={{ mt: 1 }}
                    />
                    <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
                      <Button
                        size="small"
                        onClick={() => setDiasAct([1, 2, 3, 4, 5, 6, 7])}
                      >
                        Todos
                      </Button>
                      <Button size="small" onClick={() => setDiasAct([])}>
                        Ninguno
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setDiasAct([1, 2, 3, 4, 5])}
                      >
                        L–V
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch
                        checked={multiDia}
                        onChange={(e) => setMultiDia(e.target.checked)}
                      />
                      <Typography>Aplicar a días seleccionados</Typography>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <TextField
                        select
                        size="small"
                        label="Copiar de"
                        value={copiarDesde}
                        onChange={(e) => setCopiarDesde(Number(e.target.value))}
                        sx={{ minWidth: 160 }}
                      >
                        {DIAS.map((d) => (
                          <MenuItem key={d.v} value={d.v}>
                            {d.t}
                          </MenuItem>
                        ))}
                      </TextField>
                      <Button
                        variant="outlined"
                        startIcon={<ContentCopyIcon />}
                        onClick={copiarDia}
                      >
                        Copiar
                      </Button>
                    </Stack>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        startIcon={<BoltIcon />}
                        onClick={presetLV_ManianaTarde}
                      >
                        L–V 08–12 / 14–19
                      </Button>
                      <Button
                        size="small"
                        startIcon={<BoltIcon />}
                        onClick={presetSabadoManiana}
                      >
                        Sáb 09–13
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ReplayIcon />}
                        onClick={() => setSlotsSel(emptySlotsMap())}
                      >
                        Vaciar
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </div>
              <div className="col-12 col-xxl-9">
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Horario
                    </Typography>
                    <div style={{ overflowX: "auto" }}>
                      <table
                        className="table table-sm align-middle mb-2"
                        style={{ minWidth: 920 }}
                      >
                        <thead>
                          <tr>
                            <th style={{ width: 90 }}>Hora</th>
                            {DIAS.map((d) => (
                              <th key={d.v} className="text-center">
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span>{d.t}</span>
                                  <Button
                                    size="small"
                                    onClick={() => selectAllDia(d.v)}
                                  >
                                    Todo
                                  </Button>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => borrarDia(d.v)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map((label, idx) => (
                            <tr key={label}>
                              <td style={{ width: 90 }}>
                                <Chip size="small" label={label} />
                              </td>
                              {DIAS.map((d) => {
                                const active = Boolean(
                                  slotsSel[d.v] && slotsSel[d.v].has(idx)
                                );
                                const id = `c-${d.v}-${idx}`;
                                return (
                                  <td key={d.v} className="text-center">
                                    <input
                                      id={id}
                                      type="checkbox"
                                      checked={active}
                                      onChange={() => toggleCell(d.v, idx)}
                                      style={{ display: "none" }}
                                    />
                                    <label
                                      htmlFor={id}
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e) =>
                                        clickCellKeyboard(e, d.v, idx)
                                      }
                                      style={{
                                        display: "inline-block",
                                        width: 34,
                                        height: 34,
                                        borderRadius: 6,
                                        border: "1px solid rgba(0,0,0,.15)",
                                        background: active
                                          ? "rgba(25,118,210,0.95)"
                                          : "transparent",
                                        cursor: "pointer",
                                        boxShadow: active
                                          ? "0 1px 3px rgba(0,0,0,.2)"
                                          : "none",
                                      }}
                                      title={`${d.t} ${label}`}
                                    />
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <Divider sx={{ my: 2 }} />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={saveHorario}
                      >
                        Guardar horario
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
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
    </Paper>
  );
}
